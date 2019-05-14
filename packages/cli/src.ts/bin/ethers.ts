#!/usr/bin/env node

"use strict";

import fs from "fs";
import REPL from "repl";
import util from "util";
import vm from "vm";

import { ethers } from "ethers";

import { ArgParser, CLI, dump, Help, Plugin } from "../cli";
import { getPassword, getProgressBar } from "../prompt";
import { compile } from "../solc";

function setupContext(context: any, plugin: Plugin) {

    context.provider = plugin.provider;
    context.accounts = plugin.accounts;

    if (!context.console) { context.console = console; }
    if (!context.require) { context.require = require; }
    if (!context.process) { context.process = process; }

    context.ethers = ethers;
    context.version = ethers.version;

    context.Contract = ethers.Contract;
    context.ContractFactory = ethers.ContractFactory;
    context.Wallet = ethers.Wallet;

    context.providers = ethers.providers;
    context.utils = ethers.utils;

    context.abiCoder = ethers.utils.defaultAbiCoder;

    context.BN = ethers.BigNumber;
    context.BigNumber = ethers.BigNumber;
    context.FixedNumber = ethers.FixedNumber;

    context.getAddress = ethers.utils.getAddress;
    context.getContractAddress = ethers.utils.getContractAddress;
    context.getIcapAddress = ethers.utils.getIcapAddress;

    context.arrayify = ethers.utils.arrayify;
    context.hexlify = ethers.utils.hexlify;

    context.joinSignature = ethers.utils.joinSignature;
    context.splitSignature = ethers.utils.splitSignature;

    context.id = ethers.utils.id;
    context.keccak256 = ethers.utils.keccak256;
    context.namehash = ethers.utils.namehash;
    context.sha256 = ethers.utils.sha256;

    context.parseEther = ethers.utils.parseEther;
    context.parseUnits = ethers.utils.parseUnits;
    context.formatEther = ethers.utils.formatEther;
    context.formatUnits = ethers.utils.formatUnits;

    context.randomBytes = ethers.utils.randomBytes;
    context.constants = ethers.constants;

    context.parseTransaction = ethers.utils.parseTransaction;
    context.serializeTransaction = ethers.utils.serializeTransaction;

    context.toUtf8Bytes = ethers.utils.toUtf8Bytes;
    context.toUtf8String = ethers.utils.toUtf8String;
}


const cli = new CLI("sandbox");

class SandboxPlugin extends Plugin {
    static getHelp(): Help {
        return {
            name: "sandbox",
            help: "Run a REPL VM environment with ethers"
        }
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 0) {
            this.throwUsageError("Unexpected argument - " + JSON.stringify(args[0]));
        }

        for (let i = 0; i < this.accounts.length; i++) {
            await this.accounts[i].unlock();
        }
    }

    run(): Promise<void> {
        console.log("network: " + this.network.name + " (chainId: " + this.network.chainId + ")");

        let nextPromiseId = 0;
        function promiseWriter(output: any): string {
            if (output instanceof Promise) {
                repl.context._p = output;
                let promiseId = nextPromiseId++;
                output.then((result) => {
                    console.log(`\n<Promise id=${promiseId} resolved>`);
                    console.log(util.inspect(result));
                    repl.context._r = result;
                    repl.displayPrompt(true)
                }, (error) => {
                    console.log(`\n<Promise id=${promiseId} rejected>`);
                    console.log(util.inspect(error));
                    repl.displayPrompt(true)
                });
                return `<Promise id=${promiseId} pending>`;
            }
            return util.inspect(output);
        }

        let repl = REPL.start({
            input: process.stdin,
            output: process.stdout,
            prompt: (this.provider ? this.network.name: "no-network") + "> ",
            writer: promiseWriter
        });
        setupContext(repl.context, this);

        return new Promise((resolve) => {
            repl.on("exit", function() {
                console.log("");
                resolve(null);
            });
        });
    }
}
cli.addPlugin("sandbox", SandboxPlugin);


class InitPlugin extends Plugin {
    filename: string;
    force: boolean;

