/* istanbul ignore file */

"use strict";

import fs from "fs";
import { basename } from "path";

import { ethers } from "ethers";
import * as scrypt from "scrypt-js";

import { getChoice, getPassword, getProgressBar } from "./prompt";

import { version } from "./_version";

const logger = new ethers.utils.Logger(version);

class UsageError extends Error { }


/////////////////////////////
// Signer

/*
const signerStates = new WeakMap();

class SignerState {
    signerFunc: () => Promise<ethers.Signer>;
    signer: ethers.Signer;
    alwaysAllow: boolean;

    static get(wrapper: WrappedSigner): SignerState {
        return signerStates.get(wrapper);
    }
}
*/
const signerFuncs = new WeakMap();
const signers = new WeakMap();
const alwaysAllow = new WeakMap();

// Gets a signer or lazily request it if needed, possibly asking for a password
// to decrypt a JSON wallet
async function getSigner(wrapper: WrappedSigner): Promise<ethers.Signer> {
    if (!signers.has(wrapper)) {
        let signerFunc: () => Promise<ethers.Signer> = signerFuncs.get(wrapper);
        let signer = await signerFunc();
        signers.set(wrapper, signer);
    }
    return signers.get(wrapper);
}

// Throws an error if the user does not allow the operation. If "y" is
// selected, all future operations of that type are automatically accepted
async function isAllowed(wrapper: WrappedSigner, message: string): Promise<boolean> {
    if (wrapper.plugin.yes) {
        console.log(message + " (--yes => \"y\")");
        return true;
    }

    let allowed = alwaysAllow.get(wrapper) || { };
    if (allowed[message]) {
        console.log(message + " (previous (a)ll => \"y\")");
        return true;
    }

    try {
        let allow = await getChoice(message, "yna", "n");
        if (allow === "a") {
            allowed[message] = true;
            alwaysAllow.set(wrapper, allowed);
        } else if (allow === "n") {
            throw new Error("Cancelled.");
        }
    } catch (error) {
        throw new Error("Cancelled.");
    }

    return true;
}

function repeat(chr: string, length: number): string {
    let result = chr;
    while (result.length < length) { result += result; }
    return result.substring(0, length);
}

// @TODO: Make dump recursable for objects

// Dumps key/value pairs in a nice format
export function dump(header: string, info: any): void {
    console.log(header);
    let maxLength = Object.keys(info).reduce((maxLength, i) => Math.max(maxLength, i.length), 0);
    for (let key in info) {
        let value = info[key];
        if (Array.isArray(value)) {
            console.log("  " + key + ":");
            value.forEach((value) => {
                console.log("    " + value);
            });
        } else {
            console.log("  " + key + ":" + repeat(" ", maxLength - key.length) + "  " + info[key]);
        }
    }
}

// This wraps our signers to prevent the private keys and mnemonics from being exposed.
// It is also in charge of user-interaction, requesting permission before signing or
// sending.
class WrappedSigner extends ethers.Signer {
    readonly addressPromise: Promise<string>;
    readonly provider: ethers.providers.Provider;
    readonly plugin: Plugin;

    constructor(addressPromise: Promise<string>, signerFunc: () => Promise<ethers.Signer>, plugin: Plugin) {
        super();
        signerFuncs.set(this, signerFunc);
        ethers.utils.defineReadOnly(this, "addressPromise", addressPromise);
        ethers.utils.defineReadOnly(this, "provider", plugin.provider);
        ethers.utils.defineReadOnly(this, "plugin", plugin);
    }

    connect(provider?: ethers.providers.Provider): ethers.Signer {
        throw new Error("unsupported for now...");
        //return new WrappedSigner(this.addressPromise, () => getSigner(this).then((s) => s.connect(provider)), provider);
    }

    async getAddress(): Promise<string> {
        return this.addressPromise;
    }

