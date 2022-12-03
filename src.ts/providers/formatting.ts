/**
 *  About provider formatting?
 *
 *  @_section: api/providers/formatting:Formatting  [provider-formatting]
 */

import type { Signature } from "../crypto/index.js";
import type { AccessList } from "../transaction/index.js";

/*
export interface TransactionRequest {
    type?: null | number;

    to?: null | AddressLike;
    from?: null | AddressLike;

    nonce?: null | number;

    gasLimit?: null | BigNumberish;
    gasPrice?: null | BigNumberish;

    maxPriorityFeePerGas?: null | BigNumberish;
    maxFeePerGas?: null | BigNumberish;

    data?: null | string;
    value?: null | BigNumberish;
    chainId?: null | BigNumberish;

    accessList?: null | AccessListish;

    customData?: any;

    // Only meaningful when used for call
    blockTag?: BlockTag;
    enableCcipRead?: boolean;

    // Todo?
    //gasMultiplier?: number;
};
export interface PreparedTransactionRequest {
    type?: number;

    to?: AddressLike;
    from?: AddressLike;

    nonce?: number;

    gasLimit?: bigint;
    gasPrice?: bigint;

    maxPriorityFeePerGas?: bigint;
    maxFeePerGas?: bigint;

    data?: string;
    value?: bigint;
    chainId?: bigint;

    accessList?: AccessList;

    customData?: any;

    blockTag?: BlockTag;
    enableCcipRead?: boolean;
}
*/


//////////////////////
// Block

export interface BlockParams {
    hash?: null | string;

    number: number;
    timestamp: number;

    parentHash: string;

    nonce: string;
    difficulty: bigint;

    gasLimit: bigint;
    gasUsed: bigint;

    miner: string;
    extraData: string;

    baseFeePerGas: null | bigint;

    transactions: ReadonlyArray<string | TransactionResponseParams>;
};


//////////////////////
// Log

export interface LogParams {
    transactionHash: string;
    blockHash: string;
    blockNumber: number;

    removed: boolean;

    address: string;
    data: string;

    topics: ReadonlyArray<string>;

    index: number;
    transactionIndex: number;
}


//////////////////////
// Transaction Receipt

export interface TransactionReceiptParams {
    to: null | string;
    from: string;
    contractAddress: null | string;

    hash: string;
    index: number;

    blockHash: string;
    blockNumber: number;

    logsBloom: string;
    logs: ReadonlyArray<LogParams>;

    gasUsed: bigint;
    cumulativeGasUsed: bigint;
    gasPrice?: null | bigint;
    effectiveGasPrice?: null | bigint;

    type: number;
    //byzantium: boolean;
    status: null | number;
    root: null | string;
}

/*
export interface LegacyTransactionReceipt {
    byzantium: false;
    status: null;
    root: string;
}

export interface ByzantiumTransactionReceipt {
    byzantium: true;
    status: number;
    root: null;
}
*/



//////////////////////
// Transaction Response

export interface TransactionResponseParams {
    blockNumber: null | number;
    blockHash: null | string;

    hash: string;
    index: number;

    type: number;

    to: null | string;
    from: string;

    nonce: number;

    gasLimit: bigint;

    gasPrice: bigint;

    maxPriorityFeePerGas: null | bigint;
    maxFeePerGas: null | bigint;

    data: string;
    value: bigint;
    chainId: bigint;

    signature: Signature;

    accessList: null | AccessList;
};


