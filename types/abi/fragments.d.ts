/**
 *  About frgaments...
 *
 *  @_subsection api/abi/abi-coder:Fragments
 */
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
    /**
     *  @private
     */
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
    walkAsync(value: any, process: FragmentWalkAsyncFunc): Promise<any>;
    static from(obj: any, allowIndexed?: boolean): ParamType;
    static isParamType(value: any): value is ParamType;
}
export declare type FragmentType = "constructor" | "error" | "event" | "function" | "struct";
export declare abstract class Fragment {
    readonly type: FragmentType;
    readonly inputs: ReadonlyArray<ParamType>;
    /**
     *  @private
     */
    constructor(guard: any, type: FragmentType, inputs: ReadonlyArray<ParamType>);
    abstract format(format?: FormatType): string;
    static from(obj: any): Fragment;
    static isConstructor(value: any): value is ConstructorFragment;
    static isError(value: any): value is ErrorFragment;
    static isEvent(value: any): value is EventFragment;
    static isFunction(value: any): value is FunctionFragment;
    static isStruct(value: any): value is StructFragment;
}
export declare abstract class NamedFragment extends Fragment {
    readonly name: string;
    /**
     *  @private
     */
    constructor(guard: any, type: FragmentType, name: string, inputs: ReadonlyArray<ParamType>);
}
export declare class ErrorFragment extends NamedFragment {
    /**
     *  @private
     */
    constructor(guard: any, name: string, inputs: ReadonlyArray<ParamType>);
    get selector(): string;
    format(format?: FormatType): string;
    static from(obj: any): ErrorFragment;
    static isFragment(value: any): value is ErrorFragment;
}
export declare class EventFragment extends NamedFragment {
    readonly anonymous: boolean;
    /**
     *  @private
     */
    constructor(guard: any, name: string, inputs: ReadonlyArray<ParamType>, anonymous: boolean);
    get topicHash(): string;
    format(format?: FormatType): string;
    static from(obj: any): EventFragment;
    static isFragment(value: any): value is EventFragment;
}
export declare class ConstructorFragment extends Fragment {
    readonly payable: boolean;
    readonly gas: null | bigint;
    /**
     *  @private
     */
    constructor(guard: any, type: FragmentType, inputs: ReadonlyArray<ParamType>, payable: boolean, gas: null | bigint);
    format(format?: FormatType): string;
    static from(obj: any): ConstructorFragment;
    static isFragment(value: any): value is ConstructorFragment;
}
export declare class FunctionFragment extends NamedFragment {
    readonly constant: boolean;
    readonly outputs: ReadonlyArray<ParamType>;
    readonly stateMutability: string;
    readonly payable: boolean;
    readonly gas: null | bigint;
    /**
     *  @private
     */
    constructor(guard: any, name: string, stateMutability: string, inputs: ReadonlyArray<ParamType>, outputs: ReadonlyArray<ParamType>, gas: null | bigint);
    get selector(): string;
    format(format?: FormatType): string;
    static from(obj: any): FunctionFragment;
    static isFragment(value: any): value is FunctionFragment;
}
export declare class StructFragment extends NamedFragment {
    /**
     *  @private
     */
    constructor(guard: any, name: string, inputs: ReadonlyArray<ParamType>);
    format(): string;
    static from(obj: any): StructFragment;
    static isFragment(value: any): value is FunctionFragment;
}
//# sourceMappingURL=fragments.d.ts.map