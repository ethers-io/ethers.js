import { Provider, TransactionRequest, TransactionResponse } from "@hethers/abstract-provider";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Bytes, BytesLike } from "@ethersproject/bytes";
import { Deferrable } from "@ethersproject/properties";
import { Account } from "@hethers/address";
import { SigningKey } from "@ethersproject/signing-key";
export interface TypedDataDomain {
    name?: string;
    version?: string;
    chainId?: BigNumberish;
    verifyingContract?: string;
    salt?: BytesLike;
}
export interface TypedDataField {
    name: string;
    type: string;
}
export interface ExternallyOwnedAccount {
    readonly address?: string;
    readonly account?: Account;
    readonly alias?: string;
    readonly privateKey: string;
}
export interface TypedDataSigner {
    _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
export declare abstract class Signer {
    readonly provider?: Provider;
    readonly _signingKey: () => SigningKey;
    abstract getAddress(): Promise<string>;
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
    abstract connect(provider: Provider): Signer;
    /**
     * Creates an account for the specified public key and sets initial balance.
     * @param pubKey
     * @param initialBalance
     */
    abstract createAccount(pubKey: BytesLike, initialBalance?: BigInt): Promise<TransactionResponse>;
    readonly _isSigner: boolean;
    constructor();
    getGasPrice(): Promise<BigNumber>;
    getBalance(): Promise<BigNumber>;
    estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber>;
    call(txRequest: Deferrable<TransactionRequest>): Promise<string>;
    /**
     * Composes a transaction which is signed and sent to the provider's network.
     * @param transaction - the actual tx
     */
    sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse>;
    getChainId(): Promise<number>;
    /**
     * Checks if the given transaction is usable.
     * Properties - `from`, `nodeId`, `gasLimit`
     * @param transaction - the tx to be checked
     */
    checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest>;
    /**
     * Populates any missing properties in a transaction request.
     * Properties affected - `to`, `chainId`
     * @param transaction
     */
    populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest>;
    _checkProvider(operation?: string): void;
    static isSigner(value: any): value is Signer;
}
export declare class VoidSigner extends Signer implements TypedDataSigner {
    readonly address: string;
    constructor(address: string, provider?: Provider);
    getAddress(): Promise<string>;
    _fail(message: string, operation: string): Promise<any>;
    signMessage(message: Bytes | string): Promise<string>;
    signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
    createAccount(pubKey: BytesLike, initialBalance?: BigInt): Promise<TransactionResponse>;
    _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
    connect(provider: Provider): VoidSigner;
}
/**
 * Generates a random integer in the given range
 * @param min - range start
 * @param max - range end
 */
export declare function randomNumBetween(min: number, max: number): number;
//# sourceMappingURL=index.d.ts.map