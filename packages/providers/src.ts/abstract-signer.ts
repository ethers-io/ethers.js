import { defineProperties, resolveProperties } from "@ethersproject/properties";
import { Transaction } from "@ethersproject/transaction";

import type { Addressable } from "@ethersproject/address";
import type { TypedDataDomain, TypedDataField } from "@ethersproject/hash";
import type { TransactionLike } from "@ethersproject/transaction";

import type {
    BlockTag, CallRequest, Provider, TransactionRequest, TransactionResponse
} from "./provider.js";
import type { Signer } from "./signer.js";

import { logger } from "./logger.js";


export abstract class AbstractSigner implements Signer {
    readonly provider!: null | Provider;

    constructor(provider?: null | Provider) {
        defineProperties<AbstractSigner>(this, { provider: (provider || null) });
    }

    abstract getAddress(): Promise<string>;
    abstract connect(provider: null | Provider): Signer;

    #checkProvider(operation: string): Provider {
        if (this.provider) { return this.provider; }
        return logger.throwError("missing provider", "UNSUPPORTED_OPERATION", { operation });
    }

    async getBalance(blockTag?: BlockTag): Promise<bigint> {
        return this.#checkProvider("getBalance").getBalanceOf(await this.getAddress(), blockTag);
    }

    async getTransactionCount(blockTag?: BlockTag): Promise<number> {
        return this.#checkProvider("getTransactionCount").getTransactionCountOf(await this.getAddress(), blockTag);
    }

    async #fromify(tx: TransactionRequest): Promise<TransactionRequest> {
        tx = Object.assign({ }, tx);

        const actions: Array<Promise<void>> = [ ];

        if (tx.from != null) {
            const from = tx.from;
            actions.push(Promise.all([
                this.getAddress(),
                this.resolveName(from)
            ]).then(([ address, from ]) => {
                if (!from || address.toLowerCase() !== from.toLowerCase()) {
                    logger.throwArgumentError("transaction from mismatch", "tx.from", from);
                }
                tx.from = address;
            }));
        }

        await Promise.all(actions);

        return tx;
    }

    async estimateGas(tx: CallRequest): Promise<bigint> {
        return this.#checkProvider("estimateGas").estimateGas(await this.#fromify(tx));
    }

    async call(tx: CallRequest): Promise<string> {
        return this.#checkProvider("call").call(await this.#fromify(tx));
    }

    async populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>> {
        const provider = this.#checkProvider("populateTransaction");

        //let pop: Deferrable<TransactionRequest> = Object.assign({ }, tx);
        let pop: any = Object.assign({ }, tx);

        if (pop.to != null) {
            pop.to = provider.resolveName(pop.to).then((to) => {
                if (to == null) {
                    return logger.throwArgumentError("transaction to ENS name not configured", "tx.to", pop.to);
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
                    return logger.throwArgumentError("transaction from mismatch", "tx.from", from);
                }
                return address;
            });
        }

        if (pop.nonce == null) {
            pop.nonce = this.getTransactionCount();
        }

        pop = resolveProperties(pop);

        if (pop.gasLimit == null) {
            pop.gasLimit = provider.estimateGas(pop);
        }

        pop = resolveProperties(pop);

        //@TODO: Copy logic from AbstractSigner in v5

        return await resolveProperties(pop);
    }

    async resolveName(name: string | Addressable): Promise<null | string> {
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
        return logger.throwError(`VoidSigner cannot sign ${ suffix }`, "UNSUPPORTED_OPERATION", {
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

    //get provider(): null | Provider { return this.#signer.provider; }

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
