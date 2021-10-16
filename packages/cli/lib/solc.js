/* istanbul ignore file */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.wrapSolc = exports.customRequire = void 0;
var fs_1 = __importDefault(require("fs"));
var module_1 = __importDefault(require("module"));
var path_1 = require("path");
var ethers_1 = require("ethers");
;
function populateOptions(options) {
    options = ethers_1.ethers.utils.shallowCopy(options || {});
    if (options.filename && !options.basedir) {
        options.basedir = (0, path_1.dirname)(options.filename);
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
    var sources = {};
    sources[options.filename] = { content: source };
    var input = {
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
    var compilerVersion = _solc.version();
    var ver = compilerVersion.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!ver || ver[1] !== "0") {
        throw new Error("unknown version");
    }
    var version = parseFloat(ver[2] + "." + ver[3]);
    //if (version < 4.11 || version >= 8) {
    if (version < 5.0 || version >= 8.0) {
        throw new Error("unsupported version: " + ver[1] + "." + ver[2] + "." + ver[3]);
    }
    options = populateOptions(options);
    var input = getInput(source, options);
    var findImport = function (filename) {
        try {
            return {
                contents: fs_1.default.readFileSync((0, path_1.resolve)(options.basedir, filename)).toString()
            };
        }
        catch (error) {
            return { error: error.message };
        }
    };
    if (version >= 6) {
        findImport = { import: findImport };
    }
    var outputJson = _solc.compile(JSON.stringify(input), findImport);
    var output = JSON.parse(outputJson);
    var errors = (output.errors || []).filter(function (x) { return (x.severity === "error" || options.throwWarnings); }).map(function (x) { return x.formattedMessage; });
    if (errors.length) {
        var error = new Error("compilation error");
        error.errors = errors;
        throw error;
    }
    var result = [];
    for (var filename in output.contracts) {
        for (var name_1 in output.contracts[filename]) {
            var contract = output.contracts[filename][name_1];
            // Skip empty contracts
            if (!contract.evm.bytecode.object) {
                continue;
            }
            result.push({
                name: name_1,
                interface: new ethers_1.ethers.utils.Interface(contract.abi),
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
function customRequire(path) {
    // Node 8.x does not support createRequireFromPath
    var createRequire = (module_1.default.createRequireFromPath || (function (path) {
        return require;
    }));
    var pathRequire = createRequire((0, path_1.resolve)(path, "./sandbox.js"));
    var libRequire = createRequire((0, path_1.resolve)(__filename));
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
exports.customRequire = customRequire;
function wrapSolc(_solc) {
    return function (source, options) {
        return _compile(_solc, source, options || {});
    };
}
exports.wrapSolc = wrapSolc;
exports.compile = wrapSolc(customRequire(".")("solc"));
//# sourceMappingURL=solc.js.map