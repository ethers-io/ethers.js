import { AbstractSigner } from "@ethersproject/providers";
import type { TypedDataDomain, TypedDataField } from "@ethersproject/hash";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SigningKey } from "@ethersproject/signing-key";
export declare class BaseWallet extends AbstractSigner {
    #private;
    readonly address: string;
    constructor(privateKey: SigningKey, provider?: null | Provider);
    get signingKey(): SigningKey;
    get privateKey(): string;
    getAddress(): Promise<string>;
    connect(provider: null | Provider): BaseWallet;
    signTransaction(_tx: TransactionRequest): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=base-wallet.d.ts.map