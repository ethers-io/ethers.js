"use strict";

import { Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { getStatic } from "@ethersproject/properties";

import { WebSocketProvider } from "./websocket-provider";
import { CommunityResourcable } from "./formatter";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { JsonRpcSigner } from "./json-rpc-provider";
import { StaticJsonRpcProvider } from "./url-json-rpc-provider";

export class QuicknodeWebSocketProvider
  extends WebSocketProvider
  implements CommunityResourcable
{
  constructor(network?: Networkish, connectionUrl?: string) {
    const provider = new QuicknodeProvider(network, connectionUrl);

    const url = provider.connection.url.replace(/^http/i, "ws");

    super(url, provider.network);
  }

  isCommunityResource(): boolean {
    return false;
  }
}

type getUrlFunc = (connectionUrl: string) => ConnectionInfo;

export class QuicknodeProvider
  extends StaticJsonRpcProvider
  implements CommunityResourcable
{
  constructor(network?: Networkish, connectionUrl?: string) {
    if (!connectionUrl) {
      return logger.throwArgumentError(
        "no connectionUrl provided",
        "connectionUrl",
        connectionUrl
      );
    }

    const connection = getStatic<getUrlFunc>(
      new.target,
      "getUrl"
    )(connectionUrl);

    super(connection, network);
  }

  static getWebSocketProvider(
    network: Networkish,
    connectionUrl: string
  ): QuicknodeWebSocketProvider {
    return new QuicknodeWebSocketProvider(network, connectionUrl);
  }

  isCommunityResource(): boolean {
    return false;
  }

  getSigner(): JsonRpcSigner {
    return logger.throwError(
      "API provider does not support signing",
      Logger.errors.UNSUPPORTED_OPERATION,
      { operation: "getSigner" }
    );
  }

  listAccounts(): Promise<Array<string>> {
    return Promise.resolve([]);
  }

  static getUrl(connectionUrl: string): ConnectionInfo {
    return {
      allowGzip: true,
      url: connectionUrl,
      throttleCallback: () => {
        return Promise.resolve(true);
      },
    };
  }
}
