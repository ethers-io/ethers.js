/* istanbul ignore file */
'use strict';
import fs from "fs";
import _module from "module";
import { dirname, resolve } from "path";
import { ethers } from "ethers";
;
function populateOptions(options) {
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
    return options;
}
function getInput(source, options) {
    const sources = {};
    sources[options.filename] = { content: source };
    const input = {
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
    return input;
}
function _compile(_solc, source, options) {
    const compilerVersion = _solc.version();
    const ver = compilerVersion.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!ver || ver[1] !== "0") {
        throw new Error("unknown version");
    }
    const version = parseFloat(ver[2] + "." + ver[3]);
    //if (version < 4.11 || version >= 8) {
    if (version < 5.0 || version >= 8.0) {
        throw new Error(`unsupported version: ${ver[1]}.${ver[2]}.${ver[3]}`);
    }
    options = populateOptions(options);
    const input = getInput(source, options);
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
    if (version >= 6) {
        findImport = { import: findImport };
    }
    const outputJson = _solc.compile(JSON.stringify(input), findImport);
    const output = JSON.parse(outputJson);
    const errors = (output.errors || []).filter((x) => (x.severity === "error" || options.throwWarnings)).map((x) => x.formattedMessage);
    if (errors.length) {
        const error = new Error("compilation error");
        error.errors = errors;
        throw error;
    }
    const result = [];
    for (let filename in output.contracts) {
        for (let name in output.contracts[filename]) {
            let contract = output.contracts[filename][name];
            // Skip empty contracts
            if (!contract.evm.bytecode.object) {
                continue;
            }
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
export function customRequire(path) {
    // Node 8.x does not support createRequireFromPath
    const createRequire = (_module.createRequireFromPath || (function (path) {
        return require;
    }));
    const pathRequire = createRequire(resolve(path, "./sandbox.js"));
    const libRequire = createRequire(resolve(__filename));
    return function (name) {
        try {
            return pathRequire(name);
        }
        catch (error) {
            if (name === "solc") {
                try {
                    return libRequire(name);
                }
                catch (error) { }
            }
            throw error;
        }
    };
}
export function wrapSolc(_solc) {
    return function (source, options) {
        return _compile(_solc, source, options || {});
    };
}
export const compile = wrapSolc(customRequire(".")("solc"));
//# sourceMappingURL=solc.js.map