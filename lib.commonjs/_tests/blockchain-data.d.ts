export type TestBlockchainNetwork = "mainnet" | "goerli";
export interface TestBlockchainAddress {
    test: string;
    address: string;
    code?: string;
    nonce?: number;
    name?: string;
    balance?: bigint;
    storage?: Record<string, string>;
}
export interface TestBlockchainBlock {
    test: string;
    hash: string;
    parentHash: string;
    number: number;
    timestamp: number;
    nonce: string;
    difficulty: bigint;
    gasLimit: bigint;
    gasUsed: bigint;
    miner: string;
    extraData: string;
    transactions: Array<string>;
    baseFeePerGas?: bigint;
}
export interface TestBlockchainTransaction {
    test: string;
    hash: string;
    blockHash: string;
    blockNumber: number;
    type: number;
    from: string;
    gasPrice: bigint;
    gasLimit: bigint;
    to: string;
    value: bigint;
    nonce: number;
    data: string;
    signature: {
        r: string;
        s: string;
        yParity: 0 | 1;
        v: number;
        networkV: null | bigint;
    };
    creates: null | string;
    chainId: bigint;
    accessList?: Array<Record<string, Array<string>>>;
    maxPriorityFeePerGas?: bigint;
    maxFeePerGas?: bigint;
}
export interface TestBlockchainReceipt {
    test: string;
    blockHash: string;
    blockNumber: number;
    type: number;
    contractAddress: null | string;
    cumulativeGasUsed: bigint;
    from: string;
    gasUsed: bigint;
    gasPrice: bigint;
    logs: Array<{
        address: string;
        blockHash: string;
        blockNumber: number;
        data: string;
        index: number;
        topics: Array<string>;
        transactionHash: string;
        transactionIndex: number;
    }>;
    logsBloom: string;
    root: null | string;
    status: null | number;
    to: string;
    hash: string;
    index: number;
}
export declare const testAddress: Record<TestBlockchainNetwork, Array<TestBlockchainAddress>>;
export declare const testBlock: Record<TestBlockchainNetwork, Array<TestBlockchainBlock>>;
export declare const testTransaction: Record<TestBlockchainNetwork, Array<TestBlockchainTransaction>>;
export declare const testReceipt: Record<TestBlockchainNetwork, Array<TestBlockchainReceipt>>;
export declare const networkNames: Array<TestBlockchainNetwork>;
export declare function networkFeatureAtBlock(feature: string, block: number): boolean;
