import { Opcode } from "./opcodes";
export declare type Location = {
    offset: number;
    length: number;
    source: string;
};
export declare type AssembleVisitFunc = (node: Node, bytecode: string) => void;
export declare type VisitFunc = (node: Node) => void;
export declare abstract class Node {
    readonly tag: string;
    readonly location: Location;
    readonly warnings: Array<string>;
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
}
export declare class LiteralNode extends ValueNode {
    readonly value: string;
    readonly verbatim: boolean;
    constructor(guard: any, location: Location, value: string, verbatim: boolean);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    static from(options: any): LiteralNode;
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
    constructor(guard: any, location: Location, opcode: Opcode, operands: Array<ValueNode>);
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
export declare class DataNode extends LabelledNode {
    readonly data: Array<ValueNode>;
    constructor(guard: any, location: Location, name: string, data: string);
    assemble(assembler: Assembler, visit: AssembleVisitFunc): Promise<void>;
    children(): Array<Node>;
    visit(visit: VisitFunc): void;
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
    visit(visit: VisitFunc): void;
    static from(options: any): ScopeNode;
}
export declare function parse(code: string): Node;
export declare type Operation = {
    opcode: Opcode;
    offset: number;
    pushValue?: string;
};
export interface Bytecode extends Array<Operation> {
    getOperation(offset: number): Operation;
}
export declare function disassemble(bytecode: string): Bytecode;
export declare function formatBytecode(bytecode: Array<Operation>): string;
interface DataSource extends Array<number> {
    readonly offset: number;
}
declare type NodeState = {
    node: Node;
    offset: number;
    bytecode: string;
    pending: string;
    object?: number | DataSource;
};
export declare type AssemblerOptions = {
    filename?: string;
    retry?: number;
    positionIndependentCode?: boolean;
    defines?: {
        [name: string]: any;
    };
};
declare class Assembler {
    readonly root: Node;
    readonly nodes: {
        [tag: string]: NodeState;
    };
    readonly labels: {
        [name: string]: LabelledNode;
    };
    readonly filename: string;
    readonly positionIndependentCode: boolean;
    readonly retry: number;
    readonly defines: {
        [name: string]: any;
    };
    private _stack;
    private _parents;
    private _script;
    private _changed;
    constructor(root: Node, options: AssemblerOptions);
    readonly changed: boolean;
    getTarget(name: string): LabelledNode;
    reset(): void;
    evaluate(script: string, source: Node): Promise<any>;
    start(node: Node): void;
    end(node: Node): void;
    getPendingBytecode(node: Node): string;
    _appendBytecode(bytecode: string): void;
    getAncestor<T = Node>(node: Node, cls: {
        new (...args: any[]): T;
    }): T;
    getLinkValue(target: LabelledNode, source: Node): number | DataSource;
    get(name: string, source: Node): any;
    _didChange(): void;
    _assemble(): Promise<string>;
    assemble(): Promise<string>;
}
export declare function assemble(ast: Node, options?: AssemblerOptions): Promise<string>;
export {};
