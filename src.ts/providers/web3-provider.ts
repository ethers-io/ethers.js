'use strict';

import { JsonRpcProvider } from './json-rpc-provider';

import { defineReadOnly } from '../utils/properties';

// Imported Types
import { Networkish } from '../utils/networks';

import * as errors from '../errors';


// Exported Types
export type AsyncSendable = {
    isMetaMask?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (request: any, callback: (error: any, response: any) => void) => void
    send?: (request: any, callback: (error: any, response: any) => void) => void
}

/*
@TODO
utils.defineProperty(Web3Signer, 'onchange', {

});

*/

let _nextId = 42;

export class Web3Provider extends JsonRpcProvider {
    readonly _web3Provider: AsyncSendable;
    private _sendAsync: (request: any, callback: (error: any, response: any) => void) => void;

    constructor(web3Provider: AsyncSendable, network?: Networkish) {
        // HTTP has a host; IPC has a path.
        super(web3Provider.host || web3Provider.path || '', network);
        errors.checkNew(this, Web3Provider);

        if (web3Provider) {
            if (web3Provider.sendAsync) {
                this._sendAsync = web3Provider.sendAsync.bind(web3Provider);
            } else if (web3Provider.send) {
                this._sendAsync = web3Provider.send.bind(web3Provider);
            }
        }

        if (!web3Provider || !this._sendAsync) {
            errors.throwError(
                'invalid web3Provider',
                errors.INVALID_ARGUMENT,
                { arg: 'web3Provider', value: web3Provider }
            );
        }

        defineReadOnly(this, '_web3Provider', web3Provider);

        // @TODO: In v5 remove the above definition; only this one is needed
        defineReadOnly(this, 'provider', web3Provider);
    }

    send(method: string, params: any): Promise<any> {

        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == 'eth_sign' && this._web3Provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = 'personal_sign';
            params = [ params[1], params[0] ];
        }

        return new Promise((resolve, reject) => {
            let request = {
                method: method,
                params: params,
                id: (_nextId++),
                jsonrpc: "2.0"
            };

            this._sendAsync(request, function(error, result) {
                if (error) {
                    reject(error);
                    return;
                }

                if (result.error) {
                    // @TODO: not any
                    let error: any = new Error(result.error.message);
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
