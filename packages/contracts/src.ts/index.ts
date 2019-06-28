"use strict";

import { EventFragment, Fragment, Indexed, Interface, JsonFragment, ParamType } from "@ethersproject/abi";
import { Block, BlockTag, Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer, VoidSigner } from "@ethersproject/abstract-signer";
import { getContractAddress } from "@ethersproject/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike, concat, hexlify, isBytes, isHexString } from "@ethersproject/bytes";
import { Zero } from "@ethersproject/constants";
import * as errors from "@ethersproject/errors";
import { defineReadOnly, deepCopy, getStatic, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { UnsignedTransaction } from "@ethersproject/transactions";


export interface Overrides {
    gasLimit?: BigNumberish | Promise<BigNumberish>;
    gasPrice?: BigNumberish | Promise<BigNumberish>;
    nonce?: BigNumberish | Promise<BigNumberish>;
}

export interface PayableOverrides extends Overrides {
    value?: BigNumberish | Promise<BigNumberish>;
}

export interface CallOverrides extends PayableOverrides {
    blockTag?: BlockTag | Promise<BlockTag>;
    from?: string | Promise<string>
}

export type ContractFunction = (...params: Array<any>) => Promise<any>;

export type EventFilter = {
    address?: string;
    topics?: Array<string>;
    // @TODO: Support OR-style topcis; backwards compatible to make this change
    //topics?: Array<string | Array<string>>
};

// The (n + 1)th parameter passed to contract event callbacks
export interface Event extends Log {

    // The event name
    event?: string;

    // The event signature
    eventSignature?: string;

    // The parsed arguments to the event
    values?: Array<any>;

    // A function that can be used to decode event data and topics
    decode?: (data: string, topics?: Array<string>) => any;

    // A function that will remove the listener responsible for this event (if any)
    removeListener: () => void;

    // Get blockchain details about this event's block and transaction
    getBlock: () => Promise<Block>;
    getTransaction: () => Promise<TransactionResponse>;
    getTransactionReceipt: () => Promise<TransactionReceipt>;
}

export interface ContractReceipt extends TransactionReceipt {
    events?: Array<Event>;
}

export interface ContractTransaction extends TransactionResponse {
    wait(confirmations?: number): Promise<ContractReceipt>;
}

///////////////////////////////

const allowedTransactionKeys: { [ key: string ]: boolean } = {
    chainId: true, data: true, from: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true
}

// Recursively replaces ENS names with promises to resolve the name and resolves all properties
function resolveAddresses(signerOrProvider: Signer | Provider, value: any, paramType: ParamType | Array<ParamType>): Promise<any> {
    if (Array.isArray(paramType)) {
        return Promise.all(paramType.map((paramType, index) => {
            return resolveAddresses(
                signerOrProvider,
                ((Array.isArray(value)) ? value[index]: value[paramType.name]),
                paramType
            );
        }));
    }

    if (paramType.type === "address") {
        return signerOrProvider.resolveName(value);
    }

    if (paramType.type === "tuple") {
        return resolveAddresses(signerOrProvider, value, paramType.components);
    }

    if (paramType.baseType === "array") {
        if (!Array.isArray(value)) { throw new Error("invalid value for array"); }
        return Promise.all(value.map((v) => resolveAddresses(signerOrProvider, v, paramType.arrayChildren)));
    }

    return Promise.resolve(value);
}

type RunFunction = (...params: Array<any>) => Promise<any>;

type RunOptions = {
    estimate?: boolean;
    callStatic?: boolean;
    payable?: boolean;
    transaction?: boolean;
};

function runMethod(contract: Contract, functionName: string, options: RunOptions): RunFunction {
    let method = contract.interface.functions[functionName];
    return function(...params): Promise<any> {
        let tx: any = {}

        let blockTag: BlockTag = null;

        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof(params[params.length - 1]) === "object") {
            tx = shallowCopy(params.pop());

            if (tx.blockTag != null) {
                blockTag = tx.blockTag;
            }

            delete tx.blockTag;

            // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
            for (let key in tx) {
                if (!allowedTransactionKeys[key]) {
                    errors.throwError(("unknown transaxction override - " + key), "overrides", tx);
                }
            }
        }

        errors.checkArgumentCount(params.length, method.inputs.length, "passed to contract");

        // Check overrides make sense
        ["data", "to"].forEach(function(key) {
            if (tx[key] != null) {
                errors.throwError("cannot override " + key, errors.UNSUPPORTED_OPERATION, { operation: key });
            }
        });

        // If the contract was just deployed, wait until it is minded
        if (contract.deployTransaction != null) {
            tx.to = contract._deployed(blockTag).then(() => {
                return contract.addressPromise;
            });
        } else {
            tx.to = contract.addressPromise;
        }

        return resolveAddresses(contract.signer || contract.provider, params, method.inputs).then((params) => {
            tx.data = contract.interface.encodeFunctionData(method, params);
            if (method.constant || options.callStatic) {

                // Call (constant functions) always cost 0 ether
                if (options.estimate) {
                    return Promise.resolve(Zero);
                }

                if (!contract.provider && !contract.signer) {
                    errors.throwError("call (constant functions) require a provider or signer", errors.UNSUPPORTED_OPERATION, { operation: "call" })
                }

                // Check overrides make sense
                ["gasLimit", "gasPrice", "value"].forEach(function(key) {
                    if (tx[key] != null) {
                        throw new Error("call cannot override " + key) ;
                    }
                });

                if (options.transaction) { return resolveProperties(tx); }

                return (contract.signer || contract.provider).call(tx, blockTag).then((value) => {

                    try {
                        let result = contract.interface.decodeFunctionResult(method, value);
                        if (method.outputs.length === 1) {
                            result = result[0];
                        }
                        return result;

                    } catch (error) {
                        if (error.code === errors.CALL_EXCEPTION) {
                            error.address = contract.address;
                            error.args = params;
                            error.transaction = tx;
                        }
                        throw error;
                    }
                });

            }

            // Only computing the transaction estimate
            if (options.estimate) {
                if (!contract.provider && !contract.signer) {
                    errors.throwError("estimate require a provider or signer", errors.UNSUPPORTED_OPERATION, { operation: "estimateGas" })
                }

                return (contract.signer || contract.provider).estimateGas(tx);
            }

            if (tx.gasLimit == null && method.gas != null) {
                tx.gasLimit = BigNumber.from(method.gas).add(21000);
            }

            if (tx.value != null && !method.payable) {
                errors.throwError("contract method is not payable", errors.INVALID_ARGUMENT, {
                    argument: "sendTransaction",
                    value: tx,
                    method: method.format()
                })
            }

            if (options.transaction) { return resolveProperties(tx); }

            if (!contract.signer) {
                errors.throwError("sending a transaction require a signer", errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction" })
            }

            return contract.signer.sendTransaction(tx).then((tx) => {
                let wait = tx.wait.bind(tx);

                tx.wait = (confirmations?: number) => {
                    return wait(confirmations).then((receipt: ContractReceipt) => {
                        receipt.events = receipt.logs.map((log) => {
                             let event: Event = (<Event>deepCopy(log));

                             let parsed = contract.interface.parseLog(log);
                             if (parsed) {
                                 event.values = parsed.values;
                                 event.decode = (data: BytesLike, topics?: Array<any>) => {
                                     return this.interface.decodeEventLog(parsed.eventFragment, data, topics);
                                 };
                                 event.event = parsed.name;
                                 event.eventSignature = parsed.signature;
                            }

                            event.removeListener = () => { return contract.provider; }
                            event.getBlock = () => {
                                return contract.provider.getBlock(receipt.blockHash);
                            }
                            event.getTransaction = () => {
                                return contract.provider.getTransaction(receipt.transactionHash);
                            }
                            event.getTransactionReceipt = () => {
                                return Promise.resolve(receipt);
                            }

                            return event;
                        });

                        return receipt;
                    });
                };

                return tx;
            });
        });
    }
}

function getEventTag(filter: EventFilter): string {
    if (filter.address && (filter.topics == null || filter.topics.length === 0)) {
        return "*";
    }
    return (filter.address || "*") + "@" + (filter.topics ? filter.topics.join(":"): "");
}

interface Bucket<T> {
    [name: string]: T;
}

class RunningEvent {
    readonly tag: string;
    readonly filter: EventFilter;
    private _listeners: Array<{ listener: Listener, once: boolean }>;

    constructor(tag: string, filter: EventFilter) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "filter", filter);
        this._listeners = [ ];
    }

    addListener(listener: Listener, once: boolean): void {
        this._listeners.push({ listener: listener, once: once });
    }

    removeListener(listener: Listener): void {
        let done = false;
        this._listeners = this._listeners.filter((item) => {
            if (done || item.listener !== listener) { return true; }
            done = true;
            return false;
        });
    }

    removeAllListeners(): void {
        this._listeners = [];
    }

    listeners(): Array<Listener> {
        return this._listeners.map((i) => i.listener);
    }

    listenerCount(): number {
        return this._listeners.length;
    }

    run(args: Array<any>): number {
        let listenerCount = this.listenerCount();
        this._listeners = this._listeners.filter((item) => {

            let argsCopy = args.slice();

            // Call the callback in the next event loop
            setTimeout(() => {
                item.listener.apply(this, argsCopy);
            }, 0);

            // Reschedule it if it not "once"
            return !(item.once);
        });

        return listenerCount;
    }

    prepareEvent(event: Event): void {
    }
}

