import { Transaction } from "../transaction/index.js";
import {
    defineProperties, getBigInt, resolveProperties,
    throwArgumentError, throwError
} from "../utils/index.js";

import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { TransactionLike } from "../transaction/index.js";

import type {
    BlockTag, CallRequest, Provider, TransactionRequest, TransactionResponse
} from "./provider.js";
import type { Signer } from "./signer.js";


export abstract class AbstractSigner<P extends null | Provider = null | Provider> implements Signer {
    readonly provider!: P;

    constructor(provider?: P) {
        defineProperties<AbstractSigner>(this, { provider: (provider || null) });
    }

    abstract getAddress(): Promise<string>;
    abstract connect(provider: null | Provider): Signer;

    #checkProvider(operation: string): Provider {
        if (this.provider) { return this.provider; }
        return throwError("missing provider", "UNSUPPORTED_OPERATION", { operation });
    }

    async getNonce(blockTag?: BlockTag): Promise<number> {
        return this.#checkProvider("getTransactionCount").getTransactionCount(await this.getAddress(), blockTag);
    }

    async #populate(op: string, tx: CallRequest | TransactionRequest): Promise<TransactionLike<string>> {
        const provider = this.#checkProvider(op);

        //let pop: Deferrable<TransactionRequest> = Object.assign({ }, tx);
        let pop: any = Object.assign({ }, tx);

        if (pop.to != null) {
            pop.to = provider.resolveName(pop.to).then((to) => {
                if (to == null) {
                    return throwArgumentError("transaction to ENS name not configured", "tx.to", pop.to);
                }
                return to;
            });
        }

        if (pop.from != null) {
            const from = pop.from;
            pop.from = Promise.all([
                this.getAddress(),
                this.resolveName(from)
            ]).then(([ address, from ]) => {
                if (!from || address.toLowerCase() !== from.toLowerCase()) {
                    return throwArgumentError("transaction from mismatch", "tx.from", from);
                }
                return address;
            });
        }

        return pop;
    }

    async populateCall(tx: CallRequest): Promise<TransactionLike<string>> {
        const pop = await this.#populate("populateCall", tx);

        return pop;
    }

    async populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>> {
        const pop = await this.#populate("populateTransaction", tx);

        if (pop.nonce == null) {
            pop.nonce = await this.getNonce("pending");
        }

        if (pop.gasLimit == null) {
            pop.gasLimit = await this.estimateGas(pop);
        }

        // Populate the chain ID
        const network = await (<Provider>(this.provider)).getNetwork();
        if (pop.chainId != null) {
            const chainId = getBigInt(pop.chainId);
            if (chainId !== network.chainId) {
                throwArgumentError("transaction chainId mismatch", "tx.chainId", tx.chainId);
            }
        } else {
            pop.chainId = network.chainId;
        }

//@TOOD: Don't await all over the place; save them up for
// the end for better batching
        //@TODO: Copy type logic from AbstractSigner in v5
// Test how many batches is actually sent for sending a tx; compare before/after
        return await resolveProperties(pop);
    }

    async estimateGas(tx: CallRequest): Promise<bigint> {
        return this.#checkProvider("estimateGas").estimateGas(await this.populateCall(tx));
    }

    async call(tx: CallRequest): Promise<string> {
        return this.#checkProvider("call").call(await this.populateCall(tx));
    }

    async resolveName(name: string): Promise<null | string> {
        const provider = this.#checkProvider("resolveName");
        return await provider.resolveName(name);
    }

    async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
        const provider = this.#checkProvider("sendTransaction");

        const txObj = Transaction.from(await this.populateTransaction(tx));
        return await provider.broadcastTransaction(await this.signTransaction(txObj));
    }

    abstract signTransaction(tx: TransactionRequest): Promise<string>;
    abstract signMessage(message: string | Uint8Array): Promise<string>;
    abstract signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}

export class VoidSigner extends AbstractSigner {
    readonly address!: string;

    constructor(address: string, provider?: null | Provider) {
        super(provider);
        defineProperties<VoidSigner>(this, { address });
    }

    async getAddress(): Promise<string> { return this.address; }

    connect(provider: null | Provider): VoidSigner {
        return new VoidSigner(this.address, provider);
    }

    #throwUnsupported(suffix: string, operation: string): never {
        return throwError(`VoidSigner cannot sign ${ suffix }`, "UNSUPPORTED_OPERATION", {
            operation
        });
    }

    async signTransaction(tx: TransactionRequest): Promise<string> {
        this.#throwUnsupported("transactions", "signTransaction");
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        this.#throwUnsupported("messages", "signMessage");
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        this.#throwUnsupported("typed-data", "signTypedData");
    }
}

export class WrappedSigner extends AbstractSigner {
    #signer: Signer;

    constructor(signer: Signer) {
        super(signer.provider);
        this.#signer = signer;
    }

    async getAddress(): Promise<string> {
        return await this.#signer.getAddress();
    }

    connect(provider: null | Provider): WrappedSigner {
        return new WrappedSigner(this.#signer.connect(provider));
    }

    async getNonce(blockTag?: BlockTag): Promise<number> {
        return await this.#signer.getNonce(blockTag);
    }

    async populateCall(tx: CallRequest): Promise<TransactionLike<string>> {
        return await this.#signer.populateCall(tx);
    }

    async populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>> {
        return await this.#signer.populateTransaction(tx);
    }

    async estimateGas(tx: CallRequest): Promise<bigint> {
        return await this.#signer.estimateGas(tx);
    }

    async call(tx: CallRequest): Promise<string> {
        return await this.#signer.call(tx);
    }

    async resolveName(name: string): Promise<null | string> {
        return this.#signer.resolveName(name);
    }

    async signTransaction(tx: TransactionRequest): Promise<string> {
        return await this.#signer.signTransaction(tx);
    }

    async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
        return await this.#signer.sendTransaction(tx);
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        return await this.#signer.signMessage(message);
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return await this.#signer.signTypedData(domain, types, value);
    }
}
