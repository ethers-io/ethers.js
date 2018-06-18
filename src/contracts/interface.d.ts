import { ParamType } from '../utils/abi-coder';
import { BigNumber, BigNumberish } from '../utils/bignumber';
export declare class Description {
    readonly type: string;
    constructor(info: any);
}
export declare class Indexed extends Description {
    readonly hash: string;
}
export declare class DeployDescription extends Description {
    readonly inputs: Array<ParamType>;
    readonly payable: boolean;
    encode(bytecode: string, params: Array<any>): string;
}
export declare class FunctionDescription extends Description {
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;
    readonly inputs: Array<ParamType>;
    readonly outputs: Array<ParamType>;
    readonly payable: boolean;
    encode(params: Array<any>): string;
    decode(data: string): any;
}
export declare class EventDescription extends Description {
    readonly name: string;
    readonly signature: string;
    readonly inputs: Array<ParamType>;
    readonly anonymous: boolean;
    readonly topic: string;
    decode(data: string, topics?: Array<string>): any;
}
declare class TransactionDescription extends Description {
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly decode: (data: string) => any;
    readonly value: BigNumber;
}
declare class LogDescription extends Description {
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly values: Array<any>;
}
export declare class Interface {
    readonly abi: Array<any>;
    readonly functions: Array<FunctionDescription>;
    readonly events: Array<EventDescription>;
    readonly deployFunction: DeployDescription;
    constructor(abi: Array<string | ParamType> | string);
    parseTransaction(tx: {
        data: string;
        value?: BigNumberish;
    }): TransactionDescription;
    parseLog(log: {
        topics: Array<string>;
        data: string;
    }): LogDescription;
}
export {};
