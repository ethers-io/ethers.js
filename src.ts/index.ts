'use strict';

// This is empty in node, and used by browserify to inject extra goodies
import {} from './utils/shims';

import { Contract, Interface } from './contracts';
import * as providers from './providers';
import * as errors from './utils/errors';
import { getNetwork } from './providers/networks';
import * as utils from './utils';
import { HDNode, SigningKey, Wallet } from './wallet';
import * as wordlists from './wordlists';

// @TODO:
//import info from '../package.json';
console.log("@TODO: Get version");
const version = "4.0.0";

export {
    Wallet,

    HDNode,
    SigningKey,

    Contract,
    Interface,

    getNetwork,
    providers,

    errors,
    utils,

    wordlists,

    version
};

export default {
    Wallet,

    HDNode,
    SigningKey,

    Contract,
    Interface,

    getNetwork,
    providers,

    errors,
    utils,

    wordlists,

    version
}