class ErrorRunningEvent extends RunningEvent {
    constructor() {
        super("error", null);
    }
}

class FragmentRunningEvent extends RunningEvent {
    readonly address: string;
    readonly interface: Interface;
    readonly fragment: EventFragment;

    constructor(address: string, contractInterface: Interface, fragment: EventFragment) {
        let filter = {
            address: address,
            topics: [ contractInterface.getEventTopic(fragment) ]
        }

        super(getEventTag(filter), filter);
        defineReadOnly(this, "address", address);
        defineReadOnly(this, "interface", contractInterface);
        defineReadOnly(this, "fragment", fragment);
    }


    prepareEvent(event: Event): void {
        super.prepareEvent(event);

        event.event = this.fragment.name;
        event.eventSignature = this.fragment.format();

        event.decode = (data: BytesLike, topics?: Array<string>) => {
            return this.interface.decodeEventLog(this.fragment, data, topics);
        };

        event.values = this.interface.decodeEventLog(this.fragment, event.data, event.topics);
    }
}

class WildcardRunningEvent extends RunningEvent {
    readonly address: string;
    readonly interface: Interface;

    constructor(address :string, contractInterface: Interface) {
        super("*", { address: address });
        defineReadOnly(this, "address", address);
        defineReadOnly(this, "interface", contractInterface);
    }

