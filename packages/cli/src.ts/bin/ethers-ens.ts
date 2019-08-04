#!/usr/bin/env node

'use strict';

import { ethers } from 'ethers';

import { ArgParser, CLI, Help, Plugin } from '../cli';

import { version } from "../_version";

const logger = new ethers.utils.Logger(version);

const ensAbi = [
    "function setOwner(bytes32 node, address owner) external @500000",
    "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external @500000",
    "function setResolver(bytes32 node, address resolver) external @500000",
    "function owner(bytes32 node) external view returns (address)",
    "function resolver(bytes32 node) external view returns (address)"
];

const States = Object.freeze([ "Open", "Auction", "Owned", "Forbidden", "Reveal", "NotAvailable" ]);

const ethLegacyRegistrarAbi = [
    "function entries(bytes32 _hash) view returns (uint8 state, address owner, uint registrationDate, uint value, uint highestBid)",
    "function state(bytes32 _hash) public view returns (uint8)",
    "function transferRegistrars(bytes32 _hash) @500000",
];

const ethControllerAbi = [
    "function rentPrice(string memory name, uint duration) view public returns(uint)",
    "function available(string memory label) public view returns(bool)",
    "function makeCommitment(string memory name, address owner, bytes32 secret) pure public returns(bytes32)",
    "function commit(bytes32 commitment) public",
    "function register(string calldata name, address owner, uint duration, bytes32 secret) payable @500000",
    "function renew(string calldata name, uint duration) payable @500000",
];

const ethRegistrarAbi = [
    "function transferFrom(address from, address to, uint256 tokenId)"
];

const resolverAbi = [
    "function interfaceImplementer(bytes32 nodehash, bytes4 interfaceId) view returns (address)",
    "function addr(bytes32 nodehash) view returns (address)",
    "function setAddr(bytes32 nodehash, address addr) @500000",
    "function text(bytes32 nodehash, string key) view returns (string)",
    "function setText(bytes32 nodehash, string key, string value) @500000",
];

const InterfaceID_ERC721 = "0x6ccb2df4";
const InterfaceID_Controller = "0x018fac06";
const InterfaceID_Legacy = "0x7ba18ba1";


/*

const reverseRegistrarAbi = [
];
*/

function listify(words: Array<string>): string {
    if (words.length === 1) { return words[0]; }
    return words.slice(0, words.length - 1).join(", ") + " and " + words[words.length - 1];
}


let cli = new CLI();

abstract class EnsPlugin extends Plugin {
    _ethAddressCache: { [ addressOrInterfaceId: string ]: string };

    constructor() {
        super();
        ethers.utils.defineReadOnly(this, "_ethAddressCache", { });
    }

    async getEns(): Promise<ethers.Contract> {
        let network = await this.provider.getNetwork();
        return new ethers.Contract(network.ensAddress, ensAbi, this.accounts[0] || this.provider);
    }

    async getResolver(nodehash: string): Promise<ethers.Contract> {
        if (!this._ethAddressCache[nodehash]) {
            let ens = await this.getEns();
            this._ethAddressCache[nodehash] = await ens.resolver(nodehash);
        }
        return new ethers.Contract(this._ethAddressCache[nodehash], resolverAbi, this.accounts[0] || this.provider);
    }

    async getEthInterfaceAddress(interfaceId: string): Promise<string> {
        let ethNodehash = ethers.utils.namehash("eth");
        if (!this._ethAddressCache[interfaceId]) {
            let resolver = await this.getResolver(ethNodehash);
            this._ethAddressCache[interfaceId] = await resolver.interfaceImplementer(ethNodehash, interfaceId);
        }
        return this._ethAddressCache[interfaceId];
    }

    async getEthController(): Promise<ethers.Contract> {
        let address = await this.getEthInterfaceAddress(InterfaceID_Controller);
        return new ethers.Contract(address, ethControllerAbi, this.accounts[0] || this.provider);
    }

