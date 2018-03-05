// See: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// See: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

var secp256k1 = new (require('elliptic')).ec('secp256k1');

var wordlist = (function() {
    var words = require('./words.json');
    return words.replace(/([A-Z])/g, ' $1').toLowerCase().substring(1).split(' ');
})();

var utils = (function() {
    var convert = require('../utils/convert.js');

    var sha2 = require('../utils/sha2');

    var hmac = require('../utils/hmac');

    return {
        defineProperty: require('../utils/properties.js').defineProperty,

        arrayify: convert.arrayify,
        bigNumberify: require('../utils/bignumber.js').bigNumberify,
        hexlify: convert.hexlify,

        toUtf8Bytes: require('../utils/utf8.js').toUtf8Bytes,

        sha256: sha2.sha256,
        createSha512Hmac: hmac.createSha512Hmac,

        pbkdf2: require('../utils/pbkdf2.js'),
    }
})();

// "Bitcoin seed"
var MasterSecret = utils.toUtf8Bytes('Bitcoin seed');

var HardenedBit = 0x80000000;

// Returns a byte with the MSB bits set
function getUpperMask(bits) {
   return ((1 << bits) - 1) << (8 - bits);
}

// Returns a byte with the LSB bits set
function getLowerMask(bits) {
   return (1 << bits) - 1;
}

function HDNode(keyPair, chainCode, index, depth) {
    if (!(this instanceof HDNode)) { throw new Error('missing new'); }

    utils.defineProperty(this, '_keyPair', keyPair);

    utils.defineProperty(this, 'privateKey', utils.hexlify(keyPair.priv.toArray('be', 32)));
    utils.defineProperty(this, 'publicKey', '0x' + keyPair.getPublic(true, 'hex'));

    utils.defineProperty(this, 'chainCode', utils.hexlify(chainCode));

    utils.defineProperty(this, 'index', index);
    utils.defineProperty(this, 'depth', depth);
}

utils.defineProperty(HDNode.prototype, '_derive', function(index) {

    // Public parent key -> public child key
    if (!this.privateKey) {
        if (index >= HardenedBit) { throw new Error('cannot derive child of neutered node'); }
        throw new Error('not implemented');
    }

    var data = new Uint8Array(37);

    if (index & HardenedBit) {
        // Data = 0x00 || ser_256(k_par)
        data.set(utils.arrayify(this.privateKey), 1);

    } else {
        // Data = ser_p(point(k_par))
        data.set(this._keyPair.getPublic().encode(null, true));
    }

    // Data += ser_32(i)
    for (var i = 24; i >= 0; i -= 8) { data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff); }

    var I = utils.arrayify(utils.createSha512Hmac(this.chainCode).update(data).digest());
    var IL = utils.bigNumberify(I.slice(0, 32));
    var IR = I.slice(32);

    var ki = IL.add('0x' + this._keyPair.getPrivate('hex')).mod('0x' + secp256k1.curve.n.toString(16));

    return new HDNode(secp256k1.keyFromPrivate(utils.arrayify(ki)), I.slice(32), index, this.depth + 1);
});

utils.defineProperty(HDNode.prototype, 'derivePath', function(path) {
    var components = path.split('/');

    if (components.length === 0 || (components[0] === 'm' && this.depth !== 0)) {
        throw new Error('invalid path');
    }

    if (components[0] === 'm') { components.shift(); }

    var result = this;
    for (var i = 0; i < components.length; i++) {
        var component = components[i];
        if (component.match(/^[0-9]+'$/)) {
            var index = parseInt(component.substring(0, component.length - 1));
            if (index >= HardenedBit) { throw new Error('invalid path index - ' + component); }
            result = result._derive(HardenedBit + index);
        } else if (component.match(/^[0-9]+$/)) {
            var index = parseInt(component);
            if (index >= HardenedBit) { throw new Error('invalid path index - ' + component); }
            result = result._derive(index);
        } else {
            throw new Error('invlaid path component - ' + component);
        }
    }

    return result;
});

utils.defineProperty(HDNode, 'fromMnemonic', function(mnemonic) {
    // Check that the checksum s valid (will throw an error)
    mnemonicToEntropy(mnemonic);

    return HDNode.fromSeed(mnemonicToSeed(mnemonic));
});

utils.defineProperty(HDNode, 'fromSeed', function(seed) {
    seed = utils.arrayify(seed);
    if (seed.length < 16 || seed.length > 64) { throw new Error('invalid seed'); }

    var I = utils.arrayify(utils.createSha512Hmac(MasterSecret).update(seed).digest());

    return new HDNode(secp256k1.keyFromPrivate(I.slice(0, 32)), I.slice(32), 0, 0, 0);
});

function mnemonicToSeed(mnemonic, password) {

    if (!password) {
        password = '';

    } else if (password.normalize) {
        password = password.normalize('NFKD');

    } else {
        for (var i = 0; i < password.length; i++) {
            var c = password.charCodeAt(i);
            if (c < 32 || c > 127) { throw new Error('passwords with non-ASCII characters not supported in this environment'); }
        }
    }

    mnemonic = utils.toUtf8Bytes(mnemonic, 'NFKD');
    var salt = utils.toUtf8Bytes('mnemonic' + password, 'NFKD');

    return utils.hexlify(utils.pbkdf2(mnemonic, salt, 2048, 64, utils.createSha512Hmac));
}

function mnemonicToEntropy(mnemonic) {
   var words = mnemonic.toLowerCase().split(' ');
   if ((words.length % 3) !== 0) { throw new Error('invalid mnemonic'); }

   var entropy = utils.arrayify(new Uint8Array(Math.ceil(11 * words.length / 8)));

   var offset = 0;
   for (var i = 0; i < words.length; i++) {
       var index = wordlist.indexOf(words[i]);
       if (index === -1) { throw new Error('invalid mnemonic'); }

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

   var checksum = utils.arrayify(utils.sha256(entropy.slice(0, entropyBits / 8)))[0];
   checksum &= checksumMask;

   if (checksum !== (entropy[entropy.length - 1] & checksumMask)) {
       throw new Error('invalid checksum');
   }

   return utils.hexlify(entropy.slice(0, entropyBits / 8));
}

function entropyToMnemonic(entropy) {
    entropy = utils.arrayify(entropy);

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
        } else {
            words[words.length - 1] <<= remainingBits;
            words[words.length - 1] |= entropy[i] >> (8 - remainingBits);

            // Start the next word
            words.push(entropy[i] & getLowerMask(8 - remainingBits));

            remainingBits += 3;
        }
    }

    // Compute the checksum bits
    var checksum = utils.arrayify(utils.sha256(entropy))[0];
    var checksumBits = entropy.length / 4;
    checksum &= getUpperMask(checksumBits);

    // Shift the checksum into the word indices
    words[words.length - 1] <<= checksumBits;
    words[words.length - 1] |= (checksum >> (8 - checksumBits));

    // Convert indices into words
    for (var i = 0; i < words.length; i++) {
        words[i] = wordlist[words[i]];
    }

    return words.join(' ');
}

function isValidMnemonic(mnemonic) {
    try {
        mnemonicToEntropy(mnemonic);
        return true;
    } catch (error) { }

    return false;
}

module.exports = {
    fromMnemonic: HDNode.fromMnemonic,
    fromSeed: HDNode.fromSeed,

    mnemonicToEntropy: mnemonicToEntropy,
    entropyToMnemonic: entropyToMnemonic,
    mnemonicToSeed: mnemonicToSeed,

    isValidMnemonic: isValidMnemonic,
};
