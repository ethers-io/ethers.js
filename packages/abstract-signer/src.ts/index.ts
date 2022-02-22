"use strict";

import { Provider, TransactionRequest, TransactionResponse } from "@hethers/abstract-provider";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { numberify } from "@hethers/transactions";
import { arrayify, Bytes, BytesLike, hexlify } from "@ethersproject/bytes";
import { Deferrable, defineReadOnly, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { Logger } from "@hethers/logger";
import { version } from "./_version";
import {
    Account,
    asAccountString,
    getAddressFromAccount,
    getChecksumAddress
} from "@hethers/address";
import { SigningKey } from "@ethersproject/signing-key";
import {
    AccountId,
    ContractCallQuery,
    Hbar,
    PrivateKey,
    PublicKey as HederaPubKey,
    TransactionId
} from "@hashgraph/sdk";
import * as Long from "long";
import { SignedTransaction, TransactionBody } from "@hashgraph/proto";

const logger = new Logger(version);

const allowedTransactionKeys: Array<string> = [
    "accessList", "chainId", "customData", "data", "from", "gasLimit", "maxFeePerGas", "maxPriorityFeePerGas", "to", "type", "value",
    "nodeId"
];

// const forwardErrors = [
//     Logger.errors.INSUFFICIENT_FUNDS,
// ];

// EIP-712 Typed Data
// See: https://eips.ethereum.org/EIPS/eip-712

export interface TypedDataDomain {
    name?: string;
    version?: string;
    chainId?: BigNumberish;
    verifyingContract?: string;
    salt?: BytesLike;
};

export interface TypedDataField {
    name: string;
    type: string;
};

// Sub-classes of Signer may optionally extend this interface to indicate
// they have a private key available synchronously
export interface ExternallyOwnedAccount {
    readonly address?: string;
    readonly account?: Account;
    readonly alias?: string;
    readonly privateKey: string;
}

// Sub-Class Notes:
//  - A Signer MUST always make sure, that if present, the "from" field
//    matches the Signer, before sending or signing a transaction
//  - A Signer SHOULD always wrap private information (such as a private
//    key or mnemonic) in a function, so that console.log does not leak
//    the data

// @TODO: This is a temporary measure to preserve backwards compatibility
//        In v6, the method on TypedDataSigner will be added to Signer
export interface TypedDataSigner {
    _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}

function checkError(method: string, error: any, txRequest: Deferrable<TransactionRequest>) {
    switch (error.status._code) {
        // insufficient gas
        case 30:
            return logger.throwError("insufficient funds for gas cost", Logger.errors.CALL_EXCEPTION, {tx: txRequest});
        // insufficient payer balance
        case 10:
            return logger.throwError("insufficient funds in payer account", Logger.errors.INSUFFICIENT_FUNDS, {tx: txRequest});
        // insufficient tx fee
        case 9:
            return logger.throwError("transaction fee too low", Logger.errors.INSUFFICIENT_FUNDS, {tx: txRequest})
        // invalid signature
        case 7:
            return logger.throwError("invalid transaction signature", Logger.errors.UNKNOWN_ERROR, {tx: txRequest});
        // invalid contract id
        case 16:
            return logger.throwError("invalid contract address", Logger.errors.INVALID_ARGUMENT, {tx: txRequest});
        // contract revert
        case 33:
            return logger.throwError("contract execution reverted", Logger.errors.CALL_EXCEPTION, {tx: txRequest});
    }
    throw error;
}


export abstract class Signer {
    readonly provider?: Provider;
    readonly _signingKey: () => SigningKey;
    ///////////////////
    // Sub-classes MUST implement these

    // Returns the checksum address
    abstract getAddress(): Promise<string>

    // Returns the signed prefixed-message. This MUST treat:
    // - Bytes as a binary message
    // - string as a UTF8-message
    // i.e. "0x1234" is a SIX (6) byte string, NOT 2 bytes of data
    abstract signMessage(message: Bytes | string): Promise<string>;

    /**
     * Signs a transaction with the key given upon creation.
     * The transaction can be:
     * - FileCreate - when there is only `fileChunk` field in the `transaction.customData` object
     * - FileAppend - when there is both `fileChunk` and a `fileId` fields
     * - ContractCreate - when there is a `bytecodeFileId` field
     * - ContractCall - when there is a `to` field present. Ignores the other fields
     *
     * @param transaction - the transaction to be signed.
     */
    abstract signTransaction(transaction: TransactionRequest): Promise<string>;

    // Returns a new instance of the Signer, connected to provider.
    // This MAY throw if changing providers is not supported.
    abstract connect(provider: Provider): Signer;

    /**
     * Creates an account for the specified public key and sets initial balance.
     * @param pubKey
     * @param initialBalance
     */
    abstract createAccount(pubKey: BytesLike, initialBalance?: BigInt): Promise<TransactionResponse>;

    readonly _isSigner: boolean;


    ///////////////////
    // Sub-classes MUST call super
    constructor() {
        logger.checkAbstract(new.target, Signer);
        defineReadOnly(this, "_isSigner", true);
    }

    async getGasPrice(): Promise<BigNumber> {
        this._checkProvider("getGasPrice");
        return await this.provider.getGasPrice();
    }
    ///////////////////
    // Sub-classes MAY override these

    async getBalance(): Promise<BigNumber> {
        this._checkProvider("getBalance");
        return await this.provider.getBalance(this.getAddress());
    }

    // Populates "from" if unspecified, and estimates the gas for the transaction
    async estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
        this._checkProvider("estimateGas");
        const tx = await resolveProperties(this.checkTransaction(transaction));
        // cost-answer query on hedera
        return await this.provider.estimateGas(tx);
    }

    // super classes should override this for now
    async call(txRequest: Deferrable<TransactionRequest>): Promise<string> {
        this._checkProvider("call");
        const tx = await resolveProperties(this.checkTransaction(txRequest));
        const to = asAccountString(tx.to);
        const from = asAccountString(await this.getAddress());
        const nodeID = AccountId.fromString(asAccountString(tx.nodeId));
        const paymentTxId = TransactionId.generate(from);

        const hederaTx = new ContractCallQuery()
            .setContractId(to)
            .setFunctionParameters(arrayify(tx.data))
            .setNodeAccountIds([nodeID])
            .setGas(numberify(tx.gasLimit))
            .setPaymentTransactionId(paymentTxId);

        // TODO: the exact amount here will be computed using getCost when it's implemented
        const cost = 3;
        const paymentBody = {
            transactionID: paymentTxId._toProtobuf(),
            nodeAccountID: nodeID._toProtobuf(),
            transactionFee: new Hbar(0.005).toTinybars(),
            transactionValidDuration: {
                seconds: Long.fromInt(120),
            },
            cryptoTransfer: {
                transfers: {
                    accountAmounts:[
                        {
                            accountID: AccountId.fromString(from)._toProtobuf(),
                            amount: new Hbar(cost).negated().toTinybars()
                        },
                        {
                            accountID: nodeID._toProtobuf(),
                            amount: new Hbar(cost).toTinybars()
                        }
                    ],
                },
            },
        };

        const signed = {
            bodyBytes: TransactionBody.encode(paymentBody).finish(),
            sigMap: {}
        };

        const walletKey = PrivateKey.fromStringECDSA(this._signingKey().privateKey);
        const signature = walletKey.sign(signed.bodyBytes);
        signed.sigMap ={
            sigPair: [walletKey.publicKey._toProtobufSignature(signature)]
        }

        const transferSignedTransactionBytes =  SignedTransaction.encode(signed).finish();
        hederaTx._paymentTransactions.push({
            signedTransactionBytes: transferSignedTransactionBytes
        });

        try{
            const response = await hederaTx.execute(this.provider.getHederaClient());
            return hexlify(response.bytes);
        } catch (error) {
            return checkError('call', error, txRequest);
        }
    }

    /**
     * Composes a transaction which is signed and sent to the provider's network.
     * @param transaction - the actual tx
     */
    async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
        const tx = await resolveProperties(transaction);
        if (tx.to) {
            const signed = await this.signTransaction(tx);
            return await this.provider.sendTransaction(signed);
        } else {
            const contractByteCode = tx.data;
            let chunks = splitInChunks(Buffer.from(contractByteCode).toString(), 4096);
            const fileCreate = {
                customData: {
                    fileChunk: chunks[0],
                    fileKey: HederaPubKey.fromString(this._signingKey().compressedPublicKey)
                }
            };
            const signedFileCreate = await this.signTransaction(fileCreate);
            const resp =  await this.provider.sendTransaction(signedFileCreate);
            for (let chunk of chunks.slice(1)) {
                const fileAppend = {
                    customData: {
                        fileId: resp.customData.fileId.toString(),
                        fileChunk: chunk
                    }
                };
                const signedFileAppend = await this.signTransaction(fileAppend);
                await this.provider.sendTransaction(signedFileAppend);
            }

            const contractCreate = {
                gasLimit: tx.gasLimit,
                customData: {
                    bytecodeFileId: resp.customData.fileId.toString()
                }
            };
            const signedContractCreate = await this.signTransaction(contractCreate);
            return await this.provider.sendTransaction(signedContractCreate);
        }
    }

    async getChainId(): Promise<number> {
        this._checkProvider("getChainId");
        const network = await this.provider.getNetwork();
        return network.chainId;
    }

    /**
     * Checks if the given transaction is usable.
     * Properties - `from`, `nodeId`, `gasLimit`
     * @param transaction - the tx to be checked
     */
    checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest> {
        for (const key in transaction) {
            if (allowedTransactionKeys.indexOf(key) === -1) {
                logger.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }

        const tx = shallowCopy(transaction);
        if (!tx.nodeId) {
            this._checkProvider();
            // provider present, we can go on
            const submittableNodeIDs = this.provider.getHederaNetworkConfig();
            if (submittableNodeIDs.length > 0) {
                tx.nodeId = submittableNodeIDs[randomNumBetween(0, submittableNodeIDs.length-1)].toString();
            } else {
                logger.throwError("Unable to find submittable node ID. The signer's provider is not connected to any usable network");
            }
        }

        if (tx.from == null) {
            tx.from = this.getAddress();

        } else {
            // Make sure any provided address matches this signer
            tx.from = Promise.all([
                Promise.resolve(tx.from),
                this.getAddress()
            ]).then((result) => {
                if (result[0].toString().toLowerCase() !== result[1].toLowerCase()) {
                    logger.throwArgumentError("from address mismatch", "transaction", transaction);
                }
                return result[0];
            });
        }
        tx.gasLimit = transaction.gasLimit;
        return tx;
    }

    /**
     * Populates any missing properties in a transaction request.
     * Properties affected - `to`, `chainId`
     * @param transaction
     */
    async populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest> {
        const tx: Deferrable<TransactionRequest> = await resolveProperties(this.checkTransaction(transaction))

        if (tx.to != null) {
            tx.to = Promise.resolve(tx.to).then(async (to) => {
                if (to == null) { return null; }
                return getChecksumAddress(getAddressFromAccount(to));
            });

            // Prevent this error from causing an UnhandledPromiseException
            tx.to.catch((error) => {  });
        }

        let isCryptoTransfer = false;
        if (tx.to && tx.value) {
            if (!tx.data && !tx.gasLimit) {
                isCryptoTransfer = true;
            } else if (tx.data && !tx.gasLimit) {
                logger.throwError("gasLimit is not provided. Cannot execute a Contract Call");
            } else if (!tx.data && tx.gasLimit) {
                this._checkProvider();
                if ((await this.provider.getCode(tx.to)) === '0x') {
                    logger.throwError("receiver is an account. Cannot execute a Contract Call");
                }
            }
        }
        tx.customData = {...tx.customData, isCryptoTransfer};

        const customData = await tx.customData;

        // FileCreate and FileAppend always carry a customData.fileChunk object
        const isFileCreateOrAppend = customData && customData.fileChunk;

        // CreateAccount always has a publicKey
        const isCreateAccount = customData && customData.publicKey;

        if (!isFileCreateOrAppend && !isCreateAccount && !tx.customData.isCryptoTransfer && tx.gasLimit == null) {
            return logger.throwError("cannot estimate gas; transaction requires manual gas limit", Logger.errors.UNPREDICTABLE_GAS_LIMIT, {tx: tx});
        }

        return await resolveProperties(tx);
    }


    ///////////////////
    // Sub-classes SHOULD leave these alone

    _checkProvider(operation?: string): void {
        if (!this.provider) { logger.throwError("missing provider", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: (operation || "_checkProvider") });
        }
    }

    static isSigner(value: any): value is Signer {
        return !!(value && value._isSigner);
    }
}