    static getHelp(): Help {
        return {
           name: "init FILENAME",
           help: "Create a new JSON wallet"
        }
    }

    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "[ --force ]",
                help: "Overwrite any existing files"
            }
        ];
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);
        this.force = argParser.consumeFlag("force");
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args)

        if (args.length !== 1) {
            this.throwUsageError("init requires FILENAME");
        }

        this.filename = args[0];
    }

    async run(): Promise<void> {
        if (!this.force && fs.existsSync(this.filename)) {
            this.throwError('File already exists (use --force to overwrite)');
        }

        console.log("Creating a new JSON Wallet - " + this.filename);
        console.log('Keep this password and file SAFE!! If lost or forgotten');
        console.log('it CANNOT be recovered, by ANYone, EVER.');

        let password = await getPassword("Choose a password: ");
        let confirm = await getPassword("Confirm password: ");
        if (password !== confirm) {
            this.throwError("Passwords do not match");
        }

        let wallet = ethers.Wallet.createRandom();

        let progressBar = await getProgressBar("Encrypting");
        let json = await wallet.encrypt(password, { }, progressBar);

        try {
            if (this.force) {
                fs.writeFileSync(this.filename, json);
            } else {
                fs.writeFileSync(this.filename, json, { flag: 'wx' });
            }
            console.log('New account address: ' + wallet.address);
            console.log('Saved:               ' + this.filename);
        } catch (error) {
            if (error.code === 'EEXIST') {
                this.throwError('File already exists (use --force to overwrite)');
            }
            this.throwError('Unknown Error: ' + error.message);
        }
    }
}
cli.addPlugin("init", InitPlugin);


class FundPlugin extends Plugin {
    toAddress: string;

    static getHelp(): Help {
        return {
           name: "fund TARGET",
           help: "Fund TARGET with testnet ether"
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (this.network.name !== "ropsten") {
            this.throwError("Funding requires --network ropsten");
        }

        if (args.length !== 1) {
            this.throwUsageError("fund requires ADDRESS");
        }

        this.toAddress = await this.getAddress(args[0], "Cannot fund ZERO address", false);
    }

    async run(): Promise<void> {
        let url = "https:/" + "/api.ethers.io/api/v1/?action=fundAccount&address=" + this.toAddress.toLowerCase();
        return ethers.utils.fetchJson(url).then((data) => {
            console.log("Transaction Hash: " + data.hash);
        });
    }
}
cli.addPlugin("fund", FundPlugin);


class InfoPlugin extends Plugin {
    queries: Array<string>;
    addresses: Array<string>;

    static getHelp(): Help {
        return {
           name: "info [ TARGET ... ]",
           help: "Dump info for accounts, addresses and ENS names"
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        this.queries = [ ];
        let runners: Array<Promise<string>> = [];

        this.accounts.forEach((account, index) => {
            this.queries.push(`Account #${index}`);
            runners.push(account.getAddress());
        });

        args.forEach((arg) => {
            if (ethers.utils.isAddress(arg)) {
                this.queries.push(`Address: ${arg}`);
            } else {
                this.queries.push(`ENS Name: ${arg}`);
            }
            runners.push(this.provider.resolveName(arg));
        })

        this.addresses = await Promise.all(runners);
    }

    async run(): Promise<void> {
        for (let i = 0; i < this.addresses.length; i++) {
            let address = this.addresses[i];
            let { balance, nonce, code, reverse } = await ethers.utils.resolveProperties({
                balance: this.provider.getBalance(address),
                nonce: this.provider.getTransactionCount(address),
                code: this.provider.getCode(address),
                reverse: this.provider.lookupAddress(address)
            });

            let info: any = {
                "Address": address,
                "Balance": (ethers.utils.formatEther(balance) + " ether"),
                "Transaction Count": nonce
            }

            if (code != "0x") {
                info["Code"] = code;
            }

            if (reverse) {
                info["Reverse Lookup"] = reverse;
            }

            dump(this.queries[i], info);
        }
    }
}
cli.addPlugin("info", InfoPlugin);


class SendPlugin extends Plugin {
    toAddress: string;
    value: ethers.BigNumber;
    allowZero: boolean;

