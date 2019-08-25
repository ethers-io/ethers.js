"use strict";
import { defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { JsonRpcProvider } from "./json-rpc-provider";
/*
@TODO
utils.defineProperty(Web3Signer, "onchange", {

});

*/
export class Web3Provider extends JsonRpcProvider {
    constructor(web3Provider, network) {
        logger.checkNew(new.target, Web3Provider);
        // HTTP has a host; IPC has a path.
        super(web3Provider.host || web3Provider.path || "", network);
        if (web3Provider) {
            if (web3Provider.sendAsync) {
                this._sendAsync = web3Provider.sendAsync.bind(web3Provider);
            }
            else if (web3Provider.send) {
                this._sendAsync = web3Provider.send.bind(web3Provider);
            }
        }
        if (!web3Provider || !this._sendAsync) {
            logger.throwArgumentError("invalid web3Provider", "web3Provider", web3Provider);
        }
        defineReadOnly(this, "_web3Provider", web3Provider);
    }
    send(method, params) {
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && this._web3Provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        return new Promise((resolve, reject) => {
            let request = {
                method: method,
                params: params,
                id: 42,
                jsonrpc: "2.0"
            };
            this._sendAsync(request, function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                if (result.error) {
                    // @TODO: not any
                    let error = new Error(result.error.message);
                    error.code = result.error.code;
                    error.data = result.error.data;
                    reject(error);
                    return;
                }
                resolve(result.result);
            });
        });
    }
}
