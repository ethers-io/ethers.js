'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// See: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// See: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
// The English language word list.
// For additional word lists, please see /src.tc/wordlists/
var lang_en_1 = require("../wordlists/lang-en");
// Automatically register English?
//import { register } from '../wordlists/wordlist';
//register(langEn);
var bytes_1 = require("../utils/bytes");
var bignumber_1 = require("../utils/bignumber");
var utf8_1 = require("../utils/utf8");
var pbkdf2_1 = require("../utils/pbkdf2");
var hmac_1 = require("../utils/hmac");
var properties_1 = require("../utils/properties");
var secp256k1_1 = require("../utils/secp256k1");
var sha2_1 = require("../utils/sha2");
var N = bignumber_1.bigNumberify("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
var errors = __importStar(require("../utils/errors"));
// "Bitcoin seed"
var MasterSecret = utf8_1.toUtf8Bytes('Bitcoin seed');
var HardenedBit = 0x80000000;
// Returns a byte with the MSB bits set
function getUpperMask(bits) {
    return ((1 << bits) - 1) << (8 - bits);
}
// Returns a byte with the LSB bits set
function getLowerMask(bits) {
    return (1 << bits) - 1;
}
var _constructorGuard = {};
exports.defaultPath = "m/44'/60'/0'/0/0";
var HDNode = /** @class */ (function () {
    /**
     *  This constructor should not be called directly.
     *
     *  Please use:
     *   - fromMnemonic
     *   - fromSeed
     */
    function HDNode(constructorGuard, privateKey, chainCode, index, depth, mnemonic, path) {
        errors.checkNew(this, HDNode);
        if (constructorGuard !== _constructorGuard) {
            throw new Error('HDNode constructor cannot be called directly');
        }
        properties_1.defineReadOnly(this, 'keyPair', new secp256k1_1.KeyPair(privateKey));
        properties_1.defineReadOnly(this, 'privateKey', this.keyPair.privateKey);
        properties_1.defineReadOnly(this, 'publicKey', this.keyPair.compressedPublicKey);
        properties_1.defineReadOnly(this, 'chainCode', bytes_1.hexlify(chainCode));
        properties_1.defineReadOnly(this, 'index', index);
        properties_1.defineReadOnly(this, 'depth', depth);
        properties_1.defineReadOnly(this, 'mnemonic', mnemonic);
        properties_1.defineReadOnly(this, 'path', path);
        properties_1.setType(this, 'HDNode');
    }
    HDNode.prototype._derive = function (index) {
        // Public parent key -> public child key
        if (!this.privateKey) {
            if (index >= HardenedBit) {
                throw new Error('cannot derive child of neutered node');
            }
            throw new Error('not implemented');
        }
        var data = new Uint8Array(37);
        // Base path
        var mnemonic = this.mnemonic;
        var path = this.path;
        if (path) {
            path += '/' + index;
        }
        if (index & HardenedBit) {
            // Data = 0x00 || ser_256(k_par)
            data.set(bytes_1.arrayify(this.privateKey), 1);
            // Hardened path
            if (path) {
                path += "'";
            }
        }
        else {
            // Data = ser_p(point(k_par))
            data.set(this.keyPair.publicKeyBytes);
        }
        // Data += ser_32(i)
        for (var i = 24; i >= 0; i -= 8) {
            data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff);
        }
        var I = hmac_1.computeHmac(hmac_1.SupportedAlgorithms.sha512, this.chainCode, data);
        var IL = bignumber_1.bigNumberify(I.slice(0, 32));
        var IR = I.slice(32);
        var ki = IL.add(this.keyPair.privateKey).mod(N);
        return new HDNode(_constructorGuard, bytes_1.arrayify(ki), IR, index, this.depth + 1, mnemonic, path);
    };
    HDNode.prototype.derivePath = function (path) {
        var components = path.split('/');
        if (components.length === 0 || (components[0] === 'm' && this.depth !== 0)) {
            throw new Error('invalid path');
        }
        if (components[0] === 'm') {
            components.shift();
        }
        var result = this;
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            if (component.match(/^[0-9]+'$/)) {
                var index = parseInt(component.substring(0, component.length - 1));
                if (index >= HardenedBit) {
                    throw new Error('invalid path index - ' + component);
                }
                result = result._derive(HardenedBit + index);
            }
            else if (component.match(/^[0-9]+$/)) {
                var index = parseInt(component);
                if (index >= HardenedBit) {
                    throw new Error('invalid path index - ' + component);
                }
                result = result._derive(index);
            }
            else {
                throw new Error('invlaid path component - ' + component);
            }
        }
        return result;
    };
    HDNode.isHDNode = function (value) {
        return properties_1.isType(value, 'HDNode');
    };
    return HDNode;
}());
exports.HDNode = HDNode;
function _fromSeed(seed, mnemonic) {
    var seedArray = bytes_1.arrayify(seed);
    if (seedArray.length < 16 || seedArray.length > 64) {
        throw new Error('invalid seed');
    }
    var I = bytes_1.arrayify(hmac_1.computeHmac(hmac_1.SupportedAlgorithms.sha512, MasterSecret, seedArray));
    return new HDNode(_constructorGuard, I.slice(0, 32), I.slice(32), 0, 0, mnemonic, 'm');
}
function fromMnemonic(mnemonic, wordlist) {
    // Check that the checksum s valid (will throw an error)
    mnemonicToEntropy(mnemonic, wordlist);
    return _fromSeed(mnemonicToSeed(mnemonic), mnemonic);
}
exports.fromMnemonic = fromMnemonic;
function fromSeed(seed) {
    return _fromSeed(seed, null);
}
exports.fromSeed = fromSeed;
function mnemonicToSeed(mnemonic, password) {
    if (!password) {
        password = '';
    }
    var salt = utf8_1.toUtf8Bytes('mnemonic' + password, utf8_1.UnicodeNormalizationForm.NFKD);
    return bytes_1.hexlify(pbkdf2_1.pbkdf2(utf8_1.toUtf8Bytes(mnemonic, utf8_1.UnicodeNormalizationForm.NFKD), salt, 2048, 64, 'sha512'));
}
exports.mnemonicToSeed = mnemonicToSeed;
function mnemonicToEntropy(mnemonic, wordlist) {
    if (!wordlist) {
        wordlist = lang_en_1.langEn;
    }
    var words = wordlist.split(mnemonic);
    if ((words.length % 3) !== 0) {
        throw new Error('invalid mnemonic');
    }
    var entropy = bytes_1.arrayify(new Uint8Array(Math.ceil(11 * words.length / 8)));
    var offset = 0;
    for (var i = 0; i < words.length; i++) {
        var index = wordlist.getWordIndex(words[i].normalize('NFKD'));
        if (index === -1) {
            throw new Error('invalid mnemonic');
        }
        for (var bit = 0; bit < 11; bit++) {
            if (index & (1 << (10 - bit))) {
                entropy[offset >> 3] |= (1 << (7 - (offset % 8)));
            }
            offset++;
        }
    }
    var entropyBits = 32 * words.length / 3;
    var checksumBits = words.length / 3;
    var checksumMask = getUpperMask(checksumBits);
    var checksum = bytes_1.arrayify(sha2_1.sha256(entropy.slice(0, entropyBits / 8)))[0];
    checksum &= checksumMask;
    if (checksum !== (entropy[entropy.length - 1] & checksumMask)) {
        throw new Error('invalid checksum');
    }
    return bytes_1.hexlify(entropy.slice(0, entropyBits / 8));
}
exports.mnemonicToEntropy = mnemonicToEntropy;
function entropyToMnemonic(entropy, wordlist) {
    entropy = bytes_1.arrayify(entropy);
    if ((entropy.length % 4) !== 0 || entropy.length < 16 || entropy.length > 32) {
        throw new Error('invalid entropy');
    }
    var indices = [0];
    var remainingBits = 11;
    for (var i = 0; i < entropy.length; i++) {
        // Consume the whole byte (with still more to go)
        if (remainingBits > 8) {
            indices[indices.length - 1] <<= 8;
            indices[indices.length - 1] |= entropy[i];
            remainingBits -= 8;
            // This byte will complete an 11-bit index
        }
        else {
            indices[indices.length - 1] <<= remainingBits;
            indices[indices.length - 1] |= entropy[i] >> (8 - remainingBits);
            // Start the next word
            indices.push(entropy[i] & getLowerMask(8 - remainingBits));
            remainingBits += 3;
        }
    }
    // Compute the checksum bits
    var checksum = bytes_1.arrayify(sha2_1.sha256(entropy))[0];
    var checksumBits = entropy.length / 4;
    checksum &= getUpperMask(checksumBits);
    // Shift the checksum into the word indices
    indices[indices.length - 1] <<= checksumBits;
    indices[indices.length - 1] |= (checksum >> (8 - checksumBits));
    if (!wordlist) {
        wordlist = lang_en_1.langEn;
    }
    return wordlist.join(indices.map(function (index) { return wordlist.getWord(index); }));
}
exports.entropyToMnemonic = entropyToMnemonic;
function isValidMnemonic(mnemonic, wordlist) {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
        return true;
    }
    catch (error) { }
    return false;
}
exports.isValidMnemonic = isValidMnemonic;