    static getHelp(): Help {
        return {
           name: "send TARGET ETHER",
           help: "Send ETHER ether to TARGET form accounts[0]"
        }
    }

    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "[ --allow-zero ]",
                help: "Allow sending to the address zero"
            }
        ];
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        if (this.accounts.length !== 1) {
            this.throwUsageError("send requires exacly one account");
        }

        this.allowZero = argParser.consumeFlag("allow-zero");
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 2) {
            this.throwUsageError("send requires exactly ADDRESS and AMOUNT");
        }

        this.toAddress = await this.getAddress(args[0], "Cannot send to the zero address (use --allow-zero to override)", this.allowZero);
        this.value = ethers.utils.parseEther(args[1]);
    }

    async run(): Promise<void> {
        await this.accounts[0].sendTransaction({
            to: this.toAddress,
            value: this.value
        });;
    }
}
cli.addPlugin("send", SendPlugin);


class SweepPlugin extends Plugin {
    toAddress: string;

    static getHelp(): Help {
        return {
           name: "sweep TARGET",
           help: "Send all ether from accounts[0] to TARGET"
        }
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        if (this.accounts.length !== 1) {
            this.throwUsageError("sweep requires exacly one account");
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 1) {
            this.throwUsageError("sweep requires exactly ADDRESS");
        }

        this.toAddress = await this.getAddress(args[0]);;
    }

    async run(): Promise<void> {

        let { balance, gasPrice, code } = await ethers.utils.resolveProperties({
            balance: this.provider.getBalance(this.accounts[0].getAddress()),
            gasPrice: (this.gasPrice || this.provider.getGasPrice()),
            code: this.provider.getCode(this.toAddress)
        });

        if (code !== "0x") {
            this.throwError("Cannot sweep to a contract address");
        }

        let maxSpendable = balance.sub(gasPrice.mul(21000));
        if (maxSpendable.lte(0)) {
            this.throwError("Insufficient funds to sweep");
        }

        await this.accounts[0].sendTransaction({
            to: this.toAddress,
            gasLimit: 21000,
            gasPrice: gasPrice,
            value: maxSpendable
        });
    }
}
cli.addPlugin("sweep", SweepPlugin);


class SignMessagePlugin extends Plugin {
    message: string;
    hex: boolean;

    static getHelp(): Help {
        return {
           name: "sign-message MESSAGE",
           help: "Sign a MESSAGE with accounts[0]"
        }
    }

    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "[ --hex ]",
                help: "The message content is hex encoded"
            }
        ];
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);
        if (this.accounts.length !== 1) {
            this.throwError("sign-message requires exacly one account");
        }
        this.hex = argParser.consumeFlag("hex");
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 1) {
            this.throwError("send requires exactly MESSAGE");
        }

        this.message = args[0];
    }

    async run(): Promise<void> {
        await this.accounts[0].signMessage(this.message);
    }
}
cli.addPlugin("sign-message", SignMessagePlugin);


class EvalPlugin extends Plugin {
    code: string;

    static getHelp(): Help {
        return {
           name: "eval CODE",
           help: "Run CODE in a VM with ethers"
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 1) {
            this.throwError("eval requires exactly CODE");
        }

        this.code = args[0];
    }

    async run(): Promise<void> {
        let contextObject = { };
        setupContext(contextObject, this);

        let context = vm.createContext(contextObject);
        let script = new vm.Script(this.code, { filename: "-" });

        let result = script.runInContext(context);
        if (result instanceof Promise) {
            result = await result;
        }

        console.log(result);
    }
}
cli.addPlugin("eval", EvalPlugin);


class RunPlugin extends Plugin {
    filename: string;

    static getHelp(): Help {
        return {
           name: "run FILENAME",
           help: "Run FILENAME in a VM with ethers"
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 1) {
            this.throwError("run requires exactly FILENAME");
        }

        this.filename = args[0];
    }

