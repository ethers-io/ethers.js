"use strict";

import { ethers } from "ethers";

import { version } from "./_version";

const logger = new ethers.utils.Logger(version);

//import { Networkish } from "@ethersproject/networks";
//import { defineReadOnly } from "@ethersproject/properties";

//import { Logger } from "@ethersproject/logger";
//import { version } from "./_version";
//const logger = new Logger(version);

//import { JsonRpcProvider } from "./json-rpc-provider";


// Exported Types
export interface Eip1193Provider {
    send: (message: string, params?: Array<any>) => Promise<any>;
    on(eventName: string, listener: (...args: Array<any>) => void): this;
}


export class EipWrappedProvider extends ethers.providers.JsonRpcProvider {
    readonly provider: Eip1193Provider;

    constructor(provider: Eip1193Provider, network?: ethers.providers.Networkish) {
        logger.checkNew(new.target, EipWrappedProvider);

        super("eip1193:/\/", network);

        ethers.utils.defineReadOnly(this, "provider", provider);
    }

    send(method: string, params: any): Promise<any> {
        return this.provider.send(method, params);
    }
}
