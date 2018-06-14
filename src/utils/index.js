'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// This is SUPER useful, but adds 140kb (even zipped, adds 40kb)
//var unorm = require('unorm');
var address_1 = require("./address");
var abi_coder_1 = require("./abi-coder");
var base64 = __importStar(require("./base64"));
var bigNumber = __importStar(require("./bignumber"));
var convert = __importStar(require("./convert"));
var id_1 = require("./id");
var keccak256_1 = require("./keccak256");
var namehash_1 = require("./namehash");
var sha2 = __importStar(require("./sha2"));
var solidity = __importStar(require("./solidity"));
var random_bytes_1 = require("./random-bytes");
//import properties = require('./properties');
var RLP = __importStar(require("./rlp"));
var utf8 = __importStar(require("./utf8"));
var units = __importStar(require("./units"));
var web_1 = require("./web");
exports.default = {
    AbiCoder: abi_coder_1.AbiCoder,
    defaultAbiCoder: abi_coder_1.defaultAbiCoder,
    parseSignature: abi_coder_1.parseSignature,
    RLP: RLP,
    fetchJson: web_1.fetchJson,
    //defineProperty: properties.defineProperty,
    // NFKD (decomposed)
    //etherSymbol: '\uD835\uDF63',
    // NFKC (composed)
    etherSymbol: '\u039e',
    arrayify: convert.arrayify,
    concat: convert.concat,
    padZeros: convert.padZeros,
    stripZeros: convert.stripZeros,
    base64: base64,
    bigNumberify: bigNumber.bigNumberify,
    BigNumber: bigNumber.BigNumber,
    hexlify: convert.hexlify,
    toUtf8Bytes: utf8.toUtf8Bytes,
    toUtf8String: utf8.toUtf8String,
    namehash: namehash_1.namehash,
    id: id_1.id,
    getAddress: address_1.getAddress,
    getContractAddress: address_1.getContractAddress,
    formatEther: units.formatEther,
    parseEther: units.parseEther,
    formatUnits: units.formatUnits,
    parseUnits: units.parseUnits,
    keccak256: keccak256_1.keccak256,
    sha256: sha2.sha256,
    randomBytes: random_bytes_1.randomBytes,
    solidityPack: solidity.pack,
    solidityKeccak256: solidity.keccak256,
    soliditySha256: solidity.sha256,
    splitSignature: convert.splitSignature,
};
