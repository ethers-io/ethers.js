var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAccountFromAddress, getAddress, getAddressFromAccount } from "@hethers/address";
import { Provider } from "@hethers/abstract-provider";
import { Signer } from "@hethers/abstract-signer";
import { arrayify, concat, hexDataSlice, hexlify, isHexString, joinSignature } from "@ethersproject/bytes";
import { hashMessage } from "@ethersproject/hash";
import { defaultPath, entropyToMnemonic, HDNode } from "@hethers/hdnode";
import { keccak256 } from "@ethersproject/keccak256";
import { defineReadOnly } from "@ethersproject/properties";
import { randomBytes } from "@ethersproject/random";
import { SigningKey, recoverPublicKey } from "@ethersproject/signing-key";
import { decryptJsonWallet, decryptJsonWalletSync, encryptKeystore } from "@hethers/json-wallets";
import { computeAlias, serializeHederaTransaction } from "@hethers/transactions";
import { Logger } from "@hethers/logger";
import { version } from "./_version";
import { PrivateKey as HederaPrivKey, PublicKey as HederaPubKey } from "@hashgraph/sdk";
const logger = new Logger(version);
function isAccount(value) {
    return value != null && isHexString(value.privateKey, 32);
}
function hasMnemonic(value) {
    const mnemonic = value.mnemonic;
    return (mnemonic && mnemonic.phrase);
}
function hasAlias(value) {
    return isAccount(value) && value.alias != null;
}
export class Wallet extends Signer {
    constructor(identity, provider) {
        logger.checkNew(new.target, Wallet);
        super();
        if (isAccount(identity) && !SigningKey.isSigningKey(identity)) {
            const signingKey = new SigningKey(identity.privateKey);
            defineReadOnly(this, "_signingKey", () => signingKey);
            if (identity.address || identity.account) {
                defineReadOnly(this, "address", identity.address ? getAddress(identity.address) : getAddressFromAccount(identity.account));
                defineReadOnly(this, "account", identity.account ? identity.account : getAccountFromAddress(identity.address));
            }
            if (hasAlias(identity)) {
                defineReadOnly(this, "alias", identity.alias);
                if (this.alias !== computeAlias(signingKey.privateKey)) {
                    logger.throwArgumentError("privateKey/alias mismatch", "privateKey", "[REDACTED]");
                }
            }
            if (hasMnemonic(identity)) {
                const srcMnemonic = identity.mnemonic;
                defineReadOnly(this, "_mnemonic", () => ({
                    phrase: srcMnemonic.phrase,
                    path: srcMnemonic.path || defaultPath,
                    locale: srcMnemonic.locale || "en"
                }));
                const mnemonic = this.mnemonic;
                const node = HDNode.fromMnemonic(mnemonic.phrase, null, mnemonic.locale).derivePath(mnemonic.path);
                if (node.privateKey !== this._signingKey().privateKey) {
                    logger.throwArgumentError("mnemonic/privateKey mismatch", "privateKey", "[REDACTED]");
                }
            }
            else {
                defineReadOnly(this, "_mnemonic", () => null);
            }
        }
        else {
            if (SigningKey.isSigningKey(identity)) {
                /* istanbul ignore if */
                if (identity.curve !== "secp256k1") {
                    logger.throwArgumentError("unsupported curve; must be secp256k1", "privateKey", "[REDACTED]");
                }
                defineReadOnly(this, "_signingKey", () => identity);
            }
            else {
                // A lot of common tools do not prefix private keys with a 0x (see: #1166)
                if (typeof (identity) === "string") {
                    if (identity.match(/^[0-9a-f]*$/i) && identity.length === 64) {
                        identity = "0x" + identity;
                    }
                }
                const signingKey = new SigningKey(identity);
                defineReadOnly(this, "_signingKey", () => signingKey);
            }
            defineReadOnly(this, "_mnemonic", () => null);
            defineReadOnly(this, "alias", computeAlias(this._signingKey().privateKey));
        }
        /* istanbul ignore if */
        if (provider && !Provider.isProvider(provider)) {
            logger.throwArgumentError("invalid provider", "provider", provider);
        }
        defineReadOnly(this, "provider", provider || null);
    }
    get mnemonic() {
        return this._mnemonic();
    }
    get privateKey() {
        return this._signingKey().privateKey;
    }
    get publicKey() {
        return this._signingKey().publicKey;
    }
    getAddress() {
        return Promise.resolve(this.address);
    }
    getAccount() {
        return Promise.resolve(this.account);
    }
    getAlias() {
        return Promise.resolve(this.alias);
    }
    connect(provider) {
        return new Wallet(this, provider);
    }
    connectAccount(accountLike) {
        const eoa = {
            privateKey: this._signingKey().privateKey,
            address: getAddressFromAccount(accountLike),
            alias: this.alias,
            mnemonic: this._mnemonic()
        };
        return new Wallet(eoa, this.provider);
    }
    signTransaction(transaction) {
        this._checkAddress('signTransaction');
        let tx = this.checkTransaction(transaction);
        return this.populateTransaction(tx).then((readyTx) => __awaiter(this, void 0, void 0, function* () {
            const pubKey = HederaPubKey.fromString(this._signingKey().compressedPublicKey);
            const tx = serializeHederaTransaction(readyTx, pubKey);
            const privKey = HederaPrivKey.fromStringECDSA(this._signingKey().privateKey);
            const signed = yield tx.sign(privKey);
            return hexlify(signed.toBytes());
        }));
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return joinSignature(this._signingKey().signDigest(hashMessage(message)));
        });
    }
    _signTypedData(domain, types, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return logger.throwError("_signTypedData not supported", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: '_signTypedData'
            });
        });
    }
    encrypt(password, options, progressCallback) {
        if (typeof (options) === "function" && !progressCallback) {
            progressCallback = options;
            options = {};
        }
        if (progressCallback && typeof (progressCallback) !== "function") {
            throw new Error("invalid callback");
        }
        if (!options) {
            options = {};
        }
        return encryptKeystore(this, password, options, progressCallback);
    }
    /**
     * Performs a contract local call (ContractCallQuery) against the given contract in the provider's network.
     * In the future, this method should automatically perform getCost and apply the results for gasLimit/txFee.
     * TODO: utilize getCost when implemented
     *
     * @param txRequest - the call request to be submitted
     */
    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options) {
        let entropy = randomBytes(16);
        if (!options) {
            options = {};
        }
        if (options.extraEntropy) {
            entropy = arrayify(hexDataSlice(keccak256(concat([entropy, options.extraEntropy])), 0, 16));
        }
        const mnemonic = entropyToMnemonic(entropy, options.locale);
        return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
    }
    createAccount(pubKey, initialBalance) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!initialBalance)
                initialBalance = BigInt(0);
            const signed = yield this.signTransaction({
                customData: {
                    publicKey: pubKey,
                    initialBalance
                }
            });
            return this.provider.sendTransaction(signed);
        });
    }
    ;
    static fromEncryptedJson(json, password, progressCallback) {
        return decryptJsonWallet(json, password, progressCallback).then((account) => {
            return new Wallet(account);
        });
    }
    static fromEncryptedJsonSync(json, password) {
        return new Wallet(decryptJsonWalletSync(json, password));
    }
    static fromMnemonic(mnemonic, path, wordlist) {
        if (!path) {
            path = defaultPath;
        }
        return new Wallet(HDNode.fromMnemonic(mnemonic, null, wordlist).derivePath(path));
    }
    _checkAddress(operation) {
        if (!this.address) {
            logger.throwError("missing address", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: (operation || "_checkAddress")
            });
        }
    }
}
export function verifyMessage(message, signature) {
    return recoverPublicKey(arrayify(hashMessage(message)), signature);
}
export function verifyTypedData(domain, types, value, signature) {
    return logger.throwError("verifyTypedData not supported", Logger.errors.UNSUPPORTED_OPERATION, {
        operation: 'verifyTypedData'
    });
}
//# sourceMappingURL=index.js.map