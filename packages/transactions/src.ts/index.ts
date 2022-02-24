"use strict";

import { AccountLike, getAccountFromAddress, getAddress } from "@hethers/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import {
    arrayify,
    BytesLike,
    hexDataLength,
    hexDataSlice,
    hexlify,
    SignatureLike,
} from "@ethersproject/bytes";
import {Zero} from "@hethers/constants";
import {keccak256} from "@ethersproject/keccak256";
import {computePublicKey, recoverPublicKey} from "@ethersproject/signing-key";

import {Logger} from "@hethers/logger";
import {version} from "./_version";
import * as base64 from "@ethersproject/base64";
import {getAddressFromAccount} from "@hethers/address";
import {
    ContractCreateTransaction,
    ContractExecuteTransaction, ContractId, FileAppendTransaction,
    FileCreateTransaction,
    Transaction as HederaTransaction,
    PublicKey as HederaPubKey, TransactionId, AccountId, TransferTransaction, AccountCreateTransaction, Hbar, HbarUnit
} from "@hashgraph/sdk";

const logger = new Logger(version);

///////////////////////////////
// Exported Types

export type AccessList = Array<{ address: string, storageKeys: Array<string> }>;

// Input allows flexibility in describing an access list
export type AccessListish = AccessList |
                            Array<[ string, Array<string> ]> |
                            Record<string, Array<string>>;

export enum TransactionTypes {
    legacy = 0,
    eip2930 = 1,
    eip1559 = 2,
}

export type UnsignedTransaction = {
    to?: AccountLike,
    from?: AccountLike,
    gasLimit?: BigNumberish,
    data?: BytesLike,
    value?: BigNumberish,
    chainId?: number
    type?: number;
    accessList?: AccessListish;
    maxPriorityFeePerGas?: BigNumberish;
    maxFeePerGas?: BigNumberish;
    nodeId?: AccountLike,
    customData?: Record<string, any>;
}

export interface Transaction {
    transactionId: string;
    hash?: string;

    to?: string;
    from?: string;

    gasLimit: BigNumber;

    data: string;
    value: BigNumber;
    chainId: number;

    r?: string;
    s?: string;
    v?: number;

    // EIP-2930; Type 1 & EIP-1559; Type 2
    accessList?: AccessList;
}

type HederaTransactionContents = {
    transactionId: string,
    hash: string,
    to?: string,
    from: string,
    gasLimit: BigNumber,
    value: BigNumber,
    data: string
}

///////////////////////////////

function handleNumber(value: string): BigNumber {
    if (value === "0x") { return Zero; }
    return BigNumber.from(value);
}

export function computeAddress(key: BytesLike | string): string {
    const publicKey = computePublicKey(key);
    return getAddress(hexDataSlice(keccak256(hexDataSlice(publicKey, 1)), 12));
}

export function computeAlias(key: BytesLike | string): string {
    const publicKey = computePublicKey(key);
    return computeAliasFromPubKey(publicKey);
}

export function computeAliasFromPubKey(pubKey: string): string {
    return `0.0.${base64.encode(pubKey)}`;
}

export function recoverAddress(digest: BytesLike, signature: SignatureLike): string {
    return computeAddress(recoverPublicKey(arrayify(digest), signature));
}

function accessSetify(addr: string, storageKeys: Array<string>): { address: string,storageKeys: Array<string> } {
    return {
        address: getAddress(addr),
        storageKeys: (storageKeys || []).map((storageKey, index) => {
            if (hexDataLength(storageKey) !== 32) {
                logger.throwArgumentError("invalid access list storageKey", `accessList[${ addr }:${ index }]`, storageKey)
            }
            return storageKey.toLowerCase();
        })
    };
}

export function accessListify(value: AccessListish): AccessList {
    if (Array.isArray(value)) {
        return (<Array<[ string, Array<string>] | { address: string, storageKeys: Array<string>}>>value).map((set, index) => {
            if (Array.isArray(set)) {
                if (set.length > 2) {
                    logger.throwArgumentError("access list expected to be [ address, storageKeys[] ]", `value[${ index }]`, set);
                }
                return accessSetify(set[0], set[1])
            }
            return accessSetify(set.address, set.storageKeys);
        });
    }

    const result: Array<{ address: string, storageKeys: Array<string> }> = Object.keys(value).map((addr) => {
        const storageKeys: Record<string, true> = value[addr].reduce((accum, storageKey) => {
            accum[storageKey] = true;
            return accum;
        }, <Record<string, true>>{ });
        return accessSetify(addr, Object.keys(storageKeys).sort())
    });
    result.sort((a, b) => (a.address.localeCompare(b.address)));
    return result;
}

