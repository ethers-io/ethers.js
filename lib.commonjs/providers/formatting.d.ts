/**
 *  About provider formatting?
 *
 *  @_section: api/providers/formatting:Formatting  [provider-formatting]
 */
import type { Signature } from "../crypto/index.js";
import type { AccessList } from "../transaction/index.js";
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
}
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
    status: null | number;
    root: null | string;
}
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
}
//# sourceMappingURL=formatting.d.ts.map