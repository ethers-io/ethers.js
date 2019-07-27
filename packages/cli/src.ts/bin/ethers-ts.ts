#!/usr/bin/env node

'use strict';

import fs from 'fs';
import { join as pathJoin } from "path";

import { ethers } from 'ethers';

import { ArgParser, CLI, Help, Plugin } from '../cli';
import { header as Header, generate as generateTypeScript } from "../typescript";
import { compile, ContractCode } from "../solc";

function computeHash(content: string): string {
    let bareContent = content.replace(/\/\*\* Content Hash: 0x[0-9A-F]{64} \*\//i, '/** Content Hash: */');
    return ethers.utils.id(bareContent);
}

function checkHash(content: string): boolean {
    let match = content.match(/\/\*\* Content Hash: (0x[0-9A-F]{64}) \*\//i);
    return (match && match[1] === computeHash(content));
}

function addContentHash(content: string): string {
    let contentHash = computeHash("/** Content Hash: */\n" + content);
    return "/** Content Hash: " + contentHash + " */\n" + content;
}

function save(path: string, content: string, force?: boolean): boolean {
    if (fs.existsSync(path) && !force) {
        let oldContent = fs.readFileSync(path).toString();
        if (!checkHash(oldContent)) { return false; }
    }
    fs.writeFileSync(path, content);
    return true;
}

function walkFilenames(filenames: Array<string>): Array<string> {
    let result: Array<string> = [];
    filenames.forEach((filename) => {
        let stat = fs.statSync(filename);
        if (stat.isDirectory()) {
            walkFilenames(fs.readdirSync(filename).map((x: string) => pathJoin(filename, x))).forEach((filename) => {
                result.push(filename);
            });
        } else if (stat.isFile()) {
            result.push(filename);
        }
    });
    return result;
}

let cli = new CLI(null, {
    account: false,
    provider: false,
    transaction: false
});

class GeneratePlugin extends Plugin {

    filenames: Array<string>;
    output: string;
    force: boolean;
    optimize: boolean;
    noBytecode: boolean;

    static getHelp(): Help {
        return {
            name: "FILENAME [ ... ]",
            help: "Generates a TypeScript file of all Contracts. May specify folders."
        };
    }
    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "--output FILENAME",
                help: "Write the output to FILENAME (default: stdout)"
            },
            {
                name: "--force",
                help: "Overwrite files if they already exist"
            },
            {
                name: "--no-optimize",
                help: "Do not run the solc optimizer"
            },
            {
                name: "--no-bytecode",
                help: "Do not include bytecode and Factory methods"
            }
        ];
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        this.output = argParser.consumeOption("output");
        this.force = argParser.consumeFlag("force");
        this.optimize = !argParser.consumeFlag("no-optimize");
        this.noBytecode = argParser.consumeFlag("no-bytecode");
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length === 0) {
            this.throwError("generate requires at least one FILENAME");
        }

        this.filenames = args;
    }


    async run(): Promise<void> {
        let output = Header;

        walkFilenames(this.filenames).forEach((filename) => {
            if (!filename.match(/\.sol$/)) { return; }
            let contracts: Array<ContractCode> = null;
            let content = fs.readFileSync(filename).toString();

            try {
                 contracts = compile(content, { filename: filename, optimize: this.optimize });
            } catch (error) {
                console.log(error);
                if ((<any>error).errors) {
                    (<any>error).errors.forEach((error: string) => {
                        console.log(error);
                    });
                }

                throw new Error("errors during compilation");
            }

            contracts.forEach((contract) => {
                output += generateTypeScript(contract, (this.noBytecode ? null: contract.bytecode));
                output += "\n";
            });
        });

        output = addContentHash(output.trim());

        if (this.output) {
            let success = save(this.output, output, this.force);
            if (!success) {
                return Promise.reject(new Error("File has been modified; use --force"));
            }
        } else {
            console.log(output);
        }

        return Promise.resolve(null);
    }
}
cli.setPlugin(GeneratePlugin);

cli.run(process.argv.slice(2))
