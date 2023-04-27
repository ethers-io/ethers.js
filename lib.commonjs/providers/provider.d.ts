import type { AddressLike, NameResolver } from "../address/index.js";
import type { BigNumberish, EventEmitterable } from "../utils/index.js";
import type { Signature } from "../crypto/index.js";
import type { AccessList, AccessListish, TransactionLike } from "../transaction/index.js";
import type { ContractRunner } from "./contracts.js";
import type { Network } from "./network.js";
export type BlockTag = BigNumberish | string;
import { BlockParams, LogParams, TransactionReceiptParams, TransactionResponseParams } from "./formatting.js";
/**
 *  A **FeeData** wraps all the fee-related values associated with
 *  the network.
 */
export declare class FeeData {
    /**
     *  The gas price for legacy networks.
     */
    readonly gasPrice: null | bigint;
    /**
     *  The maximum fee to pay per gas.
     *
     *  The base fee per gas is defined by the network and based on
     *  congestion, increasing the cost during times of heavy load
     *  and lowering when less busy.
     *
     *  The actual fee per gas will be the base fee for the block
     *  and the priority fee, up to the max fee per gas.
     *
     *  This will be ``null`` on legacy networks (i.e. [pre-EIP-1559](link-eip-1559))
     */
    readonly maxFeePerGas: null | bigint;
    /**
     *  The additional amout to pay per gas to encourage a validator
     *  to include the transaction.
     *
     *  The purpose of this is to compensate the validator for the
     *  adjusted risk for including a given transaction.
     *
     *  This will be ``null`` on legacy networks (i.e. [pre-EIP-1559](link-eip-1559))
     */
    readonly maxPriorityFeePerGas: null | bigint;
    /**
     *  Creates a new FeeData for %%gasPrice%%, %%maxFeePerGas%% and
     *  %%maxPriorityFeePerGas%%.
     */
    constructor(gasPrice?: null | bigint, maxFeePerGas?: null | bigint, maxPriorityFeePerGas?: null | bigint);
    /**
     *  Returns a JSON-friendly value.
     */
    toJSON(): any;
}
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
    blockTag?: BlockTag;
    enableCcipRead?: boolean;
}
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
export declare function copyRequest(req: TransactionRequest): PreparedTransactionRequest;
/**
 *  An Interface to indicate a [[Block]] has been included in the
 *  blockchain. This asserts a Type Guard that necessary properties
 *  are non-null.
 *
 *  Before a block is included, it is a //pending// block.
 */
export interface MinedBlock extends Block {
    readonly number: number;
    readonly hash: string;
    readonly timestamp: number;
    readonly date: Date;
    readonly miner: string;
}
/**
 *  A **Block** represents the data associated with a full block on
 *  Ethereum.
 */