    prepareEvent(event: Event): void {
        super.prepareEvent(event);

        let parsed = this.interface.parseLog(event);
        if (parsed) {
            event.event = parsed.name;
            event.eventSignature = parsed.signature;

            event.decode = (data: BytesLike, topics?: Array<string>) => {
                return this.interface.decodeEventLog(parsed.eventFragment, data, topics);
            };

            event.values = parsed.values;
        }
    }
}

export type ContractInterface = string | Array<Fragment | JsonFragment | string> | Interface;

type InterfaceFunc = (contractInterface: ContractInterface) => Interface;

export class Contract {
    readonly address: string;
    readonly interface: Interface;

    readonly signer: Signer;
    readonly provider: Provider;

    readonly functions: Bucket<ContractFunction>;

    readonly callStatic: Bucket<ContractFunction>;
    readonly estimate: Bucket<(...params: Array<any>) => Promise<BigNumber>>;
    readonly populateTransaction: Bucket<(...params: Array<any>) => Promise<UnsignedTransaction>>;

    readonly filters: Bucket<(...params: Array<any>) => EventFilter>;

    readonly [ name: string ]: ContractFunction | any;

    readonly addressPromise: Promise<string>;

    // This is only set if the contract was created with a call to deploy
    readonly deployTransaction: TransactionResponse;

    private _deployedPromise: Promise<Contract>;

