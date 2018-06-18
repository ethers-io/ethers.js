'use strict';

import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';
import { getNetwork, Networkish } from './networks';

import { defineReadOnly } from '../utils/properties';

import * as errors from '../utils/errors';

export class InfuraProvider extends JsonRpcProvider {
    readonly apiAccessToken: string;

    constructor(network?: Networkish, apiAccessToken?: string) {
        network = getNetwork((network == null) ? 'homestead': network);

        var host = null;
        switch(network.name) {
            case 'homestead':
                host = 'mainnet.infura.io';
                break;
            case 'ropsten':
                host = 'ropsten.infura.io';
                break;
            case 'rinkeby':
                host = 'rinkeby.infura.io';
                break;
            case 'kovan':
                host = 'kovan.infura.io';
                break;
            default:
                throw new Error('unsupported network');
        }

        super('https://' + host + '/' + (apiAccessToken || ''), network);
        errors.checkNew(this, InfuraProvider);

        defineReadOnly(this, 'apiAccessToken', apiAccessToken || null);
    }

    _startPending(): void {
        console.log('WARNING: INFURA does not support pending filters');
    }

    getSigner(address?: string): JsonRpcSigner {
        errors.throwError(
            'INFURA does not support signing',
            errors.UNSUPPORTED_OPERATION,
            { operation: 'getSigner' }
        );
        return null;
    }

    listAccounts(): Promise<Array<string>> {
        return Promise.resolve([]);
    }
}
