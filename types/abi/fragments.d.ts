export interface JsonFragmentType {
    readonly name?: string;
    readonly indexed?: boolean;
    readonly type?: string;
    readonly internalType?: string;
    readonly components?: ReadonlyArray<JsonFragmentType>;
}
export interface JsonFragment {
    readonly name?: string;
    readonly type?: string;
    readonly anonymous?: boolean;
    readonly payable?: boolean;
    readonly constant?: boolean;
    readonly stateMutability?: string;
    readonly inputs?: ReadonlyArray<JsonFragmentType>;
    readonly outputs?: ReadonlyArray<JsonFragmentType>;
    readonly gas?: string;
}
export declare type FormatType = "sighash" | "minimal" | "full" | "json";
/**
 *  @ignore:
 */
declare type Token = Readonly<{
    type: string;
    offset: number;
    text: string;
    depth: number;
    match: number;
    linkBack: number;
    linkNext: number;
    value: number;
}>;
declare class TokenString {
    #private;
    get offset(): number;
    get length(): number;
    constructor(tokens: ReadonlyArray<Token>);
    clone(): TokenString;
    reset(): void;
    popKeyword(allowed: ReadonlySet<string>): string;
    popType(type: string): string;
    popParen(): TokenString;
    popParams(): Array<TokenString>;
    peek(): Token;
    peekKeyword(allowed: ReadonlySet<string>): null | string;
    peekType(type: string): null | string;
    pop(): Token;
    toString(): string;
}
export declare type FragmentWalkFunc = (type: string, value: any) => any;
export declare type FragmentWalkAsyncFunc = (type: string, value: any) => any | Promise<any>;
export declare class ParamType {
    #private;
    readonly name: string;
    readonly type: string;
    readonly baseType: string;
    readonly indexed: null | boolean;
    readonly components: null | ReadonlyArray<ParamType>;
    readonly arrayLength: null | number;
    readonly arrayChildren: null | ParamType;
    constructor(guard: any, name: string, type: string, baseType: string, indexed: null | boolean, components: null | ReadonlyArray<ParamType>, arrayLength: null | number, arrayChildren: null | ParamType);
    format(format?: FormatType): string;
    static isArray(value: any): value is {
        arrayChildren: ParamType;
    };
    isArray(): this is (ParamType & {
        arrayLength: number;
        arrayChildren: ParamType;
    });
    isTuple(): this is (ParamType & {
        components: ReadonlyArray<ParamType>;
    });
    isIndexable(): this is (ParamType & {
        indexed: boolean;
    });
    walk(value: any, process: FragmentWalkFunc): any;
    walkAsync(value: any, process: (type: string, value: any) => any | Promise<any>): Promise<any>;
    static from(obj: any, allowIndexed?: boolean): ParamType;
    static fromObject(obj: any, allowIndexed?: boolean): ParamType;
    static fromTokens(tokens: TokenString, allowIndexed?: boolean): ParamType;
    static isParamType(value: any): value is ParamType;
}
export declare type FragmentType = "constructor" | "error" | "event" | "function" | "struct";
export declare abstract class Fragment {
    readonly type: FragmentType;
    readonly inputs: ReadonlyArray<ParamType>;
    constructor(guard: any, type: FragmentType, inputs: ReadonlyArray<ParamType>);
    abstract format(format?: FormatType): string;
    static from(obj: any): Fragment;
    static fromObject(obj: any): Fragment;
    static fromString(text: string): Fragment;
    static fromTokens(tokens: TokenString): Fragment;
    static isConstructor(value: any): value is ConstructorFragment;
    static isError(value: any): value is ErrorFragment;
    static isEvent(value: any): value is EventFragment;
    static isFunction(value: any): value is FunctionFragment;
    static isStruct(value: any): value is StructFragment;
}
export declare abstract class NamedFragment extends Fragment {
    readonly name: string;
    constructor(guard: any, type: FragmentType, name: string, inputs: ReadonlyArray<ParamType>);
}
export declare class ErrorFragment extends NamedFragment {
    constructor(guard: any, name: string, inputs: ReadonlyArray<ParamType>);
    get selector(): string;
    format(format?: FormatType): string;
    static fromString(text: string): ErrorFragment;
    static fromTokens(tokens: TokenString): ErrorFragment;
}
export declare class EventFragment extends NamedFragment {
    readonly anonymous: boolean;
    constructor(guard: any, name: string, inputs: ReadonlyArray<ParamType>, anonymous: boolean);
    get topicHash(): string;
    format(format?: FormatType): string;
    static fromString(text: string): EventFragment;
    static fromTokens(tokens: TokenString): EventFragment;
}
export declare class ConstructorFragment extends Fragment {
    readonly payable: boolean;
    readonly gas: null | bigint;
    constructor(guard: any, type: FragmentType, inputs: ReadonlyArray<ParamType>, payable: boolean, gas: null | bigint);
    format(format?: FormatType): string;
    static fromString(text: string): ConstructorFragment;
    static fromObject(obj: any): ConstructorFragment;
    static fromTokens(tokens: TokenString): ConstructorFragment;
}
export declare class FunctionFragment extends NamedFragment {
    readonly constant: boolean;
    readonly outputs: ReadonlyArray<ParamType>;
    readonly stateMutability: string;
    readonly payable: boolean;
    readonly gas: null | bigint;
    constructor(guard: any, name: string, stateMutability: string, inputs: ReadonlyArray<ParamType>, outputs: ReadonlyArray<ParamType>, gas: null | bigint);
    get selector(): string;
    format(format?: FormatType): string;
    static fromString(text: string): FunctionFragment;
    static fromTokens(tokens: TokenString): FunctionFragment;
}
export declare class StructFragment extends NamedFragment {
    format(): string;
    static fromString(text: string): StructFragment;
    static fromTokens(tokens: TokenString): StructFragment;
}
export {};
//# sourceMappingURL=fragments.d.ts.map