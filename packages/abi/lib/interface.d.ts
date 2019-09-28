import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { Description } from "@ethersproject/properties";
import { AbiCoder } from "./abi-coder";
import { ConstructorFragment, EventFragment, Fragment, FunctionFragment, JsonFragment, ParamType } from "./fragments";
export declare class LogDescription extends Description {
    readonly eventFragment: EventFragment;
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly values: any;
}
export declare class TransactionDescription extends Description {
    readonly functionFragment: FunctionFragment;
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly value: BigNumber;
}
export declare class Indexed extends Description {
    readonly hash: string;
    static isIndexed(value: any): value is Indexed;
}
export declare class Result {
    [key: string]: any;
    [key: number]: any;
}
export declare class Interface {
    readonly fragments: Array<Fragment>;
    readonly errors: {
        [name: string]: any;
    };
    readonly events: {
        [name: string]: EventFragment;
    };
    readonly functions: {
        [name: string]: FunctionFragment;
    };
    readonly structs: {
        [name: string]: any;
    };
    readonly deploy: ConstructorFragment;
    readonly _abiCoder: AbiCoder;
    static _isInterface: boolean;
    constructor(fragments: string | Array<Fragment | JsonFragment | string>);
    static getAbiCoder(): AbiCoder;
    static getAddress(address: string): string;
    _sighashify(functionFragment: FunctionFragment): string;
    _topicify(eventFragment: EventFragment): string;
    getFunction(nameOrSignatureOrSighash: string): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: string): EventFragment;
    getSighash(functionFragment: FunctionFragment | string): string;
    getEventTopic(eventFragment: EventFragment | string): string;
    _decodeParams(params: Array<ParamType>, data: BytesLike): Array<any>;
    _encodeParams(params: Array<ParamType>, values: Array<any>): string;
    encodeDeploy(values?: Array<any>): string;
    decodeFunctionData(functionFragment: FunctionFragment | string, data: BytesLike): Array<any>;
    encodeFunctionData(functionFragment: FunctionFragment | string, values?: Array<any>): string;
    decodeFunctionResult(functionFragment: FunctionFragment | string, data: BytesLike): Array<any>;
    encodeFunctionResult(functionFragment: FunctionFragment | string, values?: Array<any>): string;
    encodeFilterTopics(eventFragment: EventFragment, values: Array<any>): Array<string | Array<string>>;
    decodeEventLog(eventFragment: EventFragment | string, data: BytesLike, topics?: Array<string>): Array<any>;
    parseTransaction(tx: {
        data: string;
        value?: BigNumberish;
    }): TransactionDescription;
    parseLog(log: {
        topics: Array<string>;
        data: string;
    }): LogDescription;
    static isInterface(value: any): value is Interface;
}
