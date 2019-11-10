"use strict";

import { Network } from "@ethersproject/networks";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";

const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";

const defaultProjectId = "84842078b09946638c03157f83405213"

declare type InfuraRateLimitError = {
    code: number,
    message: string,
    data: {
        see: string,
        current_rps: number,
        allowed_rps: number,
        backoff_seconds: number
    }
};

export class InfuraProvider extends UrlJsonRpcProvider {
    get projectId(): string { return this.apiKey; }

    static getApiKey(apiKey: string): string {
        if (apiKey == null) { return defaultProjectId; }
        return apiKey;
    }

    static getUrl(network: Network, apiKey: string): string {
        let host = null;
        switch(network.name) {
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
            default:
                logger.throwError("unsupported network", Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }

        return "https:/" + "/" + host + "/v3/" + apiKey;
    }
}

/**
 * This provider is assuming that the JsonRPC provider
 * up the inheritance hierarchy is http based. This will
 * not work for wss based connections.
 * InfuraRateLimitError.code = -32005 may also work.
 * This code may also be ambiguous with data limits as well, so
 * care should be taken when relying on the status code.
 * @See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1474.md
 */
export class InfuraRetryProvider extends InfuraProvider {
    pause(ms:number): Promise<any> {
        return new Promise((res) => setTimeout(res, ms));
    }

    perform(method: string, params: any): Promise<any> {
        const MAX_RETRY:number = 3;
        let rateLimited:boolean = false;
        let rate:number = 0;
        let retries: number = 0;

        return new Promise(async (resolve, reject) => {
            do {
                await this.pause(rate);
                try {
                    const result = await super.perform(method, params);
                    rateLimited = false;
                    resolve(result);
                } catch(e) {
                    const errPayload:any = JSON.parse(e.body);
                    const infuraErr:InfuraRateLimitError = errPayload.error;

                    if (e.status === 429) {
                        if(retries++ === MAX_RETRY) {
                            reject(e);
                            rateLimited = false;
                            return;
                        };
                        rateLimited = true;
                        rate = infuraErr.data.backoff_seconds * 1000;
                    } else {
                        throw e;
                    }
                }
            } while(rateLimited);
        })
    }
}