    // A list of RunningEvents to track listsners for each event tag
    private _runningEvents: { [ eventTag: string ]: RunningEvent };

    // Wrapped functions to call emit and allow deregistration from the provider
    private _wrappedEmits: { [ eventTag: string ]: (...args: Array<any>) => void };

    constructor(addressOrName: string, contractInterface: ContractInterface, signerOrProvider: Signer | Provider) {
        errors.checkNew(new.target, Contract);

        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);
        defineReadOnly(this, "interface", getStatic<InterfaceFunc>(new.target, "getInterface")(contractInterface));

        if (Signer.isSigner(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider.provider || null);
            defineReadOnly(this, "signer", signerOrProvider);
        } else if (Provider.isProvider(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider);
            defineReadOnly(this, "signer", null);
        } else {
            errors.throwError("invalid signer or provider", errors.INVALID_ARGUMENT, { arg: "signerOrProvider", value: signerOrProvider });
        }

        defineReadOnly(this, "callStatic", { });
        defineReadOnly(this, "estimate", { });
        defineReadOnly(this, "functions", { });
        defineReadOnly(this, "populateTransaction", { });

        defineReadOnly(this, "filters", { });

        Object.keys(this.interface.events).forEach((eventName) => {
            let event = this.interface.events[eventName];
            defineReadOnly(this.filters, eventName, (...args: Array<any>) => {
                return {
                    address: this.address,
                    topics: this.interface.encodeFilterTopics(event, args)
                }
            });
        });

        defineReadOnly(this, "_runningEvents", { });
        defineReadOnly(this, "_wrappedEmits", { });

        defineReadOnly(this, "address", addressOrName);
        if (this.provider) {
            defineReadOnly(this, "addressPromise", this.provider.resolveName(addressOrName).then((address) => {
                if (address == null) { throw new Error("name not found"); }
                return address;
            }).catch((error: Error) => {
                console.log("ERROR: Cannot find Contract - " + addressOrName);
                throw error;
            }));
        } else {
            try {
                defineReadOnly(this, "addressPromise", Promise.resolve((<any>(this.interface.constructor)).getAddress(addressOrName)));
            } catch (error) {
                // Without a provider, we cannot use ENS names
                errors.throwError("provider is required to use non-address contract address", errors.INVALID_ARGUMENT, { argument: "addressOrName", value: addressOrName });
            }
        }

        Object.keys(this.interface.functions).forEach((name) => {
            let run = runMethod(this, name, { });

            if (this[name] == null) {
                defineReadOnly(this, name, run);
            }

            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, run);
            }

            if (this.callStatic[name] == null) {
                defineReadOnly(this.callStatic, name, runMethod(this, name, { callStatic: true }));
            }

            if (this.populateTransaction[name] == null) {
                defineReadOnly(this.populateTransaction, name, runMethod(this, name, { transaction: true }));
            }

