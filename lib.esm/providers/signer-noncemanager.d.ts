import { AbstractSigner } from "./abstract-signer.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { BlockTag, Provider, TransactionRequest, TransactionResponse } from "./provider.js";
import type { Signer } from "./signer.js";

/**
 * A **NonceManager** wraps another [[Signer]] and automatically manages
 * the nonce, ensuring serialized and sequential nonces are used during
 * transaction.
 */
export declare class NonceManager extends AbstractSigner {
    private signer: Signer;
    private noncePromise: null | Promise<number>;
    private delta: number;
    
    /**
     * Creates a new **NonceManager** to manage the provided Signer.
     * @param signer The Signer to manage.
     * @param redisUrl The Redis URL for nonce caching (optional).
     */
    constructor(signer: Signer, redisUrl?: string);

    /**
     * Retrieves the address associated with the managed Signer.
     * @returns A Promise that resolves to the signer's address.
     */
    getAddress(): Promise<string>;

    /**
     * Connects the NonceManager to a new provider.
     * @param provider The new provider to connect to.
     * @returns A new NonceManager instance connected to the specified provider.
     */
    connect(provider: null | Provider): NonceManager;

    /**
     * Retrieves the nonce, optionally for a specific block tag.
     * @param blockTag The block tag to fetch the nonce for (optional).
     * @returns A Promise that resolves to the nonce value.
     */
    getNonce(blockTag?: BlockTag): Promise<number>;

    /**
     * Manually increments the nonce. Useful for managing offline transactions.
     */
    increment(): void;

    /**
     * Resets the nonce, causing the NonceManager to reload the current nonce from the blockchain on the next transaction.
     */
    reset(): void;

    /**
     * Sends a transaction through the managed Signer.
     * @param tx The transaction request.
     * @returns A Promise that resolves to the transaction response.
     */
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;

    /**
     * Signs a transaction.
     * @param tx The transaction request.
     * @returns A Promise that resolves to the signed transaction.
     */
    signTransaction(tx: TransactionRequest): Promise<string>;

    /**
     * Signs a message.
     * @param message The message to sign (string or Uint8Array).
     * @returns A Promise that resolves to the signature.
     */
    signMessage(message: string | Uint8Array): Promise<string>;

    /**
     * Signs typed data.
     * @param domain The TypedData domain.
     * @param types The TypedData types.
     * @param value The TypedData value.
     * @returns A Promise that resolves to the signature.
     */
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
}

//# sourceMappingURL=signer-noncemanager.d.ts.map