    async getEthLegacyRegistrar(): Promise<ethers.Contract> {
        let address = await this.getEthInterfaceAddress(InterfaceID_Legacy);
        return new ethers.Contract(address, ethLegacyRegistrarAbi, this.accounts[0] || this.provider);
    }

    async getEthRegistrar(): Promise<ethers.Contract> {
        let address = await this.getEthInterfaceAddress(InterfaceID_ERC721);
        return new ethers.Contract(address, ethRegistrarAbi, this.accounts[0] || this.provider);
    }
}

class LookupPlugin extends EnsPlugin {

    names: Array<string>;

    static getHelp(): Help {
        return {
           name: "lookup [ NAME | ADDRESS [ ... ] ]",
           help: "Lookup a name or address"
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        this.names = args;
    }

    async run(): Promise<void> {
        await super.run();

        let ens = await this.getEns();

        for (let i = 0; i < this.names.length; i++) {
            let name = this.names[i];

            let nodehash = ethers.utils.namehash(name);

            let details: any = {
                Owner: ens.owner(nodehash),
                Resolver: ens.resolver(nodehash)
            };

            let comps = name.split(".");
            if (comps.length === 2 && comps[1] === "eth") {
                let labelhash = ethers.utils.id(comps[0].toLowerCase()); // @TODO: nameprep

                let available = this.getEthController().then((ethController) => {
                    return ethController.available(comps[0]);
                });
                details.Available = available;

                let legacyRegistrarPromise = this.getEthLegacyRegistrar();

                details._Registrar = Promise.all([
                    available,
                    legacyRegistrarPromise.then((legacyRegistrar) => {
                        return legacyRegistrar.state(labelhash);
                    })
                ]).then((results) => {
                    let available = results[0];
                    let state = States[results[1]];
                    if (!available && state === "Owned") {
                        return legacyRegistrarPromise.then((legacyRegistrar) => {
                            return legacyRegistrar.entries(labelhash).then((entries: any) => {
                                return {
                                    Registrar: "Legacy",
                                    "Deed Value": (ethers.utils.formatEther(entries.value) + " ether"),
                                    "Highest Bid": (ethers.utils.formatEther(entries.highestBid) + " ether"),
                                }
                            });
                        });
                    }
                    return { Registrar: "Permanent" };
                });
            }

            details = await ethers.utils.resolveProperties(details);

            if (details.Resolver !== ethers.constants.AddressZero) {
                let resolver = new ethers.Contract(details.Resolver, resolverAbi, this.provider);
                details.address = resolver.addr(nodehash);
                details.email = resolver.text(nodehash, "email").catch((error: any) => (""));
                details.website = resolver.text(nodehash, "website").catch((error: any) => (""));
            }

            details = await ethers.utils.resolveProperties(details);

            for (let key in details._Registrar) {
                details[key] = details._Registrar[key];
            }
            delete details._Registrar;

            this.dump("Name: " + this.names[i], details);
        }
    }
}
cli.addPlugin("lookup", LookupPlugin);

abstract class AccountPlugin extends EnsPlugin {
    name: string;
    nodehash: string;
    _wait: boolean;