            if (this.estimate[name] == null) {
                defineReadOnly(this.estimate, name, runMethod(this, name, { estimate: true }));
            }
        });
    }

    static getContractAddress(transaction: { from: string, nonce: BigNumberish }): string {
        return getContractAddress(transaction);
    }

    static getInterface(contractInterface: ContractInterface): Interface {
        if (Interface.isInterface(contractInterface)) {
            return contractInterface;
        }
        return new Interface(contractInterface);
    }

    // @TODO: Allow timeout?
    deployed(): Promise<Contract> {
        return this._deployed();
    }

    _deployed(blockTag?: BlockTag): Promise<Contract> {
        if (!this._deployedPromise) {

            // If we were just deployed, we know the transaction we should occur in
            if (this.deployTransaction) {
                this._deployedPromise = this.deployTransaction.wait().then(() => {
                    return this;
                });

            } else {
                // @TODO: Once we allow a timeout to be passed in, we will wait
                // up to that many blocks for getCode

                // Otherwise, poll for our code to be deployed
                this._deployedPromise = this.provider.getCode(this.address, blockTag).then((code) => {
                    if (code === "0x") {
                        errors.throwError("contract not deployed", errors.UNSUPPORTED_OPERATION, {
                            contractAddress: this.address,
                            operation: "getDeployed"
                        });
                    }
                    return this;
                });
            }
        }

        return this._deployedPromise;
    }

    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>

    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>

    fallback(overrides?: TransactionRequest): Promise<TransactionResponse> {
        if (!this.signer) {
            errors.throwError("sending a transaction require a signer", errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction(fallback)" })
        }

        let tx: TransactionRequest = shallowCopy(overrides || {});

        ["from", "to"].forEach(function(key) {
            if ((<any>tx)[key] == null) { return; }
            errors.throwError("cannot override " + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        tx.to = this.addressPromise;
        return this.deployed().then(() => {
            return this.signer.sendTransaction(tx);
        });
    }

    // Reconnect to a different signer or provider
    connect(signerOrProvider: Signer | Provider | string): Contract {
        if (typeof(signerOrProvider) === "string") {
            signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
        }

        let contract = new (<{ new(...args: any[]): Contract }>(this.constructor))(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            defineReadOnly(contract, "deployTransaction", this.deployTransaction);
        }
        return contract;
    }

    // Re-attach to a different on-chain instance of this contract
    attach(addressOrName: string): Contract {
        return new (<{ new(...args: any[]): Contract }>(this.constructor))(addressOrName, this.interface, this.signer || this.provider);
    }

    static isIndexed(value: any): value is Indexed {
        return Indexed.isIndexed(value);
    }

    private _normalizeRunningEvent(runningEvent: RunningEvent): RunningEvent {
        // Already have an instance of this event running; we can re-use it
        if (this._runningEvents[runningEvent.tag]) {
            return this._runningEvents[runningEvent.tag];
         }
         return runningEvent
    }

    private _getRunningEvent(eventName: EventFilter | string): RunningEvent {
        if (typeof(eventName) === "string") {


            // Listen for "error" events (if your contract has an error event, include
            // the full signature to bypass this special event keyword)
            if (eventName === "error") {
                return this._normalizeRunningEvent(new ErrorRunningEvent());
            }

            // Listen for any event
            if (eventName === "*") {
                return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
            }

            let fragment = this.interface.getEvent(eventName)
            if (!fragment) {
                errors.throwError("unknown event - " + eventName, errors.INVALID_ARGUMENT, { argumnet: "eventName", value: eventName });
            }

            return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment));
        }

        let filter: EventFilter = {
            address: this.address
        }

        // Find the matching event in the ABI; if none, we still allow filtering
        // since it may be a filter for an otherwise unknown event
        if (eventName.topics) {
            if (eventName.topics[0]) {
                let fragment = this.interface.getEvent(eventName.topics[0]);
                if (fragment) {
                    return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment));
                }
            }

            filter.topics = eventName.topics;
        }

        return this._normalizeRunningEvent(new RunningEvent(getEventTag(filter), filter));
    }

    _checkRunningEvents(runningEvent: RunningEvent): void {
        if (runningEvent.listenerCount() === 0) {
            delete this._runningEvents[runningEvent.tag];
        }

        // If we have a poller for this, remove it
        let emit = this._wrappedEmits[runningEvent.tag];
        if (emit) {
            this.provider.off(runningEvent.filter, emit);
            delete this._wrappedEmits[runningEvent.tag];
        }
    }

    private _wrapEvent(runningEvent: RunningEvent, log: Log, listener: Listener): Event {
        let event = <Event>deepCopy(log);

        try {
            runningEvent.prepareEvent(event);
        } catch (error) {
            this.emit("error", error);
            throw error;
        }

        event.removeListener = () => {
            if (!listener) { return; }
            runningEvent.removeListener(listener);
            this._checkRunningEvents(runningEvent);
        };

        event.getBlock = () => { return this.provider.getBlock(log.blockHash); }
        event.getTransaction = () => { return this.provider.getTransaction(log.transactionHash); }
        event.getTransactionReceipt = () => { return this.provider.getTransactionReceipt(log.transactionHash); }

        return event;
    }

    private _addEventListener(runningEvent: RunningEvent, listener: Listener, once: boolean): void {
        if (!this.provider) {
            errors.throwError("events require a provider or a signer with a provider", errors.UNSUPPORTED_OPERATION, { operation: "once" })
        }

        runningEvent.addListener(listener, once);

        // Track this running event and its listeners (may already be there; but no hard in updating)
        this._runningEvents[runningEvent.tag] = runningEvent;

        // If we are not polling the provider, start
        if (!this._wrappedEmits[runningEvent.tag]) {
            let wrappedEmit = (log: Log) => {
                let event = this._wrapEvent(runningEvent, log, listener);
                let values = (event.values || []);
                values.push(event);
                this.emit(runningEvent.filter, ...values);
            };
            this._wrappedEmits[runningEvent.tag] = wrappedEmit;

            // Special events, like "error" do not have a filter
            if (runningEvent.filter != null) {
                this.provider.on(runningEvent.filter, wrappedEmit);
            }
        }
    }

    queryFilter(event: EventFilter, fromBlockOrBlockhash?: BlockTag | string, toBlock?: BlockTag): Promise<Array<Event>> {
        let runningEvent = this._getRunningEvent(event);
        let filter = shallowCopy(runningEvent.filter);

        if (typeof(fromBlockOrBlockhash) === "string" && isHexString(fromBlockOrBlockhash, 32)) {
            if (toBlock != null) {
                errors.throwArgumentError("cannot specify toBlock with blockhash", "toBlock", toBlock);
            }
            filter.blockhash = fromBlockOrBlockhash;
        } else {
             filter.fromBlock = ((fromBlockOrBlockhash != null) ? fromBlockOrBlockhash: 0);
             filter.toBlock = ((toBlock != null) ? toBlock: "latest");
        }

        return this.provider.getLogs(filter).then((logs) => {
            return logs.map((log) => this._wrapEvent(runningEvent, log, null));
        });
    }

    on(event: EventFilter | string, listener: Listener): this {
        this._addEventListener(this._getRunningEvent(event), listener, false);
        return this;
    }

    once(event: EventFilter | string, listener: Listener): this {
        this._addEventListener(this._getRunningEvent(event), listener, true);
        return this;
    }

    emit(eventName: EventFilter | string, ...args: Array<any>): boolean {
        if (!this.provider) { return false; }

        let runningEvent = this._getRunningEvent(eventName);
        let result = (runningEvent.run(args) > 0);

        // May have drained all the "once" events; check for living events
        this._checkRunningEvents(runningEvent);

        return result;
    }

    listenerCount(eventName?: EventFilter | string): number {
        if (!this.provider) { return 0; }
        return this._getRunningEvent(eventName).listenerCount();
    }

    listeners(eventName?: EventFilter | string): Array<Listener> {
        if (!this.provider) { return []; }

        if (eventName == null) {
            let result: Array<Listener> = [ ];
            for (let tag in this._runningEvents) {
                this._runningEvents[tag].listeners().forEach((listener) => {
                    result.push(listener)
                });
            }
            return result;
        }

        return this._getRunningEvent(eventName).listeners();
    }

    removeAllListeners(eventName?: EventFilter | string): this {
        if (!this.provider) { return this; }

        if (eventName == null) {
            for (let tag in this._runningEvents) {
                let runningEvent = this._runningEvents[tag];
                runningEvent.removeAllListeners();
                this._checkRunningEvents(runningEvent);
            }
            return this;
        }

        // Delete any listeners
        let runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeAllListeners();
        this._checkRunningEvents(runningEvent);

        return this;
    }

    off(eventName: EventFilter | string, listener: Listener): this {
        if (!this.provider) { return this; }
        let runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeListener(listener);
        this._checkRunningEvents(runningEvent);
        return this;
    }

    removeListener(eventName: EventFilter | string, listener: Listener): this {
        return this.off(eventName, listener);
    }

}

