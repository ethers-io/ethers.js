export declare enum OpcodeMemoryAccess {
    write = "write",
    read = "read",
    full = "full"
}
export declare class Opcode {
    readonly value: number;
    readonly mnemonic: string;
    readonly delta: number;
    readonly alpha: number;
    readonly doc: string;
    constructor(mnemonic: string, value: number, delta: number, alpha: number, doc?: string);
    isJump(): boolean;
    isValidJumpDest(): boolean;
    isPush(): number;
    isMemoryAccess(readOrWrite?: boolean): OpcodeMemoryAccess;
    isStatic(): boolean;
    static from(valueOrMnemonic: number | string): Opcode;
}
//# sourceMappingURL=opcodes.d.ts.map