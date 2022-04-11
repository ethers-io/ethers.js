import { arrayify, hexlify } from "@ethersproject/bytes";
import { pbkdf2, sha256 } from "@ethersproject/crypto";
import { defineProperties } from "@ethersproject/properties";
import { toUtf8Bytes, UnicodeNormalizationForm } from "@ethersproject/strings";
import { langEn } from "@ethersproject/wordlists";

import { logger } from "./logger.js";

import type { BytesLike } from "@ethersproject/logger";
import type { Wordlist } from "@ethersproject/wordlists";


// Returns a byte with the MSB bits set
function getUpperMask(bits: number): number {
   return ((1 << bits) - 1) << (8 - bits) & 0xff;
}

// Returns a byte with the LSB bits set
function getLowerMask(bits: number): number {
   return ((1 << bits) - 1) & 0xff;
}


function mnemonicToEntropy(mnemonic: string, wordlist: null | Wordlist = langEn): string {
    logger.assertNormalize("NFKD");

    if (wordlist == null) { wordlist = langEn; }

    const words = wordlist.split(mnemonic);
    if ((words.length % 3) !== 0 || words.length < 12 || words.length > 24) {
        logger.throwArgumentError("invalid mnemonic length", "mnemonic", "[ REDACTED ]");
    }

    const entropy = arrayify(new Uint8Array(Math.ceil(11 * words.length / 8)));

    let offset = 0;
    for (let i = 0; i < words.length; i++) {
        let index = wordlist.getWordIndex(words[i].normalize("NFKD"));
        if (index === -1) {
            logger.throwArgumentError(`invalid mnemonic word at index ${ i }`, "mnemonic", "[ REDACTED ]");
        }

        for (let bit = 0; bit < 11; bit++) {
            if (index & (1 << (10 - bit))) {
                entropy[offset >> 3] |= (1 << (7 - (offset % 8)));
            }
            offset++;
        }
    }

    const entropyBits = 32 * words.length / 3;


    const checksumBits = words.length / 3;
    const checksumMask = getUpperMask(checksumBits);

    const checksum = arrayify(sha256(entropy.slice(0, entropyBits / 8)))[0] & checksumMask;

    if (checksum !== (entropy[entropy.length - 1] & checksumMask)) {
        logger.throwArgumentError("invalid mnemonic checksum", "mnemonic", "[ REDACTED ]");
    }

    return hexlify(entropy.slice(0, entropyBits / 8));
}

function entropyToMnemonic(entropy: Uint8Array, wordlist: null | Wordlist = langEn): string {
    if ((entropy.length % 4) || entropy.length < 16 || entropy.length > 32) {
        logger.throwArgumentError("invalid entropy size", "entropy", "[ REDACTED ]");
    }

    if (wordlist == null) { wordlist = langEn; }

    const indices: Array<number> = [ 0 ];

    let remainingBits = 11;
    for (let i = 0; i < entropy.length; i++) {

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
    const checksumBits = entropy.length / 4;
    const checksum = parseInt(sha256(entropy).substring(2, 4), 16) & getUpperMask(checksumBits);

    // Shift the checksum into the word indices
    indices[indices.length - 1] <<= checksumBits;
    indices[indices.length - 1] |= (checksum >> (8 - checksumBits));

    return wordlist.join(indices.map((index) => (<Wordlist>wordlist).getWord(index)));
}

const _guard = { };

export class Mnemonic {
    readonly phrase!: string;
    readonly password!: string;
    readonly wordlist!: Wordlist;

    readonly entropy!: string;

    constructor(guard: any, entropy: string, phrase: string, password?: null | string, wordlist?: null | Wordlist) {
        if (password == null) { password = ""; }
        if (wordlist == null) { wordlist = langEn; }
        logger.assertPrivate(guard, _guard, "Mnemonic");
        defineProperties<Mnemonic>(this, { phrase, password, wordlist, entropy });
    }

    computeSeed(): string {
        const salt = toUtf8Bytes("mnemonic" + this.password, UnicodeNormalizationForm.NFKD);
        return pbkdf2(toUtf8Bytes(this.phrase, UnicodeNormalizationForm.NFKD), salt, 2048, 64, "sha512");
    }

    static fromPhrase(phrase: string, password?: null | string, wordlist?: null | Wordlist) {
        // Normalize the case and space; throws if invalid
        const entropy = mnemonicToEntropy(phrase, wordlist);
        phrase = entropyToMnemonic(logger.getBytes(entropy), wordlist);
        return new Mnemonic(_guard, entropy, phrase, password, wordlist);
    }

    static fromEntropy(_entropy: BytesLike, password?: null | string, wordlist?: null | Wordlist): Mnemonic {
        const entropy = logger.getBytes(_entropy, "entropy");
        const phrase = entropyToMnemonic(entropy, wordlist);
        return new Mnemonic(_guard, hexlify(entropy), phrase, password, wordlist);
    }

    static entropyToPhrase(_entropy: BytesLike, wordlist?: null | Wordlist): string {
        const entropy = logger.getBytes(_entropy, "entropy");
        return entropyToMnemonic(entropy, wordlist);
    }

    static phraseToEntropy(phrase: string, wordlist?: null | Wordlist): string {
        return mnemonicToEntropy(phrase, wordlist);
    }

    static isValidMnemonic(phrase: string, wordlist?: null | Wordlist): boolean {
        try {
            mnemonicToEntropy(phrase, wordlist);
            return true;
        } catch (error) { }
        return false;
    }
}
