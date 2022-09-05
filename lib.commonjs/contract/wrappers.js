"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEventPayload = exports.ContractTransactionResponse = exports.ContractTransactionReceipt = exports.EventLog = void 0;
const index_js_1 = require("../providers/index.js");
const index_js_2 = require("../utils/index.js");
class EventLog extends index_js_1.Log {
    interface;
    fragment;
    args;
    constructor(log, iface, fragment) {
        super(log, log.provider);
        const args = iface.decodeEventLog(fragment, log.data, log.topics);
        (0, index_js_2.defineProperties)(this, { args, fragment, interface: iface });
    }
    get eventName() { return this.fragment.name; }
    get eventSignature() { return this.fragment.format(); }
}
exports.EventLog = EventLog;
class ContractTransactionReceipt extends index_js_1.TransactionReceipt {
    #interface;
    constructor(iface, provider, tx) {
        super(tx, provider);
        this.#interface = iface;
    }
    get logs() {
        return super.logs.map((log) => {
            const fragment = log.topics.length ? this.#interface.getEvent(log.topics[0]) : null;
            if (fragment) {
                return new EventLog(log, this.#interface, fragment);
            }
            else {
                return log;
            }
        });
    }
}
exports.ContractTransactionReceipt = ContractTransactionReceipt;
class ContractTransactionResponse extends index_js_1.TransactionResponse {
    #interface;
    constructor(iface, provider, tx) {
        super(tx, provider);
        this.#interface = iface;
    }
    async wait(confirms) {
        const receipt = await super.wait();
        if (receipt == null) {
            return null;
        }
        return new ContractTransactionReceipt(this.#interface, this.provider, receipt);
    }
}
exports.ContractTransactionResponse = ContractTransactionResponse;
class ContractEventPayload extends index_js_2.EventPayload {
    fragment;
    log;
    args;
    constructor(contract, listener, filter, fragment, _log) {
        super(contract, listener, filter);
        const log = new EventLog(_log, contract.interface, fragment);
        const args = contract.interface.decodeEventLog(fragment, log.data, log.topics);
        (0, index_js_2.defineProperties)(this, { args, fragment, log });
    }
    get eventName() {
        return this.fragment.name;
    }
    get eventSignature() {
        return this.fragment.format();
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
exports.ContractEventPayload = ContractEventPayload;
//# sourceMappingURL=wrappers.js.map