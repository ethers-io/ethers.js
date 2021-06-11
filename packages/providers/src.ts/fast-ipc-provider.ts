"use strict";

import { connect, Socket } from "net";

import { BigNumber } from "@ethersproject/bignumber";
import { Networkish } from "@ethersproject/networks";
import { Logger } from "@ethersproject/logger";
import { defineReadOnly } from "@ethersproject/properties";

import { Event } from "./base-provider";
import { JsonRpcProvider } from "./json-rpc-provider";

import { version } from "./_version";

const logger = new Logger(version);

/**
 *  Notes:
 *
 *  This provider differs a bit from the polling providers. One main
 *  difference is how it handles consistency. The polling providers
 *  will stall responses to ensure a consistent state, while this
 *  WebSocket provider assumes the connected backend will manage this.
 *
 *  For example, if a polling provider emits an event which indicats
 *  the event occurred in blockhash XXX, a call to fetch that block by
 *  its hash XXX, if not present will retry until it is present. This
 *  can occur when querying a pool of nodes that are mildly out of sync
 *  with each other.
 */

type Request = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  payload: string;
};

type Subscription = {
  tag: string;
  process: (payload: any) => void;
};

// For more info about the Real-time Event API see:
//   https://geth.ethereum.org/docs/rpc/pubsub

export class FastIpcProvider extends JsonRpcProvider {
  // Global subscription ID
  private static NEXT_ID = 1;

  // Maps all registered requests
  private readonly _requests: { [id: string]: Request } = {};
  // Maps event tag to subscription ID (we dedupe identical events)
  private readonly _subIds: { [tag: string]: Promise<string> } = {};
  // Maps Subscription ID to Subscription
  private readonly _subs: { [name: string]: Subscription } = {};
  // The IPC socket
  private readonly _socket: Socket;
  private _lastChunk = "";

  public constructor(path: string, network?: Networkish) {
    super("ipc://" + path, network);
    this._socket = connect({ path });
    this._pollingInterval = -1;

    // Stall sending requests until the socket is open...
    this._socket.on("connect", () => {
      Object.keys(this._requests).forEach((id) => {
        this._socket.write(this._requests[id].payload);
      });
    });

    // Reject all pending requests on "error" or "close"
    this._socket.on("error", (err) => this.rejectAllAndDestroy(err));
    this._socket.on("close", (hadErr) => {
      if (!hadErr) {
        this.rejectAllAndDestroy(new Error("IPC socket was closed"));
      }
    });

    // Parse incoming messages and handle them by type
    this._socket.on("data", (buf) => {
      this.parseBuffer(buf).forEach((msg) => {
        if (typeof msg?.id === "number") {
          this.handleNotification(msg);
        } else if (msg?.method === "eth_subscription") {
          this.handleSubscription(msg);
        } else {
          logger.warn("unexpected RPC response");
        }
      });
    });

    // This Provider does not actually poll, but we want to trigger poll events
    // for things that depend on them (like stalling for block and transaction
    // lookups)
    const fauxPoll = setInterval(() => {
      this.emit("poll");
    }, 1000);

    if (fauxPoll.unref) {
      fauxPoll.unref();
    }
  }

  public get pollingInterval(): number {
    return 0;
  }

  public set pollingInterval(_: number) {
    logger.throwError(
      "cannot set polling interval on FastIpcProvider",
      Logger.errors.UNSUPPORTED_OPERATION,
      {
        operation: "pollingInterval",
      }
    );
  }

  public resetEventsBlock(_: number): void {
    const context = { operation: "resetEventsBlock" };
    logger.throwError(
      "cannot reset events block on FastIpcProvider",
      Logger.errors.UNSUPPORTED_OPERATION,
      context
    );
  }

  public async poll(): Promise<void> {
    return;
  }

  public set polling(value: boolean) {
    if (!value) {
      return;
    }

    const context = { operation: "setPolling" };
    logger.throwError(
      "cannot set polling on FastIpcProvider",
      Logger.errors.UNSUPPORTED_OPERATION,
      context
    );
  }

