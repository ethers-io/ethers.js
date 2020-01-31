"use strict";

import { assemble, CodeNode, DataNode, disassemble, EvaluationNode, ExecutionNode, formatBytecode, LabelNode, LabelledNode, LinkNode, LiteralNode, Node, OpcodeNode, parse, ScopeNode, ValueNode } from "./assembler";
import { getOpcode, Opcode } from "./opcodes";

import { AssemblerOptions, AssembleVisitFunc, Bytecode, Location, Operation, VisitFunc } from "./assembler";

export {
    // Opcodes
    getOpcode,
    Opcode,

    // Assembler functions
    assemble,
    disassemble,
    formatBytecode,
    parse,

    // Assembly AST Nodes
    CodeNode,
    DataNode,
    EvaluationNode,
    ExecutionNode,
    LabelNode,
    LabelledNode,
    LinkNode,
    LiteralNode,
    Node,
    OpcodeNode,
    ScopeNode,
    ValueNode,

    // Assembler Types
    AssemblerOptions,
    AssembleVisitFunc,
    Bytecode,
    Location,
    Operation,
    VisitFunc,
}
