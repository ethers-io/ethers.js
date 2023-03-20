// import from provider.ts instead of index.ts to prevent circular dep
// from EtherscanProvider
import { Log, TransactionReceipt, TransactionResponse } from "../providers/provider.js";
import { defineProperties, EventPayload } from "../utils/index.js";
export class EventLog extends Log {
    interface;
    fragment;
    args;
    constructor(log, iface, fragment) {
        super(log, log.provider);
        const args = iface.decodeEventLog(fragment, log.data, log.topics);
        defineProperties(this, { args, fragment, interface: iface });
    }
    get eventName() { return this.fragment.name; }
    get eventSignature() { return this.fragment.format(); }
}
export class ContractTransactionReceipt extends TransactionReceipt {
    #iface;
    constructor(iface, provider, tx) {
        super(tx, provider);
        this.#iface = iface;
    }
    get logs() {
        return super.logs.map((log) => {
            const fragment = log.topics.length ? this.#iface.getEvent(log.topics[0]) : null;
            if (fragment) {
                return new EventLog(log, this.#iface, fragment);
            }
            else {
                return log;
            }
        });
    }
}
export class ContractTransactionResponse extends TransactionResponse {
    #iface;
    constructor(iface, provider, tx) {
        super(tx, provider);
        this.#iface = iface;
    }
    async wait(confirms) {
        const receipt = await super.wait();
        if (receipt == null) {
            return null;
        }
        return new ContractTransactionReceipt(this.#iface, this.provider, receipt);
    }
}
export class ContractUnknownEventPayload extends EventPayload {
    log;
    constructor(contract, listener, filter, log) {
        super(contract, listener, filter);
        defineProperties(this, { log });
    }
    async getBlock() {
        return await this.log.getBlock();
    }
    async getTransaction() {
        return await this.log.getTransaction();
    }
    async getTransactionReceipt() {
        return await this.log.getTransactionReceipt();
    }
}
export class ContractEventPayload extends ContractUnknownEventPayload {
    constructor(contract, listener, filter, fragment, _log) {
        super(contract, listener, filter, new EventLog(_log, contract.interface, fragment));
        const args = contract.interface.decodeEventLog(fragment, this.log.data, this.log.topics);
        defineProperties(this, { args, fragment });
    }
    get eventName() {
        return this.fragment.name;
    }
    get eventSignature() {
        return this.fragment.format();
    }
}
//# sourceMappingURL=wrappers.js.map