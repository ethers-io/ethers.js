import { getAddress, resolveAddress } from "../address/index.js";
import { hashMessage, TypedDataEncoder } from "../hash/index.js";
import { AbstractSigner } from "../providers/index.js";
import { computeAddress, Transaction } from "../transaction/index.js";
import { defineProperties, logger, resolveProperties } from "../utils/index.js";
export class BaseWallet extends AbstractSigner {
    address;
    #signingKey;
    constructor(privateKey, provider) {
        super(provider);
        this.#signingKey = privateKey;
        const address = computeAddress(this.signingKey.publicKey);
        defineProperties(this, { address });
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
//# sourceMappingURL=base-wallet.js.map