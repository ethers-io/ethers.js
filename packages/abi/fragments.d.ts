import { BigNumber } from "@ethersproject/bignumber";
export interface JsonFragmentType {
    name?: string;
    indexed?: boolean;
    type?: string;
    components?: Array<JsonFragmentType>;
}
export interface JsonFragment {
    name?: string;
    type?: string;
    anonymous?: boolean;
    payable?: boolean;
    constant?: boolean;
    stateMutability?: string;
    inputs?: Array<JsonFragmentType>;
    outputs?: Array<JsonFragmentType>;
    gas?: string;
}
export declare class ParamType {
    readonly name: string;
    readonly type: string;
    readonly baseType: string;
    readonly indexed: boolean;
    readonly components: Array<ParamType>;
    readonly arrayLength: number;
    readonly arrayChildren: ParamType;
    constructor(constructorGuard: any, params: any);
    format(expanded?: boolean): string;
    static from(value: string | JsonFragmentType | ParamType, allowIndexed?: boolean): ParamType;
    static fromObject(value: JsonFragmentType | ParamType): ParamType;
    static fromString(value: string, allowIndexed?: boolean): ParamType;
}
export declare abstract class Fragment {
    readonly type: string;
    readonly name: string;
    readonly inputs: Array<ParamType>;
    constructor(constructorGuard: any, params: any);
    format(expanded?: boolean): string;
    static from(value: Fragment | JsonFragment | string): Fragment;
    static fromObject(value: Fragment | JsonFragment): Fragment;
    static fromString(value: string): Fragment;
}
export declare class EventFragment extends Fragment {
    readonly anonymous: boolean;
    static from(value: EventFragment | JsonFragment | string): EventFragment;
    static fromObject(value: JsonFragment | EventFragment): EventFragment;
    static fromString(value: string): EventFragment;
}
export declare class ConstructorFragment extends Fragment {
    stateMutability: string;
    payable: boolean;
    gas?: BigNumber;
    static from(value: ConstructorFragment | JsonFragment | string): ConstructorFragment;
    static fromObject(value: ConstructorFragment | JsonFragment): ConstructorFragment;
    static fromString(value: string): ConstructorFragment;
}
export declare class FunctionFragment extends ConstructorFragment {
    constant: boolean;
    outputs?: Array<ParamType>;
    static from(value: FunctionFragment | JsonFragment | string): FunctionFragment;
    static fromObject(value: FunctionFragment | JsonFragment): FunctionFragment;
    static fromString(value: string): FunctionFragment;
}
