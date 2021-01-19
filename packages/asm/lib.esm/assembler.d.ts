import { ethers } from "ethers";
import { Opcode } from "./opcodes";
export declare type Location = {
    offset: number;
    line: number;
    length: number;
    source: string;
    statement: boolean;
};
export declare type AssembleVisitFunc = (node: Node, bytecode: string) => void;
export declare type VisitFunc = (node: Node) => void;
export declare abstract class Node {
    readonly tag: string;
    readonly location: Location;
    constructor(guard: any, location: Location, options: {
        [key: string]: any;
    });
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    children(): Array<Node>;
    visit(visit: VisitFunc): void;
    static from(options: any): Node;
}
export declare abstract class ValueNode extends Node {
    constructor(guard: any, location: Location, options: {
        [key: string]: any;
    });
    getPushLiteral(value: ethers.utils.BytesLike | ethers.utils.Hexable | number): string;
}
export declare class LiteralNode extends ValueNode {
    readonly value: string;
    readonly verbatim: boolean;
    constructor(guard: any, location: Location, value: string, verbatim: boolean);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    static from(options: any): LiteralNode;
}
export declare class PopNode extends ValueNode {
    readonly index: number;
    constructor(guard: any, location: Location, index: number);
    get placeholder(): string;
    static from(options: any): PopNode;
}
export declare class LinkNode extends ValueNode {
    readonly type: string;
    readonly label: string;
    constructor(guard: any, location: Location, type: string, label: string);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    static from(options: any): LinkNode;
}
export declare class OpcodeNode extends ValueNode {
    readonly opcode: Opcode;
    readonly operands: Array<ValueNode>;
    readonly instructional: boolean;
    constructor(guard: any, location: Location, opcode: Opcode, operands: Array<ValueNode>, instructional: boolean);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    children(): Array<Node>;
    visit(visit: VisitFunc): void;
    static from(options: any): OpcodeNode;
}
export declare abstract class LabelledNode extends Node {
    readonly name: string;
    constructor(guard: any, location: Location, name: string, values?: {
        [key: string]: any;
    });
}
export declare class LabelNode extends LabelledNode {
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    static from(options: any): LabelNode;
}
export declare class PaddingNode extends ValueNode {
    _length: number;
    constructor(guard: any, location: Location);
    setLength(length: number): void;
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
}
export declare class DataNode extends LabelledNode {
    readonly data: Array<ValueNode>;
    readonly padding: PaddingNode;
    constructor(guard: any, location: Location, name: string, data: string);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    children(): Array<Node>;
    static from(options: any): DataNode;
}
export declare class EvaluationNode extends ValueNode {
    readonly script: string;
    readonly verbatim: boolean;
    constructor(guard: any, location: Location, script: string, verbatim: boolean);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    static from(options: any): EvaluationNode;
}
export declare class ExecutionNode extends Node {
    readonly script: string;
    constructor(guard: any, location: Location, script: string);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    static from(options: any): ExecutionNode;
}
export declare class ScopeNode extends LabelledNode {
    readonly statements: Array<Node>;
    constructor(guard: any, location: Location, name: string, statements: Array<Node>);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    children(): Array<Node>;
    static from(options: any): ScopeNode;
}
export declare type Operation = {
    opcode: Opcode;
    offset: number;
    length: number;
    pushValue?: string;
};
export interface Bytecode extends Array<Operation> {
    getOperation(offset: number): Operation;
    getByte(offset: number): number;
    getBytes(offset: number, length: number): Uint8Array;
    byteLength: number;
    operationCount: number;
}
export declare function disassemble(bytecode: string): Bytecode;
export declare function formatBytecode(bytecode: Array<Operation>): string;
export interface DataSource extends Array<number> {
    offset: number;
    ast: Node;
    source: string;
    _freeze?: () => void;
}
export declare type NodeState = {
    node: Node;
    offset: number;
    bytecode: string;
};
export declare type AssemblerOptions = {
    filename?: string;
    retry?: number;
    positionIndependentCode?: boolean;
    defines?: {
        [name: string]: any;
    };
    target?: string;
};
export declare type ParserOptions = {
    ignoreWarnings?: boolean;
};
declare class Assembler {
    readonly root: Node;
    readonly positionIndependentCode: boolean;
    readonly nodes: {
        [tag: string]: NodeState;
    };
    readonly labels: {
        [name: string]: LabelledNode;
    };
    _parents: {
        [tag: string]: Node;
    };
    constructor(root: Node, positionIndependentCode?: boolean);
    getTarget(label: string): LabelledNode;
    evaluate(script: string, source: Node): Promise<any>;
    getAncestor<T = Node>(node: Node, cls: {
        new (...args: any[]): T;
    }): T;
    getOffset(node: Node, source?: Node): number;
    setOffset(node: Node, offset: number): void;
    getBytecode(node: Node): string;
    setBytecode(node: Node, bytecode: string): void;
    getLinkValue(target: LabelledNode, source: Node): number | DataSource;
    start(node: Node): void;
    end(node: Node): void;
}
export declare enum SemanticErrorSeverity {
    error = "error",
    warning = "warning"
}
export declare type SemanticError = {
    readonly message: string;
    readonly severity: SemanticErrorSeverity;
    readonly node: Node;
};
export declare function parse(code: string, options?: ParserOptions): Node;
export declare function assemble(ast: Node, options?: AssemblerOptions): Promise<string>;
export {};
//# sourceMappingURL=assembler.d.ts.map