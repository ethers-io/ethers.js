'use strict';

// See: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// See: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

import * as secp256k1 from './secp256k1';

import words from './words';
var wordlist: Array<string> = words.replace(/([A-Z])/g, ' $1').toLowerCase().substring(1).split(' ');

import { arrayify, hexlify } from '../utils/convert';
import { bigNumberify } from '../utils/bignumber';
import { toUtf8Bytes, UnicodeNormalizationForm } from '../utils/utf8';
import { pbkdf2 } from '../utils/pbkdf2';
import { createSha512Hmac } from '../utils/hmac';
import { sha256 } from '../utils/sha2';

import * as errors from '../utils/errors';

// "Bitcoin seed"
var MasterSecret = toUtf8Bytes('Bitcoin seed');

var HardenedBit = 0x80000000;

// Returns a byte with the MSB bits set
function getUpperMask(bits: number): number {
   return ((1 << bits) - 1) << (8 - bits);
}

// Returns a byte with the LSB bits set
function getLowerMask(bits: number): number {
   return (1 << bits) - 1;
}

export class HDNode {
    private readonly keyPair: secp256k1.KeyPair;

    readonly privateKey: string;
    readonly publicKey: string;

    readonly mnemonic: string;
    readonly path: string;

    readonly chainCode: string;

    readonly index: number;
    readonly depth: number;

    // @TODO: Private constructor?
    constructor(keyPair: secp256k1.KeyPair, chainCode: Uint8Array, index: number, depth: number, mnemonic: string, path: string) {
        errors.checkNew(this, HDNode);

        this.keyPair = keyPair;

        this.privateKey = hexlify(keyPair.priv.toArray('be', 32));
        this.publicKey = '0x' + keyPair.getPublic(true, 'hex');

        this.chainCode = hexlify(chainCode);

        this.index = index;
        this.depth = depth;

        this.mnemonic = mnemonic;
        this.path = path;
    }

    private _derive(index: number): HDNode {

        // Public parent key -> public child key
        if (!this.privateKey) {
            if (index >= HardenedBit) { throw new Error('cannot derive child of neutered node'); }
            throw new Error('not implemented');
        }

        var data = new Uint8Array(37);

        // Base path
        var mnemonic = this.mnemonic;
        var path = this.path;
        if (path) { path += '/' + index; }

        if (index & HardenedBit) {
            // Data = 0x00 || ser_256(k_par)
            data.set(arrayify(this.privateKey), 1);

            // Hardened path
            if (path) { path += "'"; }

        } else {
            // Data = ser_p(point(k_par))
            data.set(this.keyPair.getPublic().encode(null, true));
        }

        // Data += ser_32(i)
        for (var i = 24; i >= 0; i -= 8) { data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff); }

        var I = arrayify(createSha512Hmac(this.chainCode).update(data).digest());
        var IL = bigNumberify(I.slice(0, 32));
        var IR = I.slice(32);

        var ki = IL.add('0x' + this.keyPair.getPrivate('hex')).mod('0x' + secp256k1.curve.n.toString(16));

        return new HDNode(secp256k1.curve.keyFromPrivate(arrayify(ki)), IR, index, this.depth + 1, mnemonic, path);
    }

    derivePath(path: string): HDNode {
        var components = path.split('/');

        if (components.length === 0 || (components[0] === 'm' && this.depth !== 0)) {
            throw new Error('invalid path');
        }

        if (components[0] === 'm') { components.shift(); }

        var result: HDNode = this;
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
    }
}

function _fromSeed(seed: any, mnemonic: string): HDNode {
    seed = arrayify(seed);
    if (seed.length < 16 || seed.length > 64) { throw new Error('invalid seed'); }

    var I = arrayify(createSha512Hmac(MasterSecret).update(seed).digest());

    return new HDNode(secp256k1.curve.keyFromPrivate(I.slice(0, 32)), I.slice(32), 0, 0, mnemonic, 'm');
}

export function fromMnemonic(mnemonic: string): HDNode {
    // Check that the checksum s valid (will throw an error)
    mnemonicToEntropy(mnemonic);

    return _fromSeed(mnemonicToSeed(mnemonic), mnemonic);
}

export function fromSeed(seed: any): HDNode {
    return _fromSeed(seed, null);
}

export function mnemonicToSeed(mnemonic: string, password?: string): string {

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

    var salt = toUtf8Bytes('mnemonic' + password, UnicodeNormalizationForm.NFKD);

    return hexlify(pbkdf2(toUtf8Bytes(mnemonic, UnicodeNormalizationForm.NFKD), salt, 2048, 64, createSha512Hmac));
}

export function mnemonicToEntropy(mnemonic: string): string {
    var words = mnemonic.toLowerCase().split(' ');
    if ((words.length % 3) !== 0) { throw new Error('invalid mnemonic'); }

    var entropy = arrayify(new Uint8Array(Math.ceil(11 * words.length / 8)));

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

    var checksum = arrayify(sha256(entropy.slice(0, entropyBits / 8)))[0];
    checksum &= checksumMask;

    if (checksum !== (entropy[entropy.length - 1] & checksumMask)) {
        throw new Error('invalid checksum');
    }

    return hexlify(entropy.slice(0, entropyBits / 8));
}

export function entropyToMnemonic(entropy: any): string {
    entropy = arrayify(entropy);

    if ((entropy.length % 4) !== 0 || entropy.length < 16 || entropy.length > 32) {
        throw new Error('invalid entropy');
    }

    var words: Array<number> = [ 0 ];

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
    var checksum = arrayify(sha256(entropy))[0];
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

export function isValidMnemonic(mnemonic: string): boolean {
    try {
        mnemonicToEntropy(mnemonic);
        return true;
    } catch (error) { }
    return false;
}

// Exporting
/*
const exporting = {
    HDNode: HDNode,
    fromMnemonic: fromMnemonic,
    fromSeed: fromSeed,
    mnemonicToSeed: mnemonicToSeed,
    mnemonicToEntropy: mnemonicToEntropy,
    entropyToMnemonic: entropyToMnemonic,
    isValidMnemonic: isValidMnemonic
}
*/
// Default TypeScript
//export default exporting;

// Node exports
//declare var module: any;
//(module).exports = exporting;
