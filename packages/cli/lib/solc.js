'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var ethers_1 = require("ethers");
var _solc = null;
function getSolc() {
    if (!_solc) {
        _solc = require("solc");
    }
    return _solc;
}
;
function compile(source, options) {
    options = ethers_1.ethers.utils.shallowCopy(options || {});
    if (options.filename && !options.basedir) {
        options.basedir = path_1.dirname(options.filename);
    }
    if (!options.filename) {
        options.filename = "_contract.sol";
    }
    if (!options.basedir) {
        options.basedir = ".";
    }
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
    var findImport = function (filename) {
        try {
            return {
                contents: fs_1.default.readFileSync(path_1.resolve(options.basedir, filename)).toString()
            };
        }
        catch (error) {
            return { error: error.message };
        }
    };
    var output = JSON.parse(getSolc().compile(JSON.stringify(input), findImport));
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
            result.push({
                name: name_1,
                interface: new ethers_1.ethers.utils.Interface(contract.abi),
                bytecode: "0x" + contract.evm.bytecode.object,
                runtime: "0x" + contract.evm.deployedBytecode.object
            });
        }
    }
    return result;
}
exports.compile = compile;
