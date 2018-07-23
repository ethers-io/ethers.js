export declare type Arrayish = string | ArrayLike<number>;
export declare abstract class BigNumber {
    abstract fromTwos(value: number): BigNumber;
    abstract toTwos(value: number): BigNumber;
    abstract add(other: BigNumberish): BigNumber;
    abstract sub(other: BigNumberish): BigNumber;
    abstract div(other: BigNumberish): BigNumber;
    abstract mul(other: BigNumberish): BigNumber;
    abstract mod(other: BigNumberish): BigNumber;
    abstract pow(other: BigNumberish): BigNumber;
    abstract maskn(value: number): BigNumber;
    abstract eq(other: BigNumberish): boolean;
    abstract lt(other: BigNumberish): boolean;
    abstract lte(other: BigNumberish): boolean;
    abstract gt(other: BigNumberish): boolean;
    abstract gte(other: BigNumberish): boolean;
    abstract isZero(): boolean;
    abstract toNumber(): number;
    abstract toString(): string;
    abstract toHexString(): string;
}
export declare type BigNumberish = BigNumber | string | number | Arrayish;
export declare type ConnectionInfo = {
    url: string;
    user?: string;
    password?: string;
    allowInsecure?: boolean;
};
export interface OnceBlockable {
    once(eventName: "block", handler: () => void): void;
}
export declare type PollOptions = {
    timeout?: number;
    floor?: number;
    ceiling?: number;
    interval?: number;
    onceBlock?: OnceBlockable;
};
export declare type SupportedAlgorithms = 'sha256' | 'sha512';
export interface Signature {
    r: string;
    s: string;
    recoveryParam?: number;
    v?: number;
}
export declare type Network = {
    name: string;
    chainId: number;
    ensAddress?: string;
};
export declare type Networkish = Network | string | number;
export declare type CoerceFunc = (type: string, value: any) => any;
export declare type ParamType = {
    name?: string;
    type: string;
    indexed?: boolean;
    components?: Array<any>;
};
export declare type EventFragment = {
    type: string;
    name: string;
    anonymous: boolean;
    inputs: Array<ParamType>;
};
export declare type FunctionFragment = {
    type: string;
    name: string;
    constant: boolean;
    inputs: Array<ParamType>;
    outputs: Array<ParamType>;
    payable: boolean;
    stateMutability: string;
};
export declare type UnsignedTransaction = {
    to?: string;
    nonce?: number;
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
    data?: Arrayish;
    value?: BigNumberish;
    chainId?: number;
};
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
export declare type BlockTag = string | number;
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
export declare type Filter = {
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
    address?: string;
    topics?: Array<string | Array<string>>;
};
export interface Log {
    blockNumber?: number;
    blockHash?: string;
    transactionIndex?: number;
    removed?: boolean;
    transactionLogIndex?: number;
    address: string;
    data: string;
    topics: Array<string>;
    transactionHash?: string;
    logIndex?: number;
}
export interface TransactionReceipt {
    contractAddress?: string;
    transactionIndex?: number;
    root?: string;
    gasUsed?: BigNumber;
    logsBloom?: string;
    blockHash?: string;
    transactionHash?: string;
    logs?: Array<Log>;
    blockNumber?: number;
    cumulativeGasUsed?: BigNumber;
    byzantium: boolean;
    status?: number;
}
export declare type TransactionRequest = {
    to?: string | Promise<string>;
    from?: string | Promise<string>;
    nonce?: number | string | Promise<number | string>;
    gasLimit?: BigNumberish | Promise<BigNumberish>;
    gasPrice?: BigNumberish | Promise<BigNumberish>;
    data?: Arrayish | Promise<Arrayish>;
    value?: BigNumberish | Promise<BigNumberish>;
    chainId?: number | Promise<number>;
};
export interface TransactionResponse extends Transaction {
    blockNumber?: number;
    blockHash?: string;
    timestamp?: number;
    from: string;
    raw?: string;
    wait: (timeout?: number) => Promise<TransactionReceipt>;
}
export declare abstract class Indexed {
    readonly hash: string;
}
export interface DeployDescription {
    readonly inputs: Array<ParamType>;
    readonly payable: boolean;
    encode(bytecode: string, params: Array<any>): string;
}
export interface FunctionDescription {
    readonly type: "call" | "transaction";
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;
    readonly inputs: Array<ParamType>;
    readonly outputs: Array<ParamType>;
    readonly payable: boolean;
    encode(params: Array<any>): string;
    decode(data: string): any;
}
export interface EventDescription {
    readonly name: string;
    readonly signature: string;
    readonly inputs: Array<ParamType>;
    readonly anonymous: boolean;
    readonly topic: string;
    encodeTopics(params: Array<any>): Array<string>;
    decode(data: string, topics?: Array<string>): any;
}
export interface LogDescription {
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly values: Array<any>;
}
export interface TransactionDescription {
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly decode: (data: string) => any;
    readonly value: BigNumber;
}
export declare type ContractFunction = (...params: Array<any>) => Promise<any>;
export declare type EventFilter = {
    address?: string;
    topics?: Array<string>;
};
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
export declare type EventType = string | Array<string> | Filter;
export declare type Listener = (...args: Array<any>) => void;
/**
 *  Provider
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Provider.
 */
export declare abstract class MinimalProvider implements OnceBlockable {
    abstract getNetwork(): Promise<Network>;
    abstract getBlockNumber(): Promise<number>;
    abstract getGasPrice(): Promise<BigNumber>;
    abstract getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    abstract getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    abstract getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
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
    abstract waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionReceipt>;
}
export declare type AsyncProvider = {
    isMetaMask?: boolean;
    host?: string;
    path?: string;
    sendAsync: (request: any, callback: (error: any, response: any) => void) => void;
};
export declare type ProgressCallback = (percent: number) => void;
export declare type EncryptOptions = {
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
    };
};
/**
 *  Signer
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Signer.
 */
export declare abstract class Signer {
    provider?: MinimalProvider;
    abstract getAddress(): Promise<string>;
    abstract signMessage(message: Arrayish | string): Promise<string>;
    abstract sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}
export declare abstract class HDNode {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly mnemonic: string;
    readonly path: string;
    readonly chainCode: string;
    readonly index: number;
    readonly depth: number;
    abstract derivePath(path: string): HDNode;
}
export interface Wordlist {
    locale: string;
    getWord(index: number): string;
    getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
}
//# sourceMappingURL=types.d.ts.map