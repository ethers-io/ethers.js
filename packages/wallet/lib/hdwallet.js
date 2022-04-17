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
var _a, _HDNodeWallet_fromSeed, _HDNodeWalletManager_root;
import { arrayify, concat, dataSlice, hexlify } from "@ethersproject/bytes";
import { computeHmac, randomBytes, ripemd160, sha256 } from "@ethersproject/crypto";
import { decodeBase58, encodeBase58, toBigInt, toHex } from "@ethersproject/math";
import { defineProperties } from "@ethersproject/properties";
import { VoidSigner } from "@ethersproject/providers";
import { SigningKey } from "@ethersproject/signing-key";
import { computeAddress } from "@ethersproject/transaction";
import { langEn } from "@ethersproject/wordlists/lib/lang-en.js";
import { logger } from "./logger.js";
import { Mnemonic } from "./mnemonic.js";
import { BaseWallet } from "./base-wallet.js";
export const defaultPath = "m/44'/60'/0'/0/0";
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
    const value = logger.getBytes(_value);
    const check = dataSlice(sha256(sha256(value)), 0, 4);
    const bytes = concat([value, check]);
    return encodeBase58(bytes);
}
const _guard = {};
function ser_I(index, chainCode, publicKey, privateKey) {
    const data = new Uint8Array(37);
    if (index & HardenedBit) {
        if (privateKey == null) {
            return logger.throwError("cannot derive child of neutered node", "UNSUPPORTED_OPERATION", {
                operation: "deriveChild"
            });
        }
        // Data = 0x00 || ser_256(k_par)
        data.set(arrayify(privateKey), 1);
    }
    else {
        // Data = ser_p(point(k_par))
        data.set(arrayify(publicKey));
    }
    // Data += ser_32(i)
    for (let i = 24; i >= 0; i -= 8) {
        data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff);
    }
    const I = arrayify(computeHmac("sha512", chainCode, data));
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
export class HDNodeWallet extends BaseWallet {
    constructor(guard, signingKey, parentFingerprint, chainCode, path, index, depth, mnemonic, provider) {
        super(signingKey, provider);
        logger.assertPrivate(guard, _guard, "HDNodeWallet");
        defineProperties(this, { publicKey: signingKey.compressedPublicKey });
        const fingerprint = dataSlice(ripemd160(sha256(this.publicKey)), 0, 4);
        defineProperties(this, {
            parentFingerprint, fingerprint,
            chainCode, path, index, depth
        });
        defineProperties(this, { mnemonic });
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
        return encodeBase58Check(concat([
            "0x0488ADE4", zpad(this.depth, 1), this.parentFingerprint,
            zpad(this.index, 4), this.chainCode,
            concat(["0x00", this.privateKey])
        ]));
    }
    hasPath() { return (this.path != null); }
    neuter() {
        return new HDNodeVoidWallet(_guard, this.address, this.publicKey, this.parentFingerprint, this.chainCode, this.path, this.index, this.depth, this.provider);
    }
    deriveChild(_index) {
        const index = logger.getNumber(_index, "index");
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
        const ki = new SigningKey(toHex((toBigInt(IL) + BigInt(this.privateKey)) % N, 32));
        return new HDNodeWallet(_guard, ki, this.fingerprint, hexlify(IR), path, index, this.depth + 1, this.mnemonic, this.provider);
    }
    derivePath(path) {
        return derivePath(this, path);
    }
    static fromSeed(seed) {
        return __classPrivateFieldGet(HDNodeWallet, _a, "m", _HDNodeWallet_fromSeed).call(HDNodeWallet, seed, null);
    }
    static fromPhrase(phrase, password = "", path = defaultPath, wordlist = langEn) {
        if (!path) {
            path = defaultPath;
        }
        const mnemonic = Mnemonic.fromPhrase(phrase, password, wordlist);
        return __classPrivateFieldGet(HDNodeWallet, _a, "m", _HDNodeWallet_fromSeed).call(HDNodeWallet, mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
    static fromMnemonic(mnemonic, path = defaultPath) {
        if (!path) {
            path = defaultPath;
        }
        return __classPrivateFieldGet(HDNodeWallet, _a, "m", _HDNodeWallet_fromSeed).call(HDNodeWallet, mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
    static fromExtendedKey(extendedKey) {
        const bytes = arrayify(decodeBase58(extendedKey)); // @TODO: redact
        if (bytes.length !== 82 || encodeBase58Check(bytes.slice(0, 78)) !== extendedKey) {
            logger.throwArgumentError("invalid extended key", "extendedKey", "[ REDACTED ]");
        }
        const depth = bytes[4];
        const parentFingerprint = hexlify(bytes.slice(5, 9));
        const index = parseInt(hexlify(bytes.slice(9, 13)).substring(2), 16);
        const chainCode = hexlify(bytes.slice(13, 45));
        const key = bytes.slice(45, 78);
        switch (hexlify(bytes.slice(0, 4))) {
            // Public Key
            case "0x0488b21e":
            case "0x043587cf": {
                const publicKey = hexlify(key);
                return new HDNodeVoidWallet(_guard, computeAddress(publicKey), publicKey, parentFingerprint, chainCode, null, index, depth, null);
            }
            // Private Key
            case "0x0488ade4":
            case "0x04358394 ":
                if (key[0] !== 0) {
                    break;
                }
                return new HDNodeWallet(_guard, new SigningKey(key.slice(1)), parentFingerprint, chainCode, null, index, depth, null, null);
        }
        return logger.throwArgumentError("invalid extended key prefix", "extendedKey", "[ REDACTED ]");
    }
    static createRandom(password = "", path = defaultPath, wordlist = langEn) {
        if (!path) {
            path = defaultPath;
        }
        const mnemonic = Mnemonic.fromEntropy(randomBytes(16), password, wordlist);
        return __classPrivateFieldGet(HDNodeWallet, _a, "m", _HDNodeWallet_fromSeed).call(HDNodeWallet, mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
}
_a = HDNodeWallet, _HDNodeWallet_fromSeed = function _HDNodeWallet_fromSeed(_seed, mnemonic) {
    const seed = logger.getBytes(_seed, "seed");
    if (seed.length < 16 || seed.length > 64) {
        throw new Error("invalid seed");
    }
    const I = arrayify(computeHmac("sha512", MasterSecret, seed));
    const signingKey = new SigningKey(hexlify(I.slice(0, 32)));
    return new HDNodeWallet(_guard, signingKey, "0x00000000", hexlify(I.slice(32)), "m", 0, 0, mnemonic, null);
};
export class HDNodeVoidWallet extends VoidSigner {
    constructor(guard, address, publicKey, parentFingerprint, chainCode, path, index, depth, provider) {
        super(address, provider);
        logger.assertPrivate(guard, _guard, "HDNodeVoidWallet");
        defineProperties(this, { publicKey });
        const fingerprint = dataSlice(ripemd160(sha256(publicKey)), 0, 4);
        defineProperties(this, {
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
        return encodeBase58Check(concat([
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
        const index = logger.getNumber(_index, "index");
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
        const Ki = SigningKey._addPoints(IL, this.publicKey, true);
        const address = computeAddress(Ki);
        return new HDNodeVoidWallet(_guard, address, Ki, this.fingerprint, hexlify(IR), path, index, this.depth + 1, this.provider);
    }
    derivePath(path) {
        return derivePath(this, path);
    }
}
export class HDNodeWalletManager {
    constructor(phrase, password = "", path = "m/44'/60'/0'/0", locale = langEn) {
        _HDNodeWalletManager_root.set(this, void 0);
        __classPrivateFieldSet(this, _HDNodeWalletManager_root, HDNodeWallet.fromPhrase(phrase, password, path, locale), "f");
    }
    getSigner(index = 0) {
        return __classPrivateFieldGet(this, _HDNodeWalletManager_root, "f").deriveChild(index);
    }
}
_HDNodeWalletManager_root = new WeakMap();
export function getAccountPath(_index) {
    const index = logger.getNumber(_index, "index");
    if (index < 0 || index >= HardenedBit) {
        logger.throwArgumentError("invalid account index", "index", index);
    }
    return `m/44'/60'/${index}'/0/0`;
}
//# sourceMappingURL=hdwallet.js.map