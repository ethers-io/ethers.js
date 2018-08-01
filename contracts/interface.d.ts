import { BigNumber } from '../utils/bignumber';
import { BigNumberish } from '../utils/bignumber';
import { EventFragment, FunctionFragment, ParamType } from '../utils/abi-coder';
export interface Indexed {
    readonly hash: string;
}
export interface DeployDescription {
    readonly inputs: Array<ParamType>;
    readonly payable: boolean;
    encode(bytecode: string, params: Array<any>): string;
}
export interface FunctionDescription {
    readonly type: "call" | "transaction";
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;
    readonly inputs: Array<ParamType>;
    readonly outputs: Array<ParamType>;
    readonly payable: boolean;
    readonly gas: BigNumber;
    encode(params: Array<any>): string;
    decode(data: string): any;
}
export interface EventDescription {
    readonly name: string;
    readonly signature: string;
    readonly inputs: Array<ParamType>;
    readonly anonymous: boolean;
    readonly topic: string;
    encodeTopics(params: Array<any>): Array<string>;
    decode(data: string, topics?: Array<string>): any;
}
export interface LogDescription {
    readonly decode: (data: string, topics: Array<string>) => any;
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly values: any;
}
export interface TransactionDescription {
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly decode: (data: string) => any;
    readonly value: BigNumber;
}
declare class Description {
    constructor(info: any);
}
declare class _DeployDescription extends Description implements DeployDescription {
    readonly inputs: Array<ParamType>;
    readonly payable: boolean;
    encode(bytecode: string, params: Array<any>): string;
}
declare class _FunctionDescription extends Description implements FunctionDescription {
    readonly type: "call" | "transaction";
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;
    readonly inputs: Array<ParamType>;
    readonly outputs: Array<ParamType>;
    readonly payable: boolean;
    readonly gas: BigNumber;
    encode(params: Array<any>): string;
    decode(data: string): any;
}
declare class _EventDescription extends Description implements EventDescription {
    readonly name: string;
    readonly signature: string;
    readonly inputs: Array<ParamType>;
    readonly anonymous: boolean;
    readonly topic: string;
    encodeTopics(params: Array<any>): Array<string>;
    decode(data: string, topics?: Array<string>): any;
}
declare class _TransactionDescription extends Description implements TransactionDescription {
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly decode: (data: string) => any;
    readonly value: BigNumber;
}
declare class _LogDescription extends Description implements LogDescription {
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly decode: (data: string, topics: Array<string>) => any;
    readonly values: any;
}
export declare class Interface {
    readonly abi: Array<EventFragment | FunctionFragment>;
    readonly functions: {
        [name: string]: _FunctionDescription;
    };
    readonly events: {
        [name: string]: _EventDescription;
    };
    readonly deployFunction: _DeployDescription;
    constructor(abi: Array<string | ParamType> | string);
    parseTransaction(tx: {
        data: string;
        value?: BigNumberish;
    }): _TransactionDescription;
    parseLog(log: {
        topics: Array<string>;
        data: string;
    }): _LogDescription;
    static isInterface(value: any): value is Interface;
    static isIndexed(value: any): value is Indexed;
}
export {};
