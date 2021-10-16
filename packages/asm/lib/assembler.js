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
exports.assemble = exports.parse = exports.SemanticErrorSeverity = exports.formatBytecode = exports.disassemble = exports.ScopeNode = exports.ExecutionNode = exports.EvaluationNode = exports.DataNode = exports.PaddingNode = exports.LabelNode = exports.LabelledNode = exports.OpcodeNode = exports.LinkNode = exports.PopNode = exports.LiteralNode = exports.ValueNode = exports.Node = void 0;
// @TODO:
// - warn return/revert non-empty, comment ; !assert(+1 @extra)
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
        if (typeof (v) === "number") {
            if (v >= 0 && v <= 255 && !(v % 1)) {
                return ethers_1.ethers.utils.hexlify(v);
            }
            else {
                throw new Error("invalid number: " + v);
            }
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
            __dirname: (0, path_1.dirname)(this.filename),
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
            disassemble: disassemble,
            Error: Error
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
function throwError(message, location) {
    return logger.throwError(message, "ASSEMBLER", {
        location: location
    });
}
var Node = /** @class */ (function () {
    function Node(guard, location, options) {
        var _newTarget = this.constructor;
        if (guard !== Guard) {
            throwError("cannot instantiate class", location);
        }
        logger.checkAbstract(_newTarget, Node);
        ethers_1.ethers.utils.defineReadOnly(this, "location", Object.freeze(location));
        ethers_1.ethers.utils.defineReadOnly(this, "tag", "node-" + nextTag++ + "-" + this.constructor.name);
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
        this.children().forEach(function (child) {
            child.visit(visit);
        });
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
            pop: PopNode,
            scope: ScopeNode,
        };
        var factory = Factories[options.type];
        if (!factory) {
            throwError("unknown type: " + options.type, options.loc);
        }
        return factory.from(options);
    };
    return Node;
}());
exports.Node = Node;
var ValueNode = /** @class */ (function (_super) {
    __extends(ValueNode, _super);
    function ValueNode(guard, location, options) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkAbstract(_newTarget, ValueNode);
        _this = _super.call(this, guard, location, options) || this;
        return _this;
    }
    ValueNode.prototype.getPushLiteral = function (value) {
        // Convert value into a hexstring
        var hex = ethers_1.ethers.utils.hexlify(value);
        if (hex === "0x") {
            throwError("invalid literal: 0x", this.location);
        }
        // Make sure it will fit into a push
        var length = ethers_1.ethers.utils.hexDataLength(hex);
        if (length === 0 || length > 32) {
            throwError("literal out of range: " + hex, this.location);
        }
        return hexConcat([opcodes_1.Opcode.from("PUSH" + String(length)), hex]);
    };
    return ValueNode;
}(Node));
exports.ValueNode = ValueNode;
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
                    visit(this, this.getPushLiteral(ethers_1.ethers.BigNumber.from(this.value)));
                }
                assembler.end(this);
                return [2 /*return*/];
            });
        });
    };
    LiteralNode.from = function (options) {
        if (options.type !== "hex" && options.type !== "decimal") {
            throwError("expected hex or decimal type", options.loc);
        }
        return new LiteralNode(Guard, options.loc, options.value, !!options.verbatim);
    };
    return LiteralNode;
}(ValueNode));
exports.LiteralNode = LiteralNode;
var PopNode = /** @class */ (function (_super) {
    __extends(PopNode, _super);
    function PopNode(guard, location, index) {
        return _super.call(this, guard, location, { index: index }) || this;
    }
    Object.defineProperty(PopNode.prototype, "placeholder", {
        get: function () {
            if (this.index === 0) {
                return "$$";
            }
            return "$" + String(this.index);
        },
        enumerable: false,
        configurable: true
    });
    PopNode.from = function (options) {
        return new PopNode(Guard, options.loc, options.index);
    };
    return PopNode;
}(ValueNode));
exports.PopNode = PopNode;
var LinkNode = /** @class */ (function (_super) {
    __extends(LinkNode, _super);
    function LinkNode(guard, location, type, label) {
        return _super.call(this, guard, location, { type: type, label: label }) || this;
    }
    LinkNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var value, isOffset, target, result, here, opcodes, literal, w;
            return __generator(this, function (_a) {
                assembler.start(this);
                value = null;
                isOffset = false;
                target = assembler.getTarget(this.label);
                if (target instanceof LabelNode) {
                    if (this.type === "offset") {
                        value = (assembler.getLinkValue(target, this));
                        isOffset = true;
                    }
                }
                else {
                    result = (assembler.getLinkValue(target, this));
                    if (this.type === "offset") {
                        value = result.offset;
                        isOffset = true;
                    }
                    else if (this.type === "length") {
                        value = result.length;
                    }
                }
                if (value == null) {
                    throwError("labels can only be targeted as offsets", this.location);
                }
                if (isOffset && assembler.positionIndependentCode) {
                    here = assembler.getOffset(this, this);
                    opcodes = [];
                    if (here > value) {
                        literal = "0x";
                        for (w = 1; w <= 5; w++) {
                            if (w > 4) {
                                throwError("jump too large!", this.location);
                            }
                            literal = this.getPushLiteral(here - value + w);
                            if (ethers_1.ethers.utils.hexDataLength(literal) <= w) {
                                literal = ethers_1.ethers.utils.hexZeroPad(literal, w);
                                break;
                            }
                        }
                        opcodes.push(literal);
                        opcodes.push(opcodes_1.Opcode.from("PC"));
                        opcodes.push(opcodes_1.Opcode.from("SUB"));
                        // This also works, in case the above literal thing doesn't work out...
                        //opcodes.push(Opcode.from("PC"));
                        //opcodes.push(pushLiteral(-delta));
                        //opcodes.push(Opcode.from("SWAP1"));
                        //opcodes.push(Opcode.from("SUB"));
                    }
                    else {
                        // Jump forwards; this is easy to calculate since we can
                        // do PC firat.
                        opcodes.push(opcodes_1.Opcode.from("PC"));
                        opcodes.push(this.getPushLiteral(value - here));
                        opcodes.push(opcodes_1.Opcode.from("ADD"));
                    }
                    visit(this, hexConcat(opcodes));
                }
                else {
                    visit(this, this.getPushLiteral(value));
                }
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
    function OpcodeNode(guard, location, opcode, operands, instructional) {
        return _super.call(this, guard, location, { instructional: instructional, opcode: opcode, operands: operands }) || this;
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
            throwError("expected opcode type", options.loc);
        }
        var opcode = opcodes_1.Opcode.from(options.mnemonic);
        if (!opcode) {
            throwError("unknown opcode: " + options.mnemonic, options.loc);
        }
        var operands = Object.freeze(options.operands.map(function (o) {
            var operand = Node.from(o);
            if (!(operand instanceof ValueNode)) {
                throwError("bad grammar?!", options.loc);
            }
            return operand;
        }));
        return new OpcodeNode(Guard, options.loc, opcode, operands, !!options.bare);
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
            throwError("expected label type", options.loc);
        }
        return new LabelNode(Guard, options.loc, options.name);
    };
    return LabelNode;
}(LabelledNode));
exports.LabelNode = LabelNode;
var PaddingNode = /** @class */ (function (_super) {
    __extends(PaddingNode, _super);
    function PaddingNode(guard, location) {
        var _this = _super.call(this, guard, location, {}) || this;
        _this._length = 0;
        return _this;
    }
    PaddingNode.prototype.setLength = function (length) {
        this._length = length;
    };
    PaddingNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var padding;
            return __generator(this, function (_a) {
                assembler.start(this);
                padding = new Uint8Array(this._length);
                padding.fill(0);
                visit(this, ethers_1.ethers.utils.hexlify(padding));
                assembler.end(this);
                return [2 /*return*/];
            });
        });
    };
    return PaddingNode;
}(ValueNode));
exports.PaddingNode = PaddingNode;
var DataNode = /** @class */ (function (_super) {
    __extends(DataNode, _super);
    function DataNode(guard, location, name, data) {
        var _this = _super.call(this, guard, location, name, { data: data }) || this;
        ethers_1.ethers.utils.defineReadOnly(_this, "padding", new PaddingNode(Guard, _this.location));
        return _this;
    }
    DataNode.prototype.assemble = function (assembler, visit) {
        return __awaiter(this, void 0, void 0, function () {
            var i_1, bytecode, i, opcode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assembler.start(this);
                        // @TODO: This is a problem... We need to visit before visiting children
                        // so offsets are correct, but then we cannot pad...
                        visit(this, "0x");
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
                        bytecode = ethers_1.ethers.utils.concat(this.data.map(function (d) { return assembler.getBytecode(d); }));
                        i = 0;
                        while (i < bytecode.length) {
                            opcode = opcodes_1.Opcode.from(bytecode[i++]);
                            if (opcode) {
                                i += opcode.isPush();
                            }
                        }
                        // The amount we overshot the data by is how much padding we need
                        this.padding.setLength(i - bytecode.length);
                        return [4 /*yield*/, this.padding.assemble(assembler, visit)];
                    case 5:
                        _a.sent();
                        assembler.end(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    DataNode.prototype.children = function () {
        var children = this.data.slice();
        children.push(this.padding);
        return children;
    };
    DataNode.from = function (options) {
        if (options.type !== "data") {
            throwError("expected data type", options.loc);
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
                            visit(this, this.getPushLiteral(result));
                        }
                        assembler.end(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    EvaluationNode.from = function (options) {
        if (options.type !== "eval") {
            throwError("expected eval type", options.loc);
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
            throwError("expected exec type", options.loc);
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
    ScopeNode.from = function (options) {
        if (options.type !== "scope") {
            throwError("expected scope type", options.loc);
        }
        return new ScopeNode(Guard, options.loc, options.name, Object.freeze(options.statements.map(function (s) { return Node.from(s); })));
    };
    return ScopeNode;
}(LabelledNode));
exports.ScopeNode = ScopeNode;
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
            offset: i,
            length: 1
        };
        offsets[i] = op;
        ops.push(op);
        i++;
        var push = opcode.isPush();
        if (push) {
            var data = ethers_1.ethers.utils.hexlify(bytes.slice(i, i + push));
            if (ethers_1.ethers.utils.hexDataLength(data) === push) {
                op.pushValue = data;
                op.length += push;
                i += push;
            }
            else {
                oob = true;
            }
        }
    }
    ops.getOperation = function (offset) {
        if (offset >= bytes.length) {
            return {
                opcode: opcodes_1.Opcode.from("STOP"),
                offset: offset,
                length: 1
            };
        }
        return (offsets[offset] || null);
    };
    ops.getByte = function (offset) {
        if (offset >= bytes.length) {
            return 0x00;
        }
        return bytes[offset];
    };
    ops.getBytes = function (offset, length) {
        var result = new Uint8Array(length);
        result.fill(0);
        if (offset < bytes.length) {
            result.set(bytes.slice(offset));
        }
        return ethers_1.ethers.utils.arrayify(result);
    };
    ops.byteLength = bytes.length;
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
var Assembler = /** @class */ (function () {
    function Assembler(root, positionIndependentCode) {
        ethers_1.ethers.utils.defineReadOnly(this, "root", root);
        ethers_1.ethers.utils.defineReadOnly(this, "positionIndependentCode", !!positionIndependentCode);
        var nodes = {};
        var labels = {};
        var parents = {};
        // Link labels to their target node
        root.visit(function (node) {
            nodes[node.tag] = {
                node: node,
                offset: 0x0,
                bytecode: "0x"
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
    }
    // Link operations
    Assembler.prototype.getTarget = function (label) {
        return this.labels[label];
    };
    // Evaluate script in the context of a {{! }} or {{= }}
    Assembler.prototype.evaluate = function (script, source) {
        return Promise.resolve(new Uint8Array(0));
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
    Assembler.prototype.getOffset = function (node, source) {
        var offset = this.nodes[node.tag].offset;
        if (source == null) {
            return offset;
        }
        var sourceScope = ((source instanceof ScopeNode) ? source : this.getAncestor(source, ScopeNode));
        return offset - this.nodes[sourceScope.tag].offset;
    };
    Assembler.prototype.setOffset = function (node, offset) {
        this.nodes[node.tag].offset = offset;
    };
    Assembler.prototype.getBytecode = function (node) {
        return this.nodes[node.tag].bytecode;
    };
    Assembler.prototype.setBytecode = function (node, bytecode) {
        this.nodes[node.tag].bytecode = bytecode;
    };
    Assembler.prototype.getLinkValue = function (target, source) {
        var sourceScope = ((source instanceof ScopeNode) ? source : this.getAncestor(source, ScopeNode));
        var targetScope = ((target instanceof ScopeNode) ? target : this.getAncestor(target, ScopeNode));
        if (target instanceof LabelNode) {
            // Label offset (e.g. "@foo:"); accessible only within its direct scope
            //const scope = this.getAncestor(source, Scope);
            if (targetScope !== sourceScope) {
                throwError("cannot access " + target.name + " from " + source.tag, source.location);
            }
            // Return the offset relative to its scope
            return this.nodes[target.tag].offset - this.nodes[targetScope.tag].offset;
        }
        var info = this.nodes[target.tag];
        // Return the offset is relative to its scope
        var bytes = Array.prototype.slice.call(ethers_1.ethers.utils.arrayify(info.bytecode));
        ethers_1.ethers.utils.defineReadOnly(bytes, "ast", target);
        ethers_1.ethers.utils.defineReadOnly(bytes, "source", target.location.source);
        if (!((target instanceof DataNode) || (target instanceof ScopeNode))) {
            throwError("invalid link value lookup", source.location);
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
                get: function () { throwError("cannot access " + target.name + ".offset from " + source.tag, this.location); }
            });
            ethers_1.ethers.utils.defineReadOnly(bytes, "_freeze", function () { });
        }
        // Add the offset relative to the scope; unless the offset has
        // been marked as invalid, in which case accessing it will fail
        if (safeOffset) {
            bytes.offset = info.offset - this.nodes[sourceScope.tag].offset;
            var frozen_1 = false;
            ethers_1.ethers.utils.defineReadOnly(bytes, "_freeze", function () {
                if (frozen_1) {
                    return;
                }
                frozen_1 = true;
                ethers_1.ethers.utils.defineReadOnly(bytes, "offset", bytes.offset);
            });
        }
        return bytes;
    };
    Assembler.prototype.start = function (node) { };
    Assembler.prototype.end = function (node) { };
    return Assembler;
}());
var SemanticErrorSeverity;
(function (SemanticErrorSeverity) {
    SemanticErrorSeverity["error"] = "error";
    SemanticErrorSeverity["warning"] = "warning";
})(SemanticErrorSeverity = exports.SemanticErrorSeverity || (exports.SemanticErrorSeverity = {}));
;
// This Assembler is designed to only check for errors and warnings
// Warnings
//  - Bare PUSH opcodes
//  - Instructional opcode that has parameters
// Errors
//  - Using a $$ outside of RPN
//  - Using a $$ when it is not adjacent to the stack
//  - The operand count does not match the opcode
//  - An opcode is used as an operand but does not return a value
var SemanticChecker = /** @class */ (function (_super) {
    __extends(SemanticChecker, _super);
    function SemanticChecker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SemanticChecker.prototype.check = function () {
        var _this = this;
        var errors = [];
        this.root.visit(function (node) {
            if (node instanceof OpcodeNode) {
                var opcode = node.opcode;
                if (node.instructional) {
                    if (opcode.delta) {
                        errors.push({
                            message: opcode.mnemonic + " used as instructional",
                            severity: SemanticErrorSeverity.warning,
                            node: node
                        });
                    }
                }
                else {
                    if (opcode.mnemonic === "POP") {
                        if (node.operands.length !== 0) {
                            errors.push({
                                message: "POP expects 0 operands",
                                severity: SemanticErrorSeverity.error,
                                node: node
                            });
                        }
                    }
                    else if (node.operands.length !== opcode.delta) {
                        errors.push({
                            message: opcode.mnemonic + " expects " + opcode.delta + " operands",
                            severity: SemanticErrorSeverity.error,
                            node: node
                        });
                    }
                }
                if (opcode.isPush()) {
                    // A stray PUSH operation will gobble up the following code
                    // bytes which is bad. But this may be a disassembled program
                    // and that PUSH may actually be just some data (which is safe)
                    errors.push({
                        message: "PUSH opcode modifies program flow - use literals instead",
                        severity: SemanticErrorSeverity.warning,
                        node: node
                    });
                }
                else if (!node.location.statement && opcode.alpha !== 1) {
                    // If an opcode does not push anything on the stack, it
                    // cannot be used as an operand
                    errors.push({
                        message: node.opcode.mnemonic + " cannot be an operand",
                        severity: SemanticErrorSeverity.error,
                        node: node
                    });
                }
            }
            if (node.location.statement) {
                if (node instanceof PopNode) {
                    // $$ by itself is useless and is intended to be an operand
                    errors.push({
                        message: "$$ must be an operand",
                        severity: SemanticErrorSeverity.error,
                        node: node
                    });
                }
                else {
                    var scope_1 = _this.getAncestor(node, ScopeNode);
                    // Make sure any $$ is stack adjacent (within this scope)
                    var ordered_1 = [];
                    node.visit(function (node) {
                        if (scope_1 !== _this.getAncestor(node, ScopeNode)) {
                            return;
                        }
                        ordered_1.push(node);
                    });
                    // Allow any number of stack adjacent $$
                    var foundZero = null;
                    var lastIndex = 0;
                    while (ordered_1.length && ordered_1[0] instanceof PopNode) {
                        var popNode = (ordered_1.shift());
                        var index = popNode.index;
                        if (index === 0) {
                            foundZero = popNode;
                        }
                        else if (index !== lastIndex + 1) {
                            errors.push({
                                message: "out-of-order stack placeholder " + popNode.placeholder + "; expected $$" + (lastIndex + 1),
                                severity: SemanticErrorSeverity.error,
                                node: popNode
                            });
                            while (ordered_1.length && ordered_1[0] instanceof PopNode) {
                                ordered_1.shift();
                            }
                            break;
                        }
                        else {
                            lastIndex = index;
                        }
                    }
                    if (foundZero && lastIndex > 0) {
                        errors.push({
                            message: "cannot mix $$ and $1 stack placeholder",
                            severity: SemanticErrorSeverity.error,
                            node: foundZero
                        });
                    }
                    // If there are still any buried, we have a problem
                    var pops = ordered_1.filter(function (n) { return (n instanceof PopNode); });
                    if (pops.length) {
                        errors.push({
                            message: "stack placeholder " + (pops[0]).placeholder + " must be stack adjacent",
                            severity: SemanticErrorSeverity.error,
                            node: pops[0]
                        });
                    }
                }
            }
        });
        return errors;
    };
    return SemanticChecker;
}(Assembler));
var CodeGenerationAssembler = /** @class */ (function (_super) {
    __extends(CodeGenerationAssembler, _super);
    function CodeGenerationAssembler(root, options) {
        var _this = _super.call(this, root, !!options.positionIndependentCode) || this;
        ethers_1.ethers.utils.defineReadOnly(_this, "retry", ((options.retry != null) ? options.retry : 512));
        ethers_1.ethers.utils.defineReadOnly(_this, "filename", (0, path_1.resolve)(options.filename || "./contract.asm"));
        ethers_1.ethers.utils.defineReadOnly(_this, "defines", Object.freeze(options.defines || {}));
        ethers_1.ethers.utils.defineReadOnly(_this, "_stack", []);
        _this.reset();
        return _this;
    }
    CodeGenerationAssembler.prototype._didChange = function () {
        this._changed = true;
    };
    Object.defineProperty(CodeGenerationAssembler.prototype, "changed", {
        get: function () {
            return this._changed;
        },
        enumerable: false,
        configurable: true
    });
    // Reset the assembler for another run with updated values
    CodeGenerationAssembler.prototype.reset = function () {
        var _this = this;
        this._changed = false;
        this._objectCache = {};
        this._nextBytecode = {};
        this._script = new Script(this.filename, function (name, context) {
            return _this.get(name, context);
        });
        this._checks = [];
    };
    CodeGenerationAssembler.prototype.evaluate = function (script, source) {
        return this._script.evaluate(script, source);
    };
    CodeGenerationAssembler.prototype._runChecks = function () {
        var _this = this;
        this._checks.forEach(function (func) {
            if (!func()) {
                _this._didChange();
            }
        });
    };
    CodeGenerationAssembler.prototype.getLinkValue = function (target, source) {
        var _this = this;
        // Since we are iteratively generating code, offsets and lengths
        // may not be stable at any given point in time, so if an offset
        // is negative the code is obviously wrong, however we set it to
        // 0 so we can proceed with generation to fill in as many blanks
        // as possible; then we will try assembling again
        var result = _super.prototype.getLinkValue.call(this, target, source);
        if (typeof (result) === "number") {
            if (result < 0) {
                this._checks.push(function () { return false; });
                return 0;
            }
            this._checks.push(function () {
                return (_super.prototype.getLinkValue.call(_this, target, source) === result);
            });
            return result;
        }
        // The offset cannot be used so is independent
        try {
            if (result.offset < 0) {
                this._checks.push(function () { return false; });
                result.offset = 0;
                //this._didChange();
            }
            else {
                this._checks.push(function () {
                    var check = _super.prototype.getLinkValue.call(_this, target, source);
                    if (check.offset === result.offset && ethers_1.ethers.utils.hexlify(check) === ethers_1.ethers.utils.hexlify(result)) {
                        return true;
                    }
                    return false;
                });
            }
        }
        catch (error) {
            this._checks.push(function () {
                var check = _super.prototype.getLinkValue.call(_this, target, source);
                return (ethers_1.ethers.utils.hexlify(check) === ethers_1.ethers.utils.hexlify(result));
            });
        }
        return result;
    };
    CodeGenerationAssembler.prototype.start = function (node) {
        this._stack.push(node);
        //this._oldBytecode[node.tag] = this.getBytecode(node);
        //this.setBytecode(node, "0x");
        this._nextBytecode[node.tag] = "0x";
    };
    CodeGenerationAssembler.prototype.end = function (node) {
        var _this = this;
        if (this._stack.pop() !== node) {
            throwError("missing push/pop pair", node.location);
        }
        var oldBytecode = this.getBytecode(node);
        this.setBytecode(node, this._nextBytecode[node.tag]);
        if (!(node instanceof PaddingNode)) {
            this._checks.push(function () {
                return (oldBytecode === _this.getBytecode(node));
            });
        }
    };
    // This is used by evaluate to access properties in JavaScript
    // - "defines" allow meta-programming values to be used
    // - jump destinations are available as numbers
    // - bytecode and data are available as an immutable DataSource
    CodeGenerationAssembler.prototype.get = function (name, source) {
        if (name === "defines") {
            return this.defines;
        }
        else if (name === "_ok") {
            this._runChecks();
            return !this._didChange;
        }
        var node = this.labels[name];
        if (!node) {
            return undefined;
        }
        // We cache objects when they are generated so all nodes
        // receive consistent data; if there is a change we will
        // run the entire assembly process again with the updated
        // values
        if (this._objectCache[node.tag] == null) {
            var result = this.getLinkValue(node, source);
            if (typeof (result) !== "number") {
                result._freeze();
            }
            this._objectCache[node.tag] = result;
        }
        return this._objectCache[node.tag];
    };
    CodeGenerationAssembler.prototype._assemble = function () {
        return __awaiter(this, void 0, void 0, function () {
            var offset;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        offset = 0;
                        return [4 /*yield*/, this.root.assemble(this, function (node, bytecode) {
                                // Things have moved; we will need to try again
                                if (_this.getOffset(node) !== offset) {
                                    _this.setOffset(node, offset);
                                    //this._didChange();
                                    _this._checks.push(function () { return false; });
                                }
                                _this._stack.forEach(function (node) {
                                    _this._nextBytecode[node.tag] = hexConcat([
                                        _this._nextBytecode[node.tag],
                                        bytecode
                                    ]);
                                });
                                offset += ethers_1.ethers.utils.hexDataLength(bytecode);
                            })];
                    case 1:
                        _a.sent();
                        this._runChecks();
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeGenerationAssembler.prototype.assemble = function (label) {
        return __awaiter(this, void 0, void 0, function () {
            var target, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (label == null) {
                            label = "_";
                        }
                        target = this.getTarget(label);
                        if (!target) {
                            logger.throwArgumentError("unknown labelled target: " + label, "label", label);
                        }
                        else if (!(target instanceof ScopeNode || target instanceof DataNode)) {
                            logger.throwArgumentError("cannot assemble a bodyless label: " + label, "label", label);
                        }
                        // Continue re-evaluating the bytecode until a stable set of
                        // offsets, length and values are reached.
                        return [4 /*yield*/, this._assemble()];
                    case 1:
                        // Continue re-evaluating the bytecode until a stable set of
                        // offsets, length and values are reached.
                        _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < this.retry)) return [3 /*break*/, 5];
                        // Regenerate the code with the updated assembler values
                        this.reset();
                        return [4 /*yield*/, this._assemble()];
                    case 3:
                        _a.sent();
                        // Generated bytecode is stable!! :)
                        if (!this.changed) {
                            // This should not happen; something is wrong with the grammar
                            // or missing enter/exit call in assemble
                            if (this._stack.length !== 0) {
                                throwError("Bad AST! Bad grammar?!", null);
                            }
                            //console.log(`Assembled in ${ i } attempts`);
                            return [2 /*return*/, this.getBytecode(target)];
                        }
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, logger.throwError("unable to assemble; " + this.retry + " attempts failed to generate stable bytecode", ethers_1.ethers.utils.Logger.errors.UNKNOWN_ERROR, {})];
                }
            });
        });
    };
    return CodeGenerationAssembler;
}(Assembler));
function parse(code, options) {
    if (options == null) {
        options = {};
    }
    // Since Jison allows \n, \r or \r\n line endings, we need some
    // tweaking to get the correct position
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
            return {
                offset: 0,
                line: 0,
                length: code.length,
                source: code,
                statement: true
            };
        }
        var offset = getOffset(loc.first_line, loc.first_column);
        var end = getOffset(loc.last_line, loc.last_column);
        return {
            offset: offset,
            line: loc.first_line - 1,
            length: (end - offset),
            source: code.substring(offset, end),
            statement: (!!loc.statement)
        };
    };
    var result = Node.from((0, _parser_1.parse)(code));
    // Nuke the source code lookup callback
    _parser_1.parser.yy._ethersLocation = null;
    // Semantic Checks
    var checker = new SemanticChecker(result);
    var errors = checker.check();
    if (errors.filter(function (e) { return (e.severity === SemanticErrorSeverity.error); }).length || (errors.length && !options.ignoreWarnings)) {
        var error = new Error("semantic errors during parsing");
        error.errors = errors;
        throw error;
    }
    return result;
}
exports.parse = parse;
function assemble(ast, options) {
    return __awaiter(this, void 0, void 0, function () {
        var assembler;
        return __generator(this, function (_a) {
            assembler = new CodeGenerationAssembler(ast, options || {});
            return [2 /*return*/, assembler.assemble(options.target || "_")];
        });
    });
}
exports.assemble = assemble;
//# sourceMappingURL=assembler.js.map