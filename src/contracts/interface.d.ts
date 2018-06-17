import { ParamType } from '../utils/abi-coder';
import { BigNumber, BigNumberish } from '../utils/bignumber';
export declare class Description {
    readonly type: string;
    readonly inputs: Array<ParamType>;
    constructor(info: any);
}
export declare class Indexed {
    readonly type: string;
    readonly hash: string;
    constructor(value: string);
}
export declare class DeployDescription extends Description {
    readonly payable: boolean;
    encode(bytecode: string, params: Array<any>): string;
}
export declare class FunctionDescription extends Description {
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;
    readonly outputs: Array<ParamType>;
    readonly payable: boolean;
    encode(params: Array<any>): string;
    decode(data: string): any;
}
export declare type CallTransaction = {
    args: Array<any>;
    signature: string;
    sighash: string;
    decode: (data: string) => any;
    value: BigNumber;
};
export declare class EventDescription extends Description {
    readonly name: string;
    readonly signature: string;
    readonly anonymous: boolean;
    readonly topic: string;
    decode(data: string, topics?: Array<string>): any;
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
    }): CallTransaction;
}
