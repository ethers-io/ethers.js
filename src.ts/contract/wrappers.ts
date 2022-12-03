// import from provider.ts instead of index.ts to prevent circular dep
// from EtherscanProvider
import {
    Block, Log, TransactionReceipt, TransactionResponse
} from "../providers/provider.js";
import { defineProperties, EventPayload } from "../utils/index.js";

import type { EventFragment, Interface, Result } from "../abi/index.js";
import type { Listener } from "../utils/index.js";
import type {
    Provider
} from "../providers/index.js";

import type { BaseContract } from "./contract.js";
import type { ContractEventName } from "./types.js";


export class EventLog extends Log {
    readonly interface!: Interface;
    readonly fragment!: EventFragment;
    readonly args!: Result;

    constructor(log: Log, iface: Interface, fragment: EventFragment) {
        super(log, log.provider);
        const args = iface.decodeEventLog(fragment, log.data, log.topics);
        defineProperties<EventLog>(this, { args, fragment, interface: iface });
    }

    get eventName(): string { return this.fragment.name; }
    get eventSignature(): string { return this.fragment.format(); }
}

export class ContractTransactionReceipt extends TransactionReceipt {
    readonly #interface: Interface;

    constructor(iface: Interface, provider: Provider, tx: TransactionReceipt) {
        super(tx, provider);
        this.#interface = iface;
    }

    get logs(): Array<EventLog | Log> {
        return super.logs.map((log) => {
            const fragment = log.topics.length ? this.#interface.getEvent(log.topics[0]): null;
            if (fragment) {
                return new EventLog(log, this.#interface, fragment)
            } else {
                return log;
            }
        });
    }

}

export class ContractTransactionResponse extends TransactionResponse {
    readonly #interface: Interface;

    constructor(iface: Interface, provider: Provider, tx: TransactionResponse) {
        super(tx, provider);
        this.#interface = iface;
    }

    async wait(confirms?: number): Promise<null | ContractTransactionReceipt> {
        const receipt = await super.wait();
        if (receipt == null) { return null; }
        return new ContractTransactionReceipt(this.#interface, this.provider, receipt);
    }
}

export  class ContractUnknownEventPayload extends EventPayload<ContractEventName> {
    readonly log!: Log;

    constructor(contract: BaseContract, listener: null | Listener, filter: ContractEventName, log: Log) {
        super(contract, listener, filter);
        defineProperties<ContractUnknownEventPayload>(this, { log });
    }

    async getBlock(): Promise<Block> {
        return await this.log.getBlock();
    }

    async getTransaction(): Promise<TransactionResponse> {
        return await this.log.getTransaction();
    }

    async getTransactionReceipt(): Promise<TransactionReceipt> {
        return await this.log.getTransactionReceipt();
    }
}

export class ContractEventPayload extends ContractUnknownEventPayload {

    declare readonly fragment: EventFragment;
    declare readonly log: EventLog;
    declare readonly args: Result;

    constructor(contract: BaseContract, listener: null | Listener, filter: ContractEventName, fragment: EventFragment, _log: Log) {
        super(contract, listener, filter, new EventLog(_log, contract.interface, fragment));
        const args = contract.interface.decodeEventLog(fragment, this.log.data, this.log.topics);
        defineProperties<ContractEventPayload>(this, { args, fragment });
    }

    get eventName(): string {
        return this.fragment.name;
    }

    get eventSignature(): string {
        return this.fragment.format();
    }
}
