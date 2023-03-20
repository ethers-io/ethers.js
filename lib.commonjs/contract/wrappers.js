"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEventPayload = exports.ContractUnknownEventPayload = exports.ContractTransactionResponse = exports.ContractTransactionReceipt = exports.EventLog = void 0;
// import from provider.ts instead of index.ts to prevent circular dep
// from EtherscanProvider
const provider_js_1 = require("../providers/provider.js");
const index_js_1 = require("../utils/index.js");
class EventLog extends provider_js_1.Log {
    interface;
    fragment;
    args;
    constructor(log, iface, fragment) {
        super(log, log.provider);
        const args = iface.decodeEventLog(fragment, log.data, log.topics);
        (0, index_js_1.defineProperties)(this, { args, fragment, interface: iface });
    }
    get eventName() { return this.fragment.name; }
    get eventSignature() { return this.fragment.format(); }
}
exports.EventLog = EventLog;
class ContractTransactionReceipt extends provider_js_1.TransactionReceipt {
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
exports.ContractTransactionReceipt = ContractTransactionReceipt;
class ContractTransactionResponse extends provider_js_1.TransactionResponse {
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
exports.ContractTransactionResponse = ContractTransactionResponse;
class ContractUnknownEventPayload extends index_js_1.EventPayload {
    log;
    constructor(contract, listener, filter, log) {
        super(contract, listener, filter);
        (0, index_js_1.defineProperties)(this, { log });
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
exports.ContractUnknownEventPayload = ContractUnknownEventPayload;
class ContractEventPayload extends ContractUnknownEventPayload {
    constructor(contract, listener, filter, fragment, _log) {
        super(contract, listener, filter, new EventLog(_log, contract.interface, fragment));
        const args = contract.interface.decodeEventLog(fragment, this.log.data, this.log.topics);
        (0, index_js_1.defineProperties)(this, { args, fragment });
    }
    get eventName() {
        return this.fragment.name;
    }
    get eventSignature() {
        return this.fragment.format();
    }
}
exports.ContractEventPayload = ContractEventPayload;
//# sourceMappingURL=wrappers.js.map