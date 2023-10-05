import { AbstractSigner } from "./abstract-signer.js";
import Redis from 'ioredis'; // Import the Redis library
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type {
    BlockTag, Provider, TransactionRequest, TransactionResponse
} from "./provider.js";
import type { Signer } from "./signer.js";

export class NonceManager extends AbstractSigner {
    private signer: Signer;
    private redis: Redis.Redis;
    private delta: number;

    constructor(signer: Signer, redisUrl: string) {
        super(signer.provider);
        this.signer = signer;
        this.redis = new Redis(redisUrl); // Initialize the Redis client
        this.delta = 0;
    }

    async getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    connect(provider: null | Provider): NonceManager {
        return new NonceManager(this.signer.connect(provider), this.redisUrl);
    }

    async getNonce(blockTag?: BlockTag): Promise<number> {
        if (blockTag === "pending") {
            const cachedNonce = await this.redis.get('cached-nonce'); // Retrieve the cached nonce from Redis

            if (cachedNonce !== null) {
                return parseInt(cachedNonce) + this.delta;
            }

            // If nonce is not cached, fetch it from the provider
            const nonce = await super.getNonce("pending");
            await this.redis.set('cached-nonce', nonce.toString()); // Cache the nonce in Redis
            return nonce + this.delta;
        }

        return super.getNonce(blockTag);
    }

    increment(): void {
        this.delta++;
    }

    decrement(): void {
        this.delta--;
    }

    reset(): void {
        this.delta = 0;
        this.redis.del('cached-nonce'); // Clear the cached nonce in Redis
    }

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

    async signTransaction(tx: TransactionRequest): Promise<string> {
        return this.signer.signTransaction(tx);
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        return this.signer.signMessage(message);
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return this.signer.signTypedData(domain, types, value);
    }
}
