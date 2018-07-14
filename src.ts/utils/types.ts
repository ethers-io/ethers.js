

///////////////////////////////
// Bytes

export type Arrayish = string | ArrayLike<number>;


///////////////////////////////
// BigNumber

export interface BigNumber {
    fromTwos(value: number): BigNumber;
    toTwos(value: number): BigNumber;
    add(other: BigNumberish): BigNumber;
    sub(other: BigNumberish): BigNumber;
    div(other: BigNumberish): BigNumber;
    mul(other: BigNumberish): BigNumber;
    mod(other: BigNumberish): BigNumber;
    pow(other: BigNumberish): BigNumber;
    maskn(value: number): BigNumber;
    eq(other: BigNumberish): boolean;
    lt(other: BigNumberish): boolean;
    lte(other: BigNumberish): boolean;
    gt(other: BigNumberish): boolean;
    gte(other: BigNumberish): boolean;
    isZero(): boolean;
    toNumber(): number;
    toString(): string;
    toHexString(): string;
};

export type BigNumberish = BigNumber | string | number | Arrayish;



///////////////////////////////
// Connection

export type ConnectionInfo = {
    url: string,
    user?: string,
    password?: string,
    allowInsecure?: boolean
};


///////////////////////////////
// Crypto

export type SupportedAlgorithms = 'sha256' | 'sha512';

export interface Signature {
    r: string;
    s: string;
    recoveryParam: number;
    v?: number;
}


///////////////////////////////
// Network

export type Network = {
    name: string,
    chainId: number,
    ensAddress?: string,
}

export type Networkish = Network | string | number;


///////////////////////////////
// ABI Coder

export type CoerceFunc = (type: string, value: any) => any;

export type ParamType = {
    name?: string,
    type: string,
    indexed?: boolean,
    components?: Array<any>
};

// @TODO: should this just be a combined Fragment?

export type EventFragment = {
    type: string
    name: string,

    anonymous: boolean,

    inputs: Array<ParamType>,
};

export type FunctionFragment = {
    type: string
    name: string,

    constant: boolean,

    inputs: Array<ParamType>,
    outputs: Array<ParamType>,

    payable: boolean,
    stateMutability: string,
};


///////////////////////////////
// Transactions

export type UnsignedTransaction = {
    to?: string;
    nonce?: number;

    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;

    data?: Arrayish;
    value?: BigNumberish;
    chainId?: number;
}

export interface Transaction {
    hash?: string;

    to?: string;
    from?: string;
    nonce: number;

    gasLimit: BigNumber;
    gasPrice: BigNumber;

    data: string;
    value: BigNumber;
    chainId: number;

    r?: string;
    s?: string;
    v?: number;
}


///////////////////////////////
// Blockchain

export type BlockTag = string | number;

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

export type Filter = {
    fromBlock?: BlockTag,
    toBlock?: BlockTag,
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
    contractAddress?: string,
    transactionIndex?: number,
    root?: string,
    gasUsed?: BigNumber,
    logsBloom?: string,
    blockHash?: string,
    transactionHash?: string,
    logs?: Array<Log>,
    blockNumber?: number,
    cumulativeGasUsed?: BigNumber,
    byzantium: boolean,
    status?: number
};

export type TransactionRequest = {
    to?: string | Promise<string>,
    from?: string | Promise<string>,
    nonce?: number | string | Promise<number | string>,

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

    // Not optional (as it is in Transaction)
    from: string;

    // The raw transaction
    raw?: string,

    // This function waits until the transaction has been mined
    wait: (timeout?: number) => Promise<TransactionReceipt>
};


///////////////////////////////
// Interface

export class Indexed {
    hash: string;
}

export interface DeployDescription {
    type: "deploy";
    inputs: Array<ParamType>;
    payable: boolean;
    encode(bytecode: string, params: Array<any>): string;
}

export interface FunctionDescription {
    type: "call" | "transaction";
    name: string;
    signature: string;
    sighash: string;
    inputs: Array<ParamType>;
    outputs: Array<ParamType>;
    payable: boolean;
    encode(params: Array<any>): string;
    decode(data: string): any;
}

export interface EventDescription {
    type: "event";
    name: string;
    signature: string;
    inputs: Array<ParamType>;
    anonymous: boolean;
    topic: string;
    encodeTopics(params: Array<any>): Array<string>;
    decode(data: string, topics?: Array<string>): any;
}

///////////////////////////////
// Contract

export type EventFilter = {
    address?: string;
    topics?: Array<string>;
    // @TODO: Support OR-style topcis; backwards compatible to make this change
    //topics?: Array<string | Array<string>>
};

// The (n + 1)th parameter passed to contract event callbacks
export interface Event extends Log {
    args: Array<any>;
    decode: (data: string, topics?: Array<string>) => any;
    event: string;
    eventSignature: string;

    removeListener: () => void;

    getBlock: () => Promise<Block>;
    getTransaction: () => Promise<TransactionResponse>;
    getTransactionReceipt: () => Promise<TransactionReceipt>;
}


///////////////////////////////
// Provider

export type EventType = string | Array<string> | Filter;

export type Listener = (...args: Array<any>) => void;

/**
 *  Provider
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Provider.
 */
export abstract class MinimalProvider {
    abstract getNetwork(): Promise<Network>;

    abstract getBlockNumber(): Promise<number>;
    abstract getGasPrice(): Promise<BigNumber>;

    abstract getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    abstract getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    abstract getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> ;
    abstract getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;

    abstract sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    abstract call(transaction: TransactionRequest): Promise<string>;
    abstract estimateGas(transaction: TransactionRequest): Promise<BigNumber>;

    abstract getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    abstract getTransaction(transactionHash: string): Promise<TransactionResponse>;
    abstract getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;

    abstract getLogs(filter: Filter): Promise<Array<Log>>;

    abstract resolveName(name: string | Promise<string>): Promise<string>;
    abstract lookupAddress(address: string | Promise<string>): Promise<string>;

    abstract on(eventName: EventType, listener: Listener): MinimalProvider;
    abstract once(eventName: EventType, listener: Listener): MinimalProvider;
    abstract listenerCount(eventName?: EventType): number;
    abstract listeners(eventName: EventType): Array<Listener>;
    abstract removeAllListeners(eventName: EventType): MinimalProvider;
    abstract removeListener(eventName: EventType, listener: Listener): MinimalProvider;

    // @TODO: This *could* be implemented here, but would pull in events...
    abstract waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionReceipt>;
}


///////////////////////////////
// Signer

export type ProgressCallback = (percent: number) => void;

export type EncryptOptions = {
   iv?: Arrayish;
   entropy?: Arrayish;
   mnemonic?: string;
   path?: string;
   client?: string;
   salt?: Arrayish;
   uuid?: string;
   scrypt?: {
       N?: number;
       r?: number;
       p?: number;
   }
}

/**
 *  Signer
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Signer.
 */
export abstract class Signer {
    provider?: MinimalProvider;

    abstract getAddress(): Promise<string>

    abstract signMessage(transaction: Arrayish | string): Promise<string>;
    abstract sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}

