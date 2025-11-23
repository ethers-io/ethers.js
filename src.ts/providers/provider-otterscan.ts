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
import { formatTransactionReceipt, formatTransactionResponse } from "./format.js";

import type { JsonRpcApiProviderOptions } from "./provider-jsonrpc.js";
import type { Networkish } from "./network.js";
import type { FetchRequest } from "../utils/index.js";
import type { BlockParams, TransactionReceiptParams, TransactionResponseParams } from "./formatting.js";
import type { Fragment } from "../abi/index.js";

// Otterscan default maximum page size for queries
// This can be changed: https://docs.otterscan.io/install/erigon-optional
const OTS_DEFAULT_PAGE_SIZE = 25;

// Formatted Otterscan receipt (extends standard receipt with timestamp)
export interface OtsTransactionReceiptParams extends TransactionReceiptParams {
    timestamp: number; // Otterscan adds a Unix timestamp
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
    value: string;
}

/**
 * Block data for Otterscan (transactions list and logsBloom removed for efficiency)
 */
export interface OtsBlockParams extends Omit<BlockParams, "logsBloom" | "transactions"> {
    /** Logs bloom set to null for bandwidth efficiency */
    logsBloom: null;
}

/**
 * Block details with issuance and fee information
 * Returns modified block data (log blooms set to null) plus Otterscan extensions
 */
export interface OtsBlockDetails {
    /** Block data with transactions list removed and log blooms set to null for efficiency */
    block: OtsBlockParams;
    /** Block issuance information */
    issuance?: {
        blockReward: string;
        uncleReward: string;
        issuance: string;
    };
    /** Total fees collected in the block */
    totalFees?: string;
}

/**
 * Receipt for block transactions (logs and logsBloom set to null for efficiency)
 */
export interface OtsBlockTransactionReceipt extends Omit<TransactionReceiptParams, "logs" | "logsBloom"> {
    /** Logs set to null for bandwidth efficiency */
    logs: null;
    /** Logs bloom set to null for bandwidth efficiency */
    logsBloom: null;
}

/**
 * Paginated block transactions with receipts (uses optimized receipt format)
 */
export interface OtsBlockTransactionsPage {
    /** Transaction bodies with input truncated to 4-byte selector */
    transactions: Array<TransactionResponseParams>;
    /** Receipts with logs and bloom set to null for bandwidth efficiency */
    receipts: Array<OtsBlockTransactionReceipt>;
}

/**
 * Paginated search results for address transaction history (uses standard ethers types)
 */
export interface OtsAddressTransactionsPage {
    /** Array of transactions */
    txs: TransactionResponseParams[];
    /** Array of corresponding receipts with timestamps */
    receipts: OtsTransactionReceiptParams[];
    /** Whether this is the first page */
    firstPage: boolean;
    /** Whether this is the last page */
    lastPage: boolean;
}

/**
 * Trace entry from ots_traceTransaction
 */
