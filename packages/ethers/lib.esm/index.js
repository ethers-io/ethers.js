"use strict";
// To modify this file, you must update ./admin/cmds/update-exports.js
import * as ethers from "./ethers";
if (global._ethers == null) {
    global._ethers = ethers;
}
export { ethers };
export { Signer, Wallet, VoidSigner, getDefaultProvider, providers, Contract, ContractFactory, BigNumber, FixedNumber, constants, errors, logger, utils, wordlists, 
////////////////////////
// Compile-Time Constants
version, Wordlist } from "./ethers";
