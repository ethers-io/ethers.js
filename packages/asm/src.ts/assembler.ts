"use strict";

// @TODO:
// - PIC
// - warn on opcode non-function iff parameters
// - warn return/revert non-empty, comment ; !assert(+1 @extra)
// - $$
// - In JS add config (positionIndependent)
// - When checking name collisions, verify no collision in javascript

import { dirname, resolve } from "path";
import _module from "module";
import vm from "vm";

import { ethers } from "ethers";

import { Opcode } from "./opcodes";

import { parse as _parse, parser as _parser } from "./_parser";

import { version } from "./_version";
const logger = new ethers.utils.Logger(version);

const Guard = { };

function hexConcat(values: Array<Opcode | ethers.utils.BytesLike>): string {
    return ethers.utils.hexlify(ethers.utils.concat(values.map((v) => {
        if (v instanceof Opcode) { return [ v.value ]; }
        return v;
    })));
}

function repeat(char: string, length: number): string {
    let result = char;
    while (result.length < length) { result += result; }
    return result.substring(0, length);
}

class Script {
    readonly filename: string;
    readonly context: any;
    readonly contextObject: any;

    private _context: { context: any };

    constructor(filename: string, callback: (name: string, context: any) => any) {
        ethers.utils.defineReadOnly(this, "filename", filename);

        ethers.utils.defineReadOnly(this, "contextObject", this._baseContext(callback));
        ethers.utils.defineReadOnly(this, "context", vm.createContext(this.contextObject));
    }

    _baseContext(callback: (name: string, context: any) => any): any {
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
            zeroPad: function(value: ethers.utils.BytesLike, length: number) {
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

            randomBytes: function(length: number): string {
                return ethers.utils.hexlify(ethers.utils.randomBytes(length));
            },

            toUtf8Bytes: ethers.utils.toUtf8Bytes,
            toUtf8String: ethers.utils.toUtf8String,
            formatBytes32String: ethers.utils.formatBytes32String,
            parseBytes32String: ethers.utils.parseBytes32String,

            Opcode: Opcode,

            sighash: function(signature: string): string {
               return ethers.utils.id(ethers.utils.FunctionFragment.from(signature).format()).substring(0, 10);
            },
            topichash: function(signature: string): string {
               return ethers.utils.id(ethers.utils.EventFragment.from(signature).format());
            },

            assemble: assemble,
            disassemble: disassemble
        }, {
            get: (obj: any, key: string): any => {
                if (obj[key]) { return obj[key]; }
                if (!callback) { return undefined; }
                return callback(key, this._context.context);
            }
        });
    }


    async evaluate(code: string, context?: any): Promise<string> {
        if (this._context) { throw new Error("evaluation collision"); }
        this._context = { context: context };

        const script = new vm.Script(code, { filename: this.filename });

        let result = script.runInContext(this.context);
        if (result instanceof Promise) {
            result = await result;
        }

        this._context = null;

        return result;
    }
}

let nextTag = 1;

export type Location = {
    offset: number;
    line: number;
    length: number;
    source: string;
    statement: boolean;
};

export type AssembleVisitFunc = (node: Node, bytecode: string) => void;

export type VisitFunc = (node: Node) => void;

export abstract class Node {
    readonly tag: string;
    readonly location: Location;

    constructor(guard: any, location: Location, options: { [ key: string ]: any }) {
        if (guard !== Guard) { throw new Error("cannot instantiate class"); }
        logger.checkAbstract(new.target, Node);

        ethers.utils.defineReadOnly(this, "location", Object.freeze(location));

        ethers.utils.defineReadOnly(this, "tag", `node-${ nextTag++ }-${ this.constructor.name }`);

        for (const key in options) {
            ethers.utils.defineReadOnly<any, any>(this, key, options[key]);
        }
    }

    // Note: EVERY node must call assemble with `this`, even if only with
    //       the bytes "0x" to trigger the offset and bytecode checks
    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);
        visit(this, "0x");
        assembler.end(this);
    }

    children(): Array<Node> {
        return [ ];
    }

    visit(visit: VisitFunc): void {
        visit(this);
        this.children().forEach((child) => {
            child.visit(visit);
        });
    }

    static from(options: any): Node {
        const Factories: { [ type: string ]: { from: (options: any) => Node }} = {
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
        if (!factory) { throw new Error("uknown type: " + options.type); }
        return factory.from(options);
    }
}

