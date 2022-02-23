"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAccountFromAddress, getAddress } from "@hethers/address";
import { BigNumber } from "@ethersproject/bignumber";
import { arrayify, hexDataLength, hexDataSlice, hexlify, } from "@ethersproject/bytes";
import { Zero } from "@hethers/constants";
import { keccak256 } from "@ethersproject/keccak256";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";
import { Logger } from "@hethers/logger";
import { version } from "./_version";
import * as base64 from "@ethersproject/base64";
import { getAddressFromAccount } from "@hethers/address";
import { ContractCreateTransaction, ContractExecuteTransaction, ContractId, FileAppendTransaction, FileCreateTransaction, Transaction as HederaTransaction, PublicKey as HederaPubKey, TransactionId, AccountId, TransferTransaction, AccountCreateTransaction, Hbar, HbarUnit } from "@hashgraph/sdk";
const logger = new Logger(version);
export var TransactionTypes;
(function (TransactionTypes) {
    TransactionTypes[TransactionTypes["legacy"] = 0] = "legacy";
    TransactionTypes[TransactionTypes["eip2930"] = 1] = "eip2930";
    TransactionTypes[TransactionTypes["eip1559"] = 2] = "eip1559";
})(TransactionTypes || (TransactionTypes = {}));
///////////////////////////////
function handleNumber(value) {
    if (value === "0x") {
        return Zero;
    }
    return BigNumber.from(value);
}
export function computeAddress(key) {
    const publicKey = computePublicKey(key);
    return getAddress(hexDataSlice(keccak256(hexDataSlice(publicKey, 1)), 12));
}
export function computeAlias(key) {
    const publicKey = computePublicKey(key);
    return computeAliasFromPubKey(publicKey);
}
export function computeAliasFromPubKey(pubKey) {
    return `0.0.${base64.encode(pubKey)}`;
}
export function recoverAddress(digest, signature) {
    return computeAddress(recoverPublicKey(arrayify(digest), signature));
}
function accessSetify(addr, storageKeys) {
    return {
        address: getAddress(addr),
        storageKeys: (storageKeys || []).map((storageKey, index) => {
            if (hexDataLength(storageKey) !== 32) {
                logger.throwArgumentError("invalid access list storageKey", `accessList[${addr}:${index}]`, storageKey);
            }
            return storageKey.toLowerCase();
        })
    };
}
export function accessListify(value) {
    if (Array.isArray(value)) {
        return value.map((set, index) => {
            if (Array.isArray(set)) {
                if (set.length > 2) {
                    logger.throwArgumentError("access list expected to be [ address, storageKeys[] ]", `value[${index}]`, set);
                }
                return accessSetify(set[0], set[1]);
            }
            return accessSetify(set.address, set.storageKeys);
        });
    }
    const result = Object.keys(value).map((addr) => {
        const storageKeys = value[addr].reduce((accum, storageKey) => {
            accum[storageKey] = true;
            return accum;
        }, {});
        return accessSetify(addr, Object.keys(storageKeys).sort());
    });
    result.sort((a, b) => (a.address.localeCompare(b.address)));
    return result;
}
export function serializeHederaTransaction(transaction, pubKey) {
    var _a, _b;
    let tx;
    const arrayifiedData = transaction.data ? arrayify(transaction.data) : new Uint8Array();
    const gas = numberify(transaction.gasLimit ? transaction.gasLimit : 0);
    if (transaction.customData.isCryptoTransfer) {
        tx = new TransferTransaction()
            .addHbarTransfer(transaction.from.toString(), new Hbar(transaction.value.toString(), HbarUnit.Tinybar).negated())
            .addHbarTransfer(transaction.to.toString(), new Hbar(transaction.value.toString(), HbarUnit.Tinybar));
    }
    else if (transaction.to) {
        tx = new ContractExecuteTransaction()
            .setContractId(ContractId.fromSolidityAddress(getAddressFromAccount(transaction.to)))
            .setFunctionParameters(arrayifiedData)
            .setGas(gas);
        if (transaction.value) {
            tx.setPayableAmount((_a = transaction.value) === null || _a === void 0 ? void 0 : _a.toString());
        }
    }
    else {
        if (transaction.customData.bytecodeFileId) {
            tx = new ContractCreateTransaction()
                .setBytecodeFileId(transaction.customData.bytecodeFileId)
                .setConstructorParameters(arrayifiedData)
                .setInitialBalance((_b = transaction.value) === null || _b === void 0 ? void 0 : _b.toString())
                .setGas(gas);
        }
        else {
            if (transaction.customData.fileChunk && transaction.customData.fileId) {
                tx = new FileAppendTransaction()
                    .setContents(transaction.customData.fileChunk)
                    .setFileId(transaction.customData.fileId);
            }
            else if (!transaction.customData.fileId && transaction.customData.fileChunk) {
                // only a chunk, thus the first one
                tx = new FileCreateTransaction()
                    .setContents(transaction.customData.fileChunk)
                    .setKeys([transaction.customData.fileKey ?
                        transaction.customData.fileKey :
                        pubKey
                ]);
            }
            else if (transaction.customData.publicKey) {
                const { publicKey, initialBalance } = transaction.customData;
                tx = new AccountCreateTransaction()
                    .setKey(HederaPubKey.fromString(publicKey.toString()))
                    .setInitialBalance(Hbar.fromTinybars(initialBalance.toString()));
            }
            else {
                logger.throwArgumentError("Cannot determine transaction type from given custom data. Need either `to`, `fileChunk`, `fileId` or `bytecodeFileId`", Logger.errors.INVALID_ARGUMENT, transaction);
            }
        }
    }
    const account = getAccountFromAddress(transaction.from.toString());
    tx.setTransactionId(TransactionId.generate(new AccountId({
        shard: numberify(account.shard),
        realm: numberify(account.realm),
        num: numberify(account.num)
    })))
        .setNodeAccountIds([AccountId.fromString(transaction.nodeId.toString())])
        .freeze();
    return tx;
}
export function parse(rawTransaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const payload = arrayify(rawTransaction);
        let parsed;
        try {
            parsed = HederaTransaction.fromBytes(payload);
        }
        catch (error) {
            logger.throwArgumentError(error.message, "rawTransaction", rawTransaction);
        }
        const tx = parsed.transactionId;
        const nanos = tx.validStart.nanos.toString().padStart(9, '0');
        const seconds = tx.validStart.seconds.toString().padStart(10, '0');
        let contents = {
            transactionId: `${tx.accountId.toString()}-${seconds}-${nanos}`,
            hash: hexlify(yield parsed.getTransactionHash()),
            from: getAddressFromAccount(parsed.transactionId.accountId.toString()),
        };
        if (parsed instanceof ContractExecuteTransaction) {
            parsed = parsed;
            contents.to = getAddressFromAccount((_a = parsed.contractId) === null || _a === void 0 ? void 0 : _a.toString());
            contents.gasLimit = handleNumber(parsed.gas.toString());
            contents.value = parsed.payableAmount ?
                handleNumber(parsed.payableAmount.toBigNumber().toString()) : handleNumber('0');
            contents.data = parsed.functionParameters ? hexlify(parsed.functionParameters) : '0x';
        }
        else if (parsed instanceof ContractCreateTransaction) {
            parsed = parsed;
            contents.gasLimit = handleNumber(parsed.gas.toString());
            contents.value = parsed.initialBalance ?
                handleNumber(parsed.initialBalance.toBigNumber().toString()) : handleNumber('0');
            // TODO IMPORTANT! We are setting only the constructor arguments and not the whole bytecode + constructor args
            contents.data = parsed.constructorParameters ? hexlify(parsed.constructorParameters) : '0x';
        }
        else if (parsed instanceof FileCreateTransaction) {
            parsed = parsed;
            contents.data = hexlify(Buffer.from(parsed.contents));
        }
        else if (parsed instanceof FileAppendTransaction) {
            parsed = parsed;
            contents.data = hexlify(Buffer.from(parsed.contents));
        }
        else if (parsed instanceof TransferTransaction) {
            // TODO populate value / to?
        }
        else if (parsed instanceof AccountCreateTransaction) {
            parsed = parsed;
            contents.value = parsed.initialBalance ?
                handleNumber(parsed.initialBalance.toBigNumber().toString()) : handleNumber('0');
        }
        else {
            return logger.throwError(`unsupported transaction`, Logger.errors.UNSUPPORTED_OPERATION, { operation: "parse" });
        }
        // TODO populate r, s ,v
        return Object.assign(Object.assign({}, contents), { chainId: 0, r: '', s: '', v: 0 });
    });
}
export function numberify(num) {
    return BigNumber.from(num).toNumber();
}
//# sourceMappingURL=index.js.map