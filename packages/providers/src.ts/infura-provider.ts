"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly } from "@ethersproject/properties";
import { ConnectionInfo } from "@ethersproject/web";
import { FilterByFilterId, Log } from '@ethersproject/abstract-provider'

import { Event } from './base-provider';
import { WebSocketProvider } from "./websocket-provider";
import { CommunityResourcable, showThrottleMessage } from "./formatter";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";

const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
import { logicalExpression } from "@babel/types";


const defaultProjectId = "84842078b09946638c03157f83405213"

export class InfuraWebSocketProvider extends WebSocketProvider implements CommunityResourcable {
    readonly apiKey: string;
    readonly projectId: string;
    readonly projectSecret: string;

    constructor(network?: Networkish, apiKey?: any) {
        const provider = new InfuraProvider(network, apiKey);
        const connection = provider.connection;
        if (connection.password) {
            logger.throwError("INFURA WebSocket project secrets unsupported", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "InfuraProvider.getWebSocketProvider()"
            });
        }

        const url = connection.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        super(url, network);

        defineReadOnly(this, "apiKey", provider.projectId);
        defineReadOnly(this, "projectId", provider.projectId);
        defineReadOnly(this, "projectSecret", provider.projectSecret);
    }

    isCommunityResource(): boolean {
        return (this.projectId === defaultProjectId);
    }
}

export class InfuraProvider extends UrlJsonRpcProvider {
    readonly projectId: string;
    readonly projectSecret: string;
    readonly installedFilters: { [key: string]: FilterByFilterId };

    constructor(network?: Networkish, apiKey?: any) {
        super(network, apiKey);
        defineReadOnly(this, "installedFilters", {});
    }

    static getWebSocketProvider(network?: Networkish, apiKey?: any): InfuraWebSocketProvider {
        return new InfuraWebSocketProvider(network, apiKey);
    }

    static getApiKey(apiKey: any): any {
        const apiKeyObj: { apiKey: string, projectId: string, projectSecret: string } = {
            apiKey: defaultProjectId,
            projectId: defaultProjectId,
            projectSecret: null
        };

        if (apiKey == null) { return apiKeyObj; }

        if (typeof(apiKey) === "string") {
            apiKeyObj.projectId = apiKey;

        } else if (apiKey.projectSecret != null) {
            logger.assertArgument((typeof(apiKey.projectId) === "string"),
                "projectSecret requires a projectId", "projectId", apiKey.projectId);
            logger.assertArgument((typeof(apiKey.projectSecret) === "string"),
                "invalid projectSecret", "projectSecret", "[REDACTED]");

            apiKeyObj.projectId = apiKey.projectId;
            apiKeyObj.projectSecret = apiKey.projectSecret;

        } else if (apiKey.projectId) {
            apiKeyObj.projectId = apiKey.projectId;
        }

        apiKeyObj.apiKey = apiKeyObj.projectId;

        return apiKeyObj;
    }

    static getUrl(network: Network, apiKey: any): ConnectionInfo {
        let host: string = null;
        switch(network ? network.name: "unknown") {
            case "homestead":
                host = "mainnet.infura.io";
                break;
            case "ropsten":
                host = "ropsten.infura.io";
                break;
            case "rinkeby":
                host = "rinkeby.infura.io";
                break;
            case "kovan":
                host = "kovan.infura.io";
                break;
            case "goerli":
                host = "goerli.infura.io";
                break;
            case "matic":
                host = "polygon-mainnet.infura.io";
                break;
            case "maticmum":
                host = "polygon-mumbai.infura.io";
                break;
            default:
                logger.throwError("unsupported network", Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }

        const connection: ConnectionInfo = {
            allowGzip: true,
            url: ("https:/" + "/" + host + "/v3/" + apiKey.projectId),
            throttleCallback: (attempt: number, url: string) => {
                if (apiKey.projectId === defaultProjectId) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };

        if (apiKey.projectSecret != null) {
            connection.user = "";
            connection.password = apiKey.projectSecret
        }

        return connection;
    }

    isCommunityResource(): boolean {
        return (this.projectId === defaultProjectId);
    }

    // Override this method to work on filters
    updateTransactionEvents(runners: Array<Promise<void>>, blockNumber?: number) {
        // Find all transaction hashes we are waiting on
        this._events.forEach((event) => {
            switch (event.type) {
                case "tx": {
                    const hash = event.hash;
                    let runner = this.getTransactionReceipt(hash).then((receipt) => {
                        if (!receipt || receipt.blockNumber == null) { return null; }
                        this._emitted["t:" + hash] = receipt.blockNumber;
                        this.emit(hash, receipt);
                        return null;
                    }).catch((error: Error) => { this.emit("error", error); });

                    runners.push(runner);

                    break;
                }

                case "filter": {
                    const filter: FilterByFilterId = this.checkInstalledFilters(event);

                    const runner = this.getFilterChanges(filter.filterId).then((logs) => {
                        if (logs.length === 0) { return; }

                        logs.forEach((log: Log) => {
                            this._emitted["b:" + log.blockHash] = log
                            this._emitted["b:" + log.blockHash] = log.blockNumber;
                            this._emitted["t:" + log.transactionHash] = log.blockNumber;
                            this.emit(event.filter, log);
                        });
                    }).catch((error: Error) => { this.emit("error", error); });

                    runners.push(runner);
                    break;
                }
            }
        });
    }

    private async checkInstalledFilters(event: Event): Promise<FilterByFilterId> {
        const filter = this.installedFilters[event.tag];

        // Create the filter if it doesn't already exist
        if (!filter) {
            const filterResult =  await this.newFilter(event.filter.topics)
            this.installedFilters[event.tag] = {
                topics: event.filter.topics,
                address: event.filter.address,
                filterId: filterResult
            };
        }

        return this.installedFilters[event.tag]
    }
}
