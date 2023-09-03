
import { deepCopy } from "@ethersproject/properties";
import { ConnectionInfo, fetchJson } from "@ethersproject/web";

import { JsonRpcProvider } from "./json-rpc-provider";
import { Networkish } from "@ethersproject/networks";
import { InfuraProvider } from "./infura-provider";
import { StaticJsonRpcProvider } from "./url-json-rpc-provider";

// Experimental

export class BatchSender {
    _provider: JsonRpcProvider;
    _pendingBatchAggregator: NodeJS.Timer;
    _pendingBatch: Array<{
        request: { method: string, params: Array<any>, id: number, jsonrpc: "2.0" },
        resolve: (result: any) => void,
        reject: (error: Error) => void
    }>;

    constructor(provider: JsonRpcProvider) {
        this._provider = provider
    }

    async send(method: string, params: Array<any>): Promise<any> {
        const request = {
            method: method,
            params: params,
            id: (this._provider._nextId++),
            jsonrpc: "2.0"
        };

        if (this._pendingBatch == null) {
            this._pendingBatch = [ ];
        }

        const inflightRequest: any = { request, resolve: null, reject: null };

        const promise = new Promise((resolve, reject) => {
            inflightRequest.resolve = resolve;
            inflightRequest.reject = reject;
        });

        this._pendingBatch.push(inflightRequest);

        if (!this._pendingBatchAggregator) {
            // Schedule batch for next event loop + short duration
            this._pendingBatchAggregator = setTimeout(() => {

                // Get teh current batch and clear it, so new requests
                // go into the next batch
                const batch = this._pendingBatch;
                this._pendingBatch = null;
                this._pendingBatchAggregator = null;

                // Get the request as an array of requests
                const request = batch.map((inflight) => inflight.request);

                this._provider.emit("debug", {
                    action: "requestBatch",
                    request: deepCopy(request),
                    provider: this
                });

                return fetchJson(this._provider.connection, JSON.stringify(request)).then((result) => {
                    this._provider.emit("debug", {
                        action: "response",
                        request: request,
                        response: result,
                        provider: this
                    });

                    // For each result, feed it to the correct Promise, depending
                    // on whether it was a success or error
                    batch.forEach((inflightRequest, index) => {
                        const payload = result[index];
                        if (payload.error) {
                            const error = new Error(payload.error.message);
                            (<any>error).code = payload.error.code;
                            (<any>error).data = payload.error.data;
                            inflightRequest.reject(error);
                        } else {
                            inflightRequest.resolve(payload.result);
                        }
                    });

                }, (error) => {
                    this._provider.emit("debug", {
                        action: "response",
                        error: error,
                        request: request,
                        provider: this
                    });

                    batch.forEach((inflightRequest) => {
                        inflightRequest.reject(error);
                    });
                });

            }, 10);
        }

        return promise;
    }
}

export class JsonRpcBatchProvider extends JsonRpcProvider {
    _batchSender: BatchSender
    constructor(url?: ConnectionInfo | string, network?: Networkish) {
        super(url, network);
        this._batchSender = new BatchSender(this)
    }

    async send (method: string, params: any[]): Promise<any> {
        return this._batchSender.send(method, params)
    }
}

export class InfuraBatchProvider extends InfuraProvider {
    _batchSender: BatchSender
    constructor(network?: Networkish, apiKey?: any) {
        super(network, apiKey);
        this._batchSender = new BatchSender(this)
    }

    async send (method: string, params: any[]): Promise<any> {
        return this._batchSender.send(method, params)
    }
}

export class StaticJsonRpcBatchProvider extends StaticJsonRpcProvider {
    _batchSender: BatchSender
    constructor(url?: ConnectionInfo | string, network?: Networkish) {
        super(url, network);
        this._batchSender = new BatchSender(this)
    }

    async send (method: string, params: any[]): Promise<any> {
        return this._batchSender.send(method, params)
    }
}
