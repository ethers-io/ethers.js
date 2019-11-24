"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// To modify this file, you must update ./admin/cmds/update-exports.js
var ethers = __importStar(require("./ethers"));
exports.ethers = ethers;
try {
    var anyGlobal = window;
    if (anyGlobal._ethers == null) {
        anyGlobal._ethers = ethers;
    }
}
catch (error) { }
var ethers_1 = require("./ethers");
exports.Signer = ethers_1.Signer;
exports.Wallet = ethers_1.Wallet;
exports.VoidSigner = ethers_1.VoidSigner;
exports.getDefaultProvider = ethers_1.getDefaultProvider;
exports.providers = ethers_1.providers;
exports.Contract = ethers_1.Contract;
exports.ContractFactory = ethers_1.ContractFactory;
exports.BigNumber = ethers_1.BigNumber;
exports.FixedNumber = ethers_1.FixedNumber;
exports.constants = ethers_1.constants;
exports.errors = ethers_1.errors;
exports.logger = ethers_1.logger;
exports.utils = ethers_1.utils;
exports.wordlists = ethers_1.wordlists;
////////////////////////
// Compile-Time Constants
exports.version = ethers_1.version;
exports.Wordlist = ethers_1.Wordlist;
