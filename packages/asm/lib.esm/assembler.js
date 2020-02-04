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
// - PIC
// - warn on opcode non-function iff parameters
// - warn return/revert non-empty, comment ; !assert(+1 @extra)
// - $$
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
            disassemble: disassemble
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
export class Node {
    constructor(guard, location, options) {
        if (guard !== Guard) {
            throw new Error("cannot instantiate class");
        }
        logger.checkAbstract(new.target, Node);
        ethers.utils.defineReadOnly(this, "location", location);
        ethers.utils.defineReadOnly(this, "tag", `node-${nextTag++}-${this.constructor.name}`);
        ethers.utils.defineReadOnly(this, "warnings", []);
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
            scope: ScopeNode,
        };
        const factory = Factories[options.type];
        if (!factory) {
            throw new Error("uknown type: " + options.type);
        }
        return factory.from(options);
    }
}
/*
export abstract class CodeNode extends Node {
    constructor(guard: any, location: Location, options: { [ key: string ]: any }) {
        logger.checkAbstract(new.target, CodeNode);
        super(guard, location, options);
    }
}
*/
export class ValueNode extends Node {
    constructor(guard, location, options) {
        logger.checkAbstract(new.target, ValueNode);
        super(guard, location, options);
    }
}
function pushLiteral(value) {
    // Convert value into a hexstring
    const hex = ethers.utils.hexlify(value);
    if (hex === "0x") {
        throw new Error("invalid literal: 0x");
    }
    // Make sure it will fit into a push
    const length = ethers.utils.hexDataLength(hex);
    if (length === 0 || length > 32) {
        throw new Error(`literal out of range: ${hex}`);
    }
    return hexConcat([Opcode.from("PUSH" + String(length)), hex]);
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
                visit(this, pushLiteral(ethers.BigNumber.from(this.value)));
            }
            assembler.end(this);
        });
    }
    static from(options) {
        if (options.type !== "hex" && options.type !== "decimal") {
            throw new Error("expected hex or decimal type");
        }
        return new LiteralNode(Guard, options.loc, options.value, !!options.verbatim);
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
            const target = assembler.getTarget(this.label);
            if (target instanceof LabelNode) {
                if (this.type === "offset") {
                    //value = assembler.getOffset(this.label);
                    value = (assembler.getLinkValue(target, this));
                }
            }
            else {
                const result = (assembler.getLinkValue(target, this));
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
        });
    }
    static from(options) {
        // @TODO: Verify type is offset or link...
        return new LinkNode(Guard, options.loc, options.type, options.label);
    }
}
export class OpcodeNode extends ValueNode {
    constructor(guard, location, opcode, operands) {
        super(guard, location, { opcode, operands });
        if (opcode.isPush()) {
            this.warnings.push("the PUSH opcode modifies program flow - use literals instead");
        }
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
            throw new Error("expected opcode type");
        }
        const opcode = Opcode.from(options.mnemonic);
        if (!opcode) {
            throw new Error("unknown opcode: " + options.mnemonic);
        }
        // Using the function syntax will check the operand count
        if (!options.bare) {
            if (opcode.mnemonic === "POP" && options.operands.length === 0) {
                // This is ok... Pop has a delta of 0, but without operands
            }
            else if (options.operands.length !== opcode.delta) {
                throw new Error(`opcode ${opcode.mnemonic} expects ${opcode.delta} operands`);
            }
        }
        const operands = Object.freeze(options.operands.map((o) => {
            const operand = Node.from(o);
            if (!(operand instanceof ValueNode)) {
                throw new Error("invalid operand");
            }
            return operand;
        }));
        return new OpcodeNode(Guard, options.loc, opcode, operands);
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
            throw new Error("expected label type");
        }
        return new LabelNode(Guard, options.loc, options.name);
    }
}
export class DataNode extends LabelledNode {
    constructor(guard, location, name, data) {
        super(guard, location, name, { data });
    }
    assemble(assembler, visit) {
        return __awaiter(this, void 0, void 0, function* () {
            assembler.start(this);
            for (let i = 0; i < this.data.length; i++) {
                yield this.data[i].assemble(assembler, visit);
            }
            // We pad data if is contains PUSH opcodes that would overrun
            // the data, which could eclipse valid operations (since the
            // VM won't execute or jump within PUSH operations)
            const bytecode = ethers.utils.arrayify(assembler.getPendingBytecode(this));
            // Replay the data as bytecode, skipping PUSH data
            let i = 0;
            while (i < bytecode.length) {
                const opcode = Opcode.from(bytecode[i++]);
                if (opcode) {
                    i += opcode.isPush();
                }
            }
            // The amount we overshot the data by is how much padding we need
            const padding = new Uint8Array(i - bytecode.length);
            // What makes more sense? INVALID or 0 (i.e. STOP)?
            //padding.fill(Opcode.from("INVALID").value);
            padding.fill(0);
            visit(this, ethers.utils.hexlify(padding));
            assembler.end(this);
        });
    }
    children() {
        return this.data;
    }
    visit(visit) {
        visit(this);
        for (let i = 0; i < this.data.length; i++) {
            this.data[i].visit(visit);
        }
    }
    static from(options) {
        if (options.type !== "data") {
            throw new Error("expected data type");
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
                visit(this, pushLiteral(result));
            }
            assembler.end(this);
        });
    }
    static from(options) {
        if (options.type !== "eval") {
            throw new Error("expected eval type");
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
            throw new Error("expected exec type");
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
    visit(visit) {
        visit(this);
        for (let i = 0; i < this.statements.length; i++) {
            this.statements[i].visit(visit);
        }
    }
    static from(options) {
        if (options.type !== "scope") {
            throw new Error("expected scope type");
        }
        return new ScopeNode(Guard, options.loc, options.name, Object.freeze(options.statements.map((s) => Node.from(s))));
    }
}
export function parse(code) {
    // Since jison allows \n, \r or \r\n line endings, we need some
    // twekaing to get the correct position
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
            return Object.freeze({
                offset: 0,
                length: code.length,
                source: code
            });
        }
        const offset = getOffset(loc.first_line, loc.first_column);
        const end = getOffset(loc.last_line, loc.last_column);
        return Object.freeze({
            offset: offset,
            length: (end - offset),
            source: code.substring(offset, end)
        });
    };
    const result = Node.from(_parse(code));
    // Nuke the source code lookup callback
    _parser.yy._ethersLocation = null;
    return result;
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
            offset: i
        };
        offsets[i] = op;
        ops.push(op);
        i++;
        const push = opcode.isPush();
        if (push) {
            const data = ethers.utils.hexlify(bytes.slice(i, i + push));
            if (ethers.utils.hexDataLength(data) === push) {
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
// @TODO: Rename to Assembler?
class Assembler {
    constructor(root, options) {
        ethers.utils.defineReadOnly(this, "positionIndependentCode", !!options.positionIndependentCode);
        ethers.utils.defineReadOnly(this, "retry", ((options.retry != null) ? options.retry : 512));
        ethers.utils.defineReadOnly(this, "filename", resolve(options.filename || "./contract.asm"));
        ethers.utils.defineReadOnly(this, "defines", Object.freeze(options.defines || {}));
        ethers.utils.defineReadOnly(this, "root", root);
        const nodes = {};
        const labels = {};
        const parents = {};
        // Link labels to their target node
        root.visit((node) => {
            nodes[node.tag] = {
                node: node,
                offset: 0x0,
                bytecode: "0x",
                pending: "0x"
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
        ethers.utils.defineReadOnly(this, "_stack", []);
        this.reset();
    }
    get changed() {
        return this._changed;
    }
    // Link operations
    getTarget(name) {
        return this.labels[name];
    }
    // Reset the assmebler for another run with updated values
    reset() {
        this._changed = false;
        for (const tag in this.nodes) {
            delete this.nodes[tag].object;
        }
        this._script = new Script(this.filename, (name, context) => {
            return this.get(name, context);
        });
    }
    evaluate(script, source) {
        return this._script.evaluate(script, source);
    }
    start(node) {
        this._stack.push(node);
        const info = this.nodes[node.tag];
        info.pending = "0x";
    }
    end(node) {
        if (this._stack.pop() !== node) {
            throw new Error("missing push/pop pair");
        }
        const info = this.nodes[node.tag];
        if (info.pending !== info.bytecode) {
            this._didChange();
        }
        info.bytecode = info.pending;
    }
    getPendingBytecode(node) {
        return this.nodes[node.tag].pending;
    }
    _appendBytecode(bytecode) {
        this._stack.forEach((node) => {
            const info = this.nodes[node.tag];
            info.pending = hexConcat([info.pending, bytecode]);
        });
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
    getLinkValue(target, source) {
        const sourceScope = ((source instanceof ScopeNode) ? source : this.getAncestor(source, ScopeNode));
        const targetScope = ((target instanceof ScopeNode) ? target : this.getAncestor(target, ScopeNode));
        if (target instanceof LabelNode) {
            // Label offset (e.g. "@foo:"); accessible only within its direct scope
            //const scope = this.getAncestor(source, Scope);
            if (targetScope !== sourceScope) {
                throw new Error(`cannot access ${target.name} from ${source.tag}`);
            }
            // Return the offset relative to its scope
            let offset = this.nodes[target.tag].offset - this.nodes[targetScope.tag].offset;
            // Offsets are wrong; but we should finish this run and then try again
            if (offset < 0) {
                offset = 0;
                this._didChange();
            }
            return offset;
        }
        const info = this.nodes[target.tag];
        // Return the offset is relative to its scope
        const bytes = Array.prototype.slice.call(ethers.utils.arrayify(info.bytecode));
        bytes.ast = target;
        bytes.source = target.location.source;
        if (!((target instanceof DataNode) || (target instanceof ScopeNode))) {
            throw new Error("invalid link value lookup");
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
                get: function () { throw new Error(`cannot access ${target.name}.offset from ${source.tag}`); }
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
    }
    get(name, source) {
        if (name === "defines") {
            return this.defines;
        }
        const node = this.labels[name];
        if (!node) {
            return undefined;
        }
        const info = this.nodes[node.tag];
        if (info.object == null) {
            info.object = this.getLinkValue(node, source);
        }
        return info.object;
    }
    _didChange() {
        this._changed = true;
    }
    _assemble() {
        return __awaiter(this, void 0, void 0, function* () {
            let offset = 0;
            const bytecodes = [];
            yield this.root.assemble(this, (node, bytecode) => {
                const state = this.nodes[node.tag];
                // Things have moved; we will need to try again
                if (state.offset !== offset) {
                    state.offset = offset;
                    this._didChange();
                }
                this._appendBytecode(bytecode);
                bytecodes.push(bytecode);
                // The bytecode has changed; we will need to try again
                //if (state.bytecode !== bytecode) {
                //    state.bytecode = bytecode;
                //    this._didChange();
                //}
                offset += ethers.utils.hexDataLength(bytecode);
            });
            return hexConcat(bytecodes);
        });
    }
    assemble() {
        return __awaiter(this, void 0, void 0, function* () {
            // Continue re-evaluating the bytecode until a stable set of
            // offsets, length and values are reached.
            let bytecode = yield this._assemble();
            for (let i = 0; i < this.retry; i++) {
                // Regenerate the code with the updated assembler values
                this.reset();
                const adjusted = yield this._assemble();
                // Generated bytecode is stable!! :)
                if (!this.changed) {
                    console.log(`Assembled in ${i} attempts`);
                    return bytecode;
                }
                // Try again...
                bytecode = adjusted;
            }
            // This should not happen; something is wrong with the grammar
            // or missing enter/exit call in assemble
            if (this._stack.length !== 0) {
                throw new Error("bad AST");
            }
            return logger.throwError(`unable to assemble; ${this.retry} attempts failed to generate stable bytecode`, ethers.utils.Logger.errors.UNKNOWN_ERROR, {});
        });
    }
}
export function assemble(ast, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const assembler = new Assembler(ast, options || {});
        return assembler.assemble();
    });
}