export class ContractFactory {

    readonly interface: Interface;
    readonly bytecode: string;
    readonly signer: Signer;

    constructor(contractInterface: ContractInterface, bytecode: BytesLike | { object: string }, signer?: Signer) {

        let bytecodeHex: string = null;

        if (typeof(bytecode) === "string") {
            bytecodeHex = bytecode;
        } else if (isBytes(bytecode)) {
            bytecodeHex = hexlify(bytecode);
        } else if (bytecode && typeof(bytecode.object) === "string") {
            // Allow the bytecode object from the Solidity compiler
            bytecodeHex = (<any>bytecode).object;
        } else {
            // Crash in the next verification step
            bytecodeHex = "!";
        }

        // Make sure it is 0x prefixed
        if (bytecodeHex.substring(0, 2) !== "0x") { bytecodeHex = "0x" + bytecodeHex; }

        // Make sure the final result is valid bytecode
        if (!isHexString(bytecodeHex) || (bytecodeHex.length % 2)) {
            errors.throwArgumentError("invalid bytecode", "bytecode", bytecode);
        }

        // If we have a signer, make sure it is valid
        if (signer && !Signer.isSigner(signer)) {
            errors.throwArgumentError("invalid signer", "signer", signer);
        }

        defineReadOnly(this, "bytecode", bytecodeHex);
        defineReadOnly(this, "interface", getStatic<InterfaceFunc>(new.target, "getInterface")(contractInterface));
        defineReadOnly(this, "signer", signer || null);
    }

