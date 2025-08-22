/**
 *  The Otterscan provider extends JsonRpcProvider to provide
 *  specialized methods for interacting with Erigon nodes that expose
 *  the ots_* JSON-RPC methods.
 *
 *  These methods are optimized for blockchain explorers and provide
 *  efficient access to transaction details, internal operations,
 *  and paginated transaction history.
 *
 * @_subsection: api/providers/thirdparty:Otterscan  [providers-otterscan]
 */

import { Interface } from "../abi/index.js";
import { dataSlice } from "../utils/index.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { JsonRpcApiProviderOptions } from "./provider-jsonrpc.js";
import type { Networkish } from "./network.js";
import type { FetchRequest } from "../utils/index.js";
import type { BlockParams } from "./formatting.js";
import type { Fragment } from "../abi/index.js";
import type { AccessList } from "../transaction/index.js";
import type { HexString } from "../utils/data.js";

// Log entry in transaction receipts - matches ethers LogParams but with hex strings from raw RPC
export interface OtsLog {
    address: string;
    topics: ReadonlyArray<string>;
    data: string;
    blockNumber: string; // hex string from RPC, not parsed number
    transactionHash: string;
    transactionIndex: string; // hex string from RPC, not parsed number
    blockHash: string;
    logIndex: string; // hex string from RPC, not parsed number
    removed: boolean;
}

// Otterscan transaction type - raw RPC response with hex-encoded values
export interface OtsTransaction {
    // Core transaction fields (always present)
    blockHash: string;
    blockNumber: string; // hex-encoded number
    from: string;
    gas: string; // hex-encoded gasLimit
    gasPrice: string; // hex-encoded bigint
    hash: string;
    input: string; // transaction data
    nonce: string; // hex-encoded number
    to: string;
    transactionIndex: string; // hex-encoded number
    value: string; // hex-encoded bigint
    type: string; // hex-encoded transaction type (0x0, 0x1, 0x2, etc.)
    chainId: string; // hex-encoded bigint

    // Signature components (always present)
    v: string; // hex-encoded
    r: string; // hex signature component
    s: string; // hex signature component

    // EIP-1559 fields (present in type 0x2 transactions)
    maxPriorityFeePerGas?: string; // hex-encoded bigint
    maxFeePerGas?: string; // hex-encoded bigint
    yParity?: string; // hex-encoded (0x0 or 0x1)

    // EIP-2930/EIP-1559 field
    accessList?: AccessList;
}

// Otterscan receipt type - raw RPC response format
export interface OtsReceipt {
    // Core receipt fields
    blockHash: string;
    blockNumber: string; // hex-encoded number
    contractAddress: string | null; // null for non-contract-creating txs
    cumulativeGasUsed: string; // hex-encoded bigint
    effectiveGasPrice: string; // hex-encoded bigint
    from: string;
    gasUsed: string; // hex-encoded bigint
    logs: OtsLog[];
    logsBloom: string; // hex-encoded bloom filter
    status: string; // hex-encoded: "0x1" success, "0x0" failure
    to: string;
    transactionHash: string;
    transactionIndex: string; // hex-encoded number
    type: string; // hex-encoded transaction type

    // Otterscan-specific extension
    timestamp: number; // Unix timestamp as actual number (not hex)
}

// Otterscan search page result
export interface OtsSearchResult {
    txs: OtsTransaction[];
    receipts: OtsReceipt[];
    firstPage: boolean;
    lastPage: boolean;
}

/**
 * Internal operation types returned by ots_getInternalOperations
 */
export interface OtsInternalOp {
    /** Operation type: 0=transfer, 1=selfdestruct, 2=create, 3=create2 */
    type: 0 | 1 | 2 | 3;
    /** Source address */
    from: string;
    /** Target address (null for self-destruct operations) */
    to: string | null;
    /** Value transferred (hex quantity) */
    value: HexString;
}

/**
 * Block details with issuance and fee information
 */
export interface OtsBlockDetails {
    /** Raw block data */
    block: BlockParams;
    /** Number of transactions in the block */
    transactionCount: number;
    /** Block reward information (optional) */
    issuance?: {
        blockReward: HexString;
        uncleReward: HexString;
        issuance: HexString;
    };
    /** Total fees collected in the block */
    totalFees?: HexString;
}

