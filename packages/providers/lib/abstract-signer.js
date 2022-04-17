var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _AbstractSigner_instances, _AbstractSigner_checkProvider, _AbstractSigner_fromify, _VoidSigner_instances, _VoidSigner_throwUnsupported, _WrappedSigner_signer;
import { defineProperties, resolveProperties } from "@ethersproject/properties";
import { Transaction } from "@ethersproject/transaction";
import { logger } from "./logger.js";
export class AbstractSigner {
    constructor(provider) {
        _AbstractSigner_instances.add(this);
        defineProperties(this, { provider: (provider || null) });
    }
    async getBalance(blockTag) {
        return __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_checkProvider).call(this, "getBalance").getBalanceOf(await this.getAddress(), blockTag);
    }
    async getTransactionCount(blockTag) {
        return __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_checkProvider).call(this, "getTransactionCount").getTransactionCountOf(await this.getAddress(), blockTag);
    }
    async estimateGas(tx) {
        return __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_checkProvider).call(this, "estimateGas").estimateGas(await __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_fromify).call(this, tx));
    }
    async call(tx) {
        return __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_checkProvider).call(this, "call").call(await __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_fromify).call(this, tx));
    }
    async populateTransaction(tx) {
        const provider = __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_checkProvider).call(this, "populateTransaction");
        //let pop: Deferrable<TransactionRequest> = Object.assign({ }, tx);
        let pop = Object.assign({}, tx);
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
            ]).then(([address, from]) => {
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
    async resolveName(name) {
        const provider = __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_checkProvider).call(this, "resolveName");
        return await provider.resolveName(name);
    }
    async sendTransaction(tx) {
        const provider = __classPrivateFieldGet(this, _AbstractSigner_instances, "m", _AbstractSigner_checkProvider).call(this, "sendTransaction");
        const txObj = Transaction.from(await this.populateTransaction(tx));
        return await provider.broadcastTransaction(await this.signTransaction(txObj));
    }
}
_AbstractSigner_instances = new WeakSet(), _AbstractSigner_checkProvider = function _AbstractSigner_checkProvider(operation) {
    if (this.provider) {
        return this.provider;
    }
    return logger.throwError("missing provider", "UNSUPPORTED_OPERATION", { operation });
}, _AbstractSigner_fromify = async function _AbstractSigner_fromify(tx) {
    tx = Object.assign({}, tx);
    const actions = [];
    if (tx.from != null) {
        const from = tx.from;
        actions.push(Promise.all([
            this.getAddress(),
            this.resolveName(from)
        ]).then(([address, from]) => {
            if (!from || address.toLowerCase() !== from.toLowerCase()) {
                logger.throwArgumentError("transaction from mismatch", "tx.from", from);
            }
            tx.from = address;
        }));
    }
    await Promise.all(actions);
    return tx;
};
export class VoidSigner extends AbstractSigner {
    constructor(address, provider) {
        super(provider);
        _VoidSigner_instances.add(this);
        defineProperties(this, { address });
    }
    async getAddress() { return this.address; }
    connect(provider) {
        return new VoidSigner(this.address, provider);
    }
    async signTransaction(tx) {
        __classPrivateFieldGet(this, _VoidSigner_instances, "m", _VoidSigner_throwUnsupported).call(this, "transactions", "signTransaction");
    }
    async signMessage(message) {
        __classPrivateFieldGet(this, _VoidSigner_instances, "m", _VoidSigner_throwUnsupported).call(this, "messages", "signMessage");
    }
    async signTypedData(domain, types, value) {
        __classPrivateFieldGet(this, _VoidSigner_instances, "m", _VoidSigner_throwUnsupported).call(this, "typed-data", "signTypedData");
    }
}
_VoidSigner_instances = new WeakSet(), _VoidSigner_throwUnsupported = function _VoidSigner_throwUnsupported(suffix, operation) {
    return logger.throwError(`VoidSigner cannot sign ${suffix}`, "UNSUPPORTED_OPERATION", {
        operation
    });
};
export class WrappedSigner extends AbstractSigner {
    //get provider(): null | Provider { return this.#signer.provider; }
    constructor(signer) {
        super(signer.provider);
        _WrappedSigner_signer.set(this, void 0);
        __classPrivateFieldSet(this, _WrappedSigner_signer, signer, "f");
    }
    async getAddress() {
        return await __classPrivateFieldGet(this, _WrappedSigner_signer, "f").getAddress();
    }
    connect(provider) {
        return new WrappedSigner(__classPrivateFieldGet(this, _WrappedSigner_signer, "f").connect(provider));
    }
    async signTransaction(tx) {
        return await __classPrivateFieldGet(this, _WrappedSigner_signer, "f").signTransaction(tx);
    }
    async sendTransaction(tx) {
        return await __classPrivateFieldGet(this, _WrappedSigner_signer, "f").sendTransaction(tx);
    }
    async signMessage(message) {
        return await __classPrivateFieldGet(this, _WrappedSigner_signer, "f").signMessage(message);
    }
    async signTypedData(domain, types, value) {
        return await __classPrivateFieldGet(this, _WrappedSigner_signer, "f").signTypedData(domain, types, value);
    }
}
_WrappedSigner_signer = new WeakMap();
//# sourceMappingURL=abstract-signer.js.map