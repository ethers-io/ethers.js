"use strict";
import { defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { JsonRpcProvider } from "./json-rpc-provider";
export class EipWrappedProvider extends JsonRpcProvider {
    constructor(provider, network) {
        logger.checkNew(new.target, EipWrappedProvider);
        // HTTP has a host; IPC has a path.
        super("eip1193:/\/", network);
        defineReadOnly(this, "provider", provider);
    }
    send(method, params) {
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && this.provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        return this.provider.send(method, params);
    }
}
