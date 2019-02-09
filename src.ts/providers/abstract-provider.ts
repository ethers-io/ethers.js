
import { BigNumber } from '../utils/bignumber';
import { isType, setType } from '../utils/properties';

///////////////////////////////
// Imported Types

import { Arrayish } from '../utils/bytes';
import { BigNumberish } from '../utils/bignumber';
import { Network } from '../utils/networks';
import { OnceBlockable } from '../utils/web';
import { Transaction } from '../utils/transaction';

///////////////////////////////
// Exported Types

export interface Block {
    hash: string;
    parentHash: string;
    number: number;

    timestamp: number;
    nonce: string;
    difficulty: number;

    gasLimit: BigNumber;
    gasUsed: BigNumber;

    miner: string;
    extraData: string;

    transactions: Array<string>;
}

export type BlockTag = string | number;

export type Filter = {
    fromBlock?: BlockTag,
    toBlock?: BlockTag,
    address?: string,
    topics?: Array<string | Array<string>>,
}

// @TODO: This is not supported as an EventType yet, as it will
//        need some additional work to adhere to the serialized
//        format for events. But we want to allow it for getLogs
//        for now.
export type FilterByBlock = {
    blockHash?: string,
    address?: string,
    topics?: Array<string | Array<string>>,
}

export interface Log {
    blockNumber?: number;
    blockHash?: string;
    transactionIndex?: number;

    removed?: boolean;

    transactionLogIndex?: number,

    address: string;
    data: string;

    topics: Array<string>;

    transactionHash?: string;
    logIndex?: number;
}

export interface TransactionReceipt {
    to?: string;
    from?: string;
    contractAddress?: string,
    transactionIndex?: number,
    root?: string,
    gasUsed?: BigNumber,
    logsBloom?: string,
    blockHash?: string,
    transactionHash?: string,
    logs?: Array<Log>,
    blockNumber?: number,
    confirmations?: number,
    cumulativeGasUsed?: BigNumber,
    byzantium: boolean,
    status?: number
};

export type TransactionRequest = {
    to?: string | Promise<string>,
    from?: string | Promise<string>,
    nonce?: BigNumberish | Promise<BigNumberish>,

    gasLimit?: BigNumberish | Promise<BigNumberish>,
    gasPrice?: BigNumberish | Promise<BigNumberish>,

    data?: Arrayish | Promise<Arrayish>,
    value?: BigNumberish | Promise<BigNumberish>,
    chainId?: number | Promise<number>,
}

export interface TransactionResponse extends Transaction {
    // Only if a transaction has been mined
    blockNumber?: number,
    blockHash?: string,
    timestamp?: number,

    confirmations: number,

    // Not optional (as it is in Transaction)
    from: string;

    // The raw transaction
    raw?: string,

    // This function waits until the transaction has been mined
    wait: (confirmations?: number) => Promise<TransactionReceipt>
};

export type EventType = string | Array<string> | Filter;

export type Listener = (...args: Array<any>) => void;

///////////////////////////////
// Exported Abstracts

export abstract class Provider implements OnceBlockable {
    abstract getNetwork(): Promise<Network>;

    abstract getBlockNumber(): Promise<number>;
    abstract getGasPrice(): Promise<BigNumber>;

    abstract getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    abstract getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    abstract getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> ;
    abstract getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;

    abstract sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    abstract call(transaction: TransactionRequest, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    abstract estimateGas(transaction: TransactionRequest): Promise<BigNumber>;

    abstract getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>, includeTransactions?: boolean): Promise<Block>;
    abstract getTransaction(transactionHash: string): Promise<TransactionResponse>;
    abstract getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;

    abstract getLogs(filter: Filter | FilterByBlock): Promise<Array<Log>>;

    abstract resolveName(name: string | Promise<string>): Promise<string>;
    abstract lookupAddress(address: string | Promise<string>): Promise<string>;
    abstract on(eventName: EventType, listener: Listener): Provider;
    abstract once(eventName: EventType, listener: Listener): Provider;
    abstract listenerCount(eventName?: EventType): number;
    abstract listeners(eventName: EventType): Array<Listener>;
    abstract removeAllListeners(eventName: EventType): Provider;
    abstract removeListener(eventName: EventType, listener: Listener): Provider;

    // @TODO: This *could* be implemented here, but would pull in events...
    abstract waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionReceipt>;

    constructor() {
        setType(this, 'Provider');
    }

    static isProvider(value: any): value is Provider {
        return isType(value, 'Provider');
    }

//    readonly inherits: (child: any) => void;
}

//defineReadOnly(Signer, 'inherits', inheritable(Abstract));

