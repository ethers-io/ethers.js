/* istanbul ignore file */

'use strict';

import fs from "fs";
import _module from "module";
import { dirname, resolve } from "path";

import { ethers } from "ethers";

export interface ContractCode {
    interface: ethers.utils.Interface;
    name: string;
    compiler: string;
    bytecode: string;
    runtime: string
};

export type CompilerOptions = {
    filename?: string;
    basedir?: string;
    optimize?: boolean;
    throwWarnings?: boolean;
};

function populateOptions(options?: CompilerOptions): CompilerOptions {
    options = ethers.utils.shallowCopy(options || { });

    if (options.filename && !options.basedir) {
        options.basedir = dirname(options.filename);
    }
    if (!options.filename) { options.filename = "_contract.sol"; }
    if (!options.basedir) { options.basedir = "."; }

    return options;
}

function getInput(source: string, options: CompilerOptions): any {
    const sources: { [ filename: string ]: { content: string } } = { };
    sources[options.filename] = { content: source };

    const input: any = {
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

    return input;
}

function _compile(_solc: any, source: string, options?: CompilerOptions): Array<ContractCode> {
    const compilerVersion = _solc.version();

    const ver = compilerVersion.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!ver || ver[1] !== "0") { throw new Error("unknown version"); }

    const version = parseFloat(ver[2] + "." + ver[3]);
    //if (version < 4.11 || version >= 8) {
    if (version < 5.0 || version >= 8.0) {
        throw new Error(`unsupported version: ${ ver[1] }.${ ver[2] }.${ ver[3] }`);
    }

    options = populateOptions(options);

    const input = getInput(source, options);

    let findImport: any = (filename: string): { contents?: string, error?: string } => {
        try {
            return {
                contents: fs.readFileSync(resolve(options.basedir, filename)).toString()
            };
        } catch (error) {
            return { error: error.message }
        }
    };

    if (version >= 6) {
        findImport = { import: findImport };
    }


    const outputJson = _solc.compile(JSON.stringify(input), findImport);
    const output = JSON.parse(outputJson);

    const errors = (output.errors || []).filter((x: any) => (x.severity === "error" || options.throwWarnings)).map((x: any) => x.formattedMessage);
    if (errors.length) {
        const error = new Error("compilation error");
        (<any>error).errors = errors;
        throw error;
    }

    const result: Array<ContractCode> = [];
    for (let filename in output.contracts) {
        for (let name in output.contracts[filename]) {
            let contract = output.contracts[filename][name];

            // Skip empty contracts
            if (!contract.evm.bytecode.object) { continue; }

            result.push({
                name: name,
                interface: new ethers.utils.Interface(contract.abi),
                bytecode: "0x" + contract.evm.bytecode.object,
                runtime: "0x" + contract.evm.deployedBytecode.object,
                compiler: compilerVersion
            });
        }
    }

    return result;
}



// Creates a require which will first search from the current location,
// and for solc will fallback onto the version included in @ethersproject/cli
export function customRequire(path: string): (name: string) => any {
    // Node 8.x does not support createRequireFromPath
    const createRequire = (_module.createRequireFromPath || (function(path: string) {
        return require
    }));

    const pathRequire = createRequire(resolve(path, "./sandbox.js"));
    const libRequire = createRequire(resolve(__filename));

    return function(name: string): any {
        try {
            return pathRequire(name);
        } catch (error) {
            if (name === "solc") {
                try {
                    return libRequire(name);
                } catch (error) { }
            }
            throw error;
        }

    }
}

export function wrapSolc(_solc: any): (source: string, options?: CompilerOptions) => Array<ContractCode> {
    return function(source: string, options?: CompilerOptions): Array<ContractCode> {
        return _compile(_solc, source, options || { });
    }
}

export const compile = wrapSolc(customRequire(".")("solc"));
