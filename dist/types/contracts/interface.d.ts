import { BigNumberish, DeployDescription as _DeployDescription, EventDescription as _EventDescription, FunctionDescription as _FunctionDescription, LogDescription as _LogDescription, TransactionDescription as _TransactionDescription, EventFragment, FunctionFragment, ParamType } from '../utils/types';
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
}
//# sourceMappingURL=interface.d.ts.map