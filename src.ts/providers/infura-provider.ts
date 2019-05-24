'use strict';

import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';

import { isHexString } from "../utils/bytes";
import { getNetwork } from '../utils/networks';
import { defineReadOnly } from '../utils/properties';

// Imported Types
import { Networkish } from '../utils/networks';

import * as errors from '../errors';

const defaultProjectId = "7d0d81d0919f4f05b9ab6634be01ee73";

export class InfuraProvider extends JsonRpcProvider {
    readonly apiAccessToken: string;
    readonly projectId: string;

    constructor(network?: Networkish, projectId?: string) {
        let standard = getNetwork((network == null) ? 'homestead': network);
        if (projectId == null) { projectId = defaultProjectId; }

        let host = null;
        switch(standard.name) {
            case 'homestead':
                host = 'mainnet.infura.io';
                break;
            case 'ropsten':
                host = 'ropsten.infura.io';
                break;
            case 'rinkeby':
                host = 'rinkeby.infura.io';
                break;
            case 'goerli':
                host = 'goerli.infura.io';
                break;
            case 'kovan':
                host = 'kovan.infura.io';
                break;
            default:
                errors.throwError('unsupported network', errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }

        // New-style Project ID
        if (isHexString("0x" + projectId, 16)) {
            super('https://' + host + '/v3/' + projectId, standard);
            defineReadOnly(this, 'apiAccessToken', null);
            defineReadOnly(this, 'projectId', projectId);

        // Legacy API Access Token
        } else {
            errors.warn("The legacy INFURA apiAccesToken API is deprecated; please upgrade to a Project ID instead (see INFURA dshboard; https://infura.io)");
            super('https://' + host + '/' + projectId, standard);
            defineReadOnly(this, 'apiAccessToken', projectId);
            defineReadOnly(this, 'projectId', null);
        }

        errors.checkNew(this, InfuraProvider);
    }

    protected _startPending(): void {
        errors.warn('WARNING: INFURA does not support pending filters');
    }

    getSigner(address?: string): JsonRpcSigner {
        return errors.throwError(
            'INFURA does not support signing',
            errors.UNSUPPORTED_OPERATION,
            { operation: 'getSigner' }
        );
    }

    listAccounts(): Promise<Array<string>> {
        return Promise.resolve([]);
    }
}
