#!/usr/bin/env node
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var cli_1 = require("../cli");
var _version_1 = require("../_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
var ensAbi = [
    "function setOwner(bytes32 node, address owner) external @500000",
    "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external @500000",
    "function setResolver(bytes32 node, address resolver) external @500000",
    "function owner(bytes32 node) external view returns (address)",
    "function resolver(bytes32 node) external view returns (address)"
];
var ethLegacyRegistrarAbi = [
    "function state(bytes32 _hash) public view returns (uint8)",
];
/*
const ethRegistrarAbi = [
    "function available(uint256 id) public view returns(bool)",
];
*/
var ethControllerAbi = [
    /*
    "function nameExpires(uint256 id) external view returns(uint)",
    "function register(uint256 id, address owner, uint duration) external returns(uint)",
    "renew(uint256 id, uint duration) external returns(uint)",
    "reclaim(uint256 id, address owner) external",
    "acceptRegistrarTransfer(bytes32 label, Deed deed, uint) external",
    */
    "function rentPrice(string memory name, uint duration) view public returns(uint)",
    "function available(string memory label) public view returns(bool)",
    "function makeCommitment(string memory name, address owner, bytes32 secret) pure public returns(bytes32)",
    "function commit(bytes32 commitment) public",
    "function register(string calldata name, address owner, uint duration, bytes32 secret) payable @500000",
    "function renew(string calldata name, uint duration) payable @500000",
];
var resolverAbi = [
    "function interfaceImplementer(bytes32 nodehash, bytes4 interfaceId) view returns (address)",
    "function addr(bytes32 nodehash) view returns (address)",
    "function setAddr(bytes32 nodehash, address addr) @500000",
    "function text(bytes32 nodehash, string key) view returns (string)",
    "function setText(bytes32 nodehash, string key, string value) @500000",
];
//const InterfaceID_ERC721 = "0x6ccb2df4";
var InterfaceID_Controller = "0x018fac06";
var InterfaceID_Legacy = "0x7ba18ba1";
/*

const reverseRegistrarAbi = [
];
*/
function listify(words) {
    if (words.length === 1) {
        return words[0];
    }
    return words.slice(0, words.length - 1).join(", ") + " and " + words[words.length - 1];
}
var cli = new cli_1.CLI();
var LookupPlugin = /** @class */ (function (_super) {
    __extends(LookupPlugin, _super);
    function LookupPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LookupPlugin.getHelp = function () {
        return {
            name: "lookup [ NAME | ADDRESS [ ... ] ]",
            help: "Lookup a name or address"
        };
    };
    LookupPlugin.prototype.prepareArgs = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareArgs.call(this, args)];
                    case 1:
                        _a.sent();
                        this.names = args;
                        return [2 /*return*/];
                }
            });
        });
    };
    LookupPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ens, ethNodehash, ethResolverPromise, ethControllerPromise, ethLegacyRegistrarPromise, _loop_1, this_1, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        ens = new ethers_1.ethers.Contract(this.network.ensAddress, ensAbi, this.provider);
                        ethNodehash = ethers_1.ethers.utils.namehash("eth");
                        ethResolverPromise = ens.resolver(ethNodehash).then(function (address) {
                            return new ethers_1.ethers.Contract(address, resolverAbi, _this.provider);
                        });
                        ethControllerPromise = ethResolverPromise.then(function (ethResolver) {
                            return ethResolver.interfaceImplementer(ethNodehash, InterfaceID_Controller).then(function (address) {
                                return new ethers_1.ethers.Contract(address, ethControllerAbi, _this.provider);
                            });
                        });
                        ethLegacyRegistrarPromise = ethResolverPromise.then(function (ethResolver) {
                            return ethResolver.interfaceImplementer(ethNodehash, InterfaceID_Legacy).then(function (address) {
                                return new ethers_1.ethers.Contract(address, ethLegacyRegistrarAbi, _this.provider);
                            });
                        });
                        _loop_1 = function (i) {
                            var name_1, nodehash, details, comps, labelhash_1, available, resolver;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        name_1 = this_1.names[i];
                                        nodehash = ethers_1.ethers.utils.namehash(name_1);
                                        details = {
                                            Owner: ens.owner(nodehash),
                                            Resolver: ens.resolver(nodehash)
                                        };
                                        comps = name_1.split(".");
                                        if (comps.length === 2 && comps[1] === "eth") {
                                            labelhash_1 = ethers_1.ethers.utils.id(comps[0].toLowerCase());
                                            available = ethControllerPromise.then(function (ethController) {
                                                return ethController.available(comps[0]);
                                            });
                                            details.Available = available;
                                            details.Registrar = Promise.all([
                                                available,
                                                ethLegacyRegistrarPromise.then(function (legacyRegistrar) {
                                                    return legacyRegistrar.state(labelhash_1);
                                                })
                                            ]).then(function (results) {
                                                var States = ["Open", "Auction", "Owned", "Forbidden", "Reveal", "NotAvailable"];
                                                var available = results[0];
                                                var state = States[results[1]];
                                                console.log(available, state);
                                                return "FOO";
                                            });
                                        }
                                        return [4 /*yield*/, ethers_1.ethers.utils.resolveProperties(details)];
                                    case 1:
                                        details = _a.sent();
                                        if (!(details.Resolver !== ethers_1.ethers.constants.AddressZero)) return [3 /*break*/, 3];
                                        resolver = new ethers_1.ethers.Contract(details.Resolver, resolverAbi, this_1.provider);
                                        details.address = resolver.addr(nodehash);
                                        details.email = resolver.text(nodehash, "email");
                                        details.website = resolver.text(nodehash, "website");
                                        return [4 /*yield*/, ethers_1.ethers.utils.resolveProperties(details)];
                                    case 2:
                                        details = _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        this_1.dump("Name: " + this_1.names[i], details);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < this.names.length)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(i)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return LookupPlugin;
}(cli_1.Plugin));
cli.addPlugin("lookup", LookupPlugin);
var AccountPlugin = /** @class */ (function (_super) {
    __extends(AccountPlugin, _super);
    function AccountPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AccountPlugin.getHelp = function () {
        return logger.throwError("subclasses must implemetn this", ethers_1.ethers.errors.UNSUPPORTED_OPERATION, {
            operation: "getHelp"
        });
    };
    AccountPlugin.getOptionHelp = function () {
        return [
            {
                name: "[ --wait ]",
                help: "Wait for the transaction to be mined"
            }
        ];
    };
    AccountPlugin.prototype.getResolver = function (nodehash) {
        return __awaiter(this, void 0, void 0, function () {
            var resolverAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!nodehash) {
                            nodehash = this.nodehash;
                        }
                        return [4 /*yield*/, this.ens.resolver(nodehash)];
                    case 1:
                        resolverAddress = _a.sent();
                        return [2 /*return*/, new ethers_1.ethers.Contract(resolverAddress, resolverAbi, this.accounts[0])];
                }
            });
        });
    };
    AccountPlugin.prototype.getEthController = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ethNodehash, resolver, ethControllerAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ethNodehash = ethers_1.ethers.utils.namehash("eth");
                        return [4 /*yield*/, this.getResolver(ethNodehash)];
                    case 1:
                        resolver = _a.sent();
                        return [4 /*yield*/, resolver.interfaceImplementer(ethNodehash, InterfaceID_Controller)];
                    case 2:
                        ethControllerAddress = _a.sent();
                        return [2 /*return*/, new ethers_1.ethers.Contract(ethControllerAddress, ethControllerAbi, this.accounts[0])];
                }
            });
        });
    };
    AccountPlugin.prototype.wait = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var receipt, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._wait) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        receipt = _a.sent();
                        this.dump("Success:", {
                            BlockNumber: receipt.blockNumber,
                            BlockHash: receipt.blockHash,
                            GasUsed: ethers_1.ethers.utils.commify(receipt.gasUsed.toString()),
                            Fee: ethers_1.ethers.utils.formatEther(receipt.gasUsed.mul(tx.gasPrice))
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.dump("Failed:", {
                            Error: error_1.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AccountPlugin.prototype._setValue = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ethers_1.ethers.utils.defineReadOnly(this, key, value);
                        if (!(key === "name")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._setValue("nodehash", ethers_1.ethers.utils.namehash(value))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    AccountPlugin.prototype.prepareOptions = function (argParser) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareOptions.call(this, argParser)];
                    case 1:
                        _a.sent();
                        ethers_1.ethers.utils.defineReadOnly(this, "_wait", argParser.consumeFlag("wait"));
                        ethers_1.ethers.utils.defineReadOnly(this, "ens", new ethers_1.ethers.Contract(this.network.ensAddress, ensAbi, this.accounts[0]));
                        return [2 /*return*/];
                }
            });
        });
    };
    AccountPlugin.prototype.prepareArgs = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var helpLine, params, command, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareArgs.call(this, args)];
                    case 1:
                        _a.sent();
                        helpLine = ethers_1.ethers.utils.getStatic(this.constructor, "getHelp")().name;
                        params = helpLine.split(" ");
                        command = params[0];
                        params = params.slice(1);
                        if (this.accounts.length !== 1) {
                            this.throwError(command + " requires an account");
                        }
                        if (args.length !== params.length) {
                            this.throwError(command + " requires exactly " + listify(params));
                        }
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < params.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._setValue(params[i].toLowerCase(), args[i])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AccountPlugin;
}(cli_1.Plugin));
var ControllerPlugin = /** @class */ (function (_super) {
    __extends(ControllerPlugin, _super);
    function ControllerPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ControllerPlugin.getOptionHelp = function () {
        var result = _super.getOptionHelp.call(this);
        [
            {
                name: "[ --duration DAYS ]",
                help: "The duration to register for (default: 365 days)"
            },
            {
                name: "[ --salt SALT ]",
                help: "Use SALT to blind the commit"
            },
            {
                name: "[ --secret SECRET ]",
                help: "Use id(SECRET) as the salt"
            },
            {
                name: "[ --owner OWNER ]",
                help: "Set the OWNER (default: current account)"
            }
        ].forEach(function (help) {
            result.push(help);
        });
        return result;
    };
    ControllerPlugin.prototype._setValue = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var comps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(key === "name")) return [3 /*break*/, 2];
                        comps = value.split(".");
                        if (comps.length !== 2 || comps[1] !== "eth") {
                            this.throwError("Invalid NAME");
                        }
                        return [4 /*yield*/, _super.prototype._setValue.call(this, "label", comps[0])];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, _super.prototype._setValue.call(this, key, value)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ControllerPlugin.prototype.prepareOptions = function (argParser) {
        return __awaiter(this, void 0, void 0, function () {
            var secret, _a, _b, duration;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareOptions.call(this, argParser)];
                    case 1:
                        _c.sent();
                        this.salt = argParser.consumeOption("salt");
                        secret = argParser.consumeOption("secret");
                        if (secret) {
                            if (this.salt) {
                                this.throwError("Cannot specify --salt with --secret");
                            }
                            this.salt = ethers_1.ethers.utils.id(secret);
                        }
                        this.owner = argParser.consumeOption("owner");
                        if (!this.owner) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.getAddress(this.owner)];
                    case 2:
                        _a.owner = _c.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        _b = this;
                        return [4 /*yield*/, this.accounts[0].getAddress()];
                    case 4:
                        _b.owner = _c.sent();
                        _c.label = 5;
                    case 5:
                        duration = parseInt(argParser.consumeOption("duration") || "365");
                        if (duration < 28) {
                            this.throwError("registration must be for a minimum length of 28 days");
                        }
                        ethers_1.ethers.utils.defineReadOnly(this, "duration", duration * (60 * 60 * 24));
                        return [2 /*return*/];
                }
            });
        });
    };
    ControllerPlugin.prototype.prepareArgs = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareArgs.call(this, args)];
                    case 1:
                        _a.sent();
                        if (!!this.salt) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.accounts[0].signMessage("commit-" + this.owner + "-" + this.name)];
                    case 2:
                        signature = _a.sent();
                        this.salt = ethers_1.ethers.utils.keccak256(signature);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ControllerPlugin;
}(AccountPlugin));
var CommitPlugin = /** @class */ (function (_super) {
    __extends(CommitPlugin, _super);
    function CommitPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CommitPlugin.getHelp = function () {
        return {
            name: "commit NAME",
            help: "Commit to NAME"
        };
    };
    CommitPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ethController, commitment, fee, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getEthController()];
                    case 2:
                        ethController = _a.sent();
                        return [4 /*yield*/, ethController.makeCommitment(this.label, this.owner, this.salt)];
                    case 3:
                        commitment = _a.sent();
                        return [4 /*yield*/, ethController.rentPrice(this.label, this.duration)];
                    case 4:
                        fee = _a.sent();
                        this.dump("Commit: " + this.name, {
                            Nodehash: this.nodehash,
                            Owner: this.owner,
                            Salt: this.salt,
                            Duration: (this.duration + " seconds (informational)"),
                            Fee: ethers_1.ethers.utils.formatEther(fee) + " (informational)",
                            Commitment: commitment
                        });
                        return [4 /*yield*/, ethController.commit(commitment)];
                    case 5:
                        tx = _a.sent();
                        this.wait(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    return CommitPlugin;
}(ControllerPlugin));
cli.addPlugin("commit", CommitPlugin);
var RevealPlugin = /** @class */ (function (_super) {
    __extends(RevealPlugin, _super);
    function RevealPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RevealPlugin.getHelp = function () {
        return {
            name: "reveal LABEL",
            help: "Reveal a previously committed name"
        };
    };
    RevealPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ethController, fee, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getEthController()];
                    case 2:
                        ethController = _a.sent();
                        return [4 /*yield*/, ethController.rentPrice(this.label, this.duration)];
                    case 3:
                        fee = _a.sent();
                        this.dump("Reveal: " + this.name, {
                            Nodehash: this.nodehash,
                            Owner: this.owner,
                            Salt: this.salt,
                            Duration: (this.duration + " seconds"),
                            Fee: ethers_1.ethers.utils.formatEther(fee),
                        });
                        return [4 /*yield*/, ethController.register(this.label, this.owner, this.duration, this.salt, {
                                value: fee.mul(11).div(10)
                            })];
                    case 4:
                        tx = _a.sent();
                        this.wait(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    return RevealPlugin;
}(ControllerPlugin));
cli.addPlugin("reveal", RevealPlugin);
/*
class CommitRevealPlugin extends RevealPlugin {
    waitBlocks: number;

    static getHelp(): Help {
        return {
           name: "commit-reveal LABEL",
           help: "Commit, wait and reveal a name"
        }
    }

    static getOptionHelp(): Array<Help> {
        let help = CommitPlugin.getOptionHelp().slice();

        help.push({
            name: "[ --wait BLOCKS ]",
            help: "Wait BLOCKS confirms (Default: 5)"
        })

        return help;
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        let waitBlocks = argParser.consumeOption("wait");
        try {
            this.waitBlocks = parseInt(waitBlocks || "5");
        } catch(error) {
            this.throwError("Invalid --wait BLOCKS")
        }
    }

    async run(): Promise<void> {
        await super.run();
        console.log(this);
    }
}
cli.addPlugin("commit-reveal", CommitRevealPlugin);
*/
var AddressAccountPlugin = /** @class */ (function (_super) {
    __extends(AddressAccountPlugin, _super);
    function AddressAccountPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddressAccountPlugin.getOptionHelp = function () {
        var options = _super.getOptionHelp.call(this);
        options.push({
            name: "[ --address ADDRESS ]",
            help: "Override the address"
        });
        return options;
    };
    AddressAccountPlugin.prototype.getDefaultAddress = function () {
        return this.accounts[0].getAddress();
    };
    AddressAccountPlugin.prototype.prepareOptions = function (argParser) {
        return __awaiter(this, void 0, void 0, function () {
            var address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareOptions.call(this, argParser)];
                    case 1:
                        _a.sent();
                        address = argParser.consumeOption("address");
                        if (!!address) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getDefaultAddress()];
                    case 2:
                        address = _a.sent();
                        _a.label = 3;
                    case 3:
                        this.address = address;
                        return [2 /*return*/];
                }
            });
        });
    };
    return AddressAccountPlugin;
}(AccountPlugin));
var SetOwnerPlugin = /** @class */ (function (_super) {
    __extends(SetOwnerPlugin, _super);
    function SetOwnerPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetOwnerPlugin.getHelp = function () {
        return {
            name: "set-owner NAME",
            help: "Set the owner of NAME (default: current account)"
        };
    };
    SetOwnerPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        tx = this.ens.setOwner(this.nodehash, this.address);
                        this.wait(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    return SetOwnerPlugin;
}(AddressAccountPlugin));
cli.addPlugin("set-owner", SetOwnerPlugin);
var SetSubnodePlugin = /** @class */ (function (_super) {
    __extends(SetSubnodePlugin, _super);
    function SetSubnodePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetSubnodePlugin.getHelp = function () {
        return {
            name: "set-subnode NAME",
            help: "Set the subnode owner"
        };
    };
    SetSubnodePlugin.prototype._setValue = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var comps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(key === "name")) return [3 /*break*/, 3];
                        comps = value.toLowerCase().split(".");
                        return [4 /*yield*/, _super.prototype._setValue.call(this, "label", comps[0])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype._setValue.call(this, "node", comps.slice(1).join("."))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [4 /*yield*/, _super.prototype._setValue.call(this, key, value)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SetSubnodePlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        this.dump("Set Subnode: " + this.name, {
                            Label: this.label,
                            Node: this.node
                        });
                        return [4 /*yield*/, this.ens.setSubnodeOwner(ethers_1.ethers.utils.namehash(this.node), ethers_1.ethers.utils.id(this.label), this.address)];
                    case 2:
                        tx = _a.sent();
                        this.wait(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    return SetSubnodePlugin;
}(AddressAccountPlugin));
cli.addPlugin("set-subnode", SetSubnodePlugin);
var SetResolverPlugin = /** @class */ (function (_super) {
    __extends(SetResolverPlugin, _super);
    function SetResolverPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetResolverPlugin.getHelp = function () {
        return {
            name: "set-resolver NAME",
            help: "Set the resolver for NAME (default: resolver.eth)"
        };
    };
    SetResolverPlugin.prototype.getDefaultAddress = function () {
        return this.getAddress("resolver.eth");
    };
    SetResolverPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        this.dump("Set Resolver:" + this.name, {
                            Nodehash: this.nodehash,
                            Resolver: this.address
                        });
                        return [4 /*yield*/, this.ens.setResolver(this.nodehash, this.address)];
                    case 2:
                        tx = _a.sent();
                        this.wait(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    return SetResolverPlugin;
}(AddressAccountPlugin));
cli.addPlugin("set-resolver", SetResolverPlugin);
var SetAddrPlugin = /** @class */ (function (_super) {
    __extends(SetAddrPlugin, _super);
    function SetAddrPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetAddrPlugin.getHelp = function () {
        return {
            name: "set-addr NAME",
            help: "Set the addr record (default: current account)"
        };
    };
    SetAddrPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        this.dump("Set Addr:" + this.name, {
                            Nodehash: this.nodehash,
                            Address: this.address
                        });
                        return [4 /*yield*/, this.getResolver()];
                    case 2:
                        resolver = _a.sent();
                        return [4 /*yield*/, resolver.setAddr(this.nodehash, this.address)];
                    case 3:
                        tx = _a.sent();
                        this.wait(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    return SetAddrPlugin;
}(AddressAccountPlugin));
cli.addPlugin("set-addr", SetAddrPlugin);
var TextAccountPlugin = /** @class */ (function (_super) {
    __extends(TextAccountPlugin, _super);
    function TextAccountPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextAccountPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var key, value, resolver, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        key = this.getKey();
                        value = this.getValue();
                        this.dump("Set " + this.getHeader() + ": " + this.name, {
                            Nodehash: this.nodehash,
                            Key: key,
                            Value: value
                        });
                        return [4 /*yield*/, this.getResolver()];
                    case 2:
                        resolver = _a.sent();
                        return [4 /*yield*/, resolver.setText(this.nodehash, key, value)];
                    case 3:
                        tx = _a.sent();
                        this.wait(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    return TextAccountPlugin;
}(AccountPlugin));
var SetTextPlugin = /** @class */ (function (_super) {
    __extends(SetTextPlugin, _super);
    function SetTextPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetTextPlugin.getHelp = function () {
        return {
            name: "set-text NAME KEY VALUE",
            help: "Set the KEY text record to VALUE"
        };
    };
    SetTextPlugin.prototype.getHeader = function () { return "Test"; };
    SetTextPlugin.prototype.getKey = function () { return this.key; };
    SetTextPlugin.prototype.getValue = function () { return this.value; };
    return SetTextPlugin;
}(TextAccountPlugin));
cli.addPlugin("set-text", SetTextPlugin);
var SetEmailPlugin = /** @class */ (function (_super) {
    __extends(SetEmailPlugin, _super);
    function SetEmailPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetEmailPlugin.getHelp = function () {
        return {
            name: "set-email NAME EMAIL",
            help: "Set the email text record to EMAIL"
        };
    };
    SetEmailPlugin.prototype.getHeader = function () { return "E-mail"; };
    SetEmailPlugin.prototype.getKey = function () { return "email"; };
    SetEmailPlugin.prototype.getValue = function () { return this.email; };
    return SetEmailPlugin;
}(TextAccountPlugin));
cli.addPlugin("set-email", SetEmailPlugin);
var SetWebsitePlugin = /** @class */ (function (_super) {
    __extends(SetWebsitePlugin, _super);
    function SetWebsitePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetWebsitePlugin.getHelp = function () {
        return {
            name: "set-website NAME URL",
            help: "Set the website text record to URL"
        };
    };
    SetWebsitePlugin.prototype.getHeader = function () { return "Website"; };
    SetWebsitePlugin.prototype.getKey = function () { return "website"; };
    SetWebsitePlugin.prototype.getValue = function () { return this.url; };
    return SetWebsitePlugin;
}(TextAccountPlugin));
cli.addPlugin("set-website", SetWebsitePlugin);
var SetContentHashPlugin = /** @class */ (function (_super) {
    __extends(SetContentHashPlugin, _super);
    function SetContentHashPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetContentHashPlugin.getHelp = function () {
        return {
            name: "set-content NAME HASH",
            help: "Set the content hash record to HASH"
        };
    };
    SetContentHashPlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.run.call(this)];
                    case 1:
                        _a.sent();
                        throw new Error("not implemented");
                }
            });
        });
    };
    return SetContentHashPlugin;
}(AccountPlugin));
cli.addPlugin("set-content", SetContentHashPlugin);
/**
 *  migrate-registrar NAME
 *  transfer NAME OWNER
 *  register NAME --registrar
*   set-subnode LABEL.NAME
 *
 *  set-owner NAME OWNER
 *  set-resolver NAME RESOLVER
 *  set-addr NAME ADDRESS
 *  set-reverse-name ADDRESS NAME
 *  set-email NAME EMAIL
 *  set-webstie NAME WEBSITE
 *  set-text NAME KEY VALUE
 *  set-content NAME HASH
 * Duration??
 */
cli.run(process.argv.slice(2));