export function serializeHederaTransaction(transaction: UnsignedTransaction, pubKey?: HederaPubKey) : HederaTransaction {
    let tx: HederaTransaction;
    const arrayifiedData = transaction.data ? arrayify(transaction.data) : new Uint8Array();
    const gas = numberify(transaction.gasLimit ? transaction.gasLimit : 0);
    if (transaction.customData.isCryptoTransfer) {
        tx = new TransferTransaction()
            .addHbarTransfer(transaction.from.toString(), new Hbar(transaction.value.toString(), HbarUnit.Tinybar).negated())
            .addHbarTransfer(transaction.to.toString(), new Hbar(transaction.value.toString(), HbarUnit.Tinybar));
    } else if (transaction.to) {
        tx = new ContractExecuteTransaction()
            .setContractId(ContractId.fromSolidityAddress(getAddressFromAccount(transaction.to)))
            .setFunctionParameters(arrayifiedData)
            .setGas(gas);
        if (transaction.value) {
            (tx as ContractExecuteTransaction).setPayableAmount(transaction.value?.toString())
        }
    } else {
        if (transaction.customData.bytecodeFileId) {
            tx = new ContractCreateTransaction()
                .setBytecodeFileId(transaction.customData.bytecodeFileId)
                .setConstructorParameters(arrayifiedData)
                .setInitialBalance(transaction.value?.toString())
                .setGas(gas);
        } else {
            if (transaction.customData.fileChunk && transaction.customData.fileId) {
                tx = new FileAppendTransaction()
                    .setContents(transaction.customData.fileChunk)
                    .setFileId(transaction.customData.fileId)
            } else if (!transaction.customData.fileId && transaction.customData.fileChunk) {
                // only a chunk, thus the first one
                tx = new FileCreateTransaction()
                    .setContents(transaction.customData.fileChunk)
                    .setKeys([transaction.customData.fileKey ?
                        transaction.customData.fileKey :
                        pubKey
                    ]);
            } else if (transaction.customData.publicKey) {
                const {publicKey, initialBalance} = transaction.customData;
                tx = new AccountCreateTransaction()
                    .setKey(HederaPubKey.fromString(publicKey.toString()))
                    .setInitialBalance(Hbar.fromTinybars(initialBalance.toString()));
            }
            else {
                logger.throwArgumentError(
                    "Cannot determine transaction type from given custom data. Need either `to`, `fileChunk`, `fileId` or `bytecodeFileId`",
                    Logger.errors.INVALID_ARGUMENT,
                    transaction);
            }
        }
    }
    const account = getAccountFromAddress(transaction.from.toString());
    tx.setTransactionId(
        TransactionId.generate(new AccountId({
            shard: numberify(account.shard),
            realm: numberify(account.realm),
            num: numberify(account.num)
        })))
    .setNodeAccountIds([AccountId.fromString(transaction.nodeId.toString())])
    .freeze();
    return tx;
}

export async function parse(rawTransaction: BytesLike): Promise<Transaction> {
    const payload = arrayify(rawTransaction);

    let parsed;
    try {
        parsed = HederaTransaction.fromBytes(payload);
    } catch (error) {
        logger.throwArgumentError(error.message, "rawTransaction", rawTransaction);
    }
    const tx = parsed.transactionId;

    const nanos = tx.validStart.nanos.toString().padStart(9, '0');
    const seconds = tx.validStart.seconds.toString().padStart(10, '0');

    let contents = {
        transactionId: `${tx.accountId.toString()}-${seconds}-${nanos}`,
        hash: hexlify(await parsed.getTransactionHash()), //stringify?
        from: getAddressFromAccount(parsed.transactionId.accountId.toString()),
    } as HederaTransactionContents;

    if (parsed instanceof ContractExecuteTransaction) {
        parsed = parsed as ContractExecuteTransaction;
        contents.to = getAddressFromAccount(parsed.contractId?.toString());
        contents.gasLimit = handleNumber(parsed.gas.toString());
        contents.value = parsed.payableAmount ?
            handleNumber(parsed.payableAmount.toBigNumber().toString()) : handleNumber('0');
        contents.data = parsed.functionParameters ? hexlify(parsed.functionParameters) : '0x';
    } else if (parsed instanceof ContractCreateTransaction) {
        parsed = parsed as ContractCreateTransaction;
        contents.gasLimit = handleNumber(parsed.gas.toString());
        contents.value = parsed.initialBalance ?
            handleNumber(parsed.initialBalance.toBigNumber().toString()) : handleNumber('0');
        // TODO IMPORTANT! We are setting only the constructor arguments and not the whole bytecode + constructor args
        contents.data = parsed.constructorParameters ? hexlify(parsed.constructorParameters) : '0x';
    } else if (parsed instanceof FileCreateTransaction) {
        parsed = parsed as FileCreateTransaction;
        contents.data = hexlify(Buffer.from(parsed.contents));
    } else if (parsed instanceof FileAppendTransaction) {
        parsed = parsed as FileAppendTransaction;
        contents.data = hexlify(Buffer.from(parsed.contents));
    } else if (parsed instanceof TransferTransaction) {
        // TODO populate value / to?
    } else if (parsed instanceof AccountCreateTransaction) {
        parsed = parsed as AccountCreateTransaction;
        contents.value = parsed.initialBalance ?
            handleNumber(parsed.initialBalance.toBigNumber().toString()) : handleNumber('0');
    } else {
        return logger.throwError(`unsupported transaction`, Logger.errors.UNSUPPORTED_OPERATION, {operation: "parse"});
    }

    // TODO populate r, s ,v
    return {
        ...contents,
        chainId: 0,
        r: '',
        s: '',
        v: 0,
    };
}

function numberify(num: BigNumberish) {
    return BigNumber.from(num).toNumber();
}