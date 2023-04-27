import { AbstractSigner } from "./abstract-signer.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { BlockTag, Provider, TransactionRequest, TransactionResponse } from "./provider.js";
import type { Signer } from "./signer.js";
export declare class NonceManager extends AbstractSigner {
    #private;
    signer: Signer;
    constructor(signer: Signer);
    getAddress(): Promise<string>;
    connect(provider: null | Provider): NonceManager;
    getNonce(blockTag?: BlockTag): Promise<number>;
    increment(): void;
    reset(): void;
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
    signTransaction(tx: TransactionRequest): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=signer-noncemanager.d.ts.map