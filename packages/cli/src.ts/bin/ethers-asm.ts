#!/usr/bin/env node

"use strict";

import fs from "fs";
import _module from "module";
import { resolve } from "path";

import { assemble, disassemble, formatBytecode, parse } from "@ethersproject/asm";

import { ArgParser, CLI, Help, Plugin } from "../cli";

function repeat(text: string, length: number): string {
    if (text.length === 0) { throw new Error("boo"); }
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

    filename: string;
    content: string;
    disassemble: boolean;
    defines: { [ key: string ]: string | boolean }

    static getHelp(): Help {
        return {
            name: "[ FILENAME ]",
            help: "Process the file (or stdin)"
        };
    }
    static getOptionHelp(): Array<Help> {
        return [
            {
                name: "--disassemble",
                help: "Disassemble input bytecode"
            },
            {
                name: "--define KEY=VALUE",
                help: "provide assembler defines"
            }
        ];
    }

    async prepareOptions(argParser: ArgParser): Promise<void> {
        await super.prepareOptions(argParser);

        // Get all the --define key=value pairs
        this.defines = { };
        argParser.consumeOptions("define").forEach((pair) => {
            const match = pair.match(/([a-z][a-z0-9_]+)(=.*)?/i);
            if (!match) {
                this.throwError(`invalid define: ${ pair }`);
            }
            this.defines[match[1]] = (match[2] ? match[2].substring(1): true);
        });

        // We are disassembling...
        this.disassemble = argParser.consumeFlag("disassemble");
    }

    async prepareArgs(args: Array<string>): Promise<void> {
        await super.prepareArgs(args);

        if (args.length > 1) {
            this.throwError("assembler requires at most one FILENAME");

        } else if (args.length === 1) {
            this.filename = resolve(args[0]);
            this.content = fs.readFileSync(this.filename).toString();

        } else {
            this.content = await (new Promise((resolve, reject) => {
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
            const bytecodes: Array<string> = [ ];
            const leftovers = this.content.replace(/(?:(?:0x)?((:?[0-9a-f][0-9a-f])*))/gi, (all, bytecode) => {
                bytecodes.push(bytecode);
                return repeat(" ", all.length);
            });

            if (leftovers.trim()) {

                // Process the leftovers
                const chunks = leftovers.split(/(\s+)/);
                const offset = (chunks[0] ? 0: chunks[1].length);
                const column = (chunks[0] ? 0: chunks[1].split(/[\r\n]/).pop().length);


                // Count the lines in the prefix
                const prefix = this.content.substring(0, offset);
                const lineNo = prefix.length - prefix.replace(/\r|\n|\r\n/g, '').length;

                // Get teh actual error line
                const line = this.content.substring(offset - column).split(/\n/)[0];

                // Formatted output line
                let output = `Invalid Bytecode Character found in line ${ lineNo + 1 }, column ${ column + 1 }\n`;
                output += line + "\n";
                output += repeat("-", column) + "^";

                this.throwError(output);
            }

            this.content = "0x" + bytecodes.join("");
        }
    }


    async run(): Promise<void> {
        if (this.disassemble) {
            console.log(formatBytecode(disassemble(this.content)));
        } else {
            console.log(await assemble(parse(this.content), {
                defines: this.defines,
                filename: this.filename,
            }));
        }
    }
}
cli.setPlugin(AssemblePlugin);

cli.run(process.argv.slice(2))

