"use strict";

// To modify this file, you must update ./admin/cmds/update-exports.js

import * as ethers from "./ethers";

if ((<any>global)._ethers == null) {
    (<any>global)._ethers = ethers;
}

export { ethers };

export {
    Signer,

    Wallet,
    VoidSigner,

    getDefaultProvider,
    providers,

    Contract,
    ContractFactory,

    BigNumber,
    FixedNumber,

    constants,
    errors,

    logger,

    utils,

    wordlists,


    ////////////////////////
    // Compile-Time Constants

    version,


    ////////////////////////
    // Types

    ContractFunction,
    ContractReceipt,
    ContractTransaction,
    Event,
    EventFilter,

    Overrides,
    PayableOverrides,
    CallOverrides,

    ContractInterface,

    BigNumberish,

    Bytes,
    BytesLike,

    Signature,

    Transaction,
    UnsignedTransaction,

    Wordlist
} from "./ethers";
