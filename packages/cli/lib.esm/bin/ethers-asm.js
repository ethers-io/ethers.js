#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import { resolve } from "path";
import { assemble, disassemble, formatBytecode, parse, SemanticErrorSeverity } from "@ethersproject/asm";
import { CLI, Plugin } from "../cli";
function repeat(text, length) {
    if (text.length === 0) {
        throw new Error("boo");
    }
    let result = text;
    while (result.length < length) {
        result += result;
    }
    return result.substring(0, length);
}
let cli = new CLI(null, {
    account: false,
    provider: false,
    transaction: false
});
class AssemblePlugin extends Plugin {
    static getHelp() {
        return {
            name: "[ FILENAME ]",
            help: "Process the file (or stdin)"
        };
    }
    static getOptionHelp() {
        return [
            {
                name: "--define KEY=VALUE",
                help: "provide assembler defines"
            },
            {
                name: "--disassemble",
                help: "Disassemble input bytecode"
            },
            {
                name: "--ignore-warnings",
                help: "Ignore warnings"
            },
            {
                name: "--pic",
                help: "generate position independent code"
            },
            {
                name: "--target LABEL",
                help: "output LABEL bytecode (default: _)"
            },
        ];
    }
    prepareOptions(argParser) {
        const _super = Object.create(null, {
            prepareOptions: { get: () => super.prepareOptions }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareOptions.call(this, argParser);
            // Get all the --define key=value pairs
            this.defines = {};
            argParser.consumeOptions("define").forEach((pair) => {
                const match = pair.match(/([a-z][a-z0-9_]+)(=.*)?/i);
                if (!match) {
                    this.throwError(`invalid define: ${pair}`);
                }
                this.defines[match[1]] = (match[2] ? match[2].substring(1) : true);
            });
            // We are disassembling...
            this.disassemble = argParser.consumeFlag("disassemble");
            this.ignoreWarnings = argParser.consumeFlag("ignore-warnings");
            this.pic = argParser.consumeFlag("pic");
            this.target = argParser.consumeOption("target");
        });
    }
    prepareArgs(args) {
        const _super = Object.create(null, {
            prepareArgs: { get: () => super.prepareArgs }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.prepareArgs.call(this, args);
            if (args.length > 1) {
                this.throwError("assembler requires at most one FILENAME");
            }
            else if (args.length === 1) {
                this.filename = resolve(args[0]);
                this.content = fs.readFileSync(this.filename).toString();
            }
            else {
                this.content = yield (new Promise((resolve, reject) => {
                    let data = "";
                    process.stdin.setEncoding('utf8');
                    process.stdin.on("data", (chunk) => {
                        data += chunk;
                    });
                    process.stdin.on("end", () => {
                        resolve(data);
                    });
                    process.stdin.on("error", (error) => {
                        reject(error);
                    });
                }));
            }
            if (this.disassemble) {
                const bytecodes = [];
                const leftovers = this.content.replace(/(?:(?:0x)?((:?[0-9a-f][0-9a-f])*))/gi, (all, bytecode) => {
                    bytecodes.push(bytecode);
                    return repeat(" ", all.length);
                });
                if (leftovers.trim()) {
                    // Process the leftovers
                    const chunks = leftovers.split(/(\s+)/);
                    const offset = (chunks[0] ? 0 : chunks[1].length);
                    const column = (chunks[0] ? 0 : chunks[1].split(/[\r\n]/).pop().length);
                    // Count the lines in the prefix
                    const prefix = this.content.substring(0, offset);
                    const lineNo = prefix.length - prefix.replace(/\r|\n|\r\n/g, '').length;
                    // Get teh actual error line
                    const line = this.content.substring(offset - column).split(/\n/)[0];
                    // Formatted output line
                    let output = `Invalid Bytecode Character found in line ${lineNo + 1}, column ${column + 1}\n`;
                    output += line + "\n";
                    output += repeat("-", column) + "^";
                    this.throwError(output);
                }
                this.content = "0x" + bytecodes.join("");
            }
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.disassemble) {
                console.log(formatBytecode(disassemble(this.content)));
            }
            else {
                try {
                    const ast = parse(this.content, {
                        ignoreWarnings: !!this.ignoreWarnings
                    });
                    console.log(yield assemble(ast, {
                        defines: this.defines,
                        filename: this.filename,
                        positionIndependentCode: this.pic,
                        target: (this.target || "_")
                    }));
                }
                catch (error) {
                    if (error.errors) {
                        (error.errors).forEach((error) => {
                            if (error.severity === SemanticErrorSeverity.error) {
                                console.log(`Error: ${error.message} (line: ${error.node.location.line + 1})`);
                            }
                            else if (error.severity === SemanticErrorSeverity.warning) {
                                console.log(`Warning: ${error.message} (line: ${error.node.location.line + 1})`);
                            }
                            else {
                                console.log(error);
                                return;
                            }
                        });
                    }
                    else {
                        throw error;
                    }
                }
            }
        });
    }
}
cli.setPlugin(AssemblePlugin);
cli.run(process.argv.slice(2));
//# sourceMappingURL=ethers-asm.js.map