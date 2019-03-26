'use strict';

import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';

import { getNetwork } from '../utils/networks';
import { defineReadOnly } from '../utils/properties';

import { Networkish } from '../utils/networks';

import * as errors from '../errors';

// Provider for connecting to Nodesmith's hosted JSON RPC endpoints
export class NodesmithProvider extends JsonRpcProvider {
    readonly apiKey: string;

    constructor(apiKey: string, network?: Networkish,) {
        const standardNetwork = getNetwork(network || 'homestead');
        const supportedNetworks: {[key: string]: string} = {
            homestead: 'mainnet',
            ropsten: 'ropsten',
            rinkeby: 'rinkeby',
            goerli: 'goerli',
            kovan: 'kovan'
        };

        if (Object.keys(supportedNetworks).indexOf(standardNetwork.name) < 0) {
            errors.throwError('unsupported network', errors.INVALID_ARGUMENT, {
                argument: "network",
                value: network
            });
        }

        if (!apiKey) {
            errors.throwError('missing required api key. Get one at https://nodesmith.io', errors.INVALID_ARGUMENT, {
                argument: "apiKey",
                value: apiKey
            });
        }

        const networkName = supportedNetworks[standardNetwork.name];
        const url = `https://ethereum.api.nodesmith.io/v1/${networkName}/jsonrpc?apiKey=${apiKey}`;
        super(url, standardNetwork);

        defineReadOnly(this, 'apiKey', apiKey);

        errors.checkNew(this, NodesmithProvider);
    }

    protected _startPending(): void {
        errors.warn('WARNING: NODESMITH does not support pending filters');
    }

    getSigner(address?: string): JsonRpcSigner {
        return errors.throwError(
            'NODESMITH does not support signing',
            errors.UNSUPPORTED_OPERATION,
            { operation: 'getSigner' }
        );
    }
}
