'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// See: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// See: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
var secp256k1 = __importStar(require("./secp256k1"));
var words_1 = __importDefault(require("./words"));
var wordlist = words_1.default.replace(/([A-Z])/g, ' $1').toLowerCase().substring(1).split(' ');
var convert_1 = require("../utils/convert");
var bignumber_1 = require("../utils/bignumber");
var utf8_1 = require("../utils/utf8");
var pbkdf2_1 = require("../utils/pbkdf2");
var hmac_1 = require("../utils/hmac");
var sha2_1 = require("../utils/sha2");
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
var HDNode = /** @class */ (function () {
    // @TODO: Private constructor?
    function HDNode(keyPair, chainCode, index, depth, mnemonic, path) {
        //if (!(this instanceof HDNode)) { throw new Error('missing new'); }
        this.keyPair = keyPair;
        this.privateKey = convert_1.hexlify(keyPair.priv.toArray('be', 32));
        this.publicKey = '0x' + keyPair.getPublic(true, 'hex');
        this.chainCode = convert_1.hexlify(chainCode);
        this.index = index;
        this.depth = depth;
        this.mnemonic = mnemonic;
        this.path = path;
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
            data.set(convert_1.arrayify(this.privateKey), 1);
            // Hardened path
            if (path) {
                path += "'";
            }
        }
        else {
            // Data = ser_p(point(k_par))
            data.set(this.keyPair.getPublic().encode(null, true));
        }
        // Data += ser_32(i)
        for (var i = 24; i >= 0; i -= 8) {
            data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff);
        }
        var I = convert_1.arrayify(hmac_1.createSha512Hmac(this.chainCode).update(data).digest());
        var IL = bignumber_1.bigNumberify(I.slice(0, 32));
        var IR = I.slice(32);
        var ki = IL.add('0x' + this.keyPair.getPrivate('hex')).mod('0x' + secp256k1.curve.n.toString(16));
        return new HDNode(secp256k1.curve.keyFromPrivate(convert_1.arrayify(ki)), IR, index, this.depth + 1, mnemonic, path);
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
    return HDNode;
}());
exports.HDNode = HDNode;
function _fromSeed(seed, mnemonic) {
    seed = convert_1.arrayify(seed);
    if (seed.length < 16 || seed.length > 64) {
        throw new Error('invalid seed');
    }
    var I = convert_1.arrayify(hmac_1.createSha512Hmac(MasterSecret).update(seed).digest());
    return new HDNode(secp256k1.curve.keyFromPrivate(I.slice(0, 32)), I.slice(32), 0, 0, mnemonic, 'm');
}
function fromMnemonic(mnemonic) {
    // Check that the checksum s valid (will throw an error)
    mnemonicToEntropy(mnemonic);
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
    else if (password.normalize) {
        password = password.normalize('NFKD');
    }
    else {
        for (var i = 0; i < password.length; i++) {
            var c = password.charCodeAt(i);
            if (c < 32 || c > 127) {
                throw new Error('passwords with non-ASCII characters not supported in this environment');
            }
        }
    }
    var salt = utf8_1.toUtf8Bytes('mnemonic' + password, utf8_1.UnicodeNormalizationForm.NFKD);
    return convert_1.hexlify(pbkdf2_1.pbkdf2(utf8_1.toUtf8Bytes(mnemonic, utf8_1.UnicodeNormalizationForm.NFKD), salt, 2048, 64, hmac_1.createSha512Hmac));
}
exports.mnemonicToSeed = mnemonicToSeed;
function mnemonicToEntropy(mnemonic) {
    var words = mnemonic.toLowerCase().split(' ');
    if ((words.length % 3) !== 0) {
        throw new Error('invalid mnemonic');
    }
    var entropy = convert_1.arrayify(new Uint8Array(Math.ceil(11 * words.length / 8)));
    var offset = 0;
    for (var i = 0; i < words.length; i++) {
        var index = wordlist.indexOf(words[i]);
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
    var checksum = convert_1.arrayify(sha2_1.sha256(entropy.slice(0, entropyBits / 8)))[0];
    checksum &= checksumMask;
    if (checksum !== (entropy[entropy.length - 1] & checksumMask)) {
        throw new Error('invalid checksum');
    }
    return convert_1.hexlify(entropy.slice(0, entropyBits / 8));
}
exports.mnemonicToEntropy = mnemonicToEntropy;
function entropyToMnemonic(entropy) {
    entropy = convert_1.arrayify(entropy);
    if ((entropy.length % 4) !== 0 || entropy.length < 16 || entropy.length > 32) {
        throw new Error('invalid entropy');
    }
    var words = [0];
    var remainingBits = 11;
    for (var i = 0; i < entropy.length; i++) {
        // Consume the whole byte (with still more to go)
        if (remainingBits > 8) {
            words[words.length - 1] <<= 8;
            words[words.length - 1] |= entropy[i];
            remainingBits -= 8;
            // This byte will complete an 11-bit index
        }
        else {
            words[words.length - 1] <<= remainingBits;
            words[words.length - 1] |= entropy[i] >> (8 - remainingBits);
            // Start the next word
            words.push(entropy[i] & getLowerMask(8 - remainingBits));
            remainingBits += 3;
        }
    }
    // Compute the checksum bits
    var checksum = convert_1.arrayify(sha2_1.sha256(entropy))[0];
    var checksumBits = entropy.length / 4;
    checksum &= getUpperMask(checksumBits);
    // Shift the checksum into the word indices
    words[words.length - 1] <<= checksumBits;
    words[words.length - 1] |= (checksum >> (8 - checksumBits));
    // Convert indices into words
    var result = [];
    for (var i = 0; i < words.length; i++) {
        result.push(wordlist[words[i]]);
    }
    return result.join(' ');
}
exports.entropyToMnemonic = entropyToMnemonic;
function isValidMnemonic(mnemonic) {
    try {
        mnemonicToEntropy(mnemonic);
        return true;
    }
    catch (error) { }
    return false;
}
exports.isValidMnemonic = isValidMnemonic;
