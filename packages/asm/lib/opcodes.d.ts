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
    isMemory(readOrWrite?: boolean): boolean;
    isStatic(): boolean;
    static from(valueOrMnemonic: number | string): Opcode;
}