/**
 * Paginated block transactions with receipts
 */
export interface OtsBlockTxPage {
    /** Transaction bodies with input truncated to 4-byte selector */
    transactions: Array<OtsTransaction>;
    /** Receipts with logs and bloom set to null */
    receipts: Array<OtsReceipt>;
}

/**
 * Paginated search results for address transaction history
 */
export interface OtsSearchPage {
    /** Array of transactions */
    txs: OtsTransaction[];
    /** Array of corresponding receipts */
    receipts: OtsReceipt[];
    /** Whether this is the first page */
    firstPage: boolean;
    /** Whether this is the last page */
    lastPage: boolean;
}

/**
 * Contract creator information
 */
export interface OtsContractCreator {
    /** Transaction hash where contract was created */
    hash: string;
    /** Address of the contract creator */
    creator: string;
}

/**
 * The OtterscanProvider extends JsonRpcProvider to add support for
 * Erigon's OTS (Otterscan) namespace methods.
 *
 * These methods provide efficient access to blockchain data optimized
 * for explorer applications.
 *
 * **Note**: OTS methods are only available on Erigon nodes with the
 * ots namespace enabled via --http.api "eth,erigon,trace,ots"
 */
export class OtterscanProvider extends JsonRpcProvider {
    constructor(url?: string | FetchRequest, network?: Networkish, options?: JsonRpcApiProviderOptions) {
        super(url, network, options);
    }

    /**
     * Get the OTS API level supported by the node
     * @returns The API level number
     */
    async otsApiLevel(): Promise<number> {
        return await this.send("ots_getApiLevel", []);
    }

    /**
     * Check if an address has code at a specific block
     * @param address - The address to check
     * @param blockTag - Block number or "latest"
     * @returns True if address has code
     */
    async hasCode(address: string, blockTag: string | number | "latest" = "latest"): Promise<boolean> {
        const blockNumber = blockTag === "latest" ? "latest" : Number(blockTag);
        return await this.send("ots_hasCode", [address, blockNumber]);
    }

    /**
     * Get internal operations (transfers, creates, selfdestructs) for a transaction
     * @param txHash - Transaction hash
     * @returns Array of internal operations
     */
    async getInternalOperations(txHash: string): Promise<OtsInternalOp[]> {
        return await this.send("ots_getInternalOperations", [txHash]);
    }

    /**
     * Get raw revert data for a failed transaction
     * @param txHash - Transaction hash
     * @returns Raw revert data as hex string, "0x" if no error
     */
    async getTransactionErrorData(txHash: string): Promise<HexString> {
        return await this.send("ots_getTransactionError", [txHash]);
    }

    /**
     * Get human-readable revert reason for a failed transaction
     * @param txHash - Transaction hash
     * @param customAbi - Optional custom ABI for decoding custom errors
     * @returns Decoded error message or null if no error
     */
    async getTransactionRevertReason(txHash: string, customAbi?: Fragment[]): Promise<string | null> {
        const data: string = await this.getTransactionErrorData(txHash);
        if (data === "0x") return null;

        // Try to decode Error(string) - the most common case
        const ERROR_SIG = "0x08c379a0";
        if (data.startsWith(ERROR_SIG)) {
            try {
                const iface = new Interface(["error Error(string)"]);
                const decoded = iface.decodeErrorResult("Error", data);
                return String(decoded[0]);
            } catch {
                // Fall through to other attempts
            }
        }

        // Try custom error set if provided
        if (customAbi) {
            try {
                const iface = new Interface(customAbi);
                const parsed = iface.parseError(data);
                if (parsed) {
                    return `${parsed.name}(${parsed.args
                        .map(a => {
                            try {
                                return JSON.stringify(a);
                            } catch {
                                return String(a);
                            }
                        })
                        .join(",")})`;
                }
            } catch {
                // Fall through to selector display
            }
        }

        // Last resort: show 4-byte selector
        return `revert data selector ${dataSlice(data, 0, 4)}`;
    }

    /**
     * Get execution trace for a transaction
     * @param txHash - Transaction hash
     * @returns Trace data
     */
    async traceTransaction(txHash: string): Promise<any> {
        return await this.send("ots_traceTransaction", [txHash]);
    }

