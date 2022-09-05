"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappedSigner = exports.VoidSigner = exports.AbstractSigner = void 0;
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../transaction/index.js");
const index_js_2 = require("../utils/index.js");
class AbstractSigner {
    provider;
    constructor(provider) {
        (0, index_js_2.defineProperties)(this, { provider: (provider || null) });
    }
    #checkProvider(operation) {
        if (this.provider) {
            return this.provider;
        }
        return logger_js_1.logger.throwError("missing provider", "UNSUPPORTED_OPERATION", { operation });
    }
    async getNonce(blockTag) {
        return this.#checkProvider("getTransactionCount").getTransactionCount(await this.getAddress(), blockTag);
    }
    async #populate(op, tx) {
        const provider = this.#checkProvider(op);
        //let pop: Deferrable<TransactionRequest> = Object.assign({ }, tx);
        let pop = Object.assign({}, tx);
        if (pop.to != null) {
            pop.to = provider.resolveName(pop.to).then((to) => {
                if (to == null) {
                    return logger_js_1.logger.throwArgumentError("transaction to ENS name not configured", "tx.to", pop.to);
                }
                return to;
            });
        }
        if (pop.from != null) {
            const from = pop.from;
            pop.from = Promise.all([
                this.getAddress(),
                this.resolveName(from)
            ]).then(([address, from]) => {
                if (!from || address.toLowerCase() !== from.toLowerCase()) {
                    return logger_js_1.logger.throwArgumentError("transaction from mismatch", "tx.from", from);
                }
                return address;
            });
        }
        return pop;
    }
    async populateCall(tx) {
        const pop = await this.#populate("populateCall", tx);
        return pop;
    }
    async populateTransaction(tx) {
        const pop = await this.#populate("populateTransaction", tx);
        if (pop.nonce == null) {
            pop.nonce = await this.getNonce("pending");
        }
        if (pop.gasLimit == null) {
            pop.gasLimit = await this.estimateGas(pop);
        }
        //@TODO: Copy type logic from AbstractSigner in v5
        return await (0, index_js_2.resolveProperties)(pop);
    }
    async estimateGas(tx) {
        return this.#checkProvider("estimateGas").estimateGas(await this.populateCall(tx));
    }
    async call(tx) {
        return this.#checkProvider("call").call(await this.populateCall(tx));
    }
    async resolveName(name) {
        const provider = this.#checkProvider("resolveName");
        return await provider.resolveName(name);
    }
    async sendTransaction(tx) {
        const provider = this.#checkProvider("sendTransaction");
        const txObj = index_js_1.Transaction.from(await this.populateTransaction(tx));
        return await provider.broadcastTransaction(await this.signTransaction(txObj));
    }
}
exports.AbstractSigner = AbstractSigner;
class VoidSigner extends AbstractSigner {
    address;
    constructor(address, provider) {
        super(provider);
        (0, index_js_2.defineProperties)(this, { address });
    }
    async getAddress() { return this.address; }
    connect(provider) {
        return new VoidSigner(this.address, provider);
    }
    #throwUnsupported(suffix, operation) {
        return logger_js_1.logger.throwError(`VoidSigner cannot sign ${suffix}`, "UNSUPPORTED_OPERATION", {
            operation
        });
    }
    async signTransaction(tx) {
        this.#throwUnsupported("transactions", "signTransaction");
    }
    async signMessage(message) {
        this.#throwUnsupported("messages", "signMessage");
    }
    async signTypedData(domain, types, value) {
        this.#throwUnsupported("typed-data", "signTypedData");
    }
}
exports.VoidSigner = VoidSigner;
class WrappedSigner extends AbstractSigner {
    #signer;
    constructor(signer) {
        super(signer.provider);
        this.#signer = signer;
    }
    async getAddress() {
        return await this.#signer.getAddress();
    }
    connect(provider) {
        return new WrappedSigner(this.#signer.connect(provider));
    }
    async getNonce(blockTag) {
        return await this.#signer.getNonce(blockTag);
    }
    async populateCall(tx) {
        return await this.#signer.populateCall(tx);
    }
    async populateTransaction(tx) {
        return await this.#signer.populateTransaction(tx);
    }
    async estimateGas(tx) {
        return await this.#signer.estimateGas(tx);
    }
    async call(tx) {
        return await this.#signer.call(tx);
    }
    async resolveName(name) {
        return this.#signer.resolveName(name);
    }
    async signTransaction(tx) {
        return await this.#signer.signTransaction(tx);
    }
    async sendTransaction(tx) {
        return await this.#signer.sendTransaction(tx);
    }
    async signMessage(message) {
        return await this.#signer.signMessage(message);
    }
    async signTypedData(domain, types, value) {
        return await this.#signer.signTypedData(domain, types, value);
    }
}
exports.WrappedSigner = WrappedSigner;
//# sourceMappingURL=abstract-signer.js.map