import { Block, Log, TransactionReceipt, TransactionResponse } from "../providers/provider.js";
import { EventPayload } from "../utils/index.js";
import type { EventFragment, Interface, Result } from "../abi/index.js";
import type { Listener } from "../utils/index.js";
import type { Provider } from "../providers/index.js";
import type { BaseContract } from "./contract.js";
import type { ContractEventName } from "./types.js";
export declare class EventLog extends Log {
    readonly interface: Interface;
    readonly fragment: EventFragment;
    readonly args: Result;
    constructor(log: Log, iface: Interface, fragment: EventFragment);
    get eventName(): string;
    get eventSignature(): string;
}
export declare class ContractTransactionReceipt extends TransactionReceipt {
    #private;
    constructor(iface: Interface, provider: Provider, tx: TransactionReceipt);
    get logs(): Array<EventLog | Log>;
}
export declare class ContractTransactionResponse extends TransactionResponse {
    #private;
    constructor(iface: Interface, provider: Provider, tx: TransactionResponse);
    wait(confirms?: number): Promise<null | ContractTransactionReceipt>;
}
export declare class ContractUnknownEventPayload extends EventPayload<ContractEventName> {
    readonly log: Log;
    constructor(contract: BaseContract, listener: null | Listener, filter: ContractEventName, log: Log);
    getBlock(): Promise<Block>;
    getTransaction(): Promise<TransactionResponse>;
    getTransactionReceipt(): Promise<TransactionReceipt>;
}
export declare class ContractEventPayload extends ContractUnknownEventPayload {
    readonly fragment: EventFragment;
    readonly log: EventLog;
    readonly args: Result;
    constructor(contract: BaseContract, listener: null | Listener, filter: ContractEventName, fragment: EventFragment, _log: Log);
    get eventName(): string;
    get eventSignature(): string;
}
//# sourceMappingURL=wrappers.d.ts.map