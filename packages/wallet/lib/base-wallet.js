var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseWallet_signingKey;
import { getAddress, resolveAddress } from "@ethersproject/address";
import { hashMessage, TypedDataEncoder } from "@ethersproject/hash";
import { defineProperties, resolveProperties } from "@ethersproject/properties";
import { AbstractSigner } from "@ethersproject/providers";
import { Transaction } from "@ethersproject/transactions";
import { computeAddress } from "./address.js";
import { logger } from "./logger.js";
export class BaseWallet extends AbstractSigner {
    constructor(privateKey, provider) {
        super(provider);
        _BaseWallet_signingKey.set(this, void 0);
        __classPrivateFieldSet(this, _BaseWallet_signingKey, privateKey, "f");
        const address = computeAddress(this.signingKey.publicKey);
        defineProperties(this, { address });
    }
    // Store these in getters to reduce visibility in console.log
    get signingKey() { return __classPrivateFieldGet(this, _BaseWallet_signingKey, "f"); }
    get privateKey() { return this.signingKey.privateKey; }
    async getAddress() { return this.address; }
    connect(provider) {
        return new BaseWallet(__classPrivateFieldGet(this, _BaseWallet_signingKey, "f"), provider);
    }
    async signTransaction(_tx) {
        // Replace any Addressable or ENS name with an address
        const tx = Object.assign({}, _tx, await resolveProperties({
            to: (_tx.to ? resolveAddress(_tx.to, this.provider) : undefined),
            from: (_tx.from ? resolveAddress(_tx.from, this.provider) : undefined)
        }));
        if (tx.from != null) {
            if (getAddress(tx.from) !== this.address) {
                logger.throwArgumentError("transaction from address mismatch", "tx.from", _tx.from);
            }
            delete tx.from;
        }
        // Build the transaction
        const btx = Transaction.from(tx);
        btx.signature = this.signingKey.sign(btx.unsignedHash);
        return btx.serialized;
    }
    async signMessage(message) {
        return this.signingKey.sign(hashMessage(message)).serialized;
    }
    async signTypedData(domain, types, value) {
        // Populate any ENS names
        const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (name) => {
            if (this.provider == null) {
                return logger.throwError("cannot resolve ENS names without a provider", "UNSUPPORTED_OPERATION", {
                    operation: "resolveName",
                    info: { name }
                });
            }
            const address = await this.provider.resolveName(name);
            if (address == null) {
                return logger.throwError("unconfigured ENS name", "UNCONFIGURED_NAME", {
                    value: name
                });
            }
            return address;
        });
        return this.signingKey.sign(TypedDataEncoder.hash(populated.domain, types, populated.value)).serialized;
    }
}
_BaseWallet_signingKey = new WeakMap();
//# sourceMappingURL=base-wallet.js.map