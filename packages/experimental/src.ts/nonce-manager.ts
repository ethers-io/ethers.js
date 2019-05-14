"use strict"

import { ethers } from "ethers";

export class NonceManager extends ethers.Signer {
    readonly signer: ethers.Signer;
    readonly provider: ethers.providers.Provider;

    _transactionCount: Promise<number>;

    constructor(signer: ethers.Signer) {
        ethers.errors.checkNew(new.target, NonceManager);
        super();
        ethers.utils.defineReadOnly(this, "signer", signer);
    }

    connect(provider: ethers.providers.Provider): NonceManager {
        return new NonceManager(this.signer.connect(provider));
    }

    getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    getTransactionCount(blockTag?: ethers.providers.BlockTag): Promise<number> {
        if (blockTag === "pending") {
            if (!this._transactionCount) {
                this._transactionCount = this.signer.getTransactionCount("pending");
            }
            return this._transactionCount;
        }

        return this.signer.getTransactionCount(blockTag);
    }

    setTransactionCount(transactionCount: ethers.BigNumberish | Promise<ethers.BigNumberish>): void {
        this._transactionCount = Promise.resolve(transactionCount).then((nonce) => {
            return ethers.BigNumber.from(nonce).toNumber();
        });
    }

    incrementTransactionCount(count?: number): void {
        if (!count) { count = 1; }
        this._transactionCount = this.getTransactionCount("pending").then((nonce) => {
            return nonce + count;
        });
    }

    signMessage(message: ethers.Bytes | string): Promise<string> {
        return this.signer.signMessage(message);;
    }

    signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string> {
        return this.signer.signTransaction(transaction);
    }

    sendTransaction(transaction: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse> {
        if (transaction.nonce == null) {
            transaction = ethers.utils.shallowCopy(transaction);
            transaction.nonce = this.getTransactionCount();
        }

        this.setTransactionCount(transaction.nonce);

        return this.signer.sendTransaction(transaction);
    }

}