    getDeployTransaction(...args: Array<any>): UnsignedTransaction {

        let tx: UnsignedTransaction = { };

        // If we have 1 additional argument, we allow transaction overrides
        if (args.length === this.interface.deploy.inputs.length + 1) {
            tx = shallowCopy(args.pop());
            for (let key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error("unknown transaction override " + key);
                }
            }
        }

        // Do not allow these to be overridden in a deployment transaction
        ["data", "from", "to"].forEach((key) => {
            if ((<any>tx)[key] == null) { return; }
            errors.throwError("cannot override " + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        // Make sure the call matches the constructor signature
        errors.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");

        // Set the data to the bytecode + the encoded constructor arguments
        tx.data = hexlify(concat([
            this.bytecode,
            this.interface.encodeDeploy(args)
        ]));

        return tx
    }

    deploy(...args: Array<any>): Promise<Contract> {
        return resolveAddresses(this.signer, args, this.interface.deploy.inputs).then((args) => {

            // Get the deployment transaction (with optional overrides)
            let tx = this.getDeployTransaction(...args);

            // Send the deployment transaction
            return this.signer.sendTransaction(tx).then((tx) => {
                let address = (<any>(this.constructor)).getContractAddress(tx);
                let contract = (<any>(this.constructor)).getContract(address, this.interface, this.signer);
                defineReadOnly(contract, "deployTransaction", tx);
                return contract;
            });
        });
    }

    attach(address: string): Contract {
        return (<any>(this.constructor)).getContract(address, this.interface, this.signer);
    }

    connect(signer: Signer) {
        return new (<{ new(...args: any[]): ContractFactory }>(this.constructor))(this.interface, this.bytecode, signer);
    }

    static fromSolidity(compilerOutput: any, signer?: Signer): ContractFactory {
        if (compilerOutput == null) {
            errors.throwError("missing compiler output", errors.MISSING_ARGUMENT, { argument: "compilerOutput" });
        }

        if (typeof(compilerOutput) === "string") {
            compilerOutput = JSON.parse(compilerOutput);
        }

        let abi = compilerOutput.abi;

        let bytecode: any = null;
        if (compilerOutput.bytecode) {
            bytecode = compilerOutput.bytecode;
        } else if (compilerOutput.evm && compilerOutput.evm.bytecode) {
            bytecode = compilerOutput.evm.bytecode;
        }

        return new this(abi, bytecode, signer);
    }

    static getInterface(contractInterface: ContractInterface) {
        return Contract.getInterface(contractInterface);
    }

    static getContractAddress(tx: { from: string, nonce: BytesLike | BigNumber | number }): string {
        return getContractAddress(tx);
    }

    static getContract(address: string, contractInterface: ContractInterface, signer?: Signer): Contract {
        return new Contract(address, contractInterface, signer);
    }
}