    static getHelp(): Help {
        return logger.throwError("subclasses must implemetn this", ethers.errors.UNSUPPORTED_OPERATION, {
            operation: "getHelp"
        });
    }

    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "[ --wait ]",
                help: "Wait for the transaction to be mined"
            }
        ];
    }

    async wait(tx: ethers.providers.TransactionResponse): Promise<void> {
        if (!this._wait) { return; }
        try {
            let receipt = await tx.wait();
            this.dump("Success:", {
                BlockNumber: receipt.blockNumber,
                BlockHash: receipt.blockHash,
                GasUsed: ethers.utils.commify(receipt.gasUsed.toString()),
                Fee: ethers.utils.formatEther(receipt.gasUsed.mul(tx.gasPrice))
            });
        } catch (error) {
            this.dump("Failed:", {
                Error: error.message
            });
        }
    }

    async _setValue(key: string, value: string): Promise<void> {
        ethers.utils.defineReadOnly(this, key, value);
        if (key === "name") {
            await this._setValue("nodehash", ethers.utils.namehash(value));
        }
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        ethers.utils.defineReadOnly(this, "_wait", argParser.consumeFlag("wait"));
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        let helpLine = ethers.utils.getStatic<() => Help>(this.constructor, "getHelp")().name;
        let params = helpLine.split(" ");
        let command = params[0];
        params = params.slice(1);

        if (this.accounts.length !== 1) {
            this.throwError(command + " requires an account");
        }

        if (args.length !== params.length) {
            this.throwError(command + " requires exactly " + listify(params));
        }

        for (let i = 0; i < params.length; i++ ) {
            await this._setValue(params[i].toLowerCase(), args[i]);
        }
    }
}


abstract class ControllerPlugin extends AccountPlugin {
    salt: string;
    owner: string
    label: string;
    duration: number;

    static getOptionHelp(): Array<Help> {
        let result = super.getOptionHelp();
        [
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
        ].forEach((help) => {
            result.push(help);
        });
        return result;
    }

    async _setValue(key: string, value: string): Promise<void> {
        if (key === "name") {
            let comps = value.split(".");
            if (comps.length !== 2 || comps[1] !== "eth") {
                this.throwError("Invalid NAME");
            }
            await super._setValue("label", comps[0]);
        }
        await super._setValue(key, value);
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

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
            this.owner = await this.getAddress(this.owner);
        } else {
            this.owner = await this.accounts[0].getAddress();
        }

        let duration = parseInt(argParser.consumeOption("duration") || "365");
        if (duration < 28) {
            this.throwError("registration must be for a minimum length of 28 days");
        }

        ethers.utils.defineReadOnly(this, "duration", duration * (60 * 60 * 24));
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (!this.salt) {
            let signature = await this.accounts[0].signMessage("commit-" + this.owner + "-" + this.name);
            this.salt = ethers.utils.keccak256(signature);
        }
    }
}

class CommitPlugin extends ControllerPlugin {

    static getHelp(): Help {
        return {
           name: "commit NAME",
           help: "Commit to NAME"
        }
    }

    async run(): Promise<void> {
        await super.run();
        let ethController = await this.getEthController();

        let commitment = await ethController.makeCommitment(this.label, this.owner, this.salt);
        let fee = await ethController.rentPrice(this.label, this.duration);

        this.dump("Commit: " + this.name, {
            Nodehash: this.nodehash,
            Owner: this.owner,
            Salt: this.salt,
            Duration: (this.duration + " seconds (informational)"),
            Fee: ethers.utils.formatEther(fee) + " (informational)",
            Commitment: commitment
        });

        let tx = await ethController.commit(commitment);

        this.wait(tx);
    }
}
cli.addPlugin("commit", CommitPlugin);

class RevealPlugin extends ControllerPlugin {

    static getHelp(): Help {
        return {
           name: "reveal LABEL",
           help: "Reveal a previously committed name"
        }
    }

