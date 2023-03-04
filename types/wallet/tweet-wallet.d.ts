import { AbstractSigner } from "../providers/index.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { Provider, TransactionRequest } from "../providers/index.js";
/**
 *  The **TwitterWallet** is a stream-lined implementation of a
 *  [[Signer]] that operates with a twitter account key.
 *
 *  This class may be of use for those attempting to implement
 *  a minimal Signer.
 */
export declare class TweetWallet extends AbstractSigner {
    readonly address: string;
    readonly username: string;
    /**
     *  Creates a new TweetWallet, optionally
     *  connected to %%provider%%.
     *
     *  If %%provider%% is not specified, only offline methods can
     *  be used.
     */
    constructor(username: string, provider?: null | Provider);
    getAddress(): Promise<string>;
    connect(provider: null | Provider): TweetWallet;
    signTransaction(tx: TransactionRequest): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    /**
     *  Returns the signature for %%message%% signed with this wallet.
     */
    signMessageSync(message: string | Uint8Array): string;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=tweet-wallet.d.ts.map