export abstract class ValueNode extends Node {
    constructor(guard: any, location: Location, options: { [ key: string ]: any }) {
        logger.checkAbstract(new.target, ValueNode);
        super(guard, location, options);
    }
}

function pushLiteral(value: ethers.utils.BytesLike | ethers.utils.Hexable | number) {
    // Convert value into a hexstring
    const hex = ethers.utils.hexlify(value);

    if (hex === "0x") {
        throw new Error("invalid literal: 0x");
    }

    // Make sure it will fit into a push
    const length = ethers.utils.hexDataLength(hex);
    if (length === 0 || length > 32) { throw new Error(`literal out of range: ${ hex }`); }

    return hexConcat([ Opcode.from("PUSH" + String(length)), hex ]);
}

export class LiteralNode extends ValueNode {
    readonly value: string;
    readonly verbatim: boolean;

    constructor(guard: any, location: Location, value: string, verbatim: boolean) {
        super(guard, location, { value, verbatim });
    }

    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);
        if (this.verbatim) {
            if (this.value.substring(0, 2) === "0x") {
                visit(this, this.value);
            } else {
                visit(this, ethers.BigNumber.from(this.value).toHexString());
            }
        } else {
            visit(this, pushLiteral(ethers.BigNumber.from(this.value)));
        }
        assembler.end(this);
    }

    static from(options: any): LiteralNode {
        if (options.type !== "hex" && options.type !== "decimal") { throw new Error("expected hex or decimal type"); }
        return new LiteralNode(Guard, options.loc, options.value, !!options.verbatim);
    }
}

export class PopNode extends ValueNode {
    static from(options: any): PopNode {
        return new PopNode(Guard, options.loc, { });
    }
}

export class LinkNode extends ValueNode {
    readonly type: string;
    readonly label: string;

    constructor(guard: any, location: Location, type: string, label: string) {
        super(guard, location, { type, label });
    }

    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);

        let value: number = null;

        const target = assembler.getTarget(this.label);
        if (target instanceof LabelNode) {
            if (this.type === "offset") {
                //value = assembler.getOffset(this.label);
                value = (<number>(assembler.getLinkValue(target, this)));
            }
        } else {
            const result = (<DataSource>(assembler.getLinkValue(target, this)));
            if (this.type === "offset") {
                value = result.offset;
            } else if (this.type === "length") {
                value = result.length;
            }
        }

        if (value == null) {
             throw new Error("labels can only be targetted as offsets");
        }

        visit(this, pushLiteral(value));

        assembler.end(this);
    }

    static from(options: any): LinkNode {
        // @TODO: Verify type is offset or link...
        return new LinkNode(Guard, options.loc, options.type, options.label);
    }
}

export class OpcodeNode extends ValueNode {
    readonly opcode: Opcode;
    readonly operands: Array<ValueNode>;

    readonly instructional: boolean;

    constructor(guard: any, location: Location, opcode: Opcode, operands: Array<ValueNode>, instructional: boolean) {
        super(guard, location, { instructional, opcode, operands });
    }

    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);

        // Compute the bytecode in reverse stack order
        for (let i = this.operands.length - 1; i >= 0; i--) {
            await this.operands[i].assemble(assembler, visit);
        }

        // Append this opcode
        visit(this, ethers.utils.hexlify(this.opcode.value));

        assembler.end(this);
    }

    children(): Array<Node> {
        return this.operands;
    }

    visit(visit: VisitFunc): void {
        for (let i = this.operands.length - 1; i >= 0; i--) {
            this.operands[i].visit(visit);
        }
        visit(this);
    }

    static from(options: any): OpcodeNode {
        if (options.type !== "opcode") { throw new Error("expected opcode type"); }
        const opcode = Opcode.from(options.mnemonic);
        if (!opcode) { throw new Error("unknown opcode: " + options.mnemonic); }

        const operands = Object.freeze(options.operands.map((o: any) => {
            const operand = Node.from(o);
            if (!(operand instanceof ValueNode)) {
                throw new Error("bad grammar?!");
            }
            return operand;
        }));
        return new OpcodeNode(Guard, options.loc, opcode, operands, !!options.bare);
    }
}

export abstract class LabelledNode extends Node {
    readonly name: string;

    constructor(guard: any, location: Location, name: string, values?: { [ key: string ]: any }) {
        logger.checkAbstract(new.target, LabelledNode);
        values = ethers.utils.shallowCopy(values || { });
        values.name = name;
        super(guard, location, values);
    }
}

