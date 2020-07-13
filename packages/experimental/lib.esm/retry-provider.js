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
export class RetryProvider extends ethers.providers.BaseProvider {
    constructor(provider, options) {
        logger.checkNew(new.target, RetryProvider);
        super(provider.getNetwork());
        ethers.utils.defineReadOnly(this, "provider", provider);
        ethers.utils.defineReadOnly(this, "options", options || {});
    }
    perform(method, params) {
        return poll(() => {
            return this.provider.perform(method, params).then((result) => {
                return result;
            }, (error) => {
                return undefined;
            });
        }, this.options);
    }
}
//# sourceMappingURL=retry-provider.js.map