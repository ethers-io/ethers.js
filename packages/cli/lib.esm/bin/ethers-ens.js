#!/usr/bin/env node
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ethers } from "ethers";
import { Base58 } from "@ethersproject/basex";
import { CLI, Plugin } from '../cli';
import { version } from "../_version";
const logger = new ethers.utils.Logger(version);
const ensAbi = [
    "function setOwner(bytes32 node, address owner) external @500000",
    "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external @500000",
    "function setResolver(bytes32 node, address resolver) external @500000",
    "function owner(bytes32 node) external view returns (address)",
    "function resolver(bytes32 node) external view returns (address)"
];
const States = Object.freeze(["Open", "Auction", "Owned", "Forbidden", "Reveal", "NotAvailable"]);
const deedAbi = [
    "function owner() view returns (address)"
];
const ethLegacyRegistrarAbi = [
    "function entries(bytes32 _hash) view returns (uint8 state, address owner, uint registrationDate, uint value, uint highestBid)",
    "function transferRegistrars(bytes32 _hash) @500000",
];
const ethControllerAbi = [
    "function rentPrice(string memory name, uint duration) view public returns(uint)",
    "function available(string memory label) public view returns(bool)",
    "function makeCommitment(string memory name, address owner, bytes32 secret) pure public returns(bytes32)",
    "function commit(bytes32 commitment) public @500000",
    "function register(string calldata name, address owner, uint duration, bytes32 secret) payable @500000",
    "function renew(string calldata name, uint duration) payable @500000",
];
const ethRegistrarAbi = [
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function reclaim(uint256 id, address owner) @500000",
    "function safeTransferFrom(address from, address to, uint256 tokenId) @500000",
    "function nameExpires(uint256 id) external view returns(uint)"
];
const resolverAbi = [
    "function interfaceImplementer(bytes32 nodehash, bytes4 interfaceId) view returns (address)",
    "function addr(bytes32 nodehash) view returns (address)",
    "function setAddr(bytes32 nodehash, address addr) @500000",
    "function name(bytes32 nodehash) view returns (string)",
    "function setName(bytes32 nodehash, string name) @500000",
    "function text(bytes32 nodehash, string key) view returns (string)",
    "function setText(bytes32 nodehash, string key, string value) @500000",
    "function contenthash(bytes32 nodehash) view returns (bytes)",
    "function setContenthash(bytes32 nodehash, bytes contenthash) @500000",
];
//const InterfaceID_ERC721      = "0x6ccb2df4";
const InterfaceID_Controller = "0x018fac06";
const InterfaceID_Legacy = "0x7ba18ba1";
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
let cli = new CLI();
class EnsPlugin extends Plugin {
    constructor() {
        super();
        ethers.utils.defineReadOnly(this, "_ethAddressCache", {});
    }
    getEns() {
        return new ethers.Contract(this.network.ensAddress, ensAbi, this.accounts[0] || this.provider);
    }
    getResolver(nodehash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._ethAddressCache[nodehash]) {
                this._ethAddressCache[nodehash] = yield this.getEns().resolver(nodehash);
            }
            return new ethers.Contract(this._ethAddressCache[nodehash], resolverAbi, this.accounts[0] || this.provider);
        });
    }
    getEthInterfaceAddress(interfaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            let ethNodehash = ethers.utils.namehash("eth");
            if (!this._ethAddressCache[interfaceId]) {
                let resolver = yield this.getResolver(ethNodehash);
                this._ethAddressCache[interfaceId] = yield resolver.interfaceImplementer(ethNodehash, interfaceId);
            }
            return this._ethAddressCache[interfaceId];
        });
    }
    getEthController() {
        return __awaiter(this, void 0, void 0, function* () {
            let address = yield this.getEthInterfaceAddress(InterfaceID_Controller);
            return new ethers.Contract(address, ethControllerAbi, this.accounts[0] || this.provider);
        });
    }
    getEthLegacyRegistrar() {
        return __awaiter(this, void 0, void 0, function* () {
            let address = yield this.getEthInterfaceAddress(InterfaceID_Legacy);
            return new ethers.Contract(address, ethLegacyRegistrarAbi, this.accounts[0] || this.provider);
        });
    }
    getEthRegistrar() {
        return __awaiter(this, void 0, void 0, function* () {
            //let address = await this.getEthInterfaceAddress(InterfaceID_ERC721);
            let address = yield this.getEns().owner(ethers.utils.namehash("eth"));
            return new ethers.Contract(address, ethRegistrarAbi, this.accounts[0] || this.provider);
        });
    }
}
class LookupPlugin extends EnsPlugin {
    static getHelp() {
        return {
            name: "lookup [ NAME | ADDRESS [ ... ] ]",
            help: "Lookup a name or address"
        };
    }
    prepareArgs(args) {
        const _super = Object.create(null, {
            prepareArgs: { get: () => super.prepareArgs }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareArgs.call(this, args);
            this.names = args;
        });
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            let ens = this.getEns();
            let controller = yield this.getEthController();
            let registrar = yield this.getEthRegistrar();
            let legacyRegistrar = yield this.getEthLegacyRegistrar();
            for (let i = 0; i < this.names.length; i++) {
                let name = this.names[i];
                let nodehash = ethers.utils.namehash(name);
                let details = {
                    Nodehash: nodehash
                };
                let owner = yield ens.owner(nodehash);
                let resolverAddress = null;
                if (owner === ethers.constants.AddressZero) {
                    owner = null;
                }
                else {
                    details.Controller = owner;
                    details.Resolver = yield ens.resolver(nodehash).then((address) => {
                        if (address === ethers.constants.AddressZero) {
                            return "(not configured)";
                        }
                        resolverAddress = address;
                        return address;
                    });
                }
                let comps = name.split(".");
                if (comps.length === 2 && comps[1] === "eth") {
                    details.Labelhash = ethers.utils.id(comps[0].toLowerCase()); // @TODO: nameprep
                    details.Available = yield controller.available(comps[0]);
                    if (!details.Available) {
                        try {
                            let ownerOf = yield registrar.ownerOf(details.Labelhash);
                            if (ownerOf !== ethers.constants.AddressZero) {
                                details.Registrant = ownerOf;
                                details.Registrar = "Permanent";
                            }
                        }
                        catch (error) {
                            let entry = yield legacyRegistrar.entries(details.Labelhash);
                            let deed = new ethers.Contract(entry.owner, deedAbi, this.provider);
                            details.Registrant = yield deed.owner();
                            details.Registrar = "Legacy";
                            details["Deed Value"] = (ethers.utils.formatEther(entry.value) + " ether");
                            details["Highest Bid"] = (ethers.utils.formatEther(entry.highestBid) + " ether");
                        }
                    }
                }
                if (resolverAddress) {
                    let resolver = new ethers.Contract(resolverAddress, resolverAbi, this.provider);
                    details["Address"] = yield resolver.addr(nodehash);
                    let email = yield resolver.text(nodehash, "email").catch((error) => (""));
                    if (email) {
                        details["E-mail"] = email;
                    }
                    let website = yield resolver.text(nodehash, "url").catch((error) => (""));
                    if (website) {
                        details["Website"] = website;
                    }
                    let content = yield resolver.contenthash(nodehash).then((hash) => {
                        if (hash === "0x") {
                            return "";
                        }
                        if (hash.substring(0, 10) === "0xe3010170" && ethers.utils.isHexString(hash, 38)) {
                            return Base58.encode(ethers.utils.hexDataSlice(hash, 4)) + " (IPFS)";
                        }
                        return hash + " (unknown format)";
                    }, (error) => (""));
                    if (content) {
                        details["Content Hash"] = content;
                    }
                }
                let ordered = {};
                "Nodehash,Labelhash,Available,Registrant,Controller,Resolver,Address,Registrar,Deed Value,Highest Bid,E-mail,Website,Content Hash".split(",").forEach((key) => {
                    if (!details[key]) {
                        return;
                    }
                    ordered[key] = details[key];
                });
                for (let key in details) {
                    if (ordered[key]) {
                        continue;
                    }
                    ordered[key] = details[key];
                }
                this.dump("Name: " + this.names[i], ordered);
            }
        });
    }
}
cli.addPlugin("lookup", LookupPlugin);
class AccountPlugin extends EnsPlugin {
    static getHelp() {
        return logger.throwError("subclasses must implement this", ethers.errors.UNSUPPORTED_OPERATION, {
            operation: "getHelp"
        });
    }
    _setValue(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            ethers.utils.defineReadOnly(this, key, value);
            if (key === "name") {
                yield this._setValue("nodehash", ethers.utils.namehash(value));
            }
        });
    }
    prepareArgs(args) {
        const _super = Object.create(null, {
            prepareArgs: { get: () => super.prepareArgs }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareArgs.call(this, args);
            let helpLine = ethers.utils.getStatic(this.constructor, "getHelp")().name;
            let params = helpLine.split(" ");
            let command = params[0];
            params = params.slice(1);
            if (this.accounts.length !== 1) {
                this.throwError(command + " requires an account");
            }
            if (args.length !== params.length) {
                this.throwError(command + " requires exactly " + listify(params));
            }
            for (let i = 0; i < params.length; i++) {
                yield this._setValue(params[i].toLowerCase(), args[i]);
            }
        });
    }
}
class ControllerPlugin extends AccountPlugin {
    static getOptionHelp() {
        return [
            {
                name: "[ --duration DAYS ]",
                help: "Register duration (default: 365 days)"
            },
            {
                name: "[ --salt SALT ]",
                help: "SALT to blind the commit with"
            },
            {
                name: "[ --secret SECRET ]",
                help: "Use id(SECRET) as the salt"
            },
            {
                name: "[ --owner OWNER ]",
                help: "The target owner (default: current account)"
            }
        ];
    }
    _setValue(key, value) {
        const _super = Object.create(null, {
            _setValue: { get: () => super._setValue }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (key === "name") {
                let comps = value.split(".");
                if (comps.length !== 2 || comps[1] !== "eth") {
                    this.throwError("Invalid NAME");
                }
                yield _super._setValue.call(this, "label", comps[0]);
            }
            yield _super._setValue.call(this, key, value);
        });
    }
    prepareOptions(argParser) {
        const _super = Object.create(null, {
            prepareOptions: { get: () => super.prepareOptions }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareOptions.call(this, argParser);
            this.salt = argParser.consumeOption("salt");
            let secret = argParser.consumeOption("secret");
            if (secret) {
                if (this.salt) {
                    this.throwError("Cannot specify --salt with --secret");
                }
                this.salt = ethers.utils.id(secret);
            }
            this.owner = argParser.consumeOption("owner");
            if (this.owner) {
                this.owner = yield this.getAddress(this.owner);
            }
            else {
                this.owner = yield this.accounts[0].getAddress();
            }
            let duration = parseInt(argParser.consumeOption("duration") || "365");
            if (duration < 28) {
                this.throwError("registration must be for a minimum length of 28 days");
            }
            ethers.utils.defineReadOnly(this, "duration", duration * (60 * 60 * 24));
        });
    }
    prepareArgs(args) {
        const _super = Object.create(null, {
            prepareArgs: { get: () => super.prepareArgs }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareArgs.call(this, args);
            if (!this.salt) {
                let signature = yield this.accounts[0].signMessage("commit-" + this.owner + "-" + this.name);
                this.salt = ethers.utils.keccak256(signature);
            }
        });
    }
}
class CommitPlugin extends ControllerPlugin {
    static getHelp() {
        return {
            name: "commit NAME",
            help: "Submit a pre-commitment"
        };
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            let ethController = yield this.getEthController();
            let commitment = yield ethController.makeCommitment(this.label, this.owner, this.salt);
            let fee = yield ethController.rentPrice(this.label, this.duration);
            this.dump("Commit: " + this.name, {
                Nodehash: this.nodehash,
                Owner: this.owner,
                Salt: this.salt,
                Duration: (this.duration + " seconds (informational)"),
                Fee: ethers.utils.formatEther(fee) + " (informational)",
                Commitment: commitment
            });
            yield ethController.commit(commitment);
        });
    }
}
cli.addPlugin("commit", CommitPlugin);
class RevealPlugin extends ControllerPlugin {
    static getHelp() {
        return {
            name: "reveal NAME",
            help: "Reveal a previous pre-commitment"
        };
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            let ethController = yield this.getEthController();
            let fee = yield ethController.rentPrice(this.label, this.duration);
            this.dump("Reveal: " + this.name, {
                Nodehash: this.nodehash,
                Owner: this.owner,
                Salt: this.salt,
                Duration: (this.duration + " seconds"),
                Fee: ethers.utils.formatEther(fee),
            });
            yield ethController.register(this.label, this.owner, this.duration, this.salt, {
                value: fee.mul(11).div(10)
            });
        });
    }
}
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
class AddressAccountPlugin extends AccountPlugin {
    static getOptionHelp() {
        return [
            {
                name: "[ --address ADDRESS ]",
                help: "Specify another address"
            }
        ];
    }
    getDefaultAddress() {
        return this.accounts[0].getAddress();
    }
    prepareOptions(argParser) {
        const _super = Object.create(null, {
            prepareOptions: { get: () => super.prepareOptions }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareOptions.call(this, argParser);
            let address = argParser.consumeOption("address");
            if (!address) {
                address = yield this.getDefaultAddress();
            }
            this.address = yield this.getAddress(address);
        });
    }
}
class SetControllerPlugin extends AddressAccountPlugin {
    static getHelp() {
        return {
            name: "set-controller NAME",
            help: "Set the controller (default: current account)"
        };
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Set Subnode: " + this.name, {
                "Nodehash": this.nodehash,
                "Owner": this.address
            });
            this.getEns().setOwner(this.nodehash, this.address);
        });
    }
}
cli.addPlugin("set-controller", SetControllerPlugin);
class SetSubnodePlugin extends AddressAccountPlugin {
    static getHelp() {
        return {
            name: "set-subnode NAME",
            help: "Set a subnode owner (default: current account)"
        };
    }
    _setValue(key, value) {
        const _super = Object.create(null, {
            _setValue: { get: () => super._setValue }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (key === "name") {
                let comps = value.toLowerCase().split(".");
                yield _super._setValue.call(this, "label", comps[0]);
                yield _super._setValue.call(this, "node", comps.slice(1).join("."));
            }
            yield _super._setValue.call(this, key, value);
        });
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Set Subnode: " + this.name, {
                "Label": this.label,
                "Node": this.node,
                "Owner": this.address
            });
            yield this.getEns().setSubnodeOwner(ethers.utils.namehash(this.node), ethers.utils.id(this.label), this.address);
        });
    }
}
cli.addPlugin("set-subnode", SetSubnodePlugin);
class SetResolverPlugin extends AddressAccountPlugin {
    static getHelp() {
        return {
            name: "set-resolver NAME",
            help: "Set the resolver (default: resolver.eth)"
        };
    }
    getDefaultAddress() {
        return this.getAddress("resolver.eth");
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Set Resolver: " + this.name, {
                "Nodehash": this.nodehash,
                "Resolver": this.address
            });
            yield this.getEns().setResolver(this.nodehash, this.address);
        });
    }
}
cli.addPlugin("set-resolver", SetResolverPlugin);
class SetAddrPlugin extends AddressAccountPlugin {
    static getHelp() {
        return {
            name: "set-addr NAME",
            help: "Set the addr record (default: current account)"
        };
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Set Addr: " + this.name, {
                "Nodehash": this.nodehash,
                "Address": this.address
            });
            let resolver = yield this.getResolver(this.nodehash);
            yield resolver.setAddr(this.nodehash, this.address);
        });
    }
}
cli.addPlugin("set-addr", SetAddrPlugin);
class SetNamePlugin extends AddressAccountPlugin {
    static getHelp() {
        return {
            name: "set-name NAME",
            help: "Set the reverse name record (default: current account)"
        };
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            const nodehash = ethers.utils.namehash(this.address.substring(2) + ".addr.reverse");
            this.dump("Set Name: " + this.name, {
                "Nodehash": nodehash,
                "Address": this.address
            });
            let resolver = yield this.getResolver(nodehash);
            yield resolver.setName(nodehash, this.name);
        });
    }
}
cli.addPlugin("set-name", SetNamePlugin);
class TextAccountPlugin extends AccountPlugin {
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            let key = this.getKey();
            let value = this.getValue();
            this.dump("Set " + this.getHeader() + ": " + this.name, {
                Nodehash: this.nodehash,
                Key: key,
                Value: value
            });
            let resolver = yield this.getResolver(this.nodehash);
            yield resolver.setText(this.nodehash, key, value);
        });
    }
}
class SetTextPlugin extends TextAccountPlugin {
    static getHelp() {
        return {
            name: "set-text NAME KEY VALUE",
            help: "Set a text record"
        };
    }
    getHeader() { return "Test"; }
    getKey() { return this.key; }
    getValue() { return this.value; }
}
cli.addPlugin("set-text", SetTextPlugin);
class SetEmailPlugin extends TextAccountPlugin {
    static getHelp() {
        return {
            name: "set-email NAME EMAIL",
            help: "Set the email text record"
        };
    }
    getHeader() { return "E-mail"; }
    getKey() { return "email"; }
    getValue() { return this.email; }
}
cli.addPlugin("set-email", SetEmailPlugin);
class SetWebsitePlugin extends TextAccountPlugin {
    static getHelp() {
        return {
            name: "set-website NAME URL",
            help: "Set the website text record"
        };
    }
    getHeader() { return "Website"; }
    getKey() { return "url"; }
    getValue() { return this.url; }
}
cli.addPlugin("set-website", SetWebsitePlugin);
class SetContentPlugin extends AccountPlugin {
    static getHelp() {
        return {
            name: "set-content NAME HASH",
            help: "Set the IPFS Content Hash"
        };
    }
    _setValue(key, value) {
        const _super = Object.create(null, {
            _setValue: { get: () => super._setValue }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (key === "hash") {
                let bytes = Base58.decode(value);
                if (bytes.length !== 34 || bytes[0] !== 18 || bytes[1] !== 32) {
                    this.throwError("Unsupported IPFS hash");
                }
                let multihash = ethers.utils.concat(["0xe3010170", bytes]);
                yield _super._setValue.call(this, "multihash", ethers.utils.hexlify(multihash));
            }
            yield _super._setValue.call(this, key, value);
        });
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Set Content Hash: " + this.name, {
                Nodehash: this.nodehash,
                "Content Hash": this.hash
            });
            let resolver = yield this.getResolver(this.nodehash);
            yield resolver.setContenthash(this.nodehash, this.multihash);
        });
    }
}
cli.addPlugin("set-content", SetContentPlugin);
class MigrateRegistrarPlugin extends AccountPlugin {
    static getHelp() {
        return {
            name: "migrate-registrar NAME",
            help: "Migrate from the Legacy to the Permanent Registrar"
        };
    }
    prepareArgs(args) {
        const _super = Object.create(null, {
            prepareArgs: { get: () => super.prepareArgs },
            _setValue: { get: () => super._setValue }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareArgs.call(this, args);
            // Only Top-Level names can be migrated
            let comps = this.name.split(".");
            if (comps.length !== 2 || comps[1] !== "eth") {
                this.throwError("Not a top-level .eth name");
            }
            yield _super._setValue.call(this, "label", comps[0]);
            let ethLegacyRegistrar = yield this.getEthLegacyRegistrar();
            let entry = yield ethLegacyRegistrar.entries(ethers.utils.id(comps[0]));
            // Only owned names can be migrated
            if (States[entry.state] !== "Owned") {
                this.throwError("Name not present in the Legacy registrar");
            }
            let deed = new ethers.Contract(entry.owner, deedAbi, this.provider);
            let owner = yield deed.owner();
            let address = yield this.accounts[0].getAddress();
            // Only the deed owner (registrant) may migrate a name
            if (owner !== address) {
                this.throwError("Only the registrant can migrate");
            }
            yield _super._setValue.call(this, "deedValue", entry.value);
            yield _super._setValue.call(this, "highestBid", entry.highestBid);
        });
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Migrate Registrar: " + this.name, {
                "Nodehash": this.nodehash,
                "Highest Bid": (ethers.utils.formatEther(this.highestBid) + " ether"),
                "Deed Value": (ethers.utils.formatEther(this.deedValue) + " ether"),
            });
            let legacyRegistrar = yield this.getEthLegacyRegistrar();
            yield legacyRegistrar.transferRegistrars(ethers.utils.id(this.label));
        });
    }
}
cli.addPlugin("migrate-registrar", MigrateRegistrarPlugin);
class TransferPlugin extends AccountPlugin {
    static getHelp() {
        return {
            name: "transfer NAME NEW_OWNER",
            help: "Transfer registrant ownership"
        };
    }
    _setValue(key, value) {
        const _super = Object.create(null, {
            _setValue: { get: () => super._setValue }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (key === "new_owner") {
                let address = yield this.getAddress(value);
                yield _super._setValue.call(this, key, address);
            }
            else if (key === "name") {
                let comps = value.split(".");
                if (comps.length !== 2 || comps[1] !== "eth") {
                    this.throwError("Not a top-level .eth name");
                }
                yield _super._setValue.call(this, "label", comps[0]);
                yield _super._setValue.call(this, key, value);
            }
            else {
                yield _super._setValue.call(this, key, value);
            }
        });
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Transfer: " + this.name, {
                Nodehash: this.nodehash,
                "New Owner": this.new_owner,
            });
            let registrar = yield this.getEthRegistrar();
            yield registrar.safeTransferFrom(this.accounts[0].getAddress(), this.new_owner, ethers.utils.id(this.label));
        });
    }
}
cli.addPlugin("transfer", TransferPlugin);
class ReclaimPlugin extends AddressAccountPlugin {
    static getHelp() {
        return {
            name: "reclaim NAME",
            help: "Reset the controller by the registrant"
        };
    }
    _setValue(key, value) {
        const _super = Object.create(null, {
            _setValue: { get: () => super._setValue }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (key === "name") {
                let comps = value.split(".");
                if (comps.length !== 2 || comps[1] !== "eth") {
                    this.throwError("Not a top-level .eth name");
                }
                let account = yield this.accounts[0].getAddress();
                let registrar = yield this.getEthRegistrar();
                let ownerOf = null;
                try {
                    ownerOf = yield registrar.ownerOf(ethers.utils.id(comps[0]));
                }
                catch (error) {
                    this.throwError("Name not present in Permanent Registrar");
                }
                if (account !== ownerOf) {
                    this.throwError("Only the registrant can call reclaim");
                }
                yield _super._setValue.call(this, "label", comps[0]);
            }
            yield _super._setValue.call(this, key, value);
        });
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            this.dump("Reclaim: " + this.name, {
                "Nodehash": this.nodehash,
                "Address": this.address,
            });
            let registrar = yield this.getEthRegistrar();
            yield registrar.reclaim(ethers.utils.id(this.label), this.address);
        });
    }
}
cli.addPlugin("reclaim", ReclaimPlugin);
function zpad(value, length) {
    let v = String(value);
    while (v.length < length) {
        v = "0" + v;
    }
    return v;
}
function formatDate(date) {
    const count = Math.round((date.getTime() - (new Date()).getTime()) / (24 * 60 * 60 * 1000));
    return [
        date.getFullYear(),
        zpad(date.getMonth() + 1, 2),
        zpad(date.getDate(), 2)
    ].join("-") + ` (${count} days from now)`;
}
class RenewPlugin extends EnsPlugin {
    static getHelp() {
        return {
            name: "renew NAME [ NAME ... ]",
            help: "Reset the controller by the registrant"
        };
    }
    static getOptionHelp() {
        return [
            {
                name: "[ --duration DAYS ]",
                help: "Register duration (default: 365 days)"
            },
            {
                name: "[ --until YYYY-MM-DD ]",
                help: "Register until date"
            },
        ];
    }
    getDuration(startDate, until) {
        const match = until.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
        if (!match) {
            this.throwError("invalid date format; use YYYY-MM-DD");
        }
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        // Not perfect; allow February 30 or April 31 @TODO?
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            this.throwError("date out of range");
        }
        const endDate = (new Date(year, month - 1, day)).getTime() / 1000;
        return Math.ceil(endDate - startDate);
    }
    prepareOptions(argParser) {
        const _super = Object.create(null, {
            prepareOptions: { get: () => super.prepareOptions }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareOptions.call(this, argParser);
            if (this.accounts.length !== 1) {
                this.throwError("new requires ONE account");
            }
            const timespans = argParser.consumeMultiOptions(["duration", "until"]);
            if (timespans.length === 1) {
                const timespan = timespans.pop();
                if (timespan.name === "duration") {
                    this.duration = parseInt(timespan.value) * 60 * 60 * 24;
                }
                else if (timespan.name === "until") {
                    this.until = timespan.value;
                }
            }
            else if (timespans.length > 1) {
                this.throwError("renew requires at most ONE of --duration or --until");
            }
            else {
                this.duration = 365 * 60 * 60 * 24;
            }
        });
    }
    prepareArgs(args) {
        const _super = Object.create(null, {
            prepareArgs: { get: () => super.prepareArgs }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareArgs.call(this, args);
            const labels = [];
            args.forEach((arg) => {
                const comps = arg.split(".");
                if (comps.length !== 2 || comps[1] !== "eth") {
                    this.throwError(`name not supported ${JSON.stringify(arg)}`);
                }
                labels.push(comps[0]);
            });
            this.labels = Object.freeze(labels);
        });
    }
    run() {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.run.call(this);
            const ethController = yield this.getEthController();
            const ethRegistrar = yield this.getEthRegistrar();
            for (let i = 0; i < this.labels.length; i++) {
                const label = this.labels[i];
                console.log(label);
                const expiration = (yield ethRegistrar.nameExpires(ethers.utils.id(label))).toNumber();
                if (expiration === 0) {
                    this.throwError(`not registered: ${label}`);
                }
                const duration = this.duration ? this.duration : this.getDuration(expiration, this.until);
                if (duration < 0) {
                    this.throwError(`bad duration: ${duration}`);
                }
                const fee = (yield ethController.rentPrice(label, duration)).mul(11).div(10);
                this.dump(`Renew: ${label}.eth`, {
                    "Current Expiry": formatDate(new Date(expiration * 1000)),
                    "Duration": `${(duration / (24 * 60 * 60))} days`,
                    "Until": formatDate(new Date((expiration + duration) * 1000)),
                    "Fee": `${ethers.utils.formatEther(fee)} (+10% buffer)`,
                });
                yield ethController.renew(label, duration, {
                    value: fee
                });
            }
        });
    }
}
cli.addPlugin("renew", RenewPlugin);
/**
 *  To Do:
 *    register NAME --registrar
 *    set-reverse NAME
 *    renew NAME --duration DAYS
 *
 *  Done:
 *    migrate-registrar NAME
 *    transfer NAME OWNER
 *    set-subnode LABEL.NAME
 *    set-owner NAME OWNER
 *    set-resolver NAME RESOLVER
 *    set-addr NAME ADDRESS
 *    set-reverse-name ADDRESS NAME
 *    set-email NAME EMAIL
 *    set-webstie NAME WEBSITE
 *    set-text NAME KEY VALUE
 *    set-content NAME HASH
 *    reclaim NAME --address OWNER
 */
cli.run(process.argv.slice(2));
//# sourceMappingURL=ethers-ens.js.map