export class LabelNode extends LabelledNode {
    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);
        visit(this, ethers.utils.hexlify(Opcode.from("JUMPDEST").value));
        assembler.end(this);
    }

    static from(options: any): LabelNode {
        if (options.type !== "label") { throw new Error("expected label type"); }
        return new LabelNode(Guard, options.loc, options.name);
    }
}

export class DataNode extends LabelledNode {
    readonly data: Array<ValueNode>;

    constructor(guard: any, location: Location, name: string, data: string) {
        super(guard, location, name, { data });
    }

    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);

        for (let i = 0; i < this.data.length; i++) {
            await this.data[i].assemble(assembler, visit);
        }

        // We pad data if is contains PUSH opcodes that would overrun
        // the data, which could eclipse valid operations (since the
        // VM won't execute or jump within PUSH operations)

        const bytecode = ethers.utils.arrayify(assembler.getBytecode(this));

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

        visit(this, ethers.utils.hexlify(padding))

        assembler.end(this);
    }

    children(): Array<Node> {
        return this.data;
    }

    static from(options: any): DataNode {
        if (options.type !== "data") { throw new Error("expected data type"); }
        return new DataNode(Guard, options.loc, options.name, Object.freeze(options.data.map((d: any) => Node.from(d))));
    }
}

export class EvaluationNode extends ValueNode {
    readonly script: string;
    readonly verbatim: boolean;

    constructor(guard: any, location: Location, script: string, verbatim: boolean) {
        super(guard, location, { script, verbatim });
    }

    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);
        const result: any = await assembler.evaluate(this.script, this);
        if (this.verbatim) {
            if (typeof(result) === "number") {
                visit(this, ethers.BigNumber.from(result).toHexString());
            } else {
                visit(this, ethers.utils.hexlify(result));
            }
        } else {
            visit(this, pushLiteral(result));
        }
        assembler.end(this);
    }

    static from(options: any): EvaluationNode {
        if (options.type !== "eval") { throw new Error("expected eval type"); }
        return new EvaluationNode(Guard, options.loc, options.script, !!options.verbatim);
    }
}

export class ExecutionNode extends Node {
    readonly script: string;

    constructor(guard: any, location: Location, script: string) {
        super(guard, location, { script });
    }

    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);
        await assembler.evaluate(this.script, this);
        assembler.end(this);
    }

    static from(options: any): ExecutionNode {
        if (options.type !== "exec") { throw new Error("expected exec type"); }
        return new ExecutionNode(Guard, options.loc, options.script);
    }
}

export class ScopeNode extends LabelledNode {
    readonly statements: Array<Node>;

    constructor(guard: any, location: Location, name: string, statements: Array<Node>) {
        super(guard, location, name, { statements });
    }

    async assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void> {
        assembler.start(this);
        visit(this, "0x");
        for (let i = 0; i < this.statements.length; i++) {
            await this.statements[i].assemble(assembler, visit);
        }
        assembler.end(this);
    }

    children(): Array<Node> {
        return this.statements;
    }

    static from(options: any): ScopeNode {
        if (options.type !== "scope") { throw new Error("expected scope type"); }
        return new ScopeNode(Guard, options.loc, options.name, Object.freeze(options.statements.map((s: any) => Node.from(s))));
    }
}

export type Operation = {
    opcode: Opcode;
    offset: number;
    pushValue?: string;
};

export interface Bytecode extends Array<Operation> {
    getOperation(offset: number): Operation;
}

export function disassemble(bytecode: string): Bytecode {
    const ops: Array<Operation> = [ ];
    const offsets: { [ offset: number ]: Operation } = { };

    const bytes = ethers.utils.arrayify(bytecode, { allowMissingPrefix: true });

    let i = 0;
    let oob = false;
    while (i < bytes.length) {
        let opcode = Opcode.from(bytes[i]);
        if (!opcode) {
            opcode = new Opcode(`unknown (${ ethers.utils.hexlify(bytes[i]) })`, bytes[i], 0, 0);
        } else if (oob && opcode.mnemonic === "JUMPDEST") {
            opcode = new Opcode(`JUMPDEST (invalid; OOB!!)`, bytes[i], 0, 0);
        }

        const op: Operation = {
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
            } else {
                oob = true;
            }
        }
    }

    (<Bytecode>ops).getOperation = function(offset: number): Operation {
        return (offsets[offset] || null);
    };

    return (<Bytecode>ops);
}