export declare class Block implements BlockParams, Iterable<string> {
    #private;
    /**
     *  The provider connected to the block used to fetch additional details
     *  if necessary.
     */
    readonly provider: Provider;
    /**
     *  The block number, sometimes called the block height. This is a
     *  sequential number that is one higher than the parent block.
     */
    readonly number: number;
    /**
     *  The block hash.
     */
    readonly hash: null | string;
    /**
     *  The timestamp for this block, which is the number of seconds since
     *  epoch that this block was included.
     */
    readonly timestamp: number;
    /**
     *  The block hash of the parent block.
     */
    readonly parentHash: string;
    /**
     *  The nonce.
     *
     *  On legacy networks, this is the random number inserted which
     *  permitted the difficulty target to be reached.
     */
    readonly nonce: string;
    /**
     *  The difficulty target.
     *
     *  On legacy networks, this is the proof-of-work target required
     *  for a block to meet the protocol rules to be included.
     *
     *  On modern networks, this is a random number arrived at using
     *  randao.  @TODO: Find links?
     */
    readonly difficulty: bigint;
    /**
     *  The total gas limit for this block.
     */
    readonly gasLimit: bigint;
    /**
     *  The total gas used in this block.
     */
    readonly gasUsed: bigint;
    /**
     *  The miner coinbase address, wihch receives any subsidies for
     *  including this block.
     */
    readonly miner: string;
    /**
     *  Any extra data the validator wished to include.
     */
    readonly extraData: string;
    /**
     *  The base fee per gas that all transactions in this block were
     *  charged.
     *
     *  This adjusts after each block, depending on how congested the network
     *  is.
     */
    readonly baseFeePerGas: null | bigint;
    /**
     *  Create a new **Block** object.
     *
     *  This should generally not be necessary as the unless implementing a
     *  low-level library.
     */
    constructor(block: BlockParams, provider: Provider);
    /**
     *  Returns the list of transaction hashes.
     */
    get transactions(): ReadonlyArray<string>;
    /**
     *  Returns the complete transactions for blocks which
     *  prefetched them, by passing ``true`` to %%prefetchTxs%%
     *  into [[provider_getBlock]].
     */
    get prefetchedTransactions(): Array<TransactionResponse>;
    /**
     *  Returns a JSON-friendly value.
     */
    toJSON(): any;
    [Symbol.iterator](): Iterator<string>;
    /**
     *  The number of transactions in this block.
     */
    get length(): number;
    /**
     *  The [[link-js-date]] this block was included at.
     */
    get date(): null | Date;
    /**
     *  Get the transaction at %%indexe%% within this block.
     */
    getTransaction(indexOrHash: number | string): Promise<TransactionResponse>;
    getPrefetchedTransaction(indexOrHash: number | string): TransactionResponse;
    /**
     *  Has this block been mined.
     *
     *  If true, the block has been typed-gaurded that all mined
     *  properties are non-null.
     */
    isMined(): this is MinedBlock;
    /**
     *
     */
    isLondon(): this is (Block & {
        baseFeePerGas: bigint;
    });
    orphanedEvent(): OrphanFilter;
}
export declare class Log implements LogParams {
    readonly provider: Provider;
    readonly transactionHash: string;
    readonly blockHash: string;
    readonly blockNumber: number;
    readonly removed: boolean;
    readonly address: string;
    readonly data: string;
    readonly topics: ReadonlyArray<string>;
    readonly index: number;
    readonly transactionIndex: number;
    constructor(log: LogParams, provider: Provider);
    toJSON(): any;
    getBlock(): Promise<Block>;
    getTransaction(): Promise<TransactionResponse>;
    getTransactionReceipt(): Promise<TransactionReceipt>;
    removedEvent(): OrphanFilter;
}
export declare class TransactionReceipt implements TransactionReceiptParams, Iterable<Log> {
    #private;
    readonly provider: Provider;
    readonly to: null | string;
    readonly from: string;
    readonly contractAddress: null | string;
    readonly hash: string;
    readonly index: number;
    readonly blockHash: string;
    readonly blockNumber: number;
    readonly logsBloom: string;
    readonly gasUsed: bigint;
    readonly cumulativeGasUsed: bigint;
    readonly gasPrice: bigint;
    readonly type: number;
    readonly status: null | number;
    readonly root: null | string;
    constructor(tx: TransactionReceiptParams, provider: Provider);
    get logs(): ReadonlyArray<Log>;
    toJSON(): any;
    get length(): number;
    [Symbol.iterator](): Iterator<Log>;
    get fee(): bigint;
    getBlock(): Promise<Block>;
    getTransaction(): Promise<TransactionResponse>;
    getResult(): Promise<string>;
    confirmations(): Promise<number>;
    removedEvent(): OrphanFilter;
    reorderedEvent(other?: TransactionResponse): OrphanFilter;
}
export interface MinedTransactionResponse extends TransactionResponse {
    blockNumber: number;
    blockHash: string;
    date: Date;
}
export declare class TransactionResponse implements TransactionLike<string>, TransactionResponseParams {
    #private;
    /**
     *  The provider this is connected to, which will influence how its
     *  methods will resolve its async inspection methods.
     */
    readonly provider: Provider;
    /**
     *  The block number of the block that this transaction was included in.
     *
     *  This is ``null`` for pending transactions.
     */
    readonly blockNumber: null | number;
    /**
     *  The blockHash of the block that this transaction was included in.
     *
     *  This is ``null`` for pending transactions.
     */
    readonly blockHash: null | string;
    /**
     *  The index within the block that this transaction resides at.
     */
    readonly index: number;
    /**
     *  The transaction hash.
     */
    readonly hash: string;
    /**
     *  The [[link-eip-2718]] transaction envelope type. This is
     *  ``0`` for legacy transactions types.
     */
    readonly type: number;
    /**
     *  The receiver of this transaction.
     *
     *  If ``null``, then the transaction is an initcode transaction.
     *  This means the result of executing the [[data]] will be deployed
     *  as a new contract on chain (assuming it does not revert) and the
     *  address may be computed using [[getCreateAddress]].
     */
    readonly to: null | string;
    /**
     *  The sender of this transaction. It is implicitly computed
     *  from the transaction pre-image hash (as the digest) and the
     *  [[signature]] using ecrecover.
     */
    readonly from: string;
    /**
     *  The nonce, which is used to prevent replay attacks and offer
     *  a method to ensure transactions from a given sender are explicitly
     *  ordered.
     *
     *  When sending a transaction, this must be equal to the number of
     *  transactions ever sent by [[from]].
     */
    readonly nonce: number;
    /**
     *  The maximum units of gas this transaction can consume. If execution
     *  exceeds this, the entries transaction is reverted and the sender
     *  is charged for the full amount, despite not state changes being made.
     */
    readonly gasLimit: bigint;
    /**
     *  The gas price can have various values, depending on the network.
     *
     *  In modern networks, for transactions that are included this is
     *  the //effective gas price// (the fee per gas that was actually
     *  charged), while for transactions that have not been included yet
     *  is the [[maxFeePerGas]].
     *
     *  For legacy transactions, or transactions on legacy networks, this
     *  is the fee that will be charged per unit of gas the transaction
     *  consumes.
     */
    readonly gasPrice: bigint;
    /**
     *  The maximum priority fee (per unit of gas) to allow a
     *  validator to charge the sender. This is inclusive of the
     *  [[maxFeeFeePerGas]].
     */
    readonly maxPriorityFeePerGas: null | bigint;
    /**
     *  The maximum fee (per unit of gas) to allow this transaction
     *  to charge the sender.
     */
    readonly maxFeePerGas: null | bigint;
    /**
     *  The data.
     */
    readonly data: string;
    /**
     *  The value, in wei. Use [[formatEther]] to format this value
     *  as ether.
     */
    readonly value: bigint;
    /**
     *  The chain ID.
     */
    readonly chainId: bigint;
    /**
     *  The signature.
     */
    readonly signature: Signature;
    /**
     *  The [[link-eip-2930]] access list for transaction types that
     *  support it, otherwise ``null``.
     */
    readonly accessList: null | AccessList;
    /**
     *  Create a new TransactionResponse with %%tx%% parameters
     *  connected to %%provider%%.
     */
    constructor(tx: TransactionResponseParams, provider: Provider);
    /**
     *  Returns a JSON representation of this transaction.
     */
    toJSON(): any;
    /**
     *  Resolves to the Block that this transaction was included in.
     *
     *  This will return null if the transaction has not been included yet.
     */
    getBlock(): Promise<null | Block>;
    /**
     *  Resolves to this transaction being re-requested from the
     *  provider. This can be used if you have an unmined transaction
     *  and wish to get an up-to-date populated instance.
     */
    getTransaction(): Promise<null | TransactionResponse>;
    /**
     *  Resolves once this transaction has been mined and has
     *  %%confirms%% blocks including it (default: ``1``) with an
     *  optional %%timeout%%.
     *
     *  This can resolve to ``null`` only if %%confirms%% is ``0``
     *  and the transaction has not been mined, otherwise this will
     *  wait until enough confirmations have completed.
     */
    wait(_confirms?: number, _timeout?: number): Promise<null | TransactionReceipt>;
    /**
     *  Returns ``true`` if this transaction has been included.
     *
     *  This is effective only as of the time the TransactionResponse
     *  was instantiated. To get up-to-date information, use
     *  [[getTransaction]].
     *
     *  This provides a Type Guard that this transaction will have
     *  non-null property values for properties that are null for
     *  unmined transactions.
     */
    isMined(): this is MinedTransactionResponse;
    /**
     *  Returns true if the transaction is a legacy (i.e. ``type == 0``)
     *  transaction.
     *
     *  This provides a Type Guard that this transaction will have
     *  the ``null``-ness for hardfork-specific properties set correctly.
     */
    isLegacy(): this is (TransactionResponse & {
        accessList: null;
        maxFeePerGas: null;
        maxPriorityFeePerGas: null;
    });
    /**
     *  Returns true if the transaction is a Berlin (i.e. ``type == 1``)
     *  transaction. See [[link-eip-2070]].
     *
     *  This provides a Type Guard that this transaction will have
     *  the ``null``-ness for hardfork-specific properties set correctly.
     */
    isBerlin(): this is (TransactionResponse & {
        accessList: AccessList;
        maxFeePerGas: null;
        maxPriorityFeePerGas: null;
    });
    /**
     *  Returns true if the transaction is a London (i.e. ``type == 2``)
     *  transaction. See [[link-eip-1559]].
     *
     *  This provides a Type Guard that this transaction will have
     *  the ``null``-ness for hardfork-specific properties set correctly.
     */
    isLondon(): this is (TransactionResponse & {
        accessList: AccessList;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
    });
    /**
     *  Returns a filter which can be used to listen for orphan events
     *  that evict this transaction.
     */
    removedEvent(): OrphanFilter;
    /**
     *  Returns a filter which can be used to listen for orphan events
     *  that re-order this event against %%other%%.
     */
    reorderedEvent(other?: TransactionResponse): OrphanFilter;
    /**
     *  Returns a new TransactionResponse instance which has the ability to
     *  detect (and throw an error) if the transaction is replaced, which
     *  will begin scanning at %%startBlock%%.
     *
     *  This should generally not be used by developers and is intended
     *  primarily for internal use. Setting an incorrect %%startBlock%% can
     *  have devastating performance consequences if used incorrectly.
     */
    replaceableTransaction(startBlock: number): TransactionResponse;
}
/**
 *  An Orphan Filter allows detecting when an orphan block has
 *  resulted in dropping a block or transaction or has resulted
 *  in transactions changing order.
 *
 *  Not currently fully supported.
 */
