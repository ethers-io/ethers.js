#!/usr/bin/env node
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var asm_1 = require("@ethersproject/asm");
var cli_1 = require("../cli");
function repeat(text, length) {
    if (text.length === 0) {
        throw new Error("boo");
    }
    var result = text;
    while (result.length < length) {
        result += result;
    }
    return result.substring(0, length);
}
var cli = new cli_1.CLI(null, {
    account: false,
    provider: false,
    transaction: false
});
var AssemblePlugin = /** @class */ (function (_super) {
    __extends(AssemblePlugin, _super);
    function AssemblePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AssemblePlugin.getHelp = function () {
        return {
            name: "[ FILENAME ]",
            help: "Process the file (or stdin)"
        };
    };
    AssemblePlugin.getOptionHelp = function () {
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
    };
    AssemblePlugin.prototype.prepareOptions = function (argParser) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareOptions.call(this, argParser)];
                    case 1:
                        _a.sent();
                        // Get all the --define key=value pairs
                        this.defines = {};
                        argParser.consumeOptions("define").forEach(function (pair) {
                            var match = pair.match(/([a-z][a-z0-9_]+)(=.*)?/i);
                            if (!match) {
                                _this.throwError("invalid define: " + pair);
                            }
                            _this.defines[match[1]] = (match[2] ? match[2].substring(1) : true);
                        });
                        // We are disassembling...
                        this.disassemble = argParser.consumeFlag("disassemble");
                        this.ignoreWarnings = argParser.consumeFlag("ignore-warnings");
                        this.pic = argParser.consumeFlag("pic");
                        this.target = argParser.consumeOption("target");
                        return [2 /*return*/];
                }
            });
        });
    };
    AssemblePlugin.prototype.prepareArgs = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, bytecodes_1, leftovers, chunks, offset, column, prefix, lineNo, line, output;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, _super.prototype.prepareArgs.call(this, args)];
                    case 1:
                        _b.sent();
                        if (!(args.length > 1)) return [3 /*break*/, 2];
                        this.throwError("assembler requires at most one FILENAME");
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(args.length === 1)) return [3 /*break*/, 3];
                        this.filename = (0, path_1.resolve)(args[0]);
                        this.content = fs_1.default.readFileSync(this.filename).toString();
                        return [3 /*break*/, 5];
                    case 3:
                        _a = this;
                        return [4 /*yield*/, (new Promise(function (resolve, reject) {
                                var data = "";
                                process.stdin.setEncoding('utf8');
                                process.stdin.on("data", function (chunk) {
                                    data += chunk;
                                });
                                process.stdin.on("end", function () {
                                    resolve(data);
                                });
                                process.stdin.on("error", function (error) {
                                    reject(error);
                                });
                            }))];
                    case 4:
                        _a.content = _b.sent();
                        _b.label = 5;
                    case 5:
                        if (this.disassemble) {
                            bytecodes_1 = [];
                            leftovers = this.content.replace(/(?:(?:0x)?((:?[0-9a-f][0-9a-f])*))/gi, function (all, bytecode) {
                                bytecodes_1.push(bytecode);
                                return repeat(" ", all.length);
                            });
                            if (leftovers.trim()) {
                                chunks = leftovers.split(/(\s+)/);
                                offset = (chunks[0] ? 0 : chunks[1].length);
                                column = (chunks[0] ? 0 : chunks[1].split(/[\r\n]/).pop().length);
                                prefix = this.content.substring(0, offset);
                                lineNo = prefix.length - prefix.replace(/\r|\n|\r\n/g, '').length;
                                line = this.content.substring(offset - column).split(/\n/)[0];
                                output = "Invalid Bytecode Character found in line " + (lineNo + 1) + ", column " + (column + 1) + "\n";
                                output += line + "\n";
                                output += repeat("-", column) + "^";
                                this.throwError(output);
                            }
                            this.content = "0x" + bytecodes_1.join("");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AssemblePlugin.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ast, _a, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.disassemble) return [3 /*break*/, 1];
                        console.log((0, asm_1.formatBytecode)((0, asm_1.disassemble)(this.content)));
                        return [3 /*break*/, 4];
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        ast = (0, asm_1.parse)(this.content, {
                            ignoreWarnings: !!this.ignoreWarnings
                        });
                        _b = (_a = console).log;
                        return [4 /*yield*/, (0, asm_1.assemble)(ast, {
                                defines: this.defines,
                                filename: this.filename,
                                positionIndependentCode: this.pic,
                                target: (this.target || "_")
                            })];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        if (error_1.errors) {
                            (error_1.errors).forEach(function (error) {
                                if (error.severity === asm_1.SemanticErrorSeverity.error) {
                                    console.log("Error: " + error.message + " (line: " + (error.node.location.line + 1) + ")");
                                }
                                else if (error.severity === asm_1.SemanticErrorSeverity.warning) {
                                    console.log("Warning: " + error.message + " (line: " + (error.node.location.line + 1) + ")");
                                }
                                else {
                                    console.log(error);
                                    return;
                                }
                            });
                        }
                        else {
                            throw error_1;
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AssemblePlugin;
}(cli_1.Plugin));
cli.setPlugin(AssemblePlugin);
cli.run(process.argv.slice(2));
//# sourceMappingURL=ethers-asm.js.map