export function formatBytecode(bytecode: Array<Operation>): string {
    const lines: Array<string> = [ ];

    bytecode.forEach((op) => {
        const opcode = op.opcode;

        let offset = ethers.utils.hexZeroPad(ethers.utils.hexlify(op.offset), 2);
        if (opcode.isValidJumpDest()) {
            offset += "*";
        } else {
            offset += " ";
        }

        let operation = opcode.mnemonic;

        const push = opcode.isPush();
        if (push) {
            if (op.pushValue) {
                operation = op.pushValue + `${ repeat(" ", 67 - op.pushValue.length) }; #${ push } `;
            } else {
                operation += `${ repeat(" ", 67 - operation.length) }; OOB!! `;
            }
        }

        lines.push(`${ offset.substring(2) }: ${ operation }`);

    });

    return lines.join("\n");
}


export interface DataSource extends Array<number> {
    offset: number;
    ast: Node;
    source: string;
}

export type NodeState = {
    node: Node;
    offset: number;
    bytecode: string;
};

export type AssemblerOptions = {
    filename?: string;
    retry?: number;
    positionIndependentCode?: boolean;
    defines?: { [ name: string ]: any };
    target?: string;
};

export type ParserOptions = {
    ignoreWarnings?: boolean;
}

class Assembler {
    readonly root: Node;

    readonly nodes: { [ tag: string ]: NodeState };
    readonly labels: { [ name: string ]: LabelledNode };

    _parents: { [ tag: string ]: Node };

    constructor(root: Node) {
        ethers.utils.defineReadOnly(this, "root", root);

        const nodes: { [ tag: string ]: NodeState } = { };
        const labels: { [ name: string ]: LabelledNode } = { };
        const parents: { [ tag: string ]: Node } = { };

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
                    logger.throwError(
                        ("duplicate label: " + node.name),
                        ethers.utils.Logger.errors.UNSUPPORTED_OPERATION,
                        { }
                    );
                }