export type OrphanFilter = {
    orphan: "drop-block";
    hash: string;
    number: number;
} | {
    orphan: "drop-transaction";
    tx: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
    other?: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
} | {
    orphan: "reorder-transaction";
    tx: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
    other?: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
} | {
    orphan: "drop-log";
    log: {
        transactionHash: string;
        blockHash: string;
        blockNumber: number;
        address: string;
        data: string;
        topics: ReadonlyArray<string>;
        index: number;
    };
};
/**
 *  A **TopicFilter** provides a struture to define bloom-filter
 *  queries.
 *
 *  Each field that is ``null`` matches **any** value, a field that is
 *  a ``string`` must match exactly that value and and ``array`` is
 *  effectively an ``OR``-ed set, where any one of those values must
 *  match.
 */
export type TopicFilter = Array<null | string | Array<string>>;
export interface EventFilter {
    address?: AddressLike | Array<AddressLike>;
    topics?: TopicFilter;
}
export interface Filter extends EventFilter {
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
}
export interface FilterByBlockHash extends EventFilter {
    blockHash?: string;
}
export type ProviderEvent = string | Array<string | Array<string>> | EventFilter | OrphanFilter;
/**
 *  A **Provider** is the primary method to interact with the read-only
 *  content on Ethereum.
 *
 *  It allows access to details about accounts, blocks and transactions
 *  and the ability to query event logs and simulate contract execution.
 *
 *  Account data includes the [balance](getBalance),
 *  [transaction count](getTransactionCount), [code](getCode) and
 *  [state trie storage](getStorage).
 *
 *  Simulating execution can be used to [call](call),
 *  [estimate gas](estimateGas) and
 *  [get transaction results](getTransactionResult).
 *
 *  The [[broadcastTransaction]] is the only method which allows updating
 *  the blockchain, but it is usually accessed by a [[Signer]], since a
 *  private key must be used to sign the transaction before it can be
 *  broadcast.
 */
