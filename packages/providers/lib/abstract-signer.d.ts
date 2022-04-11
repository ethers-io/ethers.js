import type { Addressable } from "@ethersproject/address";
import type { TypedDataDomain, TypedDataField } from "@ethersproject/hash";
import type { TransactionLike } from "@ethersproject/transactions";
import type { BlockTag, CallRequest, Provider, TransactionRequest, TransactionResponse } from "./provider.js";
import type { Signer } from "./signer.js";
export declare abstract class AbstractSigner implements Signer {
    #private;
    readonly provider: null | Provider;
    constructor(provider?: null | Provider);
    abstract getAddress(): Promise<string>;
    abstract connect(provider: null | Provider): Signer;
    getBalance(blockTag?: BlockTag): Promise<bigint>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    estimateGas(tx: CallRequest): Promise<bigint>;
    call(tx: CallRequest): Promise<string>;
    populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>>;
    resolveName(name: string | Addressable): Promise<null | string>;
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
    abstract signTransaction(tx: TransactionRequest): Promise<string>;
    abstract signMessage(message: string | Uint8Array): Promise<string>;
    abstract signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
export declare class VoidSigner extends AbstractSigner {
    #private;
    readonly address: string;
    constructor(address: string, provider?: null | Provider);
    getAddress(): Promise<string>;
    connect(provider: null | Provider): VoidSigner;
    signTransaction(tx: TransactionRequest): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
export declare class WrappedSigner extends AbstractSigner {
    #private;
    constructor(signer: Signer);
    getAddress(): Promise<string>;
    connect(provider: null | Provider): WrappedSigner;
    signTransaction(tx: TransactionRequest): Promise<string>;
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=abstract-signer.d.ts.map