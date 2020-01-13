'use strict';
import fs from "fs";
import { dirname, resolve } from "path";
import { ethers } from "ethers";
let _solc = null;
function getSolc() {
    if (!_solc) {
        _solc = require("solc");
    }
    return _solc;
}
;
export function compile(source, options) {
    options = ethers.utils.shallowCopy(options || {});
    if (options.filename && !options.basedir) {
        options.basedir = dirname(options.filename);
    }
    if (!options.filename) {
        options.filename = "_contract.sol";
    }
    if (!options.basedir) {
        options.basedir = ".";
    }
    let sources = {};
    sources[options.filename] = { content: source };
    let input = {
        language: "Solidity",
        sources: sources,
        settings: {
            outputSelection: {
                "*": {
                    "*": ["*"]
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
    let findImport = (filename) => {
        try {
            return {
                contents: fs.readFileSync(resolve(options.basedir, filename)).toString()
            };
        }
        catch (error) {
            return { error: error.message };
        }
    };
    let output = JSON.parse(getSolc().compile(JSON.stringify(input), findImport));
    let errors = (output.errors || []).filter((x) => (x.severity === "error" || options.throwWarnings)).map((x) => x.formattedMessage);
    if (errors.length) {
        let error = new Error("compilation error");
        error.errors = errors;
        throw error;
    }
    let result = [];
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
