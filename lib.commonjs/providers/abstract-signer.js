"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappedSigner = exports.VoidSigner = exports.AbstractSigner = void 0;
/**
 *  About Abstract Signer and subclassing
 *
 *  @_section: api/providers/abstract-signer: Subclassing Signer [abstract-signer]
 */
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
        (0, index_js_2.assert)(false, "missing provider", "UNSUPPORTED_OPERATION", { operation });
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
                (0, index_js_2.assertArgument)(to != null, "transaction to ENS name not configured", "tx.to", pop.to);
                return to;
            });
        }
        if (pop.from != null) {
            const from = pop.from;
            pop.from = Promise.all([
                this.getAddress(),
                this.resolveName(from)
            ]).then(([address, from]) => {
                (0, index_js_2.assertArgument)(from && address.toLowerCase() === from.toLowerCase(), "transaction from mismatch", "tx.from", from);
                return address;
            });
        }
        return { pop: await (0, index_js_2.resolveProperties)(pop), provider };
    }
    async populateCall(tx) {
        const { pop } = await this.#populate("populateCall", tx);
        return pop;
    }
    async populateTransaction(tx) {
        const { pop, provider } = await this.#populate("populateTransaction", tx);
        if (pop.nonce == null) {
            pop.nonce = await this.getNonce("pending");
        }
        if (pop.gasLimit == null) {
            pop.gasLimit = await this.estimateGas(pop);
        }
        // Populate the chain ID
        const network = await (this.provider).getNetwork();
        if (pop.chainId != null) {
            const chainId = (0, index_js_2.getBigInt)(pop.chainId);
            (0, index_js_2.assertArgument)(chainId === network.chainId, "transaction chainId mismatch", "tx.chainId", tx.chainId);
        }
        else {
            pop.chainId = network.chainId;
        }
        // Do not allow mixing pre-eip-1559 and eip-1559 properties
        const hasEip1559 = (pop.maxFeePerGas != null || pop.maxPriorityFeePerGas != null);
        if (pop.gasPrice != null && (pop.type === 2 || hasEip1559)) {
            (0, index_js_2.assertArgument)(false, "eip-1559 transaction do not support gasPrice", "tx", tx);
        }
        else if ((pop.type === 0 || pop.type === 1) && hasEip1559) {
            (0, index_js_2.assertArgument)(false, "pre-eip-1559 transaction do not support maxFeePerGas/maxPriorityFeePerGas", "tx", tx);
        }
        if ((pop.type === 2 || pop.type == null) && (pop.maxFeePerGas != null && pop.maxPriorityFeePerGas != null)) {
            // Fully-formed EIP-1559 transaction (skip getFeeData)
            pop.type = 2;
        }
        else if (pop.type === 0 || pop.type === 1) {
            // Explicit Legacy or EIP-2930 transaction
            // We need to get fee data to determine things
            const feeData = await provider.getFeeData();
            (0, index_js_2.assert)(feeData.gasPrice != null, "network does not support gasPrice", "UNSUPPORTED_OPERATION", {
                operation: "getGasPrice"
            });
            // Populate missing gasPrice
            if (pop.gasPrice == null) {
                pop.gasPrice = feeData.gasPrice;
            }
        }
        else {
            // We need to get fee data to determine things
            const feeData = await provider.getFeeData();
            if (pop.type == null) {
                // We need to auto-detect the intended type of this transaction...
                if (feeData.maxFeePerGas != null && feeData.maxPriorityFeePerGas != null) {
                    // The network supports EIP-1559!
                    // Upgrade transaction from null to eip-1559
                    pop.type = 2;
                    if (pop.gasPrice != null) {
                        // Using legacy gasPrice property on an eip-1559 network,
                        // so use gasPrice as both fee properties
                        const gasPrice = pop.gasPrice;
                        delete pop.gasPrice;
                        pop.maxFeePerGas = gasPrice;
                        pop.maxPriorityFeePerGas = gasPrice;
                    }
                    else {
                        // Populate missing fee data
                        if (pop.maxFeePerGas == null) {
                            pop.maxFeePerGas = feeData.maxFeePerGas;
                        }
                        if (pop.maxPriorityFeePerGas == null) {
                            pop.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                        }
                    }
                }
                else if (feeData.gasPrice != null) {
                    // Network doesn't support EIP-1559...
                    // ...but they are trying to use EIP-1559 properties
                    (0, index_js_2.assert)(hasEip1559, "network does not support EIP-1559", "UNSUPPORTED_OPERATION", {
                        operation: "populateTransaction"
                    });
                    // Populate missing fee data
                    if (pop.gasPrice == null) {
                        pop.gasPrice = feeData.gasPrice;
                    }
                    // Explicitly set untyped transaction to legacy
                    // @TODO: Maybe this shold allow type 1?
                    pop.type = 0;
                }
                else {
                    // getFeeData has failed us.
                    (0, index_js_2.assert)(false, "failed to get consistent fee data", "UNSUPPORTED_OPERATION", {
                        operation: "signer.getFeeData"
                    });
                }
            }
            else if (pop.type === 2) {
                // Explicitly using EIP-1559
                // Populate missing fee data
                if (pop.maxFeePerGas == null) {
                    pop.maxFeePerGas = feeData.maxFeePerGas;
                }
                if (pop.maxPriorityFeePerGas == null) {
                    pop.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                }
            }
        }
        //@TOOD: Don't await all over the place; save them up for
        // the end for better batching
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
        const pop = await this.populateTransaction(tx);
        const txObj = index_js_1.Transaction.from(pop);
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
        (0, index_js_2.assert)(false, `VoidSigner cannot sign ${suffix}`, "UNSUPPORTED_OPERATION", { operation });
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