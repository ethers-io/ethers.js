"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var contracts_1 = require("@ethersproject/contracts");
exports.Contract = contracts_1.Contract;
exports.ContractFactory = contracts_1.ContractFactory;
var bignumber_1 = require("@ethersproject/bignumber");
exports.BigNumber = bignumber_1.BigNumber;
exports.FixedNumber = bignumber_1.FixedNumber;
var abstract_signer_1 = require("@ethersproject/abstract-signer");
exports.Signer = abstract_signer_1.Signer;
exports.VoidSigner = abstract_signer_1.VoidSigner;
var wallet_1 = require("@ethersproject/wallet");
exports.Wallet = wallet_1.Wallet;
var constants = __importStar(require("@ethersproject/constants"));
exports.constants = constants;
var errors = __importStar(require("@ethersproject/errors"));
exports.errors = errors;
var providers = __importStar(require("@ethersproject/providers"));
exports.providers = providers;
var wordlists = __importStar(require("@ethersproject/wordlists"));
exports.wordlists = wordlists;
var utils = __importStar(require("./utils"));
exports.utils = utils;
var _version_1 = require("./_version");
exports.version = _version_1.version;
var wordlist_1 = require("@ethersproject/wordlists/wordlist");
exports.Wordlist = wordlist_1.Wordlist;
////////////////////////
// Compile-Time Constants
// This is empty in node, and used by browserify to inject extra goodies
var platform_1 = require("./platform");
exports.platform = platform_1.platform;
////////////////////////
// Helper Functions
function getDefaultProvider(network, options) {
    if (network == null) {
        network = "homestead";
    }
    var n = providers.getNetwork(network);
    if (!n || !n._defaultProvider) {
        errors.throwError("unsupported getDefaultProvider network", errors.NETWORK_ERROR, {
            operation: "getDefaultProvider",
            network: network
        });
    }
    return n._defaultProvider(providers, options);
}
exports.getDefaultProvider = getDefaultProvider;
