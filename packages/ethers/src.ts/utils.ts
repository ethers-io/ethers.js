"use strict";

import { AbiCoder, defaultAbiCoder, EventFragment, FormatTypes, Fragment, FunctionFragment, Indexed, Interface, ParamType } from "@ethersproject/abi";
import { getAddress, getCreate2Address, getContractAddress, getIcapAddress, isAddress } from "@ethersproject/address";
import * as base64 from "@ethersproject/base64";
import { arrayify, concat, hexDataSlice, hexDataLength, hexlify, hexStripZeros, hexValue, hexZeroPad, isHexString, joinSignature, zeroPad, splitSignature, stripZeros } from "@ethersproject/bytes";
import { hashMessage, id, isValidName, namehash } from "@ethersproject/hash";
import { defaultPath, entropyToMnemonic, HDNode, isValidMnemonic, mnemonicToEntropy, mnemonicToSeed } from "@ethersproject/hdnode";
import { getJsonWalletAddress } from "@ethersproject/json-wallets";
import { keccak256 } from "@ethersproject/keccak256";
import { Logger } from "@ethersproject/logger";
import { sha256 } from "@ethersproject/sha2";
import { keccak256 as solidityKeccak256, pack as solidityPack, sha256 as soliditySha256 } from "@ethersproject/solidity";
import { randomBytes } from "@ethersproject/random";
import { checkProperties, deepCopy, defineReadOnly, getStatic, resolveProperties, shallowCopy } from "@ethersproject/properties";
import * as RLP from "@ethersproject/rlp";
import { computePublicKey, recoverPublicKey, SigningKey } from "@ethersproject/signing-key";
import { formatBytes32String, nameprep, parseBytes32String, _toEscapedUtf8String, toUtf8Bytes, toUtf8CodePoints, toUtf8String, Utf8ErrorFuncs } from "@ethersproject/strings";
import { computeAddress, parse as parseTransaction, recoverAddress, serialize as serializeTransaction } from "@ethersproject/transactions";
import { commify, formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";
import { verifyMessage } from "@ethersproject/wallet";
import { fetchJson, poll } from "@ethersproject/web";

////////////////////////
// Enums

import { SupportedAlgorithm } from "@ethersproject/sha2";
import { UnicodeNormalizationForm, Utf8ErrorReason } from "@ethersproject/strings";


////////////////////////
// Types and Interfaces

import { CoerceFunc } from "@ethersproject/abi";
import { Bytes, BytesLike, Hexable } from "@ethersproject/bytes"
import { Mnemonic } from "@ethersproject/hdnode";
import { EncryptOptions, ProgressCallback } from "@ethersproject/json-wallets";
import { Utf8ErrorFunc } from "@ethersproject/strings";
import { ConnectionInfo, FetchJsonResponse, OnceBlockable, PollOptions } from "@ethersproject/web";

////////////////////////
// Exports

export {
    AbiCoder,
    defaultAbiCoder,

    Fragment,
    EventFragment,
    FunctionFragment,
    ParamType,
    FormatTypes,

    Logger,

    RLP,

    fetchJson,
    poll,

    checkProperties,
    deepCopy,
    defineReadOnly,
    getStatic,
    resolveProperties,
    shallowCopy,

    arrayify,

    concat,
    stripZeros,
    zeroPad,

    defaultPath,
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

    nameprep,
    _toEscapedUtf8String,
    toUtf8Bytes,
    toUtf8CodePoints,
    toUtf8String,
    Utf8ErrorFuncs,

    formatBytes32String,
    parseBytes32String,

    hashMessage,
    namehash,
    isValidName,
    id,

    getAddress,
    getIcapAddress,
    getContractAddress,
    getCreate2Address,
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

    SupportedAlgorithm,

    UnicodeNormalizationForm,
    Utf8ErrorReason,

    ////////////////////////
    // Types

    Bytes,
    BytesLike,
    Hexable,

    CoerceFunc,

    Indexed,

    Mnemonic,

    Utf8ErrorFunc,

    ConnectionInfo,
    OnceBlockable,
    PollOptions,
    FetchJsonResponse,

    EncryptOptions,
    ProgressCallback
}