export interface OtsTraceEntry {
    /** Type of operation (CALL, DELEGATECALL, STATICCALL, CREATE, etc.) */
    type: string;
    /** Call depth in the execution stack */
    depth: number;
    /** Source address */
    from: string;
    /** Target address */
    to: string;
    /** Value transferred (hex string, null for delegate/static calls) */
    value: string | null;
    /** Input data for the call */
    input?: string;
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
     * Check if an address has deployed code (is a contract vs EOA)
     * More efficient than eth_getCode for checking contract vs EOA status
     * @param address - The address to check
     * @param blockTag - Block number or "latest"
     * @returns True if address has code (is a contract)
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
    async getTransactionErrorData(txHash: string): Promise<string> {
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
     * @returns Array of trace entries showing call execution flow
     */
    async traceTransaction(txHash: string): Promise<OtsTraceEntry[]> {
        return await this.send("ots_traceTransaction", [txHash]);
    }

    /**
     * Get detailed block information including issuance and fees
     * Tailor-made version of eth_getBlock - removes transaction list and log blooms for efficiency
     * @param blockNumber - Block number
     * @returns Block details with additional metadata
     */
    async getBlockDetails(blockNumber: number): Promise<OtsBlockDetails> {
        return await this.send("ots_getBlockDetails", [blockNumber]);
    }

    /**
     * Get detailed block information including issuance and fees (by hash)
     * Same as ots_getBlockDetails, but accepts a block hash as parameter
     * @param blockHash - Block hash
     * @returns Block details with additional metadata
     */
    async getBlockDetailsByHash(blockHash: string): Promise<OtsBlockDetails> {
        return await this.send("ots_getBlockDetailsByHash", [blockHash]);
    }

    /**
     * Get paginated transactions for a block
     * Removes verbose fields like logs from receipts to save bandwidth
     * @param blockNumber - Block number
     * @param page - Page number (0-based)
     * @param pageSize - Soft limit on transactions per page (actual results may exceed this if a block contains more transactions)
     * @returns Page of transactions and receipts (with logs removed)
     */
    async getBlockTransactions(blockNumber: number, page: number, pageSize: number): Promise<OtsBlockTransactionsPage> {
        return await this.send("ots_getBlockTransactions", [blockNumber, page, pageSize]);
    }

    /**
     * Search for inbound/outbound transactions before a specific block for an address
     * Provides paginated transaction history with in-node search (no external indexer needed)
     * @param address - Address to search for
     * @param blockNumber - Starting block number
     * @param pageSize - Soft limit on results to return (actual results may exceed this if a block contains more transactions)
     * @returns Page of transactions and receipts
     */
    async searchTransactionsBefore(
        address: string,
        blockNumber: number,
        pageSize: number
    ): Promise<OtsAddressTransactionsPage> {
        const result = await this.send("ots_searchTransactionsBefore", [address, blockNumber, pageSize]) as OtsAddressTransactionsPage;
        return {
            ...result,
            txs: result.txs.map(tx => formatTransactionResponse(tx)),
            receipts: result.receipts.map(receipt => ({
                ...formatTransactionReceipt(receipt),
                timestamp: receipt.timestamp
            }))
        };
    }

    /**
     * Search for inbound/outbound transactions after a specific block for an address
     * Provides paginated transaction history with in-node search (no external indexer needed)
     * @param address - Address to search for
     * @param blockNumber - Starting block number
     * @param pageSize - Soft limit on results to return (actual results may exceed this if a block contains more transactions)
     * @returns Page of transactions and receipts
     */
    async searchTransactionsAfter(
        address: string,
        blockNumber: number,
        pageSize: number
    ): Promise<OtsAddressTransactionsPage> {
        const result = await this.send("ots_searchTransactionsAfter", [address, blockNumber, pageSize]) as OtsAddressTransactionsPage;
        return {
            ...result,
            txs: result.txs.map(tx => formatTransactionResponse(tx)),
            receipts: result.receipts.map(receipt => ({
                ...formatTransactionReceipt(receipt),
                timestamp: receipt.timestamp
            }))
        };
    }

    /**
     * Get transaction hash by sender address and nonce
     * Enables navigation between nonces from the same sender (not available in standard JSON-RPC)
     * @param sender - Sender address
     * @param nonce - Transaction nonce
     * @returns Transaction hash or null if not found
     */
    async getTransactionBySenderAndNonce(sender: string, nonce: number): Promise<string | null> {
        return await this.send("ots_getTransactionBySenderAndNonce", [sender, nonce]);
    }

    /**
     * Get contract creator information (transaction hash and creator address)
     * Provides info not available through standard JSON-RPC API
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
     * Iterate through transaction history for an address between block ranges
     * @param address - Address to search
     * @param startBlock - Starting block number (inclusive)
     * @param endBlock - Ending block number (inclusive)
     * @yields Object with tx and receipt for each transaction in ascending block order
     */
    async *iterateAddressHistory(
        address: string,
        startBlock: number,
        endBlock: number,
        pageSize: number = OTS_DEFAULT_PAGE_SIZE
    ): AsyncGenerator<{ tx: TransactionResponseParams; receipt: OtsTransactionReceiptParams }, void, unknown> {
        let currentBlock = startBlock;

        while (currentBlock <= endBlock) {
            const page = await this.searchTransactionsAfter(address, currentBlock, pageSize);

            // Sort by block number ascending (API returns descending)
            const sortedIndices = page.txs
                .map((tx, index) => ({ blockNum: Number(tx.blockNumber), index }))
                .sort((a, b) => a.blockNum - b.blockNum)
                .map(item => item.index);

            for (const i of sortedIndices) {
                const tx = page.txs[i];
                const blockNum = Number(tx.blockNumber);

                if (blockNum >= startBlock && blockNum <= endBlock) {
                    yield {
                        tx: tx,
                        receipt: page.receipts[i]
                    };
                }

                if (blockNum > endBlock) return;
            }

            // Check if we've reached the end of available data
            if (page.lastPage) break;

            // Move to the next block after the last transaction we saw
            const lastTx = page.txs[page.txs.length - 1];
            if (!lastTx) break;

            const nextBlock = Number(lastTx.blockNumber);

            // Prevent infinite loops from malformed API responses
            if (nextBlock === currentBlock) {
                throw new Error(`Iterator stuck on block ${currentBlock}. API returned same block number.`);
            }

            // Move cursor forward
            currentBlock = nextBlock + 1;
        }
    }
}
