"use strict";

import { AbiCoder, defaultAbiCoder, EventFragment, Fragment, FunctionFragment, Indexed, Interface, ParamType } from "@ethersproject/abi";
import { getAddress, getContractAddress, getIcapAddress, isAddress } from "@ethersproject/address";
import * as base64 from "@ethersproject/base64";
import { arrayify, concat, hexDataSlice, hexDataLength, hexlify, hexStripZeros, hexValue, hexZeroPad, isHexString, joinSignature, zeroPad, splitSignature, stripZeros } from "@ethersproject/bytes";
import { hashMessage, id, namehash } from "@ethersproject/hash";
import { entropyToMnemonic, HDNode, isValidMnemonic, mnemonicToEntropy, mnemonicToSeed } from "@ethersproject/hdnode";
import { getJsonWalletAddress } from "@ethersproject/json-wallets";
import { keccak256 } from "@ethersproject/keccak256";
import { sha256 } from "@ethersproject/sha2";
import { keccak256 as solidityKeccak256, pack as solidityPack, sha256 as soliditySha256 } from "@ethersproject/solidity";
import { randomBytes } from "@ethersproject/random";
import { checkProperties, deepCopy, defineReadOnly, resolveProperties, shallowCopy } from "@ethersproject/properties";
import * as RLP from "@ethersproject/rlp";
import { computePublicKey, recoverPublicKey, SigningKey } from "@ethersproject/signing-key";
import { formatBytes32String, parseBytes32String, toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
import { computeAddress, parse as parseTransaction, recoverAddress, serialize as serializeTransaction } from "@ethersproject/transactions";
import { commify, formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";
import { verifyMessage } from "@ethersproject/wallet";
import { fetchJson, poll } from "@ethersproject/web";

////////////////////////
// Enums

import { SupportedAlgorithms } from "@ethersproject/sha2";
import { UnicodeNormalizationForm } from "@ethersproject/strings";


////////////////////////
// Types and Interfaces

import { CoerceFunc } from "@ethersproject/abi";
import { Bytes, BytesLike, Hexable } from "@ethersproject/bytes"
import { ConnectionInfo, OnceBlockable, PollOptions } from "@ethersproject/web";
import { EncryptOptions, ProgressCallback } from "@ethersproject/json-wallets";

////////////////////////
// Exports

export {
    AbiCoder,
    defaultAbiCoder,

    Fragment,
    EventFragment,
    FunctionFragment,
    ParamType,

    RLP,

    fetchJson,
    poll,

    checkProperties,
    deepCopy,
    defineReadOnly,
    resolveProperties,
    shallowCopy,

    arrayify,

    concat,
    stripZeros,
    zeroPad,

    HDNode,
    SigningKey,

    Interface,

    base64,

    hexlify,
    isHexString,
    hexStripZeros,
    hexValue,
    hexZeroPad,
    hexDataLength,
    hexDataSlice,

    toUtf8Bytes,
    toUtf8String,

    formatBytes32String,
    parseBytes32String,

    hashMessage,
    namehash,
    id,

    getAddress,
    getIcapAddress,
    getContractAddress,
    isAddress,

    formatEther,
    parseEther,

    formatUnits,
    parseUnits,

    commify,

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

    getJsonWalletAddress,

    computeAddress,
    recoverAddress,

    computePublicKey,
    recoverPublicKey,

    verifyMessage,

    mnemonicToEntropy,
    entropyToMnemonic,
    isValidMnemonic,
    mnemonicToSeed,


    ////////////////////////
    // Enums

    SupportedAlgorithms,
    UnicodeNormalizationForm,


    ////////////////////////
    // Types

    Bytes,
    BytesLike,
    Hexable,

    CoerceFunc,

    Indexed,

    ConnectionInfo,
    OnceBlockable,
    PollOptions,

    EncryptOptions,
    ProgressCallback
}

