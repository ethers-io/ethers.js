'use strict';

import fs from "fs";
import { dirname, resolve } from "path";

import { ethers } from "ethers";

let _solc: any = null;
function getSolc(): any {
    if (!_solc) {
        _solc = require("solc");
    }
    return _solc;
}

export interface ContractCode {
    interface: ethers.utils.Interface;
    name: string;
    bytecode?: string;
    runtime?: string
};

export type CompilerOptions = {
    filename?: string;
    basedir?: string;
    optimize?: boolean;
    throwWarnings?: boolean;
};

export function compile(source: string, options?: CompilerOptions): Array<ContractCode> {
    options = ethers.utils.shallowCopy(options || { });

    if (options.filename && !options.basedir) {
        options.basedir = dirname(options.filename);
    }
    if (!options.filename) { options.filename = "_contract.sol"; }
    if (!options.basedir) { options.basedir = "."; }

    let sources: { [ filename: string]: { content: string } } = { };
    sources[options.filename] = { content: source };

    let input: any = {
        language: "Solidity",
        sources: sources,
        settings: {
            outputSelection: {
                "*": {
                    "*": [ "*" ]
                }
            }
        }
    };

    if (options.optimize) {
        input.settings.optimizer = {
            enabled: true,
            runs: 200
        };
    }

    let findImport = (filename: string): { contents?: string, error?: string } => {
        try {
            return {
                contents: fs.readFileSync(resolve(options.basedir, options.filename)).toString()
            };
        } catch (error) {
            return { error: error.message }
        }
    };

    let output = JSON.parse(getSolc().compile(JSON.stringify(input), findImport));

    let errors = (output.errors || []).filter((x: any) => (x.severity === "error" || options.throwWarnings)).map((x: any) => x.formattedMessage);
    if (errors.length) {
        let error = new Error("compilation error");
        (<any>error).errors = errors;
        throw error;
    }

    let result: Array<ContractCode> = [];
    for (let filename in output.contracts) {
        for (let name in output.contracts[filename]) {
            let contract = output.contracts[filename][name];

            result.push({
                name: name,
                interface: new ethers.utils.Interface(contract.abi),
                bytecode: "0x" + contract.evm.bytecode.object,
                runtime: "0x" + contract.evm.deployedBytecode.object
            });
        }
    }

    return result;
}

