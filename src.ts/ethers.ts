'use strict';

// This is empty in node, and used by browserify to inject extra goodies
import { platform } from './utils/shims';

import { Contract, Interface } from './contracts';
import {
    Provider,
    getDefaultProvider,

    FallbackProvider,

    EtherscanProvider,
    InfuraProvider,
    JsonRpcProvider,
    Web3Provider,

    IpcProvider,
} from './providers';
import { HDNode, SigningKey, Wallet } from './wallet';

import * as utils from './utils';
import * as wordlists from './wordlists';

import * as types from './types';

import * as errors from './utils/errors';

import { version } from './_version';

const constants = utils.constants;

export {
    Wallet,

    HDNode,
    SigningKey,

    Contract,
    Interface,

    getDefaultProvider,
    Provider,
    FallbackProvider,
    EtherscanProvider,
    InfuraProvider,
    JsonRpcProvider,
    Web3Provider,
    IpcProvider,

    types,

    errors,
    constants,
    utils,

    wordlists,

    platform,
    version
};

