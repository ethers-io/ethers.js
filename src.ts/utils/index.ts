'use strict';

// This is SUPER useful, but adds 140kb (even zipped, adds 40kb)
//var unorm = require('unorm');

import { getAddress, getContractAddress, getIcapAddress } from './address';
import { AbiCoder, defaultAbiCoder, formatSignature, formatParamType, parseSignature, parseParamType } from './abi-coder';
import * as base64 from './base64';
import { BigNumber, bigNumberify, ConstantNegativeOne, ConstantZero, ConstantOne, ConstantTwo, ConstantWeiPerEther } from './bignumber';
import { AddressZero, arrayify, concat, HashZero, hexDataSlice, hexDataLength, hexlify, hexStripZeros, hexZeroPad, joinSignature, padZeros, splitSignature, stripZeros } from './bytes';
import { hashMessage, id, namehash } from './hash';
import { keccak256 } from './keccak256';
import { sha256 } from './sha2';
import { keccak256 as solidityKeccak256, pack as solidityPack, sha256 as soliditySha256 } from './solidity';
import { randomBytes } from './random-bytes';
import { defineFrozen, defineReadOnly, resolveProperties, shallowCopy } from './properties';
import * as RLP from './rlp';
import { parse as parseTransaction, serialize as serializeTransaction } from './transaction';
import { toUtf8Bytes, toUtf8String } from './utf8';
import { formatEther, parseEther, formatUnits, parseUnits } from './units';
import { fetchJson } from './web';

import * as errors from './errors';

// NFKD (decomposed)
//const etherSymbol = '\uD835\uDF63';

// NFKC (composed)
const etherSymbol = '\u039e';

const constants = {
    AddressZero: AddressZero,
    HashZero: HashZero,
    NegativeOne: ConstantNegativeOne,
    Zero: ConstantZero,
    One: ConstantOne,
    Two: ConstantTwo,
    WeiPerEther: ConstantWeiPerEther
};

export {
    AbiCoder,
    defaultAbiCoder,
    formatSignature,
    formatParamType,
    parseSignature,
    parseParamType,

    constants,

    RLP,

    fetchJson,

    defineReadOnly,
    defineFrozen,
    resolveProperties,
    shallowCopy,

    etherSymbol,

    arrayify,

    concat,
    padZeros,
    stripZeros,

    base64,

    bigNumberify,
    BigNumber,

    hexlify,
    hexStripZeros,
    hexZeroPad,
    hexDataLength,
    hexDataSlice,

    toUtf8Bytes,
    toUtf8String,

    hashMessage,
    namehash,
    id,

    getAddress,
    getIcapAddress,
    getContractAddress,

    formatEther,
    parseEther,

    formatUnits,
    parseUnits,

    keccak256,
    sha256,

    randomBytes,

    solidityPack,
    solidityKeccak256,
    soliditySha256,

    splitSignature,
    joinSignature,

    parseTransaction,
    serializeTransaction,

    errors
}