    async signMessage(message: string | ethers.utils.Bytes): Promise<string> {
        let signer = await getSigner(this);

        let info: any = { };
        if (typeof(message) === "string") {
            info["Message"] = JSON.stringify(message);
            info["Message (hex)"] = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));
        } else {
            let bytes = ethers.utils.arrayify(message);
            for (let i = 0; i < bytes.length; i++) {
                let c = bytes[i];
                if (c < 32 || c > 126) {
                    bytes = null;
                    break;
                }
            }
            if (bytes) {
                info["Message"] = ethers.utils.toUtf8String(bytes);
            }
            info["Message (hex)"] = ethers.utils.hexlify(message);
        }

        dump("Message:", info);

        await isAllowed(this, "Sign Message?");

        let result = await signer.signMessage(message)

        let signature = ethers.utils.splitSignature(result);
        dump("Signature", {
            Flat: result,
            r: signature.r,
            s: signature.s,
            vs: signature._vs,
            v: signature.v,
            recid: signature.recoveryParam,
        });

        return result;
    }

    async populateTransaction(transactionRequest: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionRequest> {
        transactionRequest = ethers.utils.shallowCopy(transactionRequest);

        if (this.plugin.gasPrice != null) {
            transactionRequest.gasPrice = this.plugin.gasPrice;
        }

        if (this.plugin.gasLimit != null) {
            transactionRequest.gasLimit = this.plugin.gasLimit;
        }

        if (this.plugin.nonce != null) {
            transactionRequest.nonce = this.plugin.nonce;
        }

        let signer = await getSigner(this);
        return signer.populateTransaction(transactionRequest);
    }

    async signTransaction(transactionRequest: ethers.providers.TransactionRequest): Promise<string> {
        let signer = await getSigner(this);

        let network = await this.provider.getNetwork();

        let tx = await ethers.utils.resolveProperties(transactionRequest);

        let info: any = { };
        if (tx.to != null) { info["To"] = tx.to; }
        if (tx.from != null) { info["From"] = tx.from; }
        info["Value"] = (ethers.utils.formatEther(tx.value || 0) + " ether");
        if (tx.nonce != null) { info["Nonce"] = tx.nonce; }
        info["Data"] = tx.data;
        info["Gas Limit"] = ethers.BigNumber.from(tx.gasLimit || 0).toString();
        info["Gas Price"] = (ethers.utils.formatUnits(tx.gasPrice || 0, "gwei") + " gwei"),
        info["Chain ID"] = (tx.chainId || 0);
        info["Network"] = network.name;

        dump("Transaction:", info);

        await isAllowed(this, "Sign Transaction?");

        let result = await signer.signTransaction(transactionRequest);

        let signature = ethers.utils.splitSignature(result);
        dump("Signature:", {
            Signature: result,
            r: signature.r,
            s: signature.s,
            vs: signature._vs,
            v: signature.v,
            recid: signature.recoveryParam,
        });

        return result;
    }

    async sendTransaction(transactionRequest: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse> {
        let signer = await getSigner(this);

        let network = await this.provider.getNetwork();

        let tx: any = await this.populateTransaction(transactionRequest);
        tx = await ethers.utils.resolveProperties(tx);

        let info: any = { };
        if (tx.to != null) { info["To"] = tx.to; }
        if (tx.from != null) { info["From"] = tx.from; }
        info["Value"] = (ethers.utils.formatEther(tx.value || 0) + " ether");
        if (tx.nonce != null) { info["Nonce"] = tx.nonce; }
        info["Data"] = tx.data;
        info["Gas Limit"] = ethers.BigNumber.from(tx.gasLimit || 0).toString();
        info["Gas Price"] = (ethers.utils.formatUnits(tx.gasPrice || 0, "gwei") + " gwei"),
        info["Chain ID"] = (tx.chainId || 0);
        info["Network"] = network.name;

        dump("Transaction:", info);

        await isAllowed(this, "Send Transaction?");

        let response = await signer.sendTransaction(tx);

        dump("Response:", {
            "Hash": response.hash
        });

        if (this.plugin.wait) {
            try {
                let receipt = await response.wait();
                dump("Success:", {
                    "Block Number": receipt.blockNumber,
                    "Block Hash": receipt.blockHash,
                    "Gas Used": ethers.utils.commify(receipt.gasUsed.toString()),
                    "Fee": (ethers.utils.formatEther(receipt.gasUsed.mul(tx.gasPrice)) + " ether")
                });
            } catch (error) {
                dump("Failed:", {
                    "Error": error.message
                });
            }
        }

        return response;
    }

    async unlock(): Promise<void> {
        await getSigner(this);
    }
}

class OfflineProvider extends ethers.providers.BaseProvider {
    perform(method: string, params: any): Promise<any> {
        if (method === "sendTransaction") {
            console.log("Signed Transaction:");
            console.log(params.signedTransaction);
            return Promise.resolve(ethers.utils.keccak256(params.signedTransaction));
        }
        return super.perform(method, params);
    }
}

/////////////////////////////
// Argument Parser

export class ArgParser {
    readonly _args: Array<string>
    readonly _consumed: Array<boolean>

    constructor(args: Array<string>) {
        ethers.utils.defineReadOnly(this, "_args", args);
        ethers.utils.defineReadOnly(this, "_consumed", args.map((a) => false));
    }

    _finalizeArgs(): Array<string> {
        let args = [ ];
        for (let i = 0; i < this._args.length; i++) {
            if (this._consumed[i]) { continue; }

            let arg = this._args[i];

            // Escaped args, add the rest as args
            if (arg === "--") {
               for (let j = i + 1; j < this._args.length; j++) {
                   args.push(this._args[j]);
               }
               break;
            }

            if (arg.substring(0, 2) === "--") {
                throw new UsageError(`unexpected option ${arg}`);
            }

            args.push(arg);
        }
        return args;
    }

    _checkCommandIndex() {
        for (let i = 0; i < this._args.length; i++) {
            if (this._consumed[i]) { continue; }
            return i;
        }
        return -1;
    }

    consumeFlag(name: string): boolean {
        let count = 0;
        for (let i = 0; i < this._args.length; i++) {
            let arg = this._args[i];
            if (arg === "--") { break; }
            if (arg === ("--" + name)) {
                count++;
                this._consumed[i] = true;
            }
        }

        if (count > 1) {
            throw new UsageError("expected at most one --${name}");
        }

        return (count === 1);
    }

    consumeMultiOptions(names: Array<string>): Array<{ name: string, value: string }> {
        let result: Array<{ name: string, value: string }> = [ ];

        if (typeof(names) === "string") { names = [ names ]; }

        for (let i = 0; i < this._args.length; i++) {
            let arg = this._args[i];
            if (arg === "--") { break; }
            if (arg.substring(0, 2) === "--") {
                let name = arg.substring(2);
                let index = names.indexOf(name);
                if (index < 0) { continue; }

                if (this._args.length === i) {
                    throw new UsageError("missing argument for --${name}");
                }
                this._consumed[i] = true;
                result.push({ name: name, value: this._args[++i] });
                this._consumed[i] = true;
            }
        }

        return result;
    }

    consumeOptions(name: string): Array<string> {
        return this.consumeMultiOptions([ name ]).map((o) => o.value);
    }

    consumeOption(name: string): string {
        let options = this.consumeOptions(name);
        if (options.length > 1) {
            throw new UsageError(`expected at most one --${name}`);
        }
        return (options.length ? options[0]: null);
    }
}

// Accepts:
//   - "-" which indicates to read from the terminal using prompt (which can then be any of the below)
//   - JSON Wallet filename (which will require a password to unlock)
//   - raw private key
//   - mnemonic
async function loadAccount(arg: string, plugin: Plugin, preventFile?: boolean): Promise<WrappedSigner> {

    // Secure entry; use prompt with mask
    if (arg === "-") {
        const content = await getPassword("Private Key / Mnemonic: ");
        return loadAccount(content, plugin, true);
    }

    // Raw private key
    if (ethers.utils.isHexString(arg, 32)) {
         const signer = new ethers.Wallet(arg, plugin.provider);
         return Promise.resolve(new WrappedSigner(signer.getAddress(), () => Promise.resolve(signer), plugin));
    }

    // Mnemonic
    if (ethers.utils.isValidMnemonic(arg)) {
        const mnemonic = arg;
        let signerPromise: Promise<ethers.Wallet> = null;
        if (plugin.mnemonicPassword) {
            signerPromise = getPassword("Password (mnemonic): ").then((password) => {
                let node = ethers.utils.HDNode.fromMnemonic(mnemonic, password).derivePath(plugin.mnemonicPath);
                return new ethers.Wallet(node.privateKey, plugin.provider);
            });

        } else if (plugin._xxxMnemonicPasswordHard) {
            signerPromise = getPassword("Password (mnemonic; experimental - hard): ").then((password) => {
                let passwordBytes = ethers.utils.toUtf8Bytes(password, ethers.utils.UnicodeNormalizationForm.NFKC);
                let saltBytes = ethers.utils.arrayify(ethers.utils.HDNode.fromMnemonic(mnemonic).privateKey);

                let progressBar = getProgressBar("Decrypting");
                return scrypt.scrypt(passwordBytes, saltBytes, (1 << 20), 8, 1, 32, progressBar).then((key) => {
                    const derivedPassword = ethers.utils.hexlify(key).substring(2);
                    const node = ethers.utils.HDNode.fromMnemonic(mnemonic, derivedPassword).derivePath(plugin.mnemonicPath);
                    return new ethers.Wallet(node.privateKey, plugin.provider);
                });
            });

        } else {
            signerPromise = Promise.resolve(ethers.Wallet.fromMnemonic(arg).connect(plugin.provider));
        }

        return Promise.resolve(new WrappedSigner(
             signerPromise.then((wallet) => wallet.getAddress()),
             () => signerPromise,
             plugin
        ));
    }

    // Check for a JSON wallet
    try {
        let content = fs.readFileSync(arg).toString();

        let address = ethers.utils.getJsonWalletAddress(content);
        if (address) {
            return Promise.resolve(new WrappedSigner(
                Promise.resolve(address),
                async (): Promise<ethers.Signer> => {
                    let password = await getPassword(`Password (${arg}): `);

                    let progressBar = getProgressBar("Decrypting");
                    return ethers.Wallet.fromEncryptedJson(content, password, progressBar).then((wallet) => {
                        return wallet.connect(plugin.provider);
                    });
                },
                plugin));
        } else {
            return loadAccount(content.trim(), plugin, true);
        }

    } catch (error) {
        if (error.message === "cancelled") {
            throw new Error("Cancelled.");
        } else if (error.message === "wrong password") {
            throw new Error("Incorrect password.");
        }
    }

    throw new UsageError("unknown account option - [REDACTED]");
    return null;
}


/////////////////////////////
// Plugin Class

export interface Help {
    name: string;
    help: string;
}

export interface PluginType {
    new(...args: any[]): Plugin;
    getHelp?: () => Help;
    getOptionHelp?: () => Array<Help>;
}

export abstract class Plugin {
    network: ethers.providers.Network;
    provider: ethers.providers.Provider;

    accounts: ReadonlyArray<WrappedSigner>;
    mnemonicPassword: boolean;
    mnemonicPath: string;
    _xxxMnemonicPasswordHard: boolean;

    gasLimit: ethers.BigNumber;
    gasPrice: ethers.BigNumber;
    nonce: number;
    yes: boolean;
    wait: boolean;

    constructor() {
    }

    static getHelp(): Help {
        return null;
    }

    static getOptionHelp(): Array<Help> {
        return [ ];
    }

    async prepareOptions(argParser: ArgParser, verifyOnly?: boolean): Promise<void> {
        let runners: Array<Promise<void>> = [ ];

        this.wait = argParser.consumeFlag("wait");
        this.yes = argParser.consumeFlag("yes");

        /////////////////////
        // Provider

        let network = (argParser.consumeOption("network") || "homestead");
        let providers: Array<ethers.providers.BaseProvider> = [ ];

        let rpc: Array<ethers.providers.JsonRpcProvider> = [ ];
        argParser.consumeOptions("rpc").forEach((url) => {
            let provider = new ethers.providers.JsonRpcProvider(url)
            providers.push(provider);
            rpc.push(provider);
        });

        if (argParser.consumeFlag("alchemy")) {
            providers.push(new ethers.providers.AlchemyProvider(network));
        }

        if (argParser.consumeFlag("etherscan")) {
            providers.push(new ethers.providers.EtherscanProvider(network));
        }

        if (argParser.consumeFlag("infura")) {
            providers.push(new ethers.providers.InfuraProvider(network));
        }

        if (argParser.consumeFlag("nodesmith")) {
            providers.push(new ethers.providers.NodesmithProvider(network));
        }

        if (argParser.consumeFlag("offline")) {
            providers.push(new OfflineProvider(network));
        }

        if (providers.length === 1) {
            ethers.utils.defineReadOnly(this, "provider", providers[0]);
        } else if (providers.length) {
            ethers.utils.defineReadOnly(this, "provider", new ethers.providers.FallbackProvider(providers));
        } else {
            ethers.utils.defineReadOnly(this, "provider", ethers.getDefaultProvider(network));
        }


        /////////////////////
        // Accounts

        ethers.utils.defineReadOnly(this, "mnemonicPassword", argParser.consumeFlag("mnemonic-password"));

        ethers.utils.defineReadOnly(this, "mnemonicPath", (function() {
            let mnemonicPath = argParser.consumeOption("mnemonic-path");
            if (mnemonicPath) {
                if (mnemonicPath.match(/^[0-9]+$/)) {
                    return `m/44'/60'/${ mnemonicPath }'/0/0`;
                }
                return mnemonicPath;
            }
            return ethers.utils.defaultPath;
        })());

        ethers.utils.defineReadOnly(this, "_xxxMnemonicPasswordHard", argParser.consumeFlag("xxx-mnemonic-password"));

        let accounts: Array<WrappedSigner> = [ ];

        let accountOptions = argParser.consumeMultiOptions([ "account", "account-rpc", "account-void" ]);
        for (let i = 0; i < accountOptions.length; i++) {
            let account = accountOptions[i];
            switch (account.name) {
                case "account":
                    // Verifying does not need to ask for passwords, etc.
                    if (verifyOnly) { break; }
                    let wrappedSigner = await loadAccount(account.value, this);
                    accounts.push(wrappedSigner);
                    break;

                case "account-rpc":
                    if (rpc.length !== 1) {
                        this.throwUsageError("--account-rpc requires exactly one JSON-RPC provider");
                    }

                    try {
                        let signer: ethers.providers.JsonRpcSigner = null;
                        if (account.value.match(/^[0-9]+$/)) {
                            signer = rpc[0].getSigner(parseInt(account.value));
                        } else {
                            signer = rpc[0].getSigner(ethers.utils.getAddress(account.value));
                        }
                        accounts.push(new WrappedSigner(signer.getAddress(), () => Promise.resolve(signer), this));
                    } catch (error) {
                        this.throwUsageError("invalid --account-rpc - " + account.value);
                    }
                    break;

                case "account-void": {
                    let addressPromise = this.provider.resolveName(account.value);
                    let signerPromise = addressPromise.then((addr) => {
                        return new ethers.VoidSigner(addr, this.provider);
                    });
                    accounts.push(new WrappedSigner(addressPromise, () => signerPromise, this));
                    break;
                }
            }
        }

        ethers.utils.defineReadOnly(this, "accounts", Object.freeze(accounts));


        /////////////////////
        // Transaction Options

        const gasPrice = argParser.consumeOption("gas-price");
        if (gasPrice) {
            ethers.utils.defineReadOnly(this, "gasPrice", ethers.utils.parseUnits(gasPrice, "gwei"));
        } else {
            ethers.utils.defineReadOnly(this, "gasPrice", null);
        }

        const gasLimit = argParser.consumeOption("gas-limit");
        if (gasLimit) {
            ethers.utils.defineReadOnly(this, "gasLimit", ethers.BigNumber.from(gasLimit));
        } else {
            ethers.utils.defineReadOnly(this, "gasLimit", null);
        }

        const nonce = argParser.consumeOption("nonce");
        if (nonce) {
            this.nonce = ethers.BigNumber.from(nonce).toNumber();
        }


        // Now wait for all asynchronous options to load

        runners.push(this.provider.getNetwork().then((network) => {
            ethers.utils.defineReadOnly(this, "network", Object.freeze(network));
        }, (error) => {
            ethers.utils.defineReadOnly(this, "network", Object.freeze({
                chainId: 0,
                name: "no-network"
            }));
        }));

        try {
            await Promise.all(runners)
        } catch (error) {
            this.throwError(error);
        }
    }

    prepareArgs(args: Array<string>): Promise<void> {
        return Promise.resolve(null);
    }

    run(): Promise<void> {
        return null;
    }

    getAddress(addressOrName: string, message?: string, allowZero?: boolean): Promise<string> {
        try {
            return Promise.resolve(ethers.utils.getAddress(addressOrName));
        } catch (error) { }

        return this.provider.resolveName(addressOrName).then((address) => {
            if (address == null) {
                this.throwError("ENS name not configured - " + addressOrName);
            }

            if (address === ethers.constants.AddressZero && !allowZero) {
                this.throwError(message || "cannot use the zero address");
            }

            return address;
        });
    }

    // Dumps formatted data
    dump(header: string, info: any): void {
        dump(header, info);
    }

    // Throwing a UsageError causes the --help to be shown above
    // the error.message
    throwUsageError(message?: string): never {
        throw new UsageError(message);
    }

    // Shows error.message
    throwError(message: string): never {
        throw new Error(message);
    }
}

class CheckPlugin extends Plugin {
    prepareOptions(argParser: ArgParser, verifyOnly?: boolean): Promise<void> {
        return super.prepareOptions(argParser, true);
    }
}


/////////////////////////////
// Command Line Runner

export type Options = {
    account?: boolean;
    provider?: boolean;
    transaction?: boolean;
    version?: string;
};

export class CLI {
    readonly defaultCommand: string;
    readonly plugins: { [ command: string ]: PluginType };
    readonly standAlone: PluginType;
    readonly options: Options;

    constructor(defaultCommand?: string, options?: Options) {
        ethers.utils.defineReadOnly(this, "options", {
            account: true,
            provider: true,
            transaction: true,
            version: version.split("/").pop(),
        });

        if (options) {
            ["account", "provider", "transaction"].forEach((key) => {
                if ((<any>options)[key] == null) { return; }
                (<any>(this.options))[key] = !!((<any>options)[key]);
            });

            ["version"].forEach((key) => {
                if ((<any>options)[key] == null) { return; }
                (<any>(this.options))[key] = (<any>options)[key];
            });
        }
        Object.freeze(this.options);

        ethers.utils.defineReadOnly(this, "defaultCommand", defaultCommand || null);
        ethers.utils.defineReadOnly(this, "plugins", { });
    }

    static getAppName(): string {
        try {
            return basename(process.mainModule.filename).split(".")[0];
        } catch (error) { }
        return "ethers";
    }

    // @TODO: Better way to specify default; i.e. may not have args

    addPlugin(command: string, plugin: PluginType) {
        if (this.standAlone) {
            logger.throwError("only setPlugin or addPlugin may be used at once", ethers.errors.UNSUPPORTED_OPERATION, {
                operation: "addPlugin"
            });
        } else if (this.plugins[command]) {
            logger.throwError("command already exists", ethers.errors.UNSUPPORTED_OPERATION, {
                operation: "addPlugin",
                command: command
            });
        }
        ethers.utils.defineReadOnly(this.plugins, command, plugin);
    }

    setPlugin(plugin: PluginType) {
        if (Object.keys(this.plugins).length !== 0) {
            logger.throwError("only setPlugin or addPlugin may be used at once", ethers.errors.UNSUPPORTED_OPERATION, {
                operation: "setPlugin"
            });
        }
        if (this.standAlone) {
            logger.throwError("cannot setPlugin more than once", ethers.errors.UNSUPPORTED_OPERATION, {
                operation: "setPlugin"
            });
        }
        ethers.utils.defineReadOnly(this, "standAlone", plugin);
    }

    showUsage(message?: string, status?: number): never {
        // Limit:    |                                                                             |
        console.log("Usage:");

        if (this.standAlone) {
            let help = ethers.utils.getStatic<() => Help>(this.standAlone, "getHelp")();
            console.log(`   ${ CLI.getAppName() } ${ help.name } [ OPTIONS ]`);
            console.log("");

            let lines: Array<string> = [];
            let optionHelp = ethers.utils.getStatic<() => Array<Help>>(this.standAlone, "getOptionHelp")();
            optionHelp.forEach((help) => {
                lines.push("  " + help.name + repeat(" ", 28 - help.name.length) + help.help);
            });

            if (lines.length) {
                console.log("OPTIONS");
                lines.forEach((line) => {
                    console.log(line);
                });
                console.log("");
            }
        } else {

            if (this.defaultCommand) {
                console.log(`   ${ CLI.getAppName() } [ COMMAND ] [ ARGS ] [ OPTIONS ]`);
                console.log("");
            } else {
                console.log(`   ${ CLI.getAppName() } COMMAND [ ARGS ] [ OPTIONS ]`);
                console.log("");
            }

            let lines: Array<string> = [];
            for (let cmd in this.plugins) {
                let plugin = this.plugins[cmd];
                let help = ethers.utils.getStatic<() => Help>(plugin, "getHelp")();
                if (help == null) { continue; }
                let helpLine = "   " + help.name;
                if (helpLine.length > 28) {
                    lines.push(helpLine);
                    lines.push(repeat(" ", 30) + help.help);
                } else {
                    helpLine += repeat(" ", 30 - helpLine.length);
                    lines.push(helpLine + help.help);
                }

                let optionHelp = ethers.utils.getStatic<() => Array<Help>>(plugin, "getOptionHelp")();
                optionHelp.forEach((help) => {
                    lines.push("      " + help.name + repeat(" ", 27 - help.name.length) + help.help);
                });
            }

            if (lines.length) {
                if (this.defaultCommand) {
                    console.log(`COMMANDS (default: ${ this.defaultCommand })`);
                } else {
                    console.log("COMMANDS");
                }

                lines.forEach((line) => {
                    console.log(line);
                });
                console.log("");
            }
        }

        if (this.options.account) {
            console.log("ACCOUNT OPTIONS");
            console.log("  --account FILENAME          Load from a file (JSON, RAW or mnemonic)");
            console.log("  --account RAW_KEY           Use a private key (insecure *)");
            console.log("  --account 'MNEMONIC'        Use a mnemonic (insecure *)");
            console.log("  --account -                 Use secure entry for a raw key or mnemonic");
            console.log("  --account-void ADDRESS      Use an address as a void signer");
            console.log("  --account-void ENS_NAME     Add the resolved address as a void signer");
            console.log("  --account-rpc ADDRESS       Add the address from a JSON-RPC provider");
            console.log("  --account-rpc INDEX         Add the index from a JSON-RPC provider");
            console.log("  --mnemonic-password         Prompt for a password for mnemonics");
            console.log("  --mnemonic-path             BIP-43 mnemonic path");
            console.log("  --xxx-mnemonic-password     Prompt for a (experimental) hard password");
            console.log("");
        }

        if (this.options.provider) {
            console.log("PROVIDER OPTIONS (default: all + homestead)");
            console.log("  --alchemy                   Include Alchemy");
            console.log("  --etherscan                 Include Etherscan");
            console.log("  --infura                    Include INFURA");
            console.log("  --nodesmith                 Include nodesmith");
            console.log("  --rpc URL                   Include a custom JSON-RPC");
            console.log("  --offline                   Dump signed transactions (no send)");
            console.log("  --network NETWORK           Network to connect to (default: homestead)");
            console.log("");
        }

        if (this.options.transaction) {
            console.log("TRANSACTION OPTIONS (default: query network)");
            console.log("  --gasPrice GWEI             Default gas price for transactions(in wei)");
            console.log("  --gasLimit GAS              Default gas limit for transactions");
            console.log("  --nonce NONCE               Initial nonce for the first transaction");
            console.log("  --yes                       Always accept Signing and Sending");
            console.log("");
        }

        console.log("OTHER OPTIONS");
        if (this.options.transaction) {
            console.log("  --wait                      Wait until transactions are mined");
        }
        console.log("  --debug                     Show stack traces for errors");
        console.log("  --help                      Show this usage and exit");
        console.log("  --version                   Show this version and exit");
        console.log("");

        if (this.options.account) {
            console.log("(*) By including mnemonics or private keys on the command line they are");
            console.log("    possibly readable by other users on your system and may get stored in");
            console.log("    your bash history file. This is NOT recommended.");
            console.log("");
        }

        if (message) {
            console.log(message);
            console.log("");
        }

        process.exit(status || 0);
        throw new Error("never reached");
    }

    async run(args: Array<string>): Promise<void> {
        args = args.slice();

        if (this.defaultCommand && !this.plugins[this.defaultCommand]) {
            throw new Error("missing defaultCommand plugin");
        }

        let command: string = null;

        // We run a temporary argument parser to check for a command by processing standard options
        {
            let argParser = new ArgParser(args);

            let plugin = new CheckPlugin();
            await plugin.prepareOptions(argParser);

            // These are not part of the plugin
            [ "debug", "help", "version"].forEach((key) => {
                argParser.consumeFlag(key);
            });

            // Find the first unconsumed argument
            if (!this.standAlone) {
                let commandIndex = argParser._checkCommandIndex();
                if (commandIndex === -1) {
                    command = this.defaultCommand;
                } else {
                    command = args[commandIndex];
                    args.splice(commandIndex, 1);
                }
            }
        }

        // Reset the argument parser
        let argParser = new ArgParser(args);

        if (argParser.consumeFlag("version")) {
            console.log(CLI.getAppName() + "/" + this.options.version);
            return;
        }

        if (argParser.consumeFlag("help")) {
            return this.showUsage();
        }

        const debug = argParser.consumeFlag("debug");

        // Create Plug-in instance
        let plugin: Plugin = null;
        if (this.standAlone) {
            plugin = new this.standAlone;
        } else {
            try {
                plugin = new this.plugins[command]();
            } catch (error) {
                if (command) { this.showUsage("unknown command - " + command); }
                return this.showUsage("no command provided", 1);
            }
        }

        try {
            await plugin.prepareOptions(argParser);
            await plugin.prepareArgs(argParser._finalizeArgs());
            await plugin.run();

        } catch (error) {
            if (error instanceof UsageError) {
                return this.showUsage(error.message, 1);
            }

            if (debug) {
                console.log("----- <DEBUG> ------")
                console.log(error);
                console.log("----- </DEBUG> -----")
            }

            console.log("Error: " + error.message);
            process.exit(2);
        }
    }
}

