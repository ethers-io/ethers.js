'use strict';

import { Provider } from './provider';

import { EtherscanProvider } from './etherscan-provider';
import { FallbackProvider } from './fallback-provider';
import { IpcProvider } from './ipc-provider';
import { InfuraProvider } from './infura-provider';
import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';
import { Web3Provider } from './web3-provider';

///////////////////////////////
// Imported Abstracts

import { Provider as AbstractProvider } from './abstract-provider';

///////////////////////////////
// Imported Types

import { Network } from '../utils/networks';

///////////////////////////////

function getDefaultProvider(network?: Network | string): Provider {
    return new FallbackProvider([
        new InfuraProvider(network),
        new EtherscanProvider(network),
    ]);
}

export {
    AbstractProvider,

    Provider,
    getDefaultProvider,

    FallbackProvider,

    EtherscanProvider,
    InfuraProvider,
    JsonRpcProvider,
    Web3Provider,

    IpcProvider,

    JsonRpcSigner
};

