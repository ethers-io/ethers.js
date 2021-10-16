"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @TODO:
// - warn return/revert non-empty, comment ; !assert(+1 @extra)
// - In JS add config (positionIndependent)
// - When checking name collisions, verify no collision in javascript
import { dirname, resolve } from "path";
import vm from "vm";
import { ethers } from "ethers";
import { Opcode } from "./opcodes";
import { parse as _parse, parser as _parser } from "./_parser";
import { version } from "./_version";
const logger = new ethers.utils.Logger(version);
const Guard = {};
function hexConcat(values) {
    return ethers.utils.hexlify(ethers.utils.concat(values.map((v) => {
        if (v instanceof Opcode) {
            return [v.value];
        }
        if (typeof (v) === "number") {
            if (v >= 0 && v <= 255 && !(v % 1)) {
                return ethers.utils.hexlify(v);
            }
            else {
                throw new Error("invalid number: " + v);
            }
        }
        return v;
    })));
}
function repeat(char, length) {
    let result = char;
    while (result.length < length) {
        result += result;
    }
    return result.substring(0, length);
}
class Script {
    constructor(filename, callback) {
        ethers.utils.defineReadOnly(this, "filename", filename);
        ethers.utils.defineReadOnly(this, "contextObject", this._baseContext(callback));
        ethers.utils.defineReadOnly(this, "context", vm.createContext(this.contextObject));
    }
    _baseContext(callback) {
        return new Proxy({
            __filename: this.filename,
            __dirname: dirname(this.filename),
            console: console,
            Uint8Array: Uint8Array,
            ethers: ethers,
            utils: ethers.utils,
            BigNumber: ethers.BigNumber,
            arrayify: ethers.utils.arrayify,
            concat: hexConcat,
            hexlify: ethers.utils.hexlify,
            zeroPad: function (value, length) {
                return ethers.utils.hexlify(ethers.utils.zeroPad(value, length));
            },
            id: ethers.utils.id,
            keccak256: ethers.utils.keccak256,
            namehash: ethers.utils.namehash,
            sha256: ethers.utils.sha256,
            parseEther: ethers.utils.parseEther,
            formatEther: ethers.utils.formatEther,
            parseUnits: ethers.utils.parseUnits,
            formatUnits: ethers.utils.formatUnits,
            randomBytes: function (length) {
                return ethers.utils.hexlify(ethers.utils.randomBytes(length));
            },
            toUtf8Bytes: ethers.utils.toUtf8Bytes,
            toUtf8String: ethers.utils.toUtf8String,
            formatBytes32String: ethers.utils.formatBytes32String,
            parseBytes32String: ethers.utils.parseBytes32String,
            Opcode: Opcode,
            sighash: function (signature) {
                return ethers.utils.id(ethers.utils.FunctionFragment.from(signature).format()).substring(0, 10);
            },
            topichash: function (signature) {
                return ethers.utils.id(ethers.utils.EventFragment.from(signature).format());
            },
            assemble: assemble,
            disassemble: disassemble,
            Error: Error
        }, {
            get: (obj, key) => {
                if (obj[key]) {
                    return obj[key];
                }
                if (!callback) {
                    return undefined;
                }
                return callback(key, this._context.context);
            }
        });
    }
    evaluate(code, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._context) {
                throw new Error("evaluation collision");
            }
            this._context = { context: context };
            const script = new vm.Script(code, { filename: this.filename });
            let result = script.runInContext(this.context);
            if (result instanceof Promise) {
                result = yield result;
            }
            this._context = null;
            return result;
        });
    }
}
let nextTag = 1;
function throwError(message, location) {
    return logger.throwError(message, "ASSEMBLER", {
        location: location
    });
}
export class Node {
    constructor(guard, location, options) {
        if (guard !== Guard) {
            throwError("cannot instantiate class", location);
        }
        logger.checkAbstract(new.target, Node);
        ethers.utils.defineReadOnly(this, "location", Object.freeze(location));
        ethers.utils.defineReadOnly(this, "tag", `node-${nextTag++}-${this.constructor.name}`);
        for (const key in options) {
            ethers.utils.defineReadOnly(this, key, options[key]);
        }
    }
    // Note: EVERY node must call assemble with `this`, even if only with
    //       the bytes "0x" to trigger the offset and bytecode checks
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            visit(this, "0x");
            assembler.end(this);
        });
    }
    children() {
        return [];
    }
    visit(visit) {
        visit(this);
        this.children().forEach((child) => {
            child.visit(visit);
        });
    }
    static from(options) {
        const Factories = {
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
        const factory = Factories[options.type];
        if (!factory) {
            throwError("unknown type: " + options.type, options.loc);
        }
        return factory.from(options);
    }
}
export class ValueNode extends Node {
    constructor(guard, location, options) {
        logger.checkAbstract(new.target, ValueNode);
        super(guard, location, options);
    }
    getPushLiteral(value) {
        // Convert value into a hexstring
        const hex = ethers.utils.hexlify(value);
        if (hex === "0x") {
            throwError("invalid literal: 0x", this.location);
        }
        // Make sure it will fit into a push
        const length = ethers.utils.hexDataLength(hex);
        if (length === 0 || length > 32) {
            throwError(`literal out of range: ${hex}`, this.location);
        }
        return hexConcat([Opcode.from("PUSH" + String(length)), hex]);
    }
}
export class LiteralNode extends ValueNode {
    constructor(guard, location, value, verbatim) {
        super(guard, location, { value, verbatim });
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            if (this.verbatim) {
                if (this.value.substring(0, 2) === "0x") {
                    visit(this, this.value);
                }
                else {
                    visit(this, ethers.BigNumber.from(this.value).toHexString());
                }
            }
            else {
                visit(this, this.getPushLiteral(ethers.BigNumber.from(this.value)));
            }
            assembler.end(this);
        });
    }
    static from(options) {
        if (options.type !== "hex" && options.type !== "decimal") {
            throwError("expected hex or decimal type", options.loc);
        }
        return new LiteralNode(Guard, options.loc, options.value, !!options.verbatim);
    }
}
export class PopNode extends ValueNode {
    constructor(guard, location, index) {
        super(guard, location, { index });
    }
    get placeholder() {
        if (this.index === 0) {
            return "$$";
        }
        return "$" + String(this.index);
    }
    static from(options) {
        return new PopNode(Guard, options.loc, options.index);
    }
}
export class LinkNode extends ValueNode {
    constructor(guard, location, type, label) {
        super(guard, location, { type, label });
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            let value = null;
            let isOffset = false;
            const target = assembler.getTarget(this.label);
            if (target instanceof LabelNode) {
                if (this.type === "offset") {
                    value = (assembler.getLinkValue(target, this));
                    isOffset = true;
                }
            }
            else {
                const result = (assembler.getLinkValue(target, this));
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
                const here = assembler.getOffset(this, this);
                const opcodes = [];
                if (here > value) {
                    // Jump backwards
                    // Find a literal with length the encodes its own length in the delta
                    let literal = "0x";
                    for (let w = 1; w <= 5; w++) {
                        if (w > 4) {
                            throwError("jump too large!", this.location);
                        }
                        literal = this.getPushLiteral(here - value + w);
                        if (ethers.utils.hexDataLength(literal) <= w) {
                            literal = ethers.utils.hexZeroPad(literal, w);
                            break;
                        }
                    }
                    opcodes.push(literal);
                    opcodes.push(Opcode.from("PC"));
                    opcodes.push(Opcode.from("SUB"));
                    // This also works, in case the above literal thing doesn't work out...
                    //opcodes.push(Opcode.from("PC"));
                    //opcodes.push(pushLiteral(-delta));
                    //opcodes.push(Opcode.from("SWAP1"));
                    //opcodes.push(Opcode.from("SUB"));
                }
                else {
                    // Jump forwards; this is easy to calculate since we can
                    // do PC firat.
                    opcodes.push(Opcode.from("PC"));
                    opcodes.push(this.getPushLiteral(value - here));
                    opcodes.push(Opcode.from("ADD"));
                }
                visit(this, hexConcat(opcodes));
            }
            else {
                visit(this, this.getPushLiteral(value));
            }
            assembler.end(this);
        });
    }
    static from(options) {
        // @TODO: Verify type is offset or link...
        return new LinkNode(Guard, options.loc, options.type, options.label);
    }
}
export class OpcodeNode extends ValueNode {
    constructor(guard, location, opcode, operands, instructional) {
        super(guard, location, { instructional, opcode, operands });
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            // Compute the bytecode in reverse stack order
            for (let i = this.operands.length - 1; i >= 0; i--) {
                yield this.operands[i].assemble(assembler, visit);
            }
            // Append this opcode
            visit(this, ethers.utils.hexlify(this.opcode.value));
            assembler.end(this);
        });
    }
    children() {
        return this.operands;
    }
    visit(visit) {
        for (let i = this.operands.length - 1; i >= 0; i--) {
            this.operands[i].visit(visit);
        }
        visit(this);
    }
    static from(options) {
        if (options.type !== "opcode") {
            throwError("expected opcode type", options.loc);
        }
        const opcode = Opcode.from(options.mnemonic);
        if (!opcode) {
            throwError("unknown opcode: " + options.mnemonic, options.loc);
        }
        const operands = Object.freeze(options.operands.map((o) => {
            const operand = Node.from(o);
            if (!(operand instanceof ValueNode)) {
                throwError("bad grammar?!", options.loc);
            }
            return operand;
        }));
        return new OpcodeNode(Guard, options.loc, opcode, operands, !!options.bare);
    }
}
export class LabelledNode extends Node {
    constructor(guard, location, name, values) {
        logger.checkAbstract(new.target, LabelledNode);
        values = ethers.utils.shallowCopy(values || {});
        values.name = name;
        super(guard, location, values);
    }
}
export class LabelNode extends LabelledNode {
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            visit(this, ethers.utils.hexlify(Opcode.from("JUMPDEST").value));
            assembler.end(this);
        });
    }
    static from(options) {
        if (options.type !== "label") {
            throwError("expected label type", options.loc);
        }
        return new LabelNode(Guard, options.loc, options.name);
    }
}
export class PaddingNode extends ValueNode {
    constructor(guard, location) {
        super(guard, location, {});
        this._length = 0;
    }
    setLength(length) {
        this._length = length;
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            const padding = new Uint8Array(this._length);
            padding.fill(0);
            visit(this, ethers.utils.hexlify(padding));
            assembler.end(this);
        });
    }
}
export class DataNode extends LabelledNode {
    constructor(guard, location, name, data) {
        super(guard, location, name, { data });
        ethers.utils.defineReadOnly(this, "padding", new PaddingNode(Guard, this.location));
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            // @TODO: This is a problem... We need to visit before visiting children
            // so offsets are correct, but then we cannot pad...
            visit(this, "0x");
            for (let i = 0; i < this.data.length; i++) {
                yield this.data[i].assemble(assembler, visit);
            }
            // We pad data if is contains PUSH opcodes that would overrun
            // the data, which could eclipse valid operations (since the
            // VM won't execute or jump within PUSH operations)
            const bytecode = ethers.utils.concat(this.data.map((d) => assembler.getBytecode(d)));
            // Replay the data as bytecode, skipping PUSH data
            let i = 0;
            while (i < bytecode.length) {
                const opcode = Opcode.from(bytecode[i++]);
                if (opcode) {
                    i += opcode.isPush();
                }
            }
            // The amount we overshot the data by is how much padding we need
            this.padding.setLength(i - bytecode.length);
            yield this.padding.assemble(assembler, visit);
            assembler.end(this);
        });
    }
    children() {
        const children = this.data.slice();
        children.push(this.padding);
        return children;
    }
    static from(options) {
        if (options.type !== "data") {
            throwError("expected data type", options.loc);
        }
        return new DataNode(Guard, options.loc, options.name, Object.freeze(options.data.map((d) => Node.from(d))));
    }
}
export class EvaluationNode extends ValueNode {
    constructor(guard, location, script, verbatim) {
        super(guard, location, { script, verbatim });
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            const result = yield assembler.evaluate(this.script, this);
            if (this.verbatim) {
                if (typeof (result) === "number") {
                    visit(this, ethers.BigNumber.from(result).toHexString());
                }
                else {
                    visit(this, ethers.utils.hexlify(result));
                }
            }
            else {
                visit(this, this.getPushLiteral(result));
            }
            assembler.end(this);
        });
    }
    static from(options) {
        if (options.type !== "eval") {
            throwError("expected eval type", options.loc);
        }
        return new EvaluationNode(Guard, options.loc, options.script, !!options.verbatim);
    }
}
export class ExecutionNode extends Node {
    constructor(guard, location, script) {
        super(guard, location, { script });
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            yield assembler.evaluate(this.script, this);
            assembler.end(this);
        });
    }
    static from(options) {
        if (options.type !== "exec") {
            throwError("expected exec type", options.loc);
        }
        return new ExecutionNode(Guard, options.loc, options.script);
    }
}
export class ScopeNode extends LabelledNode {
    constructor(guard, location, name, statements) {
        super(guard, location, name, { statements });
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            visit(this, "0x");
            for (let i = 0; i < this.statements.length; i++) {
                yield this.statements[i].assemble(assembler, visit);
            }
            assembler.end(this);
        });
    }
    children() {
        return this.statements;
    }
    static from(options) {
        if (options.type !== "scope") {
            throwError("expected scope type", options.loc);
        }
        return new ScopeNode(Guard, options.loc, options.name, Object.freeze(options.statements.map((s) => Node.from(s))));
    }
}
export function disassemble(bytecode) {
    const ops = [];
    const offsets = {};
    const bytes = ethers.utils.arrayify(bytecode, { allowMissingPrefix: true });
    let i = 0;
    let oob = false;
    while (i < bytes.length) {
        let opcode = Opcode.from(bytes[i]);
        if (!opcode) {
            opcode = new Opcode(`unknown (${ethers.utils.hexlify(bytes[i])})`, bytes[i], 0, 0);
        }
        else if (oob && opcode.mnemonic === "JUMPDEST") {
            opcode = new Opcode(`JUMPDEST (invalid; OOB!!)`, bytes[i], 0, 0);
        }
        const op = {
            opcode: opcode,
            offset: i,
            length: 1
        };
        offsets[i] = op;
        ops.push(op);
        i++;
        const push = opcode.isPush();
        if (push) {
            const data = ethers.utils.hexlify(bytes.slice(i, i + push));
            if (ethers.utils.hexDataLength(data) === push) {
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
                opcode: Opcode.from("STOP"),
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
        const result = new Uint8Array(length);
        result.fill(0);
        if (offset < bytes.length) {
            result.set(bytes.slice(offset));
        }
        return ethers.utils.arrayify(result);
    };
    ops.byteLength = bytes.length;
    return ops;
}
export function formatBytecode(bytecode) {
    const lines = [];
    bytecode.forEach((op) => {
        const opcode = op.opcode;
        let offset = ethers.utils.hexZeroPad(ethers.utils.hexlify(op.offset), 2);
        if (opcode.isValidJumpDest()) {
            offset += "*";
        }
        else {
            offset += " ";
        }
        let operation = opcode.mnemonic;
        const push = opcode.isPush();
        if (push) {
            if (op.pushValue) {
                operation = op.pushValue + `${repeat(" ", 67 - op.pushValue.length)}; #${push} `;
            }
            else {
                operation += `${repeat(" ", 67 - operation.length)}; OOB!! `;
            }
        }
        lines.push(`${offset.substring(2)}: ${operation}`);
    });
    return lines.join("\n");
}
class Assembler {
    constructor(root, positionIndependentCode) {
        ethers.utils.defineReadOnly(this, "root", root);
        ethers.utils.defineReadOnly(this, "positionIndependentCode", !!positionIndependentCode);
        const nodes = {};
        const labels = {};
        const parents = {};
        // Link labels to their target node
        root.visit((node) => {
            nodes[node.tag] = {
                node: node,
                offset: 0x0,
                bytecode: "0x"
            };
            if (node instanceof LabelledNode) {
                // Check for duplicate labels
                if (labels[node.name]) {
                    logger.throwError(("duplicate label: " + node.name), ethers.utils.Logger.errors.UNSUPPORTED_OPERATION, {});
                }
                labels[node.name] = node;
            }
        });
        root.visit((node) => {
            // Check all labels exist
            if (node instanceof LinkNode) {
                const target = labels[node.label];
                if (!target) {
                    logger.throwError(("missing label: " + node.label), ethers.utils.Logger.errors.UNSUPPORTED_OPERATION, {});
                }
            }
            // Build the parent structure
            node.children().forEach((child) => {
                parents[child.tag] = node;
            });
        });
        ethers.utils.defineReadOnly(this, "labels", Object.freeze(labels));
        ethers.utils.defineReadOnly(this, "nodes", Object.freeze(nodes));
        ethers.utils.defineReadOnly(this, "_parents", Object.freeze(parents));
    }
    // Link operations
    getTarget(label) {
        return this.labels[label];
    }
    // Evaluate script in the context of a {{! }} or {{= }}
    evaluate(script, source) {
        return Promise.resolve(new Uint8Array(0));
    }
    getAncestor(node, cls) {
        node = this._parents[node.tag];
        while (node) {
            if (node instanceof cls) {
                return node;
            }
            node = this._parents[node.tag];
        }
        return null;
    }
    getOffset(node, source) {
        const offset = this.nodes[node.tag].offset;
        if (source == null) {
            return offset;
        }
        const sourceScope = ((source instanceof ScopeNode) ? source : this.getAncestor(source, ScopeNode));
        return offset - this.nodes[sourceScope.tag].offset;
    }
    setOffset(node, offset) {
        this.nodes[node.tag].offset = offset;
    }
    getBytecode(node) {
        return this.nodes[node.tag].bytecode;
    }
    setBytecode(node, bytecode) {
        this.nodes[node.tag].bytecode = bytecode;
    }
    getLinkValue(target, source) {
        const sourceScope = ((source instanceof ScopeNode) ? source : this.getAncestor(source, ScopeNode));
        const targetScope = ((target instanceof ScopeNode) ? target : this.getAncestor(target, ScopeNode));
        if (target instanceof LabelNode) {
            // Label offset (e.g. "@foo:"); accessible only within its direct scope
            //const scope = this.getAncestor(source, Scope);
            if (targetScope !== sourceScope) {
                throwError(`cannot access ${target.name} from ${source.tag}`, source.location);
            }
            // Return the offset relative to its scope
            return this.nodes[target.tag].offset - this.nodes[targetScope.tag].offset;
        }
        const info = this.nodes[target.tag];
        // Return the offset is relative to its scope
        const bytes = Array.prototype.slice.call(ethers.utils.arrayify(info.bytecode));
        ethers.utils.defineReadOnly(bytes, "ast", target);
        ethers.utils.defineReadOnly(bytes, "source", target.location.source);
        if (!((target instanceof DataNode) || (target instanceof ScopeNode))) {
            throwError("invalid link value lookup", source.location);
        }
        // Check that target is any descendant (or self) of the source scope
        let safeOffset = (sourceScope == targetScope);
        if (!safeOffset) {
            sourceScope.visit((node) => {
                if (node === targetScope) {
                    safeOffset = true;
                }
            });
        }
        // Not safe to access the offset; this will fault if anything tries.
        if (!safeOffset) {
            Object.defineProperty(bytes, "offset", {
                get: function () { throwError(`cannot access ${target.name}.offset from ${source.tag}`, this.location); }
            });
            ethers.utils.defineReadOnly(bytes, "_freeze", function () { });
        }
        // Add the offset relative to the scope; unless the offset has
        // been marked as invalid, in which case accessing it will fail
        if (safeOffset) {
            bytes.offset = info.offset - this.nodes[sourceScope.tag].offset;
            let frozen = false;
            ethers.utils.defineReadOnly(bytes, "_freeze", function () {
                if (frozen) {
                    return;
                }
                frozen = true;
                ethers.utils.defineReadOnly(bytes, "offset", bytes.offset);
            });
        }
        return bytes;
    }
    start(node) { }
    end(node) { }
}
export var SemanticErrorSeverity;
(function (SemanticErrorSeverity) {
    SemanticErrorSeverity["error"] = "error";
    SemanticErrorSeverity["warning"] = "warning";
})(SemanticErrorSeverity || (SemanticErrorSeverity = {}));
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
class SemanticChecker extends Assembler {
    check() {
        const errors = [];
        this.root.visit((node) => {
            if (node instanceof OpcodeNode) {
                const opcode = node.opcode;
                if (node.instructional) {
                    if (opcode.delta) {
                        errors.push({
                            message: `${opcode.mnemonic} used as instructional`,
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
                            message: `${opcode.mnemonic} expects ${opcode.delta} operands`,
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
                        message: `${node.opcode.mnemonic} cannot be an operand`,
                        severity: SemanticErrorSeverity.error,
                        node: node
                    });
                }
            }
            if (node.location.statement) {
                if (node instanceof PopNode) {
                    // $$ by itself is useless and is intended to be an operand
                    errors.push({
                        message: `$$ must be an operand`,
                        severity: SemanticErrorSeverity.error,
                        node: node
                    });
                }
                else {
                    const scope = this.getAncestor(node, ScopeNode);
                    // Make sure any $$ is stack adjacent (within this scope)
                    const ordered = [];
                    node.visit((node) => {
                        if (scope !== this.getAncestor(node, ScopeNode)) {
                            return;
                        }
                        ordered.push(node);
                    });
                    // Allow any number of stack adjacent $$
                    let foundZero = null;
                    let lastIndex = 0;
                    while (ordered.length && ordered[0] instanceof PopNode) {
                        const popNode = (ordered.shift());
                        const index = popNode.index;
                        if (index === 0) {
                            foundZero = popNode;
                        }
                        else if (index !== lastIndex + 1) {
                            errors.push({
                                message: `out-of-order stack placeholder ${popNode.placeholder}; expected $$${lastIndex + 1}`,
                                severity: SemanticErrorSeverity.error,
                                node: popNode
                            });
                            while (ordered.length && ordered[0] instanceof PopNode) {
                                ordered.shift();
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
                    const pops = ordered.filter((n) => (n instanceof PopNode));
                    if (pops.length) {
                        errors.push({
                            message: `stack placeholder ${(pops[0]).placeholder} must be stack adjacent`,
                            severity: SemanticErrorSeverity.error,
                            node: pops[0]
                        });
                    }
                }
            }
        });
        return errors;
    }
}
class CodeGenerationAssembler extends Assembler {
    constructor(root, options) {
        super(root, !!options.positionIndependentCode);
        ethers.utils.defineReadOnly(this, "retry", ((options.retry != null) ? options.retry : 512));
        ethers.utils.defineReadOnly(this, "filename", resolve(options.filename || "./contract.asm"));
        ethers.utils.defineReadOnly(this, "defines", Object.freeze(options.defines || {}));
        ethers.utils.defineReadOnly(this, "_stack", []);
        this.reset();
    }
    _didChange() {
        this._changed = true;
    }
    get changed() {
        return this._changed;
    }
    // Reset the assembler for another run with updated values
    reset() {
        this._changed = false;
        this._objectCache = {};
        this._nextBytecode = {};
        this._script = new Script(this.filename, (name, context) => {
            return this.get(name, context);
        });
        this._checks = [];
    }
    evaluate(script, source) {
        return this._script.evaluate(script, source);
    }
    _runChecks() {
        this._checks.forEach((func) => {
            if (!func()) {
                this._didChange();
            }
        });
    }
    getLinkValue(target, source) {
        // Since we are iteratively generating code, offsets and lengths
        // may not be stable at any given point in time, so if an offset
        // is negative the code is obviously wrong, however we set it to
        // 0 so we can proceed with generation to fill in as many blanks
        // as possible; then we will try assembling again
        const result = super.getLinkValue(target, source);
        if (typeof (result) === "number") {
            if (result < 0) {
                this._checks.push(() => false);
                return 0;
            }
            this._checks.push(() => {
                return (super.getLinkValue(target, source) === result);
            });
            return result;
        }
        // The offset cannot be used so is independent
        try {
            if (result.offset < 0) {
                this._checks.push(() => false);
                result.offset = 0;
                //this._didChange();
            }
            else {
                this._checks.push(() => {
                    const check = super.getLinkValue(target, source);
                    if (check.offset === result.offset && ethers.utils.hexlify(check) === ethers.utils.hexlify(result)) {
                        return true;
                    }
                    return false;
                });
            }
        }
        catch (error) {
            this._checks.push(() => {
                const check = super.getLinkValue(target, source);
                return (ethers.utils.hexlify(check) === ethers.utils.hexlify(result));
            });
        }
        return result;
    }
    start(node) {
        this._stack.push(node);
        //this._oldBytecode[node.tag] = this.getBytecode(node);
        //this.setBytecode(node, "0x");
        this._nextBytecode[node.tag] = "0x";
    }
    end(node) {
        if (this._stack.pop() !== node) {
            throwError("missing push/pop pair", node.location);
        }
        const oldBytecode = this.getBytecode(node);
        this.setBytecode(node, this._nextBytecode[node.tag]);
        if (!(node instanceof PaddingNode)) {
            this._checks.push(() => {
                return (oldBytecode === this.getBytecode(node));
            });
        }
    }
    // This is used by evaluate to access properties in JavaScript
    // - "defines" allow meta-programming values to be used
    // - jump destinations are available as numbers
    // - bytecode and data are available as an immutable DataSource
    get(name, source) {
        if (name === "defines") {
            return this.defines;
        }
        else if (name === "_ok") {
            this._runChecks();
            return !this._didChange;
        }
        const node = this.labels[name];
        if (!node) {
            return undefined;
        }
        // We cache objects when they are generated so all nodes
        // receive consistent data; if there is a change we will
        // run the entire assembly process again with the updated
        // values
        if (this._objectCache[node.tag] == null) {
            const result = this.getLinkValue(node, source);
            if (typeof (result) !== "number") {
                result._freeze();
            }
            this._objectCache[node.tag] = result;
        }
        return this._objectCache[node.tag];
    }
    _assemble() {
        return __awaiter(this, void 0, void 0, function* () {
            let offset = 0;
            yield this.root.assemble(this, (node, bytecode) => {
                // Things have moved; we will need to try again
                if (this.getOffset(node) !== offset) {
                    this.setOffset(node, offset);
                    //this._didChange();
                    this._checks.push(() => false);
                }
                this._stack.forEach((node) => {
                    this._nextBytecode[node.tag] = hexConcat([
                        this._nextBytecode[node.tag],
                        bytecode
                    ]);
                });
                offset += ethers.utils.hexDataLength(bytecode);
            });
            this._runChecks();
        });
    }
    assemble(label) {
        return __awaiter(this, void 0, void 0, function* () {
            if (label == null) {
                label = "_";
            }
            const target = this.getTarget(label);
            if (!target) {
                logger.throwArgumentError(`unknown labelled target: ${label}`, "label", label);
            }
            else if (!(target instanceof ScopeNode || target instanceof DataNode)) {
                logger.throwArgumentError(`cannot assemble a bodyless label: ${label}`, "label", label);
            }
            // Continue re-evaluating the bytecode until a stable set of
            // offsets, length and values are reached.
            yield this._assemble();
            for (let i = 0; i < this.retry; i++) {
                // Regenerate the code with the updated assembler values
                this.reset();
                yield this._assemble();
                // Generated bytecode is stable!! :)
                if (!this.changed) {
                    // This should not happen; something is wrong with the grammar
                    // or missing enter/exit call in assemble
                    if (this._stack.length !== 0) {
                        throwError("Bad AST! Bad grammar?!", null);
                    }
                    //console.log(`Assembled in ${ i } attempts`);
                    return this.getBytecode(target);
                }
            }
            return logger.throwError(`unable to assemble; ${this.retry} attempts failed to generate stable bytecode`, ethers.utils.Logger.errors.UNKNOWN_ERROR, {});
        });
    }
}
export function parse(code, options) {
    if (options == null) {
        options = {};
    }
    // Since Jison allows \n, \r or \r\n line endings, we need some
    // tweaking to get the correct position
    const lines = [];
    let offset = 0;
    code.split(/(\r\n?|\n)/g).forEach((clump, index) => {
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
    const getOffset = function (line, column) {
        const info = lines[line - 1];
        if (!info || column >= info.line.length) {
            throw new Error("out of range");
        }
        return info.offset + column;
    };
    // We use this in the _parser to convert locations to source
    _parser.yy._ethersLocation = function (loc) {
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
        const offset = getOffset(loc.first_line, loc.first_column);
        const end = getOffset(loc.last_line, loc.last_column);
        return {
            offset: offset,
            line: loc.first_line - 1,
            length: (end - offset),
            source: code.substring(offset, end),
            statement: (!!loc.statement)
        };
    };
    const result = Node.from(_parse(code));
    // Nuke the source code lookup callback
    _parser.yy._ethersLocation = null;
    // Semantic Checks
    const checker = new SemanticChecker(result);
    const errors = checker.check();
    if (errors.filter((e) => (e.severity === SemanticErrorSeverity.error)).length || (errors.length && !options.ignoreWarnings)) {
        const error = new Error("semantic errors during parsing");
        error.errors = errors;
        throw error;
    }
    return result;
}
export function assemble(ast, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const assembler = new CodeGenerationAssembler(ast, options || {});
        return assembler.assemble(options.target || "_");
    });
}
//# sourceMappingURL=assembler.js.map