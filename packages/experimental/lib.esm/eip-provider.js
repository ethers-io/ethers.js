"use strict";
import { ethers } from "ethers";
import { version } from "./_version";
const logger = new ethers.utils.Logger(version);
export class EipWrappedProvider extends ethers.providers.JsonRpcProvider {
    constructor(provider, network) {
        logger.checkNew(new.target, EipWrappedProvider);
        super("eip1193:/\/", network);
        ethers.utils.defineReadOnly(this, "provider", provider);
    }
    send(method, params) {
        return this.provider.send(method, params);
    }
}
