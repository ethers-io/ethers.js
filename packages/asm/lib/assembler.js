"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
// @TODO:
// - PIC
// - warn on opcode non-function iff parameters
// - warn return/revert non-empty, comment ; !assert(+1 @extra)
// - $$
// - In JS add config (positionIndependent)
// - When checking name collisions, verify no collision in javascript
var path_1 = require("path");
var vm_1 = __importDefault(require("vm"));
var ethers_1 = require("ethers");
var opcodes_1 = require("./opcodes");
var _parser_1 = require("./_parser");
var _version_1 = require("./_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
var Guard = {};
function hexConcat(values) {
    return ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.concat(values.map(function (v) {
        if (v instanceof opcodes_1.Opcode) {
            return [v.value];
        }
        return v;
    })));
}
function repeat(char, length) {
    var result = char;
    while (result.length < length) {
        result += result;
    }
    return result.substring(0, length);
}
var Script = /** @class */ (function () {
    function Script(filename, callback) {
        ethers_1.ethers.utils.defineReadOnly(this, "filename", filename);
        ethers_1.ethers.utils.defineReadOnly(this, "contextObject", this._baseContext(callback));
        ethers_1.ethers.utils.defineReadOnly(this, "context", vm_1.default.createContext(this.contextObject));
    }
    Script.prototype._baseContext = function (callback) {
        var _this = this;
        return new Proxy({
            __filename: this.filename,
            __dirname: path_1.dirname(this.filename),
            console: console,
            Uint8Array: Uint8Array,
            ethers: ethers_1.ethers,
            utils: ethers_1.ethers.utils,
            BigNumber: ethers_1.ethers.BigNumber,
            arrayify: ethers_1.ethers.utils.arrayify,
            concat: hexConcat,
            hexlify: ethers_1.ethers.utils.hexlify,
            zeroPad: function (value, length) {
                return ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.zeroPad(value, length));
            },
            id: ethers_1.ethers.utils.id,
            keccak256: ethers_1.ethers.utils.keccak256,
            namehash: ethers_1.ethers.utils.namehash,
            sha256: ethers_1.ethers.utils.sha256,
            parseEther: ethers_1.ethers.utils.parseEther,
            formatEther: ethers_1.ethers.utils.formatEther,
            parseUnits: ethers_1.ethers.utils.parseUnits,
            formatUnits: ethers_1.ethers.utils.formatUnits,
            randomBytes: function (length) {
                return ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.randomBytes(length));
            },
            toUtf8Bytes: ethers_1.ethers.utils.toUtf8Bytes,
            toUtf8String: ethers_1.ethers.utils.toUtf8String,
            formatBytes32String: ethers_1.ethers.utils.formatBytes32String,
            parseBytes32String: ethers_1.ethers.utils.parseBytes32String,
            Opcode: opcodes_1.Opcode,
            sighash: function (signature) {
                return ethers_1.ethers.utils.id(ethers_1.ethers.utils.FunctionFragment.from(signature).format()).substring(0, 10);
            },
            topichash: function (signature) {
                return ethers_1.ethers.utils.id(ethers_1.ethers.utils.EventFragment.from(signature).format());
            },
            assemble: assemble,
            disassemble: disassemble
        }, {
            get: function (obj, key) {
                if (obj[key]) {
                    return obj[key];
                }
                if (!callback) {
                    return undefined;
                }
                return callback(key, _this._context.context);
            }
        });
    };
    Script.prototype.evaluate = function (code, context) {
        return __awaiter(this, void 0, void 0, function () {
            var script, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._context) {
                            throw new Error("evaluation collision");
                        }
                        this._context = { context: context };
                        script = new vm_1.default.Script(code, { filename: this.filename });
                        result = script.runInContext(this.context);
                        if (!(result instanceof Promise)) return [3 /*break*/, 2];
                        return [4 /*yield*/, result];
                    case 1:
                        result = _a.sent();
                        _a.label = 2;
                    case 2:
                        this._context = null;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return Script;
}());
var nextTag = 1;
var Node = /** @class */ (function () {
    function Node(guard, location, options) {
        var _newTarget = this.constructor;
        if (guard !== Guard) {
            throw new Error("cannot instantiate class");
        }
        logger.checkAbstract(_newTarget, Node);
        ethers_1.ethers.utils.defineReadOnly(this, "location", location);
        ethers_1.ethers.utils.defineReadOnly(this, "tag", "node-" + nextTag++ + "-" + this.constructor.name);
        ethers_1.ethers.utils.defineReadOnly(this, "warnings", []);
        for (var key in options) {
            ethers_1.ethers.utils.defineReadOnly(this, key, options[key]);
        }
    }
    // Note: EVERY node must call assemble with `this`, even if only with
    //       the bytes "0x" to trigger the offset and bytecode checks
    Node.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assembler.start(this);
                visit(this, "0x");
                assembler.end(this);
                return [2 /*return*/];
            });
        });
    };
    Node.prototype.children = function () {
        return [];
    };
    Node.prototype.visit = function (visit) {
        visit(this);
    };
    Node.from = function (options) {
        var Factories = {
            data: DataNode,
            decimal: LiteralNode,
            eval: EvaluationNode,
            exec: ExecutionNode,
            hex: LiteralNode,
            label: LabelNode,
            length: LinkNode,
            offset: LinkNode,
            opcode: OpcodeNode,
            scope: ScopeNode,
        };
        var factory = Factories[options.type];
        if (!factory) {
            throw new Error("uknown type: " + options.type);
        }
        return factory.from(options);
    };
    return Node;
}());
exports.Node = Node;
/*
export abstract class CodeNode extends Node {
    constructor(guard: any, location: Location, options: { [ key: string ]: any }) {
        logger.checkAbstract(new.target, CodeNode);
        super(guard, location, options);
    }
}
*/
var ValueNode = /** @class */ (function (_super) {
    __extends(ValueNode, _super);
    function ValueNode(guard, location, options) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkAbstract(_newTarget, ValueNode);
        _this = _super.call(this, guard, location, options) || this;
        return _this;
    }
    return ValueNode;
}(Node));
exports.ValueNode = ValueNode;
function pushLiteral(value) {
    // Convert value into a hexstring
    var hex = ethers_1.ethers.utils.hexlify(value);
    if (hex === "0x") {
        throw new Error("invalid literal: 0x");
    }
    // Make sure it will fit into a push
    var length = ethers_1.ethers.utils.hexDataLength(hex);
    if (length === 0 || length > 32) {
        throw new Error("literal out of range: " + hex);
    }
    return hexConcat([opcodes_1.Opcode.from("PUSH" + String(length)), hex]);
}
var LiteralNode = /** @class */ (function (_super) {
    __extends(LiteralNode, _super);
    function LiteralNode(guard, location, value, verbatim) {
        return _super.call(this, guard, location, { value: value, verbatim: verbatim }) || this;
    }
    LiteralNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assembler.start(this);
                if (this.verbatim) {
                    if (this.value.substring(0, 2) === "0x") {
                        visit(this, this.value);
                    }
                    else {
                        visit(this, ethers_1.ethers.BigNumber.from(this.value).toHexString());
                    }
                }
                else {
                    visit(this, pushLiteral(ethers_1.ethers.BigNumber.from(this.value)));
                }
                assembler.end(this);
                return [2 /*return*/];
            });
        });
    };
    LiteralNode.from = function (options) {
        if (options.type !== "hex" && options.type !== "decimal") {
            throw new Error("expected hex or decimal type");
        }
        return new LiteralNode(Guard, options.loc, options.value, !!options.verbatim);
    };
    return LiteralNode;
}(ValueNode));
exports.LiteralNode = LiteralNode;
var LinkNode = /** @class */ (function (_super) {
    __extends(LinkNode, _super);
    function LinkNode(guard, location, type, label) {
        return _super.call(this, guard, location, { type: type, label: label }) || this;
    }
    LinkNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var value, target, result;
            return __generator(this, function (_a) {
                assembler.start(this);
                value = null;
                target = assembler.getTarget(this.label);
                if (target instanceof LabelNode) {
                    if (this.type === "offset") {
                        //value = assembler.getOffset(this.label);
                        value = (assembler.getLinkValue(target, this));
                    }
                }
                else {
                    result = (assembler.getLinkValue(target, this));
                    if (this.type === "offset") {
                        //value = assembler.getOffset(this.label);
                        value = result.offset;
                    }
                    else if (this.type === "length") {
                        //value = assembler.getLength(this.label);
                        value = result.length;
                    }
                }
                if (value == null) {
                    throw new Error("labels can only be targetted as offsets");
                }
                visit(this, pushLiteral(value));
                assembler.end(this);
                return [2 /*return*/];
            });
        });
    };
    LinkNode.from = function (options) {
        // @TODO: Verify type is offset or link...
        return new LinkNode(Guard, options.loc, options.type, options.label);
    };
    return LinkNode;
}(ValueNode));
exports.LinkNode = LinkNode;
var OpcodeNode = /** @class */ (function (_super) {
    __extends(OpcodeNode, _super);
    function OpcodeNode(guard, location, opcode, operands) {
        var _this = _super.call(this, guard, location, { opcode: opcode, operands: operands }) || this;
        if (opcode.isPush()) {
            _this.warnings.push("the PUSH opcode modifies program flow - use literals instead");
        }
        return _this;
    }
    OpcodeNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assembler.start(this);
                        i = this.operands.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.operands[i].assemble(assembler, visit)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i--;
                        return [3 /*break*/, 1];
                    case 4:
                        // Append this opcode
                        visit(this, ethers_1.ethers.utils.hexlify(this.opcode.value));
                        assembler.end(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    OpcodeNode.prototype.children = function () {
        return this.operands;
    };
    OpcodeNode.prototype.visit = function (visit) {
        for (var i = this.operands.length - 1; i >= 0; i--) {
            this.operands[i].visit(visit);
        }
        visit(this);
    };
    OpcodeNode.from = function (options) {
        if (options.type !== "opcode") {
            throw new Error("expected opcode type");
        }
        var opcode = opcodes_1.Opcode.from(options.mnemonic);
        if (!opcode) {
            throw new Error("unknown opcode: " + options.mnemonic);
        }
        // Using the function syntax will check the operand count
        if (!options.bare) {
            if (opcode.mnemonic === "POP" && options.operands.length === 0) {
                // This is ok... Pop has a delta of 0, but without operands
            }
            else if (options.operands.length !== opcode.delta) {
                throw new Error("opcode " + opcode.mnemonic + " expects " + opcode.delta + " operands");
            }
        }
        var operands = Object.freeze(options.operands.map(function (o) {
            var operand = Node.from(o);
            if (!(operand instanceof ValueNode)) {
                throw new Error("invalid operand");
            }
            return operand;
        }));
        return new OpcodeNode(Guard, options.loc, opcode, operands);
    };
    return OpcodeNode;
}(ValueNode));
exports.OpcodeNode = OpcodeNode;
var LabelledNode = /** @class */ (function (_super) {
    __extends(LabelledNode, _super);
    function LabelledNode(guard, location, name, values) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkAbstract(_newTarget, LabelledNode);
        values = ethers_1.ethers.utils.shallowCopy(values || {});
        values.name = name;
        _this = _super.call(this, guard, location, values) || this;
        return _this;
    }
    return LabelledNode;
}(Node));
exports.LabelledNode = LabelledNode;
var LabelNode = /** @class */ (function (_super) {
    __extends(LabelNode, _super);
    function LabelNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LabelNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assembler.start(this);
                visit(this, ethers_1.ethers.utils.hexlify(opcodes_1.Opcode.from("JUMPDEST").value));
                assembler.end(this);
                return [2 /*return*/];
            });
        });
    };
    LabelNode.from = function (options) {
        if (options.type !== "label") {
            throw new Error("expected label type");
        }
        return new LabelNode(Guard, options.loc, options.name);
    };
    return LabelNode;
}(LabelledNode));
exports.LabelNode = LabelNode;
var DataNode = /** @class */ (function (_super) {
    __extends(DataNode, _super);
    function DataNode(guard, location, name, data) {
        return _super.call(this, guard, location, name, { data: data }) || this;
    }
    DataNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var i_1, bytecode, i, opcode, padding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assembler.start(this);
                        i_1 = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i_1 < this.data.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.data[i_1].assemble(assembler, visit)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i_1++;
                        return [3 /*break*/, 1];
                    case 4:
                        bytecode = ethers_1.ethers.utils.arrayify(assembler.getPendingBytecode(this));
                        i = 0;
                        while (i < bytecode.length) {
                            opcode = opcodes_1.Opcode.from(bytecode[i++]);
                            if (opcode) {
                                i += opcode.isPush();
                            }
                        }
                        padding = new Uint8Array(i - bytecode.length);
                        // What makes more sense? INVALID or 0 (i.e. STOP)?
                        //padding.fill(Opcode.from("INVALID").value);
                        padding.fill(0);
                        visit(this, ethers_1.ethers.utils.hexlify(padding));
                        assembler.end(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    DataNode.prototype.children = function () {
        return this.data;
    };
    DataNode.prototype.visit = function (visit) {
        visit(this);
        for (var i = 0; i < this.data.length; i++) {
            this.data[i].visit(visit);
        }
    };
    DataNode.from = function (options) {
        if (options.type !== "data") {
            throw new Error("expected data type");
        }
        return new DataNode(Guard, options.loc, options.name, Object.freeze(options.data.map(function (d) { return Node.from(d); })));
    };
    return DataNode;
}(LabelledNode));
exports.DataNode = DataNode;
var EvaluationNode = /** @class */ (function (_super) {
    __extends(EvaluationNode, _super);
    function EvaluationNode(guard, location, script, verbatim) {
        return _super.call(this, guard, location, { script: script, verbatim: verbatim }) || this;
    }
    EvaluationNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assembler.start(this);
                        return [4 /*yield*/, assembler.evaluate(this.script, this)];
                    case 1:
                        result = _a.sent();
                        if (this.verbatim) {
                            if (typeof (result) === "number") {
                                visit(this, ethers_1.ethers.BigNumber.from(result).toHexString());
                            }
                            else {
                                visit(this, ethers_1.ethers.utils.hexlify(result));
                            }
                        }
                        else {
                            visit(this, pushLiteral(result));
                        }
                        assembler.end(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    EvaluationNode.from = function (options) {
        if (options.type !== "eval") {
            throw new Error("expected eval type");
        }
        return new EvaluationNode(Guard, options.loc, options.script, !!options.verbatim);
    };
    return EvaluationNode;
}(ValueNode));
exports.EvaluationNode = EvaluationNode;
var ExecutionNode = /** @class */ (function (_super) {
    __extends(ExecutionNode, _super);
    function ExecutionNode(guard, location, script) {
        return _super.call(this, guard, location, { script: script }) || this;
    }
    ExecutionNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assembler.start(this);
                        return [4 /*yield*/, assembler.evaluate(this.script, this)];
                    case 1:
                        _a.sent();
                        assembler.end(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    ExecutionNode.from = function (options) {
        if (options.type !== "exec") {
            throw new Error("expected exec type");
        }
        return new ExecutionNode(Guard, options.loc, options.script);
    };
    return ExecutionNode;
}(Node));
exports.ExecutionNode = ExecutionNode;
var ScopeNode = /** @class */ (function (_super) {
    __extends(ScopeNode, _super);
    function ScopeNode(guard, location, name, statements) {
        return _super.call(this, guard, location, name, { statements: statements }) || this;
    }
    ScopeNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assembler.start(this);
                        visit(this, "0x");
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.statements.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.statements[i].assemble(assembler, visit)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        assembler.end(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    ScopeNode.prototype.children = function () {
        return this.statements;
    };
    ScopeNode.prototype.visit = function (visit) {
        visit(this);
        for (var i = 0; i < this.statements.length; i++) {
            this.statements[i].visit(visit);
        }
    };
    ScopeNode.from = function (options) {
        if (options.type !== "scope") {
            throw new Error("expected scope type");
        }
        return new ScopeNode(Guard, options.loc, options.name, Object.freeze(options.statements.map(function (s) { return Node.from(s); })));
    };
    return ScopeNode;
}(LabelledNode));
exports.ScopeNode = ScopeNode;
function parse(code) {
    // Since jison allows \n, \r or \r\n line endings, we need some
    // twekaing to get the correct position
    var lines = [];
    var offset = 0;
    code.split(/(\r\n?|\n)/g).forEach(function (clump, index) {
        if (index % 2) {
            lines[lines.length - 1].line += clump;
        }
        else {
            lines.push({ line: clump, offset: offset });
        }
        offset += clump.length;
    });
    // Add a mock-EOF to the end of the file so we don't out-of-bounds
    // on the last character
    if (lines.length) {
        lines[lines.length - 1].line += "\n";
    }
    // Givens a line (1 offset) and column (0 offset) return the byte offset
    var getOffset = function (line, column) {
        var info = lines[line - 1];
        if (!info || column >= info.line.length) {
            throw new Error("out of range");
        }
        return info.offset + column;
    };
    // We use this in the _parser to convert locations to source
    _parser_1.parser.yy._ethersLocation = function (loc) {
        // The _ scope should call with null to get the full source
        if (loc == null) {
            return Object.freeze({
                offset: 0,
                length: code.length,
                source: code
            });
        }
        var offset = getOffset(loc.first_line, loc.first_column);
        var end = getOffset(loc.last_line, loc.last_column);
        return Object.freeze({
            offset: offset,
            length: (end - offset),
            source: code.substring(offset, end)
        });
    };
    var result = Node.from(_parser_1.parse(code));
    // Nuke the source code lookup callback
    _parser_1.parser.yy._ethersLocation = null;
    return result;
}
exports.parse = parse;
function disassemble(bytecode) {
    var ops = [];
    var offsets = {};
    var bytes = ethers_1.ethers.utils.arrayify(bytecode, { allowMissingPrefix: true });
    var i = 0;
    var oob = false;
    while (i < bytes.length) {
        var opcode = opcodes_1.Opcode.from(bytes[i]);
        if (!opcode) {
            opcode = new opcodes_1.Opcode("unknown (" + ethers_1.ethers.utils.hexlify(bytes[i]) + ")", bytes[i], 0, 0);
        }
        else if (oob && opcode.mnemonic === "JUMPDEST") {
            opcode = new opcodes_1.Opcode("JUMPDEST (invalid; OOB!!)", bytes[i], 0, 0);
        }
        var op = {
            opcode: opcode,
            offset: i
        };
        offsets[i] = op;
        ops.push(op);
        i++;
        var push = opcode.isPush();
        if (push) {
            var data = ethers_1.ethers.utils.hexlify(bytes.slice(i, i + push));
            if (ethers_1.ethers.utils.hexDataLength(data) === push) {
                op.pushValue = data;
                i += push;
            }
            else {
                oob = true;
            }
        }
    }
    ops.getOperation = function (offset) {
        return (offsets[offset] || null);
    };
    return ops;
}
exports.disassemble = disassemble;
function formatBytecode(bytecode) {
    var lines = [];
    bytecode.forEach(function (op) {
        var opcode = op.opcode;
        var offset = ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.utils.hexlify(op.offset), 2);
        if (opcode.isValidJumpDest()) {
            offset += "*";
        }
        else {
            offset += " ";
        }
        var operation = opcode.mnemonic;
        var push = opcode.isPush();
        if (push) {
            if (op.pushValue) {
                operation = op.pushValue + (repeat(" ", 67 - op.pushValue.length) + "; #" + push + " ");
            }
            else {
                operation += repeat(" ", 67 - operation.length) + "; OOB!! ";
            }
        }
        lines.push(offset.substring(2) + ": " + operation);
    });
    return lines.join("\n");
}
exports.formatBytecode = formatBytecode;
// @TODO: Rename to Assembler?
var Assembler = /** @class */ (function () {
    function Assembler(root, options) {
        ethers_1.ethers.utils.defineReadOnly(this, "positionIndependentCode", !!options.positionIndependentCode);
        ethers_1.ethers.utils.defineReadOnly(this, "retry", ((options.retry != null) ? options.retry : 512));
        ethers_1.ethers.utils.defineReadOnly(this, "filename", path_1.resolve(options.filename || "./contract.asm"));
        ethers_1.ethers.utils.defineReadOnly(this, "defines", Object.freeze(options.defines || {}));
        ethers_1.ethers.utils.defineReadOnly(this, "root", root);
        var nodes = {};
        var labels = {};
        var parents = {};
        // Link labels to their target node
        root.visit(function (node) {
            nodes[node.tag] = {
                node: node,
                offset: 0x0,
                bytecode: "0x",
                pending: "0x"
            };
            if (node instanceof LabelledNode) {
                // Check for duplicate labels
                if (labels[node.name]) {
                    logger.throwError(("duplicate label: " + node.name), ethers_1.ethers.utils.Logger.errors.UNSUPPORTED_OPERATION, {});
                }
                labels[node.name] = node;
            }
        });
        root.visit(function (node) {
            // Check all labels exist
            if (node instanceof LinkNode) {
                var target = labels[node.label];
                if (!target) {
                    logger.throwError(("missing label: " + node.label), ethers_1.ethers.utils.Logger.errors.UNSUPPORTED_OPERATION, {});
                }
            }
            // Build the parent structure
            node.children().forEach(function (child) {
                parents[child.tag] = node;
            });
        });
        ethers_1.ethers.utils.defineReadOnly(this, "labels", Object.freeze(labels));
        ethers_1.ethers.utils.defineReadOnly(this, "nodes", Object.freeze(nodes));
        ethers_1.ethers.utils.defineReadOnly(this, "_parents", Object.freeze(parents));
        ethers_1.ethers.utils.defineReadOnly(this, "_stack", []);
        this.reset();
    }
    Object.defineProperty(Assembler.prototype, "changed", {
        get: function () {
            return this._changed;
        },
        enumerable: true,
        configurable: true
    });
    // Link operations
    Assembler.prototype.getTarget = function (name) {
        return this.labels[name];
    };
    // Reset the assmebler for another run with updated values
    Assembler.prototype.reset = function () {
        var _this = this;
        this._changed = false;
        for (var tag in this.nodes) {
            delete this.nodes[tag].object;
        }
        this._script = new Script(this.filename, function (name, context) {
            return _this.get(name, context);
        });
    };
    Assembler.prototype.evaluate = function (script, source) {
        return this._script.evaluate(script, source);
    };
    Assembler.prototype.start = function (node) {
        this._stack.push(node);
        var info = this.nodes[node.tag];
        info.pending = "0x";
    };
    Assembler.prototype.end = function (node) {
        if (this._stack.pop() !== node) {
            throw new Error("missing push/pop pair");
        }
        var info = this.nodes[node.tag];
        if (info.pending !== info.bytecode) {
            this._didChange();
        }
        info.bytecode = info.pending;
    };
    Assembler.prototype.getPendingBytecode = function (node) {
        return this.nodes[node.tag].pending;
    };
    Assembler.prototype._appendBytecode = function (bytecode) {
        var _this = this;
        this._stack.forEach(function (node) {
            var info = _this.nodes[node.tag];
            info.pending = hexConcat([info.pending, bytecode]);
        });
    };
    Assembler.prototype.getAncestor = function (node, cls) {
        node = this._parents[node.tag];
        while (node) {
            if (node instanceof cls) {
                return node;
            }
            node = this._parents[node.tag];
        }
        return null;
    };
    Assembler.prototype.getLinkValue = function (target, source) {
        var sourceScope = ((source instanceof ScopeNode) ? source : this.getAncestor(source, ScopeNode));
        var targetScope = ((target instanceof ScopeNode) ? target : this.getAncestor(target, ScopeNode));
        if (target instanceof LabelNode) {
            // Label offset (e.g. "@foo:"); accessible only within its direct scope
            //const scope = this.getAncestor(source, Scope);
            if (targetScope !== sourceScope) {
                throw new Error("cannot access " + target.name + " from " + source.tag);
            }
            // Return the offset relative to its scope
            var offset = this.nodes[target.tag].offset - this.nodes[targetScope.tag].offset;
            // Offsets are wrong; but we should finish this run and then try again
            if (offset < 0) {
                offset = 0;
                this._didChange();
            }
            return offset;
        }
        var info = this.nodes[target.tag];
        // Return the offset is relative to its scope
        var bytes = Array.prototype.slice.call(ethers_1.ethers.utils.arrayify(info.bytecode));
        bytes.ast = target;
        bytes.source = target.location.source;
        if (!((target instanceof DataNode) || (target instanceof ScopeNode))) {
            throw new Error("invalid link value lookup");
        }
        // Check that target is any descendant (or self) of the source scope
        var safeOffset = (sourceScope == targetScope);
        if (!safeOffset) {
            sourceScope.visit(function (node) {
                if (node === targetScope) {
                    safeOffset = true;
                }
            });
        }
        // Not safe to access the offset; this will fault if anything tries.
        if (!safeOffset) {
            Object.defineProperty(bytes, "offset", {
                get: function () { throw new Error("cannot access " + target.name + ".offset from " + source.tag); }
            });
        }
        // Add the offset relative to the scope; unless the offset has
        // been marked as invalid, in which case accessing it will fail
        if (safeOffset) {
            bytes.offset = info.offset - this.nodes[sourceScope.tag].offset;
            // Offsets are wqrong; but we should finish this run and then try again
            if (bytes.offset < 0) {
                bytes.offset = 0;
                this._didChange();
            }
        }
        return Object.freeze(bytes);
    };
    Assembler.prototype.get = function (name, source) {
        if (name === "defines") {
            return this.defines;
        }
        var node = this.labels[name];
        if (!node) {
            return undefined;
        }
        var info = this.nodes[node.tag];
        if (info.object == null) {
            info.object = this.getLinkValue(node, source);
        }
        return info.object;
    };
    Assembler.prototype._didChange = function () {
        this._changed = true;
    };
    Assembler.prototype._assemble = function () {
        return __awaiter(this, void 0, void 0, function () {
            var offset, bytecodes;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        offset = 0;
                        bytecodes = [];
                        return [4 /*yield*/, this.root.assemble(this, function (node, bytecode) {
                                var state = _this.nodes[node.tag];
                                // Things have moved; we will need to try again
                                if (state.offset !== offset) {
                                    state.offset = offset;
                                    _this._didChange();
                                }
                                _this._appendBytecode(bytecode);
                                bytecodes.push(bytecode);
                                // The bytecode has changed; we will need to try again
                                //if (state.bytecode !== bytecode) {
                                //    state.bytecode = bytecode;
                                //    this._didChange();
                                //}
                                offset += ethers_1.ethers.utils.hexDataLength(bytecode);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, hexConcat(bytecodes)];
                }
            });
        });
    };
    Assembler.prototype.assemble = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bytecode, i, adjusted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._assemble()];
                    case 1:
                        bytecode = _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < this.retry)) return [3 /*break*/, 5];
                        // Regenerate the code with the updated assembler values
                        this.reset();
                        return [4 /*yield*/, this._assemble()];
                    case 3:
                        adjusted = _a.sent();
                        // Generated bytecode is stable!! :)
                        if (!this.changed) {
                            console.log("Assembled in " + i + " attempts");
                            return [2 /*return*/, bytecode];
                        }
                        // Try again...
                        bytecode = adjusted;
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        // This should not happen; something is wrong with the grammar
                        // or missing enter/exit call in assemble
                        if (this._stack.length !== 0) {
                            throw new Error("bad AST");
                        }
                        return [2 /*return*/, logger.throwError("unable to assemble; " + this.retry + " attempts failed to generate stable bytecode", ethers_1.ethers.utils.Logger.errors.UNKNOWN_ERROR, {})];
                }
            });
        });
    };
    return Assembler;
}());
function assemble(ast, options) {
    return __awaiter(this, void 0, void 0, function () {
        var assembler;
        return __generator(this, function (_a) {
            assembler = new Assembler(ast, options || {});
            return [2 /*return*/, assembler.assemble()];
        });
    });
}
exports.assemble = assemble;
