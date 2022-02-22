"use strict";
// To modify this file, you must update ./misc/admin/lib/cmds/update-exports.js
import * as hethers from "./hethers";
try {
    const anyGlobal = window;
    if (anyGlobal._ethers == null) {
        anyGlobal._ethers = hethers;
    }
}
catch (error) { }
export { hethers };
export { Signer, Wallet, VoidSigner, getDefaultProvider, providers, BaseContract, Contract, ContractFactory, BigNumber, FixedNumber, constants, errors, logger, utils, wordlists, 
////////////////////////
// Compile-Time Constants
version, Wordlist } from "./hethers";
//# sourceMappingURL=index.js.map