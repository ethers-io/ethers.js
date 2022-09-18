import {
    Block, Log, TransactionReceipt, TransactionResponse
} from "../providers/index.js";
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

export class ContractEventPayload extends EventPayload<ContractEventName> {

    readonly fragment!: EventFragment;
    readonly log!: EventLog;
    readonly args!: Result;

    constructor(contract: BaseContract, listener: null | Listener, filter: ContractEventName, fragment: EventFragment, _log: Log) {
        super(contract, listener, filter);
        const log = new EventLog(_log, contract.interface, fragment);
        const args = contract.interface.decodeEventLog(fragment, log.data, log.topics);
        defineProperties<ContractEventPayload>(this, { args, fragment, log });
    }

    get eventName(): string {
        return this.fragment.name;
    }

    get eventSignature(): string {
        return this.fragment.format();
    }

    async getBlock(): Promise<Block<string>> {
        return await this.log.getBlock();
    }

    async getTransaction(): Promise<TransactionResponse> {
        return await this.log.getTransaction();
    }

    async getTransactionReceipt(): Promise<TransactionReceipt> {
        return await this.log.getTransactionReceipt();
    }
}
