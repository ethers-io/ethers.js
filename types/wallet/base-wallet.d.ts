import { AbstractSigner } from "../providers/index.js";
import type { SigningKey } from "../crypto/index.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { Provider, TransactionRequest } from "../providers/index.js";
import type { ProgressCallback } from "../crypto/index.js";
export declare class BaseWallet extends AbstractSigner {
    #private;
    readonly address: string;
    constructor(privateKey: SigningKey, provider?: null | Provider);
    get signingKey(): SigningKey;
    get privateKey(): string;
    getAddress(): Promise<string>;
    connect(provider: null | Provider): BaseWallet;
    encrypt(password: Uint8Array | string, progressCallback?: ProgressCallback): Promise<string>;
    encryptSync(password: Uint8Array | string): string;
    signTransaction(tx: TransactionRequest): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signMessageSync(message: string | Uint8Array): string;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=base-wallet.d.ts.map