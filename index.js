'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var contracts_1 = require("./contracts");
exports.Contract = contracts_1.Contract;
exports.Interface = contracts_1.Interface;
var providers = __importStar(require("./providers"));
exports.providers = providers;
var errors = __importStar(require("./utils/errors"));
exports.errors = errors;
var networks_1 = require("./providers/networks");
exports.getNetwork = networks_1.getNetwork;
var utils = __importStar(require("./utils"));
exports.utils = utils;
var wallet_1 = require("./wallet");
exports.HDNode = wallet_1.HDNode;
exports.SigningKey = wallet_1.SigningKey;
exports.Wallet = wallet_1.Wallet;
var wordlists = __importStar(require("./wordlists"));
exports.wordlists = wordlists;
// @TODO:
//import info from '../package.json';
console.log("@TODO: Get version");
var version = "4.0.0";
exports.version = version;
exports.default = {
    Wallet: wallet_1.Wallet,
    HDNode: wallet_1.HDNode,
    SigningKey: wallet_1.SigningKey,
    Contract: contracts_1.Contract,
    Interface: contracts_1.Interface,
    getNetwork: networks_1.getNetwork,
    providers: providers,
    errors: errors,
    utils: utils,
    wordlists: wordlists,
    version: version
};
