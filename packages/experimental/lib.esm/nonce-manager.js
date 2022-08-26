"use strict";
import { ethers } from "ethers";
// @TODO: Keep a per-NonceManager pool of sent but unmined transactions for
//        rebroadcasting, in case we overrun the transaction pool
export class NonceManager extends ethers.Signer {
    constructor(signer) {
        super();
        this._deltaCount = 0;
        ethers.utils.defineReadOnly(this, "signer", signer);
        ethers.utils.defineReadOnly(this, "provider", signer.provider || null);
    }
    connect(provider) {
        return new NonceManager(this.signer.connect(provider));
    }
    getAddress() {
        return this.signer.getAddress();
    }
    getTransactionCount(blockTag) {
        if (blockTag === "pending") {
            if (!this._initialPromise) {
                this._initialPromise = this.signer.getTransactionCount("pending");
            }
            const deltaCount = this._deltaCount;
            return this._initialPromise.then((initial) => (initial + deltaCount));
        }
        return this.signer.getTransactionCount(blockTag);
    }
    setTransactionCount(transactionCount) {
        this._initialPromise = Promise.resolve(transactionCount).then((nonce) => {
            return ethers.BigNumber.from(nonce).toNumber();
        });
        this._deltaCount = 0;
    }
    incrementTransactionCount(count) {
        this._deltaCount += ((count == null) ? 1 : count);
    }
    signMessage(message) {
        return this.signer.signMessage(message);
        ;
    }
    signTransaction(transaction) {
        return this.signer.signTransaction(transaction);
    }
    sendTransaction(transaction) {
        if (transaction.nonce == null) {
            transaction = ethers.utils.shallowCopy(transaction);
            transaction.nonce = this.getTransactionCount("pending");
            this.incrementTransactionCount();
        }
        else {
            this.setTransactionCount(transaction.nonce);
            this._deltaCount++;
        }
        return this.signer.sendTransaction(transaction).then((tx) => {
            return tx;
        });
    }
}
//# sourceMappingURL=nonce-manager.js.map