export class VoidSigner extends Signer implements TypedDataSigner {
    readonly address: string;

    constructor(address: string, provider?: Provider) {
        logger.checkNew(new.target, VoidSigner);
        super();
        defineReadOnly(this, "address", address);
        defineReadOnly(this, "provider", provider || null);
    }

    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    _fail(message: string, operation: string): Promise<any> {
        return Promise.resolve().then(() => {
            logger.throwError(message, Logger.errors.UNSUPPORTED_OPERATION, { operation: operation });
        });
    }

    signMessage(message: Bytes | string): Promise<string> {
        return this._fail("VoidSigner cannot sign messages", "signMessage");
    }

    signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
        return this._fail("VoidSigner cannot sign transactions", "signTransaction");
    }

    createAccount(pubKey: BytesLike, initialBalance?: BigInt): Promise<TransactionResponse> {
        return this._fail("VoidSigner cannot create accounts", "createAccount");
    }

    _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return this._fail("VoidSigner cannot sign typed data", "signTypedData");
    }

    connect(provider: Provider): VoidSigner {
        return new VoidSigner(this.address, provider);
    }
}

/**
 * Generates a random integer in the given range
 * @param min - range start
 * @param max - range end
 */
export function randomNumBetween(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Splits data (utf8) into chunks with the given size
 * @param data
 * @param chunkSize
 */
function splitInChunks(data: string, chunkSize: number): string[] {
    const chunks = [];
    let num = 0;
    while (num <= data.length) {
        const slice = data.slice(num, chunkSize + num);
        num += chunkSize;
        chunks.push(slice);
    }
    return chunks;
}