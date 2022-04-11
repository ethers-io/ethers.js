var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ContractTransactionReceipt_interface, _ContractTransactionResponse_interface;
import { defineProperties, EventPayload } from "@ethersproject/properties";
import { Log, TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
export class EventLog extends Log {
    constructor(log, iface, fragment) {
        super(log, log.provider);
        const args = iface.decodeEventLog(fragment, log.data, log.topics);
        defineProperties(this, { args, fragment, interface: iface });
    }
    get eventName() { return this.fragment.name; }
    get eventSignature() { return this.fragment.format(); }
}
export class ContractTransactionReceipt extends TransactionReceipt {
    constructor(iface, provider, tx) {
        super(tx, provider);
        _ContractTransactionReceipt_interface.set(this, void 0);
        __classPrivateFieldSet(this, _ContractTransactionReceipt_interface, iface, "f");
    }
    get logs() {
        return super.logs.map((log) => {
            const fragment = log.topics.length ? __classPrivateFieldGet(this, _ContractTransactionReceipt_interface, "f").getEvent(log.topics[0]) : null;
            if (fragment) {
                return new EventLog(log, __classPrivateFieldGet(this, _ContractTransactionReceipt_interface, "f"), fragment);
            }
            else {
                return log;
            }
        });
    }
}
_ContractTransactionReceipt_interface = new WeakMap();
export class ContractTransactionResponse extends TransactionResponse {
    constructor(iface, provider, tx) {
        super(tx, provider);
        _ContractTransactionResponse_interface.set(this, void 0);
        __classPrivateFieldSet(this, _ContractTransactionResponse_interface, iface, "f");
    }
    async wait(confirms) {
        const receipt = await super.wait();
        if (receipt == null) {
            return null;
        }
        return new ContractTransactionReceipt(__classPrivateFieldGet(this, _ContractTransactionResponse_interface, "f"), this.provider, receipt);
    }
}
_ContractTransactionResponse_interface = new WeakMap();
export class ContractEventPayload extends EventPayload {
    constructor(contract, listener, filter, fragment, _log) {
        super(contract, listener, filter);
        const log = new EventLog(_log, contract.interface, fragment);
        const args = contract.interface.decodeEventLog(fragment, log.data, log.topics);
        defineProperties(this, { args, fragment, log });
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
//# sourceMappingURL=wrappers.js.map