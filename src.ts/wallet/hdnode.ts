'use strict';

// See: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// See: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

// The English language word list.
// For additional word lists, please see /src.tc/wordlists/
import { langEn } from '../wordlists/lang-en';

// Automatically register English?
//import { register } from '../wordlists/wordlist';
//register(langEn);

import { arrayify, hexlify } from '../utils/bytes';
import { bigNumberify } from '../utils/bignumber';
import { toUtf8Bytes, UnicodeNormalizationForm } from '../utils/utf8';
import { pbkdf2 } from '../utils/pbkdf2';
import { computeHmac } from '../utils/hmac';
import { defineReadOnly, isType, setType } from '../utils/properties';
import { KeyPair } from '../utils/secp256k1';
import { sha256 } from '../utils/sha2';

const N = bigNumberify("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");

// Imported Types
import { Arrayish } from '../utils/bytes';
import { Wordlist } from '../wordlists/wordlist';

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

const _constructorGuard: any = {};

export const defaultPath = "m/44'/60'/0'/0/0";

export class HDNode {
    private readonly keyPair: KeyPair;

    readonly privateKey: string;
    readonly publicKey: string;

    readonly mnemonic: string;
    readonly path: string;

    readonly chainCode: string;

    readonly index: number;
    readonly depth: number;

    /**
     *  This constructor should not be called directly.
     *
     *  Please use:
     *   - fromMnemonic
     *   - fromSeed
     */
    constructor(constructorGuard: any, privateKey: Arrayish, chainCode: Uint8Array, index: number, depth: number, mnemonic: string, path: string) {
        errors.checkNew(this, HDNode);

        if (constructorGuard !== _constructorGuard) {
            throw new Error('HDNode constructor cannot be called directly');
        }

        defineReadOnly(this, 'keyPair', new KeyPair(privateKey));

        defineReadOnly(this, 'privateKey', this.keyPair.privateKey);
        defineReadOnly(this, 'publicKey', this.keyPair.compressedPublicKey);

        defineReadOnly(this, 'chainCode', hexlify(chainCode));

        defineReadOnly(this, 'index', index);
        defineReadOnly(this, 'depth', depth);

        defineReadOnly(this, 'mnemonic', mnemonic);
        defineReadOnly(this, 'path', path);

        setType(this, 'HDNode');
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
            data.set(this.keyPair.publicKeyBytes);
        }

        // Data += ser_32(i)
        for (var i = 24; i >= 0; i -= 8) { data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff); }

        var I = computeHmac('sha512', this.chainCode, data);
        var IL = bigNumberify(I.slice(0, 32));
        var IR = I.slice(32);

        var ki = IL.add(this.keyPair.privateKey).mod(N);

        return new HDNode(_constructorGuard, arrayify(ki), IR, index, this.depth + 1, mnemonic, path);
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

    static isHDNode(value: any): value is HDNode {
        return isType(value, 'HDNode');
    }
}



function _fromSeed(seed: Arrayish, mnemonic: string): HDNode {
    let seedArray: Uint8Array = arrayify(seed);
    if (seedArray.length < 16 || seedArray.length > 64) { throw new Error('invalid seed'); }

    var I: Uint8Array = arrayify(computeHmac('sha512', MasterSecret, seedArray));

    return new HDNode(_constructorGuard, I.slice(0, 32), I.slice(32), 0, 0, mnemonic, 'm');
}

export function fromMnemonic(mnemonic: string, wordlist?: Wordlist): HDNode {
    // Check that the checksum s valid (will throw an error)
    mnemonicToEntropy(mnemonic, wordlist);

    return _fromSeed(mnemonicToSeed(mnemonic), mnemonic);
}

export function fromSeed(seed: Arrayish): HDNode {
    return _fromSeed(seed, null);
}

export function mnemonicToSeed(mnemonic: string, password?: string): string {
    if (!password) { password = ''; }

    var salt = toUtf8Bytes('mnemonic' + password, UnicodeNormalizationForm.NFKD);

    return hexlify(pbkdf2(toUtf8Bytes(mnemonic, UnicodeNormalizationForm.NFKD), salt, 2048, 64, 'sha512'));
}

export function mnemonicToEntropy(mnemonic: string, wordlist?: Wordlist): string {
    if (!wordlist) { wordlist = langEn; }

    var words = wordlist.split(mnemonic);
    if ((words.length % 3) !== 0) { throw new Error('invalid mnemonic'); }

    var entropy = arrayify(new Uint8Array(Math.ceil(11 * words.length / 8)));

    var offset = 0;
    for (var i = 0; i < words.length; i++) {
        var index = wordlist.getWordIndex(words[i].normalize('NFKD'));
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

export function entropyToMnemonic(entropy: Arrayish, wordlist?: Wordlist): string {
    entropy = arrayify(entropy);

    if ((entropy.length % 4) !== 0 || entropy.length < 16 || entropy.length > 32) {
        throw new Error('invalid entropy');
    }

    var indices: Array<number> = [ 0 ];

    var remainingBits = 11;
    for (var i = 0; i < entropy.length; i++) {

        // Consume the whole byte (with still more to go)
        if (remainingBits > 8) {
            indices[indices.length - 1] <<= 8;
            indices[indices.length - 1] |= entropy[i];

            remainingBits -= 8;

        // This byte will complete an 11-bit index
        } else {
            indices[indices.length - 1] <<= remainingBits;
            indices[indices.length - 1] |= entropy[i] >> (8 - remainingBits);

            // Start the next word
            indices.push(entropy[i] & getLowerMask(8 - remainingBits));

            remainingBits += 3;
        }
    }

    // Compute the checksum bits
    var checksum = arrayify(sha256(entropy))[0];
    var checksumBits = entropy.length / 4;
    checksum &= getUpperMask(checksumBits);

    // Shift the checksum into the word indices
    indices[indices.length - 1] <<= checksumBits;
    indices[indices.length - 1] |= (checksum >> (8 - checksumBits));

    if (!wordlist) { wordlist = langEn; }

    return wordlist.join(indices.map((index) => wordlist.getWord(index)));
}

export function isValidMnemonic(mnemonic: string, wordlist?: Wordlist): boolean {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
        return true;
    } catch (error) { }
    return false;
}