    async run(): Promise<void> {
        let contextObject = { };
        setupContext(contextObject, this);

        let context = vm.createContext(contextObject);
        let script = new vm.Script(fs.readFileSync(this.filename).toString(), { filename: this.filename });

        let result = script.runInContext(context);
        if (result instanceof Promise) {
            result = await result;
        }

        console.log(result);
    }
}
cli.addPlugin("run", RunPlugin);


class WaitPlugin extends Plugin {
    hash: string;

    static getHelp(): Help {
        return {
           name: "wait HASH",
           help: "Wait for a transaction HASH to be mined"
        }
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 1) {
            this.throwError("wait requires exactly HASH");
        }

        this.hash = args[0];
    }

    async run(): Promise<void> {
        console.log("Waiting for Transaction:", this.hash);

        let receipt = await this.provider.waitForTransaction(this.hash);
        dump("Response:", {
            "Block": receipt.blockNumber,
            "Block Hash": receipt.blockHash,
            "Status": (receipt.status ? "ok": "failed")
        });
    }
}
cli.addPlugin("wait", WaitPlugin);


class CompilePlugin extends Plugin {
    filename: string;
    noOptimize: boolean;
    warnings: boolean;

    static getHelp(): Help {
        return {
           name: "compile FILENAME",
           help: "Compiles a Solidity contract"
        }
    }

    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "[ --no-optimize ]",
                help: "Do not optimize the compiled output"
            },
            {
                name: "[ --warnings ]",
                help: "Error on any warning"
            }
        ];
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        this.noOptimize = argParser.consumeFlag("no-optimize");
        this.warnings = argParser.consumeFlag("warnings");
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 1) {
            this.throwError("compile requires exactly FILENAME");
        }

        this.filename = args[0];
    }

    async run(): Promise<void> {
        let source = fs.readFileSync(this.filename).toString();
        let result = compile(source, {
            filename: this.filename,
            optimize: (!this.noOptimize)
        });

        let output: any = { };
        result.forEach((contract, index) => {
            output[contract.name] = {
                bytecode: contract.bytecode,
                runtime: contract.runtime,
                interface: contract.interface.fragments.map((f) => f.format(true))
            };
        });

        console.log(JSON.stringify(output, null, 4));
    }
}
cli.addPlugin("compile", CompilePlugin);


class DeployPlugin extends Plugin {
    filename: string;
    contractName: string;
    noOptimize: boolean;

    static getHelp(): Help {
        return {
           name: "deploy FILENAME",
           help: "Compile and deploy a Solidity contract"
        }
    }

    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "[ --no-optimize ]",
                help: "Do not optimize the compiled output"
            },
            {
                name: "[ --contract NAME ]",
                help: "Specify the contract to deploy"
            }
        ];
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        if (this.accounts.length !== 1) {
            this.throwError("deploy requires exactly one account");
        }

        this.noOptimize = argParser.consumeFlag("no-optimize");
        this.contractName = argParser.consumeOption("contract");
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length !== 1) {
            this.throwError("deploy requires exactly FILENAME");
        }

        this.filename = args[0];
    }

    async run(): Promise<void> {
        let source = fs.readFileSync(this.filename).toString();
        let result = compile(source, {
            filename: this.filename,
            optimize: (!this.noOptimize)
        });

        let codes = result.filter((c) => (c.bytecode !== "0x" && (this.contractName == null || this.contractName == c.name)));

        if (codes.length > 1) {
            this.throwError("Please specify a contract with --contract NAME");
        }

        if (codes.length === 0) {
            this.throwError("No contract found");
        }

        let factory = new ethers.ContractFactory(codes[0].interface, codes[0].bytecode, this.accounts[0]);

        let contract = await factory.deploy();

        dump("Deployed:", {
            Contract: codes[0].name,
            Address: contract.address,
            Bytecode: codes[0].bytecode,
            Interface: codes[0].interface.fragments.map((f) => f.format(true))
        });
    }
}
cli.addPlugin("deploy", DeployPlugin);


cli.run(process.argv.slice(2));
