import { ethers } from "ethers";
export declare class NonceManager extends ethers.Signer {
    readonly signer: ethers.Signer;
    _initialPromise: Promise<number>;
    _deltaCount: number;
    constructor(signer: ethers.Signer);
    connect(provider: ethers.providers.Provider): NonceManager;
    getAddress(): Promise<string>;
    getTransactionCount(blockTag?: ethers.providers.BlockTag): Promise<number>;
    setTransactionCount(transactionCount: ethers.BigNumberish | Promise<ethers.BigNumberish>): void;
    incrementTransactionCount(count?: number): void;
    signMessage(message: ethers.Bytes | string): Promise<string>;
    signTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<string>;
    sendTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<ethers.providers.TransactionResponse>;
}
//# sourceMappingURL=nonce-manager.d.ts.map