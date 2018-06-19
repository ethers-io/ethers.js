'use strict';

import { Contract, Interface } from './contracts';
import * as providers from './providers';
import * as errors from './utils/errors';
import { getNetwork } from './providers/networks';
import utils from './utils';
import { HDNode, SigningKey, Wallet } from './wallet';

//import info from '../package.json';
//console.log(info);
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

    version
};

/*
export default {
    Wallet: wallet.Wallet,

    HDNode: wallet.HDNode,
    SigningKey: wallet.SigningKey,

//    Contract: contracts.Contract,
//    Interface: contracts.Interface,

//    networks: providers.networks,
//    providers: providers,

    errors: errors,
    utils: utils,

//    version: version,
}
*/
