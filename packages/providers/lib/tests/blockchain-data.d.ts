export interface TestCaseBlockchainAddress {
    address: string;
    code?: string;
    name?: string;
    balance?: bigint;
    storage?: Record<string, string>;
}
export interface TestCaseBlockchainBlock {
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
export interface TestCaseBlockchainTransaction {
    hash: string;
    blockHash: string;
    blockNumber: number;
    index: number;
    type: number;
    from: string;
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    gasLimit: bigint;
    to: null | string;
    value: bigint;
    nonce: number;
    data: string;
    signature: {
        r: string;
        s: string;
        yParity: number;
        v: number;
    };
    creates: null | string;
    chainId: number;
    accessList?: Array<{
        address: string;
        storageKeys: Array<string>;
    }>;
}
export interface TestCaseBlockchainLog {
    address: string;
    blockHash: string;
    blockNumber: number;
    data: string;
    index: number;
    topics: Array<string>;
    transactionHash: string;
    transactionIndex: number;
}
export interface TestCaseBlockchainReceipt {
    blockHash: string;
    blockNumber: number;
    type: number;
    contractAddress: null | string;
    cumulativeGasUsed: bigint;
    from: string;
    gasUsed: bigint;
    gasPrice: bigint;
    logs: Array<TestCaseBlockchainLog>;
    logsBloom: string;
    root: null | string;
    status: null | number;
    to: string;
    hash: string;
    index: number;
}
export interface TestCaseBlockchain {
    addresses: Array<TestCaseBlockchainAddress>;
    blocks: Array<TestCaseBlockchainBlock>;
    transactions: Array<TestCaseBlockchainTransaction>;
    receipts: Array<TestCaseBlockchainReceipt>;
}
export declare const BlockchainData: Record<string, TestCaseBlockchain>;
//# sourceMappingURL=blockchain-data.d.ts.map