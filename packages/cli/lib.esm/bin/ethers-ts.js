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
import fs from 'fs';
import { join as pathJoin } from "path";
import { ethers } from 'ethers';
import { CLI, Plugin } from '../cli';
import { header as Header, generate as generateTypeScript } from "../typescript";
import { compile } from "../solc";
function computeHash(content) {
    let bareContent = content.replace(/\/\*\* Content Hash: 0x[0-9A-F]{64} \*\//i, '/** Content Hash: */');
    return ethers.utils.id(bareContent);
}
function checkHash(content) {
    let match = content.match(/\/\*\* Content Hash: (0x[0-9A-F]{64}) \*\//i);
    return (match && match[1] === computeHash(content));
}
function addContentHash(content) {
    let contentHash = computeHash("/** Content Hash: */\n" + content);
    return "/** Content Hash: " + contentHash + " */\n" + content;
}
function save(path, content, force) {
    if (fs.existsSync(path) && !force) {
        let oldContent = fs.readFileSync(path).toString();
        if (!checkHash(oldContent)) {
            return false;
        }
    }
    fs.writeFileSync(path, content);
    return true;
}
function walkFilenames(filenames) {
    let result = [];
    filenames.forEach((filename) => {
        let stat = fs.statSync(filename);
        if (stat.isDirectory()) {
            walkFilenames(fs.readdirSync(filename).map((x) => pathJoin(filename, x))).forEach((filename) => {
                result.push(filename);
            });
        }
        else if (stat.isFile()) {
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
    static getHelp() {
        return {
            name: "FILENAME [ ... ]",
            help: "Generates a TypeScript file of all Contracts. May specify folders."
        };
    }
    static getOptionHelp() {
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
    prepareOptions(argParser) {
        const _super = Object.create(null, {
            prepareOptions: { get: () => super.prepareOptions }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareOptions.call(this, argParser);
            this.output = argParser.consumeOption("output");
            this.force = argParser.consumeFlag("force");
            this.optimize = !argParser.consumeFlag("no-optimize");
            this.noBytecode = argParser.consumeFlag("no-bytecode");
        });
    }
    prepareArgs(args) {
        const _super = Object.create(null, {
            prepareArgs: { get: () => super.prepareArgs }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareArgs.call(this, args);
            if (args.length === 0) {
                this.throwError("generate requires at least one FILENAME");
            }
            this.filenames = args;
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let output = Header;
            walkFilenames(this.filenames).forEach((filename) => {
                if (!filename.match(/\.sol$/)) {
                    return;
                }
                let contracts = null;
                let content = fs.readFileSync(filename).toString();
                try {
                    contracts = compile(content, { filename: filename, optimize: this.optimize });
                }
                catch (error) {
                    console.log(error);
                    if (error.errors) {
                        error.errors.forEach((error) => {
                            console.log(error);
                        });
                    }
                    throw new Error("errors during compilation");
                }
                contracts.forEach((contract) => {
                    output += generateTypeScript(contract, (this.noBytecode ? null : contract.bytecode));
                    output += "\n";
                });
            });
            output = addContentHash(output.trim());
            if (this.output) {
                let success = save(this.output, output, this.force);
                if (!success) {
                    return Promise.reject(new Error("File has been modified; use --force"));
                }
            }
            else {
                console.log(output);
            }
            return Promise.resolve(null);
        });
    }
}
cli.setPlugin(GeneratePlugin);
cli.run(process.argv.slice(2));
//# sourceMappingURL=ethers-ts.js.map