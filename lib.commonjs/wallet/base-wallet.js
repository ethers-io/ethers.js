"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseWallet = void 0;
const index_js_1 = require("../address/index.js");
const index_js_2 = require("../hash/index.js");
const index_js_3 = require("../providers/index.js");
const index_js_4 = require("../transaction/index.js");
const index_js_5 = require("../utils/index.js");
class BaseWallet extends index_js_3.AbstractSigner {
    address;
    #signingKey;
    constructor(privateKey, provider) {
        super(provider);
        this.#signingKey = privateKey;
        const address = (0, index_js_4.computeAddress)(this.signingKey.publicKey);
        (0, index_js_5.defineProperties)(this, { address });
    }
    // Store these in getters to reduce visibility in console.log
    get signingKey() { return this.#signingKey; }
    get privateKey() { return this.signingKey.privateKey; }
    async getAddress() { return this.address; }
    connect(provider) {
        return new BaseWallet(this.#signingKey, provider);
    }
    async signTransaction(_tx) {
        // Replace any Addressable or ENS name with an address
        const tx = Object.assign({}, _tx, await (0, index_js_5.resolveProperties)({
            to: (_tx.to ? (0, index_js_1.resolveAddress)(_tx.to, this.provider) : undefined),
            from: (_tx.from ? (0, index_js_1.resolveAddress)(_tx.from, this.provider) : undefined)
        }));
        if (tx.from != null) {
            if ((0, index_js_1.getAddress)(tx.from) !== this.address) {
                (0, index_js_5.throwArgumentError)("transaction from address mismatch", "tx.from", _tx.from);
            }
            delete tx.from;
        }
        // Build the transaction
        const btx = index_js_4.Transaction.from(tx);
        btx.signature = this.signingKey.sign(btx.unsignedHash);
        return btx.serialized;
    }
    async signMessage(message) {
        return this.signingKey.sign((0, index_js_2.hashMessage)(message)).serialized;
    }
    async signTypedData(domain, types, value) {
        // Populate any ENS names
        const populated = await index_js_2.TypedDataEncoder.resolveNames(domain, types, value, async (name) => {
            if (this.provider == null) {
                return (0, index_js_5.throwError)("cannot resolve ENS names without a provider", "UNSUPPORTED_OPERATION", {
                    operation: "resolveName",
                    info: { name }
                });
            }
            const address = await this.provider.resolveName(name);
            if (address == null) {
                return (0, index_js_5.throwError)("unconfigured ENS name", "UNCONFIGURED_NAME", {
                    value: name
                });
            }
            return address;
        });
        return this.signingKey.sign(index_js_2.TypedDataEncoder.hash(populated.domain, types, populated.value)).serialized;
    }
}
exports.BaseWallet = BaseWallet;
//# sourceMappingURL=base-wallet.js.map