                labels[node.name] = node;
            }
        });

        root.visit((node) => {
            // Check all labels exist
            if (node instanceof LinkNode) {
                const target = labels[node.label];
                if (!target) {
                    logger.throwError(
                        ("missing label: " + node.label),
                        ethers.utils.Logger.errors.UNSUPPORTED_OPERATION,
                        { }
                    );
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
    getTarget(label: string): LabelledNode {
        return this.labels[label];
    }

    // Evaluate script in the context of a {{! }} or {{= }}
    evaluate(script: string, source: Node): Promise<any> {
         return Promise.resolve(new Uint8Array(0));
    }

    getAncestor<T = Node>(node: Node, cls: { new(...args: any[]): T }): T {
        node = this._parents[node.tag];
        while (node) {
            if (node instanceof cls) { return node; }
            node = this._parents[node.tag];
        }
        return null;
    }

    getBytecode(node: Node): string {
        return this.nodes[node.tag].bytecode;
    }

    setBytecode(node: Node, bytecode: string): void {
        this.nodes[node.tag].bytecode = bytecode;
    }

    getLinkValue(target: LabelledNode, source: Node): number | DataSource {
        const sourceScope: ScopeNode = ((source instanceof ScopeNode) ? source: this.getAncestor<ScopeNode>(source, ScopeNode));
        const targetScope: ScopeNode = ((target instanceof ScopeNode) ? target: this.getAncestor<ScopeNode>(target, ScopeNode));

        if (target instanceof LabelNode) {

            // Label offset (e.g. "@foo:"); accessible only within its direct scope
            //const scope = this.getAncestor(source, Scope);
            if (targetScope !== sourceScope) {
                throw new Error(`cannot access ${ target.name } from ${ source.tag }`);
            }

            // Return the offset relative to its scope
            return this.nodes[target.tag].offset - this.nodes[targetScope.tag].offset;
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
                if (node === targetScope) { safeOffset = true; }
            });
        }

        // Not safe to access the offset; this will fault if anything tries.
        if (!safeOffset) {
            Object.defineProperty(bytes, "offset", {
                get: function() { throw new Error(`cannot access ${ target.name }.offset from ${ source.tag }`); }
            });
        }

        // Add the offset relative to the scope; unless the offset has
        // been marked as invalid, in which case accessing it will fail
        if (safeOffset) {
            bytes.offset = info.offset - this.nodes[sourceScope.tag].offset;
        }

        return bytes;
    }

    start(node: Node): void { }
    end(node: Node): void { }
}

export enum SemanticErrorSeverity {
    error = "error",
    warning = "warning"
};

export type SemanticError = {
    readonly message: string;
    readonly severity: SemanticErrorSeverity;
    readonly node: Node;
};

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
    check(): Array<SemanticError> {
        const errors: Array<SemanticError> = [ ];

        this.root.visit((node) => {
            if (node instanceof OpcodeNode) {
                const opcode = node.opcode;
                if (node.instructional) {
                    if (opcode.delta) {
                        errors.push({
                            message: `${ opcode.mnemonic } used as instructional`,
                            severity: SemanticErrorSeverity.warning,
                            node: node
                        });
                    }
                } else {
                    if (opcode.mnemonic === "POP") {
                        if (node.operands.length !== 0) {
                            errors.push({
                                message: "POP expects 0 operands",
                                severity: SemanticErrorSeverity.error,
                                node: node
                            });
                        }
                    } else if (node.operands.length !== opcode.delta) {
                        errors.push({
                            message: `${ opcode.mnemonic } expects ${ opcode.delta } operands`,
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

                } else if (!node.location.statement && opcode.alpha !== 1) {
                    // If an opcode does not push anything on the stack, it
                    // cannot be used as an operand
                    errors.push({
                        message: `${ node.opcode.mnemonic } cannot be an operand`,
                        severity: SemanticErrorSeverity.error,
                        node: node
                    });
                }
            }

            if (node.location.statement) {
                if (node instanceof PopNode) {
                    // $$ by istelf is useless and is intended to be an operand
                    errors.push({
                        message: `$$ must be an operand`,
                        severity: SemanticErrorSeverity.error,
                        node: node
                    });

                } else {
                    const scope = this.getAncestor(node, ScopeNode);

                    // Make sure any $$ is stack adjacent (within this scope)
                    const ordered: Array<Node> = [ ];
                    node.visit((node) => {
                        if (scope !== this.getAncestor(node, ScopeNode)) { return; }
                        ordered.push(node);
                    });

                    // Allow any number of stack adjacent $$
                    while (ordered.length && ordered[0] instanceof PopNode) {
                        ordered.shift();
                    }

                    // If there are still any buried, we have a problem
                    const pops = ordered.filter((n) => (n instanceof PopNode));
                    if (pops.length) {
                        errors.push({
                            message: `$$ must be stack adjacent`,
                            severity: SemanticErrorSeverity.error,
                            node: node
                        });
                    }
                }
            }
        });

        return errors;
    }
}

class CodeGenerationAssembler extends Assembler {
    readonly filename: string;
    readonly positionIndependentCode: boolean;
    readonly retry: number;

    readonly defines: { [ name: string ]: any };

    readonly _stack: Array<Node>;

    _oldBytecode: { [ tag: string ]: string };
    _objectCache: { [ tag: string ]: any };

    _script: Script;

    _changed: boolean;

    constructor(root: Node, options: AssemblerOptions) {
        super(root);

        ethers.utils.defineReadOnly(this, "positionIndependentCode", !!options.positionIndependentCode);
        ethers.utils.defineReadOnly(this, "retry", ((options.retry != null) ? options.retry: 512));
        ethers.utils.defineReadOnly(this, "filename", resolve(options.filename || "./contract.asm"));
        ethers.utils.defineReadOnly(this, "defines", Object.freeze(options.defines || { }));

        ethers.utils.defineReadOnly(this, "_stack", [ ]);

        this.reset();
    }

    _didChange(): void {
        this._changed = true;
    }

    get changed(): boolean {
        return this._changed;
    }

    // Reset the assmebler for another run with updated values
    reset(): void {
        this._changed = false;
        this._oldBytecode = { };
        this._objectCache = { };

        this._script = new Script(this.filename, (name: string, context: any) => {
            return this.get(name, context);
        });
    }

    evaluate(script: string, source: Node): Promise<any> {
        return this._script.evaluate(script, source);
    }

    getLinkValue(target: LabelledNode, source: Node): number | DataSource {
        // Since we are iteratively generating code, offsets and lengths
        // may not be stable at any given point in time, so if an offset
        // is negative the code is obviously wrong, however we set it to
        // 0 so we can proceed with generation to fill in as many blanks
        // as possible; then we will try assembling again
        const result = super.getLinkValue(target, source);

        if (typeof(result) === "number") {
            if (result < 0) {
                this._didChange();
                return 0;
            }
            return result;
        }

        if (result.offset < 0) {
            result.offset = 0;
            this._didChange();
        }
        return result;
    }

    start(node: Node): void {
        this._stack.push(node);
        this._oldBytecode[node.tag] = this.getBytecode(node);
        this.setBytecode(node, "0x");
    }

    end(node: Node): void {
        if (this._stack.pop() !== node) {
            throw new Error("missing push/pop pair");
        }

        if (this._oldBytecode[node.tag] !== this.getBytecode(node)) {
            this._didChange();
        }
    }

    // This is used by evaluate to access properties in JavaScript
    // - "defines" allow meta-programming values to be used
    // - jump destinations are available as numbers
    // - bytecode and data are available as an immuatble DataSource
    get(name: string, source: Node): any {
        if (name === "defines") {
            return this.defines;
        }

        const node = this.labels[name];
        if (!node) { return undefined; }

        // We cache objects when they are generated so all nodes
        // receive consistent data; if there is a change we will
        // run the entire assembly process again with the updated
        // values
        if (this._objectCache[node.tag] == null) {
            this._objectCache[node.tag] = Object.freeze(this.getLinkValue(node, source));
        }

        return this._objectCache[node.tag];
    }

    async _assemble(): Promise<void> {
        let offset = 0;

        await this.root.assemble(this, (node, bytecode) => {
            const state = this.nodes[node.tag];

            // Things have moved; we will need to try again
            if (state.offset !== offset) {
                state.offset = offset;
                this._didChange();
            }

            this._stack.forEach((node) => {
                this.setBytecode(node, hexConcat([ this.getBytecode(node), bytecode ]));
            });

            offset += ethers.utils.hexDataLength(bytecode);
        });
    }

    async assemble(label?: string): Promise<string> {
        if (label == null) { label = "_"; }
        const target = this.getTarget(label);

        if (!target) {
            logger.throwArgumentError(`unknown labelled target: ${ label }`, "label", label);
        } else if (!(target instanceof ScopeNode || target instanceof DataNode)) {
            logger.throwArgumentError(`cannot assemble a bodyless label: ${ label }`, "label", label);
        }

        // Continue re-evaluating the bytecode until a stable set of
        // offsets, length and values are reached.
        await this._assemble();
        for (let i = 0; i < this.retry; i++) {

            // Regenerate the code with the updated assembler values
            this.reset();
            await this._assemble();

            // Generated bytecode is stable!! :)
            if (!this.changed) {

                // This should not happen; something is wrong with the grammar
                // or missing enter/exit call in assemble
                if (this._stack.length !== 0) {
                    throw new Error("Bad AST! Bad grammar?!");
                }

                //console.log(`Assembled in ${ i } attempts`);
                return this.getBytecode(target);;
            }
        }

        return logger.throwError(
            `unable to assemble; ${ this.retry } attempts failed to generate stable bytecode`,
            ethers.utils.Logger.errors.UNKNOWN_ERROR,
            { }
        );
    }
}


type _Location = {
    first_line: number;
    last_line: number;
    first_column: number;
    last_column: number;
    statement: boolean;
}

export function parse(code: string, options?: ParserOptions): Node {
    if (options == null) { options = { }; }

    // Since jison allows \n, \r or \r\n line endings, we need some
    // twekaing to get the correct position
    const lines: Array<{ line: string, offset: number }> = [ ];
    let offset = 0;
    code.split(/(\r\n?|\n)/g).forEach((clump, index) => {
        if (index % 2) {
            lines[lines.length - 1].line += clump;
        } else {
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
    const getOffset = function(line: number, column: number): number {
        const info = lines[line - 1];
        if (!info || column >= info.line.length) { throw new Error("out of range"); }
        return info.offset + column;
    };

    // We use this in the _parser to convert locations to source
    _parser.yy._ethersLocation = function(loc?: _Location): Location {

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
        (<any>error).errors = errors;
        throw error;
    }

    return result;
}

export async function assemble(ast: Node, options?: AssemblerOptions): Promise<string> {
    const assembler = new CodeGenerationAssembler(ast, options || { });
    return assembler.assemble(options.target || "_");
}
