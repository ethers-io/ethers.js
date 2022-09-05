"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountPath = exports.HDNodeWalletManager = exports.HDNodeVoidWallet = exports.HDNodeWallet = exports.defaultPath = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../providers/index.js");
const index_js_3 = require("../transaction/index.js");
const index_js_4 = require("../utils/index.js");
const lang_en_js_1 = require("../wordlists/lang-en.js");
const mnemonic_js_1 = require("./mnemonic.js");
const base_wallet_js_1 = require("./base-wallet.js");
exports.defaultPath = "m/44'/60'/0'/0/0";
// "Bitcoin seed"
const MasterSecret = new Uint8Array([66, 105, 116, 99, 111, 105, 110, 32, 115, 101, 101, 100]);
const HardenedBit = 0x80000000;
const N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
const Nibbles = "0123456789abcdef";
function zpad(value, length) {
    let result = "";
    while (value) {
        result = Nibbles[value % 16] + result;
        value = Math.trunc(value / 16);
    }
    while (result.length < length * 2) {
        result = "0" + result;
    }
    return "0x" + result;
}
function encodeBase58Check(_value) {
    const value = index_js_4.logger.getBytes(_value);
    const check = (0, index_js_4.dataSlice)((0, index_js_1.sha256)((0, index_js_1.sha256)(value)), 0, 4);
    const bytes = (0, index_js_4.concat)([value, check]);
    return (0, index_js_4.encodeBase58)(bytes);
}
const _guard = {};
function ser_I(index, chainCode, publicKey, privateKey) {
    const data = new Uint8Array(37);
    if (index & HardenedBit) {
        if (privateKey == null) {
            return index_js_4.logger.throwError("cannot derive child of neutered node", "UNSUPPORTED_OPERATION", {
                operation: "deriveChild"
            });
        }
        // Data = 0x00 || ser_256(k_par)
        data.set(index_js_4.logger.getBytes(privateKey), 1);
    }
    else {
        // Data = ser_p(point(k_par))
        data.set(index_js_4.logger.getBytes(publicKey));
    }
    // Data += ser_32(i)
    for (let i = 24; i >= 0; i -= 8) {
        data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff);
    }
    const I = index_js_4.logger.getBytes((0, index_js_1.computeHmac)("sha512", chainCode, data));
    return { IL: I.slice(0, 32), IR: I.slice(32) };
}
function derivePath(node, path) {
    const components = path.split("/");
    if (components.length === 0 || (components[0] === "m" && node.depth !== 0)) {
        throw new Error("invalid path - " + path);
    }
    if (components[0] === "m") {
        components.shift();
    }
    let result = node;
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component.match(/^[0-9]+'$/)) {
            const index = parseInt(component.substring(0, component.length - 1));
            if (index >= HardenedBit) {
                throw new Error("invalid path index - " + component);
            }
            result = result.deriveChild(HardenedBit + index);
        }
        else if (component.match(/^[0-9]+$/)) {
            const index = parseInt(component);
            if (index >= HardenedBit) {
                throw new Error("invalid path index - " + component);
            }
            result = result.deriveChild(index);
        }
        else {
            throw new Error("invalid path component - " + component);
        }
    }
    return result;
}
class HDNodeWallet extends base_wallet_js_1.BaseWallet {
    publicKey;
    fingerprint;
    parentFingerprint;
    mnemonic;
    chainCode;
    path;
    index;
    depth;
    constructor(guard, signingKey, parentFingerprint, chainCode, path, index, depth, mnemonic, provider) {
        super(signingKey, provider);
        index_js_4.logger.assertPrivate(guard, _guard, "HDNodeWallet");
        (0, index_js_4.defineProperties)(this, { publicKey: signingKey.compressedPublicKey });
        const fingerprint = (0, index_js_4.dataSlice)((0, index_js_1.ripemd160)((0, index_js_1.sha256)(this.publicKey)), 0, 4);
        (0, index_js_4.defineProperties)(this, {
            parentFingerprint, fingerprint,
            chainCode, path, index, depth
        });
        (0, index_js_4.defineProperties)(this, { mnemonic });
    }
    connect(provider) {
        return new HDNodeWallet(_guard, this.signingKey, this.parentFingerprint, this.chainCode, this.path, this.index, this.depth, this.mnemonic, provider);
    }
    get extendedKey() {
        // We only support the mainnet values for now, but if anyone needs
        // testnet values, let me know. I believe current sentiment is that
        // we should always use mainnet, and use BIP-44 to derive the network
        //   - Mainnet: public=0x0488B21E, private=0x0488ADE4
        //   - Testnet: public=0x043587CF, private=0x04358394
        if (this.depth >= 256) {
            throw new Error("Depth too large!");
        }
        return encodeBase58Check((0, index_js_4.concat)([
            "0x0488ADE4", zpad(this.depth, 1), this.parentFingerprint,
            zpad(this.index, 4), this.chainCode,
            (0, index_js_4.concat)(["0x00", this.privateKey])
        ]));
    }
    hasPath() { return (this.path != null); }
    neuter() {
        return new HDNodeVoidWallet(_guard, this.address, this.publicKey, this.parentFingerprint, this.chainCode, this.path, this.index, this.depth, this.provider);
    }
    deriveChild(_index) {
        const index = index_js_4.logger.getNumber(_index, "index");
        if (index > 0xffffffff) {
            throw new Error("invalid index - " + String(index));
        }
        // Base path
        let path = this.path;
        if (path) {
            path += "/" + (index & ~HardenedBit);
            if (index & HardenedBit) {
                path += "'";
            }
        }
        const { IR, IL } = ser_I(index, this.chainCode, this.publicKey, this.privateKey);
        const ki = new index_js_1.SigningKey((0, index_js_4.toHex)(((0, index_js_4.toBigInt)(IL) + BigInt(this.privateKey)) % N, 32));
        return new HDNodeWallet(_guard, ki, this.fingerprint, (0, index_js_4.hexlify)(IR), path, index, this.depth + 1, this.mnemonic, this.provider);
    }
    derivePath(path) {
        return derivePath(this, path);
    }
    static #fromSeed(_seed, mnemonic) {
        const seed = index_js_4.logger.getBytes(_seed, "seed");
        if (seed.length < 16 || seed.length > 64) {
            throw new Error("invalid seed");
        }
        const I = index_js_4.logger.getBytes((0, index_js_1.computeHmac)("sha512", MasterSecret, seed));
        const signingKey = new index_js_1.SigningKey((0, index_js_4.hexlify)(I.slice(0, 32)));
        return new HDNodeWallet(_guard, signingKey, "0x00000000", (0, index_js_4.hexlify)(I.slice(32)), "m", 0, 0, mnemonic, null);
    }
    static fromSeed(seed) {
        return HDNodeWallet.#fromSeed(seed, null);
    }
    static fromPhrase(phrase, password = "", path = exports.defaultPath, wordlist = lang_en_js_1.langEn) {
        if (!path) {
            path = exports.defaultPath;
        }
        const mnemonic = mnemonic_js_1.Mnemonic.fromPhrase(phrase, password, wordlist);
        return HDNodeWallet.#fromSeed(mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
    static fromMnemonic(mnemonic, path = exports.defaultPath) {
        if (!path) {
            path = exports.defaultPath;
        }
        return HDNodeWallet.#fromSeed(mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
    static fromExtendedKey(extendedKey) {
        const bytes = index_js_4.logger.getBytes((0, index_js_4.decodeBase58)(extendedKey)); // @TODO: redact
        if (bytes.length !== 82 || encodeBase58Check(bytes.slice(0, 78)) !== extendedKey) {
            index_js_4.logger.throwArgumentError("invalid extended key", "extendedKey", "[ REDACTED ]");
        }
        const depth = bytes[4];
        const parentFingerprint = (0, index_js_4.hexlify)(bytes.slice(5, 9));
        const index = parseInt((0, index_js_4.hexlify)(bytes.slice(9, 13)).substring(2), 16);
        const chainCode = (0, index_js_4.hexlify)(bytes.slice(13, 45));
        const key = bytes.slice(45, 78);
        switch ((0, index_js_4.hexlify)(bytes.slice(0, 4))) {
            // Public Key
            case "0x0488b21e":
            case "0x043587cf": {
                const publicKey = (0, index_js_4.hexlify)(key);
                return new HDNodeVoidWallet(_guard, (0, index_js_3.computeAddress)(publicKey), publicKey, parentFingerprint, chainCode, null, index, depth, null);
            }
            // Private Key
            case "0x0488ade4":
            case "0x04358394 ":
                if (key[0] !== 0) {
                    break;
                }
                return new HDNodeWallet(_guard, new index_js_1.SigningKey(key.slice(1)), parentFingerprint, chainCode, null, index, depth, null, null);
        }
        return index_js_4.logger.throwArgumentError("invalid extended key prefix", "extendedKey", "[ REDACTED ]");
    }
    static createRandom(password = "", path = exports.defaultPath, wordlist = lang_en_js_1.langEn) {
        if (!path) {
            path = exports.defaultPath;
        }
        const mnemonic = mnemonic_js_1.Mnemonic.fromEntropy((0, index_js_1.randomBytes)(16), password, wordlist);
        return HDNodeWallet.#fromSeed(mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
}
exports.HDNodeWallet = HDNodeWallet;
class HDNodeVoidWallet extends index_js_2.VoidSigner {
    publicKey;
    fingerprint;
    parentFingerprint;
    chainCode;
    path;
    index;
    depth;
    constructor(guard, address, publicKey, parentFingerprint, chainCode, path, index, depth, provider) {
        super(address, provider);
        index_js_4.logger.assertPrivate(guard, _guard, "HDNodeVoidWallet");
        (0, index_js_4.defineProperties)(this, { publicKey });
        const fingerprint = (0, index_js_4.dataSlice)((0, index_js_1.ripemd160)((0, index_js_1.sha256)(publicKey)), 0, 4);
        (0, index_js_4.defineProperties)(this, {
            publicKey, fingerprint, parentFingerprint, chainCode, path, index, depth
        });
    }
    connect(provider) {
        return new HDNodeVoidWallet(_guard, this.address, this.publicKey, this.parentFingerprint, this.chainCode, this.path, this.index, this.depth, provider);
    }
    get extendedKey() {
        // We only support the mainnet values for now, but if anyone needs
        // testnet values, let me know. I believe current sentiment is that
        // we should always use mainnet, and use BIP-44 to derive the network
        //   - Mainnet: public=0x0488B21E, private=0x0488ADE4
        //   - Testnet: public=0x043587CF, private=0x04358394
        if (this.depth >= 256) {
            throw new Error("Depth too large!");
        }
        return encodeBase58Check((0, index_js_4.concat)([
            "0x0488B21E",
            zpad(this.depth, 1),
            this.parentFingerprint,
            zpad(this.index, 4),
            this.chainCode,
            this.publicKey,
        ]));
    }
    hasPath() { return (this.path != null); }
    deriveChild(_index) {
        const index = index_js_4.logger.getNumber(_index, "index");
        if (index > 0xffffffff) {
            throw new Error("invalid index - " + String(index));
        }
        // Base path
        let path = this.path;
        if (path) {
            path += "/" + (index & ~HardenedBit);
            if (index & HardenedBit) {
                path += "'";
            }
        }
        const { IR, IL } = ser_I(index, this.chainCode, this.publicKey, null);
        const Ki = index_js_1.SigningKey._addPoints(IL, this.publicKey, true);
        const address = (0, index_js_3.computeAddress)(Ki);
        return new HDNodeVoidWallet(_guard, address, Ki, this.fingerprint, (0, index_js_4.hexlify)(IR), path, index, this.depth + 1, this.provider);
    }
    derivePath(path) {
        return derivePath(this, path);
    }
}
exports.HDNodeVoidWallet = HDNodeVoidWallet;
class HDNodeWalletManager {
    #root;
    constructor(phrase, password = "", path = "m/44'/60'/0'/0", locale = lang_en_js_1.langEn) {
        this.#root = HDNodeWallet.fromPhrase(phrase, password, path, locale);
    }
    getSigner(index = 0) {
        return this.#root.deriveChild(index);
    }
}
exports.HDNodeWalletManager = HDNodeWalletManager;
function getAccountPath(_index) {
    const index = index_js_4.logger.getNumber(_index, "index");
    if (index < 0 || index >= HardenedBit) {
        index_js_4.logger.throwArgumentError("invalid account index", "index", index);
    }
    return `m/44'/60'/${index}'/0/0`;
}
exports.getAccountPath = getAccountPath;
//# sourceMappingURL=hdwallet.js.map