    /**
     * Get detailed block information including issuance and fees
     * @param blockNumber - Block number
     * @returns Block details with additional metadata
     */
    async getBlockDetails(blockNumber: number): Promise<OtsBlockDetails> {
        return await this.send("ots_getBlockDetails", [blockNumber]);
    }

    /**
     * Get paginated transactions for a block
     * @param blockNumber - Block number
     * @param page - Page number (0-based)
     * @param pageSize - Number of transactions per page
     * @returns Page of transactions and receipts
     */
    async getBlockTransactions(blockNumber: number, page: number, pageSize: number): Promise<OtsBlockTxPage> {
        return await this.send("ots_getBlockTransactions", [blockNumber, page, pageSize]);
    }

    /**
     * Search for transactions before a specific block for an address
     * @param address - Address to search for
     * @param blockNumber - Starting block number
     * @param pageSize - Maximum results to return
     * @returns Page of transactions
     */
    async searchTransactionsBefore(address: string, blockNumber: number, pageSize: number): Promise<OtsSearchResult> {
        return await this.send("ots_searchTransactionsBefore", [address, blockNumber, pageSize]);
    }

    /**
     * Search for transactions after a specific block for an address
     * @param address - Address to search for
     * @param blockNumber - Starting block number
     * @param pageSize - Maximum results to return
     * @returns Page of transactions
     */
    async searchTransactionsAfter(address: string, blockNumber: number, pageSize: number): Promise<OtsSearchResult> {
        return await this.send("ots_searchTransactionsAfter", [address, blockNumber, pageSize]);
    }

    /**
     * Get transaction hash by sender address and nonce
     * @param sender - Sender address
     * @param nonce - Transaction nonce
     * @returns Transaction hash or null if not found
     */
    async getTransactionBySenderAndNonce(sender: string, nonce: number): Promise<string | null> {
        return await this.send("ots_getTransactionBySenderAndNonce", [sender, nonce]);
    }

    /**
     * Get contract creator information
     * @param address - Contract address
     * @returns Creator info or null if not a contract
     */
    async getContractCreator(address: string): Promise<OtsContractCreator | null> {
        return await this.send("ots_getContractCreator", [address]);
    }

    /**
     * Verify OTS availability and check minimum API level
     * @param minLevel - Minimum required API level (default: 0)
     * @throws Error if OTS is unavailable or API level too low
     */
    async ensureOts(minLevel: number = 0): Promise<void> {
        try {
            const level = await this.otsApiLevel();
            if (level < minLevel) {
                throw new Error(`ots_getApiLevel ${level} < required ${minLevel}`);
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            const err = new Error(`Erigon OTS namespace unavailable or too old: ${errorMsg}`);
            (err as any).code = "OTS_UNAVAILABLE";
            throw err;
        }
    }

    /**
     * Iterate through transaction history for an address
     * @param address - Address to search
     * @param direction - Search direction ("before" or "after")
     * @param startBlock - Starting block number
     * @param pageSize - Results per page (default: 500)
     * @yields Object with tx and receipt for each transaction
     */
    async *iterateAddressHistory(
        address: string,
        direction: "before" | "after",
        startBlock: number,
        pageSize: number = 500
    ): AsyncGenerator<{ tx: OtsTransaction; receipt: OtsReceipt }, void, unknown> {
        let currentBlock = startBlock;

        while (true) {
            const page =
                direction === "before"
                    ? await this.searchTransactionsBefore(address, currentBlock, pageSize)
                    : await this.searchTransactionsAfter(address, currentBlock, pageSize);

            // Yield each transaction with its receipt
            for (let i = 0; i < page.txs.length; i++) {
                yield {
                    tx: page.txs[i],
                    receipt: page.receipts[i]
                };
            }

            // Check if we've reached the end
            if (page.lastPage) break;

            // Update block cursor for next iteration
            const lastTx = page.txs[page.txs.length - 1];
            if (!lastTx) break;

            const nextBlock = Number(lastTx.blockNumber);

            // Prevent infinite loops from malformed API responses
            if (nextBlock === currentBlock) {
                throw new Error(`Iterator stuck on block ${currentBlock}. API returned same block number.`);
            }

            currentBlock = nextBlock;
        }
    }
}