export interface Provider extends ContractRunner, EventEmitterable<ProviderEvent>, NameResolver {
    /**
     *  The provider iteself.
     *
     *  This is part of the necessary API for executing a contract, as
     *  it provides a common property on any [[ContractRunner]] that
     *  can be used to access the read-only portion of the runner.
     */
    provider: this;
    /**
     *  Shutdown any resources this provider is using. No additional
     *  calls should be made to this provider after calling this.
     */
    destroy(): void;
    /**
     *  Get the current block number.
     */
    getBlockNumber(): Promise<number>;
    /**
     *  Get the connected [[Network]].
     */
    getNetwork(): Promise<Network>;
    /**
     *  Get the best guess at the recommended [[FeeData]].
     */
    getFeeData(): Promise<FeeData>;
    /**
     *  Get the account balance (in wei) of %%address%%. If %%blockTag%%
     *  is specified and the node supports archive access for that
     *  %%blockTag%%, the balance is as of that [[BlockTag]].
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getBalance(address: AddressLike, blockTag?: BlockTag): Promise<bigint>;
    /**
     *  Get the number of transactions ever sent for %%address%%, which
     *  is used as the ``nonce`` when sending a transaction. If
     *  %%blockTag%% is specified and the node supports archive access
     *  for that %%blockTag%%, the transaction count is as of that
     *  [[BlockTag]].
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getTransactionCount(address: AddressLike, blockTag?: BlockTag): Promise<number>;
    /**
     *  Get the bytecode for %%address%%.
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getCode(address: AddressLike, blockTag?: BlockTag): Promise<string>;
    /**
     *  Get the storage slot value for %%address%% at slot %%position%%.
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getStorage(address: AddressLike, position: BigNumberish, blockTag?: BlockTag): Promise<string>;
    /**
     *  Estimates the amount of gas required to executre %%tx%%.
     */
    estimateGas(tx: TransactionRequest): Promise<bigint>;
    /**
     *  Simulate the execution of %%tx%%. If the call reverts, it will
     *  throw a [[CallExceptionError]] which includes the revert data.
     */
    call(tx: TransactionRequest): Promise<string>;
    /**
     *  Broadcasts the %%signedTx%% to the network, adding it to the
     *  memory pool of any node for which the transaction meets the
     *  rebroadcast requirements.
     */
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
    /**
     *  Resolves to the block for %%blockHashOrBlockTag%%.
     *
     *  If %%prefetchTxs%%, and the backend supports including transactions
     *  with block requests, all transactions will be included and the
     *  [[Block]] object will not need to make remote calls for getting
     *  transactions.
     */
    getBlock(blockHashOrBlockTag: BlockTag | string, prefetchTxs?: boolean): Promise<null | Block>;
    /**
     *  Resolves to the transaction for %%hash%%.
     *
     *  If the transaction is unknown or on pruning nodes which
     *  discard old transactions this resolves to ``null``.
     */
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    /**
     *  Resolves to the transaction receipt for %%hash%%, if mined.
     *
     *  If the transaction has not been mined, is unknown or on
     *  pruning nodes which discard old transactions this resolves to
     *  ``null``.
     */
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;
    /**
     *  Resolves to the result returned by the executions of %%hash%%.
     *
     *  This is only supported on nodes with archive access and with
     *  the necessary debug APIs enabled.
     */
    getTransactionResult(hash: string): Promise<null | string>;
    /**
     *  Resolves to the list of Logs that match %%filter%%
     */
    getLogs(filter: Filter | FilterByBlockHash): Promise<Array<Log>>;
    /**
     *  Resolves to the address configured for the %%ensName%% or
     *  ``null`` if unconfigured.
     */
    resolveName(ensName: string): Promise<null | string>;
    /**
     *  Resolves to the ENS name associated for the %%address%% or
     *  ``null`` if the //primary name// is not configured.
     *
     *  Users must perform additional steps to configure a //primary name//,
     *  which is not currently common.
     */
    lookupAddress(address: string): Promise<null | string>;
    /**
     *  Waits until the transaction %%hash%% is mined and has %%confirms%%
     *  confirmations.
     */
    waitForTransaction(hash: string, confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;
    /**
     *  Resolves to the block at %%blockTag%% once it has been mined.
     *
     *  This can be useful for waiting some number of blocks by using
     *  the ``currentBlockNumber + N``.
     */
    waitForBlock(blockTag?: BlockTag): Promise<Block>;
}
//# sourceMappingURL=provider.d.ts.map