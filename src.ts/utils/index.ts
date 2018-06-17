'use strict';

// This is SUPER useful, but adds 140kb (even zipped, adds 40kb)
//var unorm = require('unorm');

import { getAddress, getContractAddress, getIcapAddress } from './address';
import { AbiCoder, defaultAbiCoder, parseSignature } from './abi-coder';
import * as base64 from './base64';
import * as bigNumber from './bignumber';
import * as bytes from './bytes';
import { id } from './id';
import { keccak256 } from './keccak256';
import { namehash } from './namehash';
import * as sha2 from './sha2';
import * as solidity from './solidity';
import { randomBytes } from './random-bytes';
//import properties = require('./properties');
import * as RLP from './rlp';
import * as utf8 from './utf8';
import * as units from './units';
import { fetchJson } from './web';
import { parse as parseTransaction } from './transaction';

export default {
    AbiCoder: AbiCoder,
    defaultAbiCoder: defaultAbiCoder,
    parseSignature: parseSignature,

    RLP: RLP,

    fetchJson: fetchJson,

    //defineProperty: properties.defineProperty,

    // NFKD (decomposed)
    //etherSymbol: '\uD835\uDF63',

    // NFKC (composed)
    etherSymbol: '\u039e',

    arrayify: bytes.arrayify,

    concat: bytes.concat,
    padZeros: bytes.padZeros,
    stripZeros: bytes.stripZeros,

    base64: base64,

    bigNumberify: bigNumber.bigNumberify,
    BigNumber: bigNumber.BigNumber,

    hexlify: bytes.hexlify,

    toUtf8Bytes: utf8.toUtf8Bytes,
    toUtf8String: utf8.toUtf8String,

    namehash: namehash,
    id: id,

    getAddress: getAddress,
    getIcapAddress: getIcapAddress,
    getContractAddress: getContractAddress,

    formatEther: units.formatEther,
    parseEther: units.parseEther,

    formatUnits: units.formatUnits,
    parseUnits: units.parseUnits,

    keccak256: keccak256,
    sha256: sha2.sha256,

    randomBytes: randomBytes,

    solidityPack: solidity.pack,
    solidityKeccak256: solidity.keccak256,
    soliditySha256: solidity.sha256,

    splitSignature: bytes.splitSignature,

    parseTransaction: parseTransaction
}
