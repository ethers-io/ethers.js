"use strict";

// RetryProvider
//
// Wraps an existing Provider to provide retry logic.
//
// See: https://github.com/ethers-io/ethers.js/issues/427


import { ethers } from "ethers";
import { poll } from "@ethersproject/web";

import { version } from "./_version";

const logger = new ethers.utils.Logger(version);

export type RetryOptions = {
    // Maximum time in total to retry
    timeout?: number,

    // Minimum Duration to wait between retries
    floor?: number,

    // Maximum Duration to wait between retries
    ceiling?: number,

    // The slot interval for exponential back-off
    interval?: number,

    // Maximum number of times to rety
    retryLimit?: number
};

export class RetryProvider extends ethers.providers.BaseProvider {
    readonly provider: ethers.providers.BaseProvider;
    readonly options: RetryOptions;

    constructor(provider: ethers.providers.BaseProvider, options?: RetryOptions) {
        logger.checkNew(new.target, RetryProvider);
        super(provider.getNetwork());
        ethers.utils.defineReadOnly(this, "provider", provider);
        ethers.utils.defineReadOnly(this, "options", options || { });
    }

    perform(method: string, params: any): Promise<any> {
        return poll(() => {
            return this.provider.perform(method, params).then((result) => {
                return result
            }, (error) => {
                return undefined
            });
        }, this.options);
    }
}
