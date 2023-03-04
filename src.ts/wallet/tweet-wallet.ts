import { getAddress, resolveAddress } from "../address/index.js";
import { AbstractSigner } from "../providers/index.js";
import { Transaction } from "../transaction/index.js";
import {
    defineProperties, resolveProperties, assertArgument
} from "../utils/index.js";

import { keccak256 } from "../crypto/index.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { Provider, TransactionRequest } from "../providers/index.js";
import type { TransactionLike } from "../transaction/index.js";


/**
 *  The **TwitterWallet** is a stream-lined implementation of a
 *  [[Signer]] that operates with a twitter account key.
 *
 *  This class may be of use for those attempting to implement
 *  a minimal Signer.
 */
export class TweetWallet extends AbstractSigner {

    readonly address!: string;
    readonly username!: string;

    /**
     *  Creates a new TweetWallet, optionally
     *  connected to %%provider%%.
     *
     *  If %%provider%% is not specified, only offline methods can
     *  be used.
     */
    constructor(username: string, provider?: null | Provider) {
        super(provider);

        this.username = username;

        let address: string = getAddress(keccak256(username).substring(26));
        this.address = address;

        defineProperties<TweetWallet>(this, { address });
    }

    // Store private values behind getters to reduce visibility
    // in console.log

    async getAddress(): Promise<string> { return this.address; }

    connect(provider: null | Provider): TweetWallet {
        return new TweetWallet(this.username, provider);
    }

    async signTransaction(tx: TransactionRequest): Promise<string> {

        // Replace any Addressable or ENS name with an address
        const { to, from } = await resolveProperties({
            to: (tx.to ? resolveAddress(tx.to, this.provider): undefined),
            from: (tx.from ? resolveAddress(tx.from, this.provider): undefined)
        });

        if (to != null) { tx.to = to; }
        if (from != null) { tx.from = from; }

        if (tx.from != null) {
            assertArgument(getAddress(<string>(tx.from)) === this.address,
                "transaction from address mismatch", "tx.from", tx.from);
            delete tx.from;
        }

        // Build the transaction
        const btx = Transaction.from(<TransactionLike<string>>tx);

        let txbytes = btx.unsignedSerialized

        let tweet_url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(txbytes) + '&hashtags=' + encodeURIComponent("0xcel");
        (window as any).open(tweet_url, "_blank")

        return txbytes;
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        return this.signMessageSync(message);
    }

    // @TODO: Add a secialized signTx and signTyped sync that enforces
    // all parameters are known?
    /**
     *  Returns the signature for %%message%% signed with this wallet.
     */
    signMessageSync(message: string | Uint8Array): string {

        return "";
        // return this.signingKey.sign(hashMessage(message)).serialized;
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return "";

        // // Populate any ENS names
        // const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
        //     // @TODO: this should use resolveName; addresses don't
        //     //        need a provider

        //     assert(this.provider != null, "cannot resolve ENS names without a provider", "UNSUPPORTED_OPERATION", {
        //         operation: "resolveName",
        //         info: { name }
        //     });

        //     const address = await this.provider.resolveName(name);
        //     assert(address != null, "unconfigured ENS name", "UNCONFIGURED_NAME", {
        //         value: name
        //     });

        //     return address;
        // });

        // return this.signingKey.sign(TypedDataEncoder.hash(populated.domain, types, populated.value)).serialized;
    }
}