  public send(method: string, params?: Array<any>): Promise<any> {
    if (this._socket.destroyed) {
      logger.throwError("provider has already been destroyed");
    }

    const id = FastIpcProvider.NEXT_ID++;
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({ method, params, id, jsonrpc: "2.0" });
      this.emit("debug", {
        action: "request",
        request: JSON.parse(payload),
        provider: this,
      });

      // requests are buffered and sent later if the socket is not yet ready
      this._requests[String(id)] = { resolve, reject, payload };
      if (!this._socket.connecting) {
        this._socket.write(payload);
      }
    });
  }

  public async _subscribe(
    tag: string,
    param: Array<any>,
    process: (res: any) => void
  ): Promise<void> {
    let subIdPromise = this._subIds[tag];
    if (subIdPromise == null) {
      subIdPromise = Promise.all(param).then((param) =>
        this.send("eth_subscribe", param)
      );
      this._subIds[tag] = subIdPromise;
    }
    const subId = await subIdPromise;
    this._subs[subId] = { tag, process };
  }

  public _startEvent(event: Event): void {
    switch (event.type) {
      case "block":
        this._subscribe("block", ["newHeads"], (res: any) => {
          const blockNumber = BigNumber.from(res.number).toNumber();
          this._emitted.block = blockNumber;
          this.emit("block", blockNumber);
        });
        break;
      case "pending":
        this._subscribe("pending", ["newPendingTransactions"], (res: any) =>
          this.emit("pending", res)
        );
        break;
      case "filter":
        this._subscribe(
          event.tag,
          ["logs", this._getFilter(event.filter)],
          (res: any) => {
            if (res.removed === null) {
              res.removed = false;
            }
            this.emit(event.filter, this.formatter.filterLog(res));
          }
        );
        break;
      case "tx": {
        const emitReceipt = (event: Event) => {
          const hash = event.hash;
          this.getTransactionReceipt(hash).then((receipt) => {
            if (!receipt) return;
            this.emit(hash, receipt);
          });
        };

        // In case it is already mined
        emitReceipt(event);

        // To keep things simple, we start up a single newHeads subscription
        // to keep an eye out for transactions we are watching for.
        // Starting a subscription for an event (i.e. "tx") that is already
        // running is (basically) a nop.
        this._subscribe("tx", ["newHeads"], () => {
          this._events
            .filter((event) => event.type === "tx")
            .forEach(emitReceipt);
        });
        break;
      }
      // Nothing is needed
      case "debug":
      case "poll":
      case "willPoll":
      case "didPoll":
      case "error":
        break;
      default:
        logger.warn("unhandled: ", event);
        break;
    }
  }

  _stopEvent(event: Event): void {
    let tag = event.tag;

    if (event.type === "tx") {
      // There are remaining transaction event listeners
      if (this._events.filter((e) => e.type === "tx").length) {
        return;
      }
      tag = "tx";
    } else if (this.listenerCount(event.event)) {
      // There are remaining event listeners
      return;
    }

    const subId = this._subIds[tag];
    if (!subId) {
      return;
    }

    delete this._subIds[tag];
    subId.then((subId) => {
      if (!this._subs[subId]) return;
      delete this._subs[subId];
      this.send("eth_unsubscribe", [subId]);
    });
  }

  public async destroy(): Promise<void> {
    if (this._socket.destroyed) {
      logger.throwError("provider has already been destroyed");
    }

    this.rejectAllAndDestroy(new Error("IPC provider was destroyed"));

    return new Promise((resolve, reject) => {
      this._socket.once("error", (err) => reject(err));
      this._socket.once("close", () => resolve());
    });
  }

  private rejectAllAndDestroy(err: Error) {
    // reject all registered requests
    Object.keys(this._requests).forEach((id) => {
      const request = this._requests[id];
      request.reject(err);
    });

    // destroy the IPC socket
    this._socket.removeAllListeners();
    this._socket.destroy();
  }

  private parseBuffer(buf: Buffer): any[] {
    const chunks = buf
      .toString()
      .replace(/\}[\n\r]?\{/g, "}|--|{") // }{
      .replace(/\}\][\n\r]?\[\{/g, "}]|--|[{") // }][{
      .replace(/\}[\n\r]?\[\{/g, "}|--|[{") // }[{
      .replace(/\}\][\n\r]?\{/g, "}]|--|{") // }]{
      .split("|--|");

    const results: any[] = [];
    for (const chunk of chunks) {
      const msg = this._lastChunk + chunk;
      try {
        results.push(JSON.parse(msg));
        // todo: cancel timeout
        this._lastChunk = "";
      } catch (err) {
        this._lastChunk = msg;
        // todo: clear timeout, start new one
        break;
      }
    }

    return results;
  }

  private handleNotification(msg: { id: number; [_: string]: any }) {
    const id = String(msg.id);
    const request = this._requests[id];
    delete this._requests[id];

    if (msg.result !== undefined) {
      request.resolve(msg.result);
      this.emit("debug", {
        action: "response",
        request: JSON.parse(request.payload),
        response: msg.result,
        provider: this,
      });
    } else {
      if (msg.error !== undefined) {
        const err = new Error(msg.error.message || "unknown error");
        defineReadOnly(<any>err, "code", msg.error.code || null);
        defineReadOnly(<any>err, "response", msg);
        request.reject(err);
      } else {
        request.reject(new Error("unknown error"));
      }

      this.emit("debug", {
        action: "response",
        request: JSON.parse(request.payload),
        provider: this,
      });
    }
  }

  private handleSubscription(msg: {
    method: "eth_subscription";
    [_: string]: any;
  }) {
    const sub = this._subs[msg.params.subscription];
    if (sub !== undefined) {
      sub.process(msg.params.result);
    }
  }
}