    async run(): Promise<void> {
        await super.run();
        let ethController = await this.getEthController();

        let fee = await ethController.rentPrice(this.label, this.duration);

        this.dump("Reveal: " + this.name, {
            Nodehash: this.nodehash,
            Owner: this.owner,
            Salt: this.salt,
            Duration: (this.duration + " seconds"),
            Fee: ethers.utils.formatEther(fee),
        });

        let tx = await ethController.register(this.label, this.owner, this.duration, this.salt, {
            value: fee.mul(11).div(10)
        });

        this.wait(tx);
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

abstract class AddressAccountPlugin extends AccountPlugin {
    address: string;

    static getOptionHelp(): Array<Help> {
        let options = super.getOptionHelp();
        options.push({
            name: "[ --address ADDRESS ]",
            help: "Override the address"
        });
        return options;
    }

    getDefaultAddress(): Promise<string> {
        return this.accounts[0].getAddress();
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        let address = argParser.consumeOption("address");
        if (!address) {
            address = await this.getDefaultAddress();
        }

        this.address = address;
    }
}

class SetOwnerPlugin extends AddressAccountPlugin {

    static getHelp(): Help {
        return {
           name: "set-owner NAME",
           help: "Set the owner of NAME (default: current account)"
        }
    }

    async run(): Promise<void> {
        await super.run();
        const ens = await this.getEns();

        let tx = ens.setOwner(this.nodehash, this.address);
        this.wait(tx);
    }
}
cli.addPlugin("set-owner", SetOwnerPlugin);

class SetSubnodePlugin extends AddressAccountPlugin {
    label: string;
    node: string;

    static getHelp(): Help {
        return {
           name: "set-subnode NAME",
           help: "Set the subnode owner"
        }
    }

    async _setValue(key: string, value: string): Promise<void> {
        if (key === "name") {
            let comps = value.toLowerCase().split(".");
            await super._setValue("label", comps[0]);
            await super._setValue("node", comps.slice(1).join("."));
        }
        await super._setValue(key, value);
    }

    async run(): Promise<void> {
        await super.run();

        this.dump("Set Subnode: " + this.name, {
            Label: this.label,
            Node: this.node
        });

        const ens = await this.getEns();
        let tx = await ens.setSubnodeOwner(ethers.utils.namehash(this.node), ethers.utils.id(this.label), this.address);
        this.wait(tx);
    }
}
cli.addPlugin("set-subnode", SetSubnodePlugin);

class SetResolverPlugin extends AddressAccountPlugin {
    static getHelp(): Help {
        return {
           name: "set-resolver NAME",
           help: "Set the resolver for NAME (default: resolver.eth)"
        }
    }

    getDefaultAddress(): Promise<string> {
        return this.getAddress("resolver.eth");
    }

    async run(): Promise<void> {
        await super.run();

        this.dump("Set Resolver: " + this.name, {
            Nodehash: this.nodehash,
            Resolver: this.address
        });

        const ens = await this.getEns();
        let tx = await ens.setResolver(this.nodehash, this.address);

        this.wait(tx);
    }
}
cli.addPlugin("set-resolver", SetResolverPlugin);

class SetAddrPlugin extends AddressAccountPlugin {

    static getHelp(): Help {
        return {
           name: "set-addr NAME",
           help: "Set the addr record (default: current account)"
        }
    }

    async run(): Promise<void> {
        await super.run();

        this.dump("Set Addr: " + this.name, {
            Nodehash: this.nodehash,
            Address: this.address
        });

        let resolver = await this.getResolver(this.nodehash);
        let tx = await resolver.setAddr(this.nodehash, this.address);
        this.wait(tx);
    }
}
cli.addPlugin("set-addr", SetAddrPlugin);

abstract class TextAccountPlugin extends AccountPlugin {
    abstract getHeader(): string;
    abstract getKey(): string;
    abstract getValue(): string;

    async run(): Promise<void> {
        await super.run();

        let key = this.getKey();
        let value = this.getValue();

        this.dump("Set " + this.getHeader() + ": " + this.name, {
            Nodehash: this.nodehash,
            Key: key,
            Value: value
        });

        let resolver = await this.getResolver(this.nodehash);
        let tx = await resolver.setText(this.nodehash, key, value);
        this.wait(tx);
    }
}

class SetTextPlugin extends TextAccountPlugin {
    key: string;
    value: string;

    static getHelp(): Help {
        return {
           name: "set-text NAME KEY VALUE",
           help: "Set the KEY text record to VALUE"
        }
    }

    getHeader(): string { return "Test" }
    getKey(): string { return this.key; }
    getValue(): string { return this.value; }
}
cli.addPlugin("set-text", SetTextPlugin);

class SetEmailPlugin extends TextAccountPlugin {
    email: string;

    static getHelp(): Help {
        return {
           name: "set-email NAME EMAIL",
           help: "Set the email text record to EMAIL"
        }
    }

    getHeader(): string { return "E-mail" }
    getKey(): string { return "email"; }
    getValue(): string { return this.email; }
}
cli.addPlugin("set-email", SetEmailPlugin);

class SetWebsitePlugin extends TextAccountPlugin {
    url: string;

    static getHelp(): Help {
        return {
           name: "set-website NAME URL",
           help: "Set the website text record to URL"
        }
    }

    getHeader(): string { return "Website" }
    getKey(): string { return "website"; }
    getValue(): string { return this.url; }
}

cli.addPlugin("set-website", SetWebsitePlugin);

/*
// @TODO:
class SetContentHashPlugin extends AccountPlugin {
    hash: string;

    static getHelp(): Help {
        return {
           name: "set-content NAME HASH",
           help: "Set the content hash record to HASH"
        }
    }

    async run(): Promise<void> {
        await super.run();
        throw new Error("not implemented");
        //let resolver = await this.getResolver();
        //let tx = resolver.setContenthash(this.nodehash, this.key, this.value);
        //this.wait(tx);
    }
}
cli.addPlugin("set-content", SetContentHashPlugin);
*/

class MigrateRegistrarPlugin extends AccountPlugin {
    readonly label: string;

    static getHelp(): Help {
        return {
           name: "migrate-registrar NAME",
           help: "Migrates NAME from the Legacy to Permanent Registrar"
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        let comps = this.name.split(".");
        if (comps.length !== 2 || comps[1] !== "eth") {
            this.throwError("Not a top-level .eth name");
        }

        // @TODO: Should probably check that accounts[0].getAddress() matches
        //        the owner in the legacy registrar

        let ethLegacyRegistrar = await this.getEthLegacyRegistrar();
        let state = await ethLegacyRegistrar.state(ethers.utils.id(comps[0]));

        if (States[state] !== "Owned") {
            this.throwError("Name not present in the Legacy registrar");
        }

        await super._setValue("label", comps[0]);
    }

    async run(): Promise<void> {
        await super.run();

        this.dump("Migrate Registrar: " + this.name, {
            Nodehash: this.nodehash
        });

        let legacyRegistrar = await this.getEthLegacyRegistrar();
        let tx = await legacyRegistrar.transferRegistrars(ethers.utils.id(this.label));
        this.wait(tx);
    }
}
cli.addPlugin("migrate-registrar", MigrateRegistrarPlugin);

class TransferPlugin extends AccountPlugin {
    readonly name: string;
    readonly new_owner: string;

    readonly label: string;

    static getHelp(): Help {
        return {
           name: "transfer NAME NEW_OWNER",
           help: "Transfers NAME to NEW_OWNER (permanent regstrar only)"
        }
    }

    async _setValue(key: string, value: string): Promise<void> {
        if (key === "new_owner") {
            let address = await this.getAddress(value);
            await this._setValue(key, address);
        } else if (key === "name") {
            let comps = this.name.split(".");
            if (comps.length !== 2 || comps[1] !== "eth") {
                this.throwError("Not a top-level .eth name");
            }
            await super._setValue("label", comps[0]);
            await super._setValue(key, value);
        } else {
            await super._setValue(key, value);
        }
    }

    async run(): Promise<void> {
        await super.run();

        this.dump("Transfer: " + this.name, {
            Nodehash: this.nodehash,
            "New Owner": this.new_owner,
        });

        let registrar = await this.getEthRegistrar();
        let tx = await registrar.transferFrom(this.accounts[0].getAddress(), this.new_owner, ethers.utils.id(this.label));
        this.wait(tx);
    }
}
cli.addPlugin("transfer", TransferPlugin);

/**
 *  To Do:
 *    register NAME --registrar
 *    set-reverse NAME
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
 */

cli.run(process.argv.slice(2))
