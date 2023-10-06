import { AbstractSigner } from "./abstract-signer.js";
import Redis from 'ioredis'; // Import the Redis library
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type {
    BlockTag, Provider, TransactionRequest, TransactionResponse
} from "./provider.js";
import type { Signer } from "./signer.js";

/**
 *  A **NonceManager** wraps another [[Signer]] and automatically manages
 *  the nonce, ensuring serialized and sequential nonces are used during
 *  transactions.
 */
export class NonceManager extends AbstractSigner {
    /**
     *  The Signer being managed.
     */
    private signer: Signer;
    private redis: Redis.Redis;
    private delta: number;

    /**
     * Creates a new **NonceManager** to manage the specified `signer`.
     * @param signer The Signer to be managed.
     * @param redisUrl The Redis connection URL.
     */
    constructor(signer: Signer, redisUrl: string) {
        super(signer.provider);
        this.signer = signer;
        this.redis = new Redis(redisUrl); // Initialize the Redis client
        this.delta = 0;
    }

    /**
     * Get the address of the signer.
     * @returns The address of the signer.
     */
    async getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    /**
     * Connect the NonceManager to a new provider.
     * @param provider The provider to connect to.
     * @param redisUrl The Redis connection URL.
     * @returns A new NonceManager instance with the updated provider.
     */
    connect(provider: null | Provider, redisUrl: string): NonceManager {
        return new NonceManager(this.signer.connect(provider), redisUrl);
    }

    /**
     * Get the nonce for the signer.
     * @param blockTag The block tag to specify the block from which to fetch the nonce.
     * @returns The nonce value.
     */
    async getNonce(blockTag?: BlockTag): Promise<number> {
        const signerAddress = await this.signer.getAddress(); // Get the signer's address
        const nonceKey = `nonce:${signerAddress}`; // Use signer's address as part of the key

        if (blockTag === "pending") {
            const cachedNonce = await this.redis.get(nonceKey); // Retrieve the cached nonce from Redis

            if (cachedNonce !== null) {
                return parseInt(cachedNonce) + this.delta;
            }

            // If nonce is not cached, fetch it from the provider
            const nonce = await super.getNonce("pending");
            await this.redis.set(nonceKey, nonce.toString()); // Cache the nonce in Redis
            return nonce + this.delta;
        }

        return super.getNonce(blockTag);
    }

    /**
     * Manually increment the nonce. This may be useful when managing
     * offline transactions.
     */
    increment(): void {
        this.delta++;
    }

    /**
     * Manually decrement the nonce. Useful for rolling back failed transactions.
     */
    decrement(): void {
        this.delta--;
    }

    /**
     * Resets the nonce, causing the NonceManager to reload the current nonce
     * from the blockchain on the next transaction.
     */
    reset(): void {
        this.delta = 0;
        const signerAddress = this.signer.getAddress(); // Get the signer's address
        const nonceKey = `nonce:${signerAddress}`; // Use signer's address as part of the key
        this.redis.del(nonceKey); // Clear the cached nonce in Redis
    }

    /**
     * Send a transaction using the managed signer.
     * @param tx The transaction request.
     * @returns The transaction response.
     */
    async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
        const nonce = await this.getNonce("pending");
        this.increment();

        tx = await this.signer.populateTransaction(tx);
        tx.nonce = nonce;

        try {
            const response = await this.signer.sendTransaction(tx);
            
            // You can add custom error handling logic here for recoverable errors
            // For example, you can check the response status and handle specific cases
            
            return response;
        } catch (error) {
            // Handle errors that may occur during transaction sending
            
            // @TODO: Implement custom error handling logic here, if needed
            // For example, you can check the error message or type to determine how to handle it
            
            // Roll back the nonce increment if the transaction failed
            this.decrement();
            
            throw error; // Rethrow the error after handling or rolling back
        }
    }

    /**
     * Sign a transaction using the managed signer.
     * @param tx The transaction request.
     * @returns The transaction signature.
     */
    async signTransaction(tx: TransactionRequest): Promise<string> {
        return this.signer.signTransaction(tx);
    }

    /**
     * Sign a message using the managed signer.
     * @param message The message to sign.
     * @returns The message signature.
     */
    async signMessage(message: string | Uint8Array): Promise<string> {
        return this.signer.signMessage(message);
    }

    /**
     * Sign typed data using the managed signer.
     * @param domain The typed data domain.
     * @param types The typed data types.
     * @param value The typed data value.
     * @returns The typed data signature.
     */
    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return this.signer.signTypedData(domain, types, value);
    }
}
