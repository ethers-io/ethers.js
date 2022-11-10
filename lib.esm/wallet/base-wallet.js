import { getAddress, resolveAddress } from "../address/index.js";
import { hashMessage, TypedDataEncoder } from "../hash/index.js";
import { AbstractSigner } from "../providers/index.js";
import { computeAddress, Transaction } from "../transaction/index.js";
import { defineProperties, resolveProperties, assert, assertArgument } from "../utils/index.js";
import { encryptKeystoreJson, encryptKeystoreJsonSync, } from "./json-keystore.js";
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
    async encrypt(password, progressCallback) {
        const account = { address: this.address, privateKey: this.privateKey };
        return await encryptKeystoreJson(account, password, { progressCallback });
    }
    encryptSync(password) {
        const account = { address: this.address, privateKey: this.privateKey };
        return encryptKeystoreJsonSync(account, password);
    }
    async signTransaction(tx) {
        // Replace any Addressable or ENS name with an address
        const { to, from } = await resolveProperties({
            to: (tx.to ? resolveAddress(tx.to, this.provider) : undefined),
            from: (tx.from ? resolveAddress(tx.from, this.provider) : undefined)
        });
        if (to != null) {
            tx.to = to;
        }
        if (from != null) {
            tx.from = from;
        }
        if (tx.from != null) {
            assertArgument(getAddress((tx.from)) === this.address, "transaction from address mismatch", "tx.from", tx.from);
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
    // @TODO: Add a secialized signTx and signTyped sync that enforces
    // all parameters are known?
    signMessageSync(message) {
        return this.signingKey.sign(hashMessage(message)).serialized;
    }
    async signTypedData(domain, types, value) {
        // Populate any ENS names
        const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (name) => {
            // @TODO: this should use resolveName; addresses don't
            //        need a provider
            assert(this.provider != null, "cannot resolve ENS names without a provider", "UNSUPPORTED_OPERATION", {
                operation: "resolveName",
                info: { name }
            });
            const address = await this.provider.resolveName(name);
            assert(address != null, "unconfigured ENS name", "UNCONFIGURED_NAME", {
                value: name
            });
            return address;
        });
        return this.signingKey.sign(TypedDataEncoder.hash(populated.domain, types, populated.value)).serialized;
    }
}
//# sourceMappingURL=base-wallet.js.map