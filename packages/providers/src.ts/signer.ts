
import type { Addressable, NameResolver } from "@ethersproject/address";
import type { TypedDataDomain, TypedDataField } from "@ethersproject/hash";

import type { CallRequest, Provider, TransactionRequest, TransactionResponse } from "./provider.js";


export interface Signer extends Addressable, NameResolver {
    provider: null | Provider;
    connect(provider: null | Provider): Signer;

    // Execution
    estimateGas(tx: CallRequest): Promise<bigint>;
    call(tx: CallRequest): Promise<string>;
    resolveName(name: string | Addressable): Promise<null | string>;

    // Signing
    signTransaction(tx: TransactionRequest): Promise<string>;
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
