'use strict';

import { Network } from './networks';
import { JsonRpcProvider } from './json-rpc-provider';

import * as errors from '../utils/errors';

/*
@TODO
utils.defineProperty(Web3Signer, 'onchange', {

});
*/

export type Callback = (error: any, response: any) => void;
export type AsyncProvider = {
    isMetaMask: boolean;
    host?: string;
    path?: string;
    sendAsync: (request: any, callback: Callback) => void
}

export class Web3Provider extends JsonRpcProvider {
    readonly _web3Provider: AsyncProvider;

    constructor(web3Provider: AsyncProvider, network?: Network | string) {

        if (!web3Provider || !web3Provider.sendAsync) {
            errors.throwError(
                'invalid web3Provider',
                errors.INVALID_ARGUMENT,
                { arg: 'web3Provider', value: web3Provider }
            );
        }

        // HTTP has a host; IPC has a path.
        var url = web3Provider.host || web3Provider.path || 'unknown';

        super(url, network);
        errors.checkNew(this, Web3Provider);

        this._web3Provider = web3Provider;
    }

    send(method, params) {

        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == 'eth_sign' && this._web3Provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = 'personal_sign';
            params = [ params[1], params[0] ];
        }

        return new Promise((resolve, reject) => {
            var request = {
                method: method,
                params: params,
                id: 42,
                jsonrpc: "2.0"
            };

            this._web3Provider.sendAsync(request, function(error, result) {
                if (error) {
                    reject(error);
                    return;
                }

                if (result.error) {
                    // @TODO: not any
                    var error: any = new Error(result.error.message);
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
