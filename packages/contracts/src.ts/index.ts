"use strict";

import { EventFragment, Fragment, Indexed, Interface, JsonFragment, ParamType } from "@ethersproject/abi";
import { Block, BlockTag, Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer, VoidSigner } from "@ethersproject/abstract-signer";
import { getContractAddress } from "@ethersproject/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike, concat, hexlify, isBytes, isHexString } from "@ethersproject/bytes";
import { Zero } from "@ethersproject/constants";
import * as errors from "@ethersproject/errors";
import { defineReadOnly, deepCopy, isNamedInstance, resolveProperties, shallowCopy } from "@ethersproject/properties";
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

// Recursively replaces ENS names with promises to resolve the name and
// stalls until all promises have returned
// @TODO: Expand this to resolve any promises too
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

    // Strips one level of array indexing off the end to recuse into
    //let isArrayMatch = paramType.type.match(/(.*)(\[[0-9]*\]$)/);
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

            if (!contract.signer) {
                errors.throwError("sending a transaction require a signer", errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction" })
            }

            if (options.transaction) { return tx; }

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

type _EventFilter = {
    prepareEvent: (event: Event) => void;
    fragment?: EventFragment;
    eventTag: string;
    filter: EventFilter;
};

type _Event = {
    eventFilter: _EventFilter;
    listener: Listener;
    once: boolean;
    wrappedListener: Listener;
};

export type ContractInterface = string | Array<Fragment | JsonFragment | string> | Interface;

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

    _deployedPromise: Promise<Contract>;

    // https://github.com/Microsoft/TypeScript/issues/5453
    // Once this issue is resolved (there are open PR) we can do this nicer
    // by making addressOrName default to null for 2 operand calls. :)

    constructor(addressOrName: string, contractInterface: ContractInterface, signerOrProvider: Signer | Provider) {
        errors.checkNew(new.target, Contract);

        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);

        defineReadOnly(this, "interface", new.target.getInterface(contractInterface));

        if (isNamedInstance<Signer>(Signer, signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider.provider);
            defineReadOnly(this, "signer", signerOrProvider);
        } else if (isNamedInstance<Provider>(Provider, signerOrProvider)) {
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

        this._events = [];

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
        if (isNamedInstance<Interface>(Interface, contractInterface)) {
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
        return isNamedInstance<Indexed>(Indexed, value);
    }

    private _events: Array<_Event>;

    private _getEventFilter(eventName: EventFilter | string): _EventFilter {
        if (typeof(eventName) === "string") {

            // Listen for any event
            if (eventName === "*") {
                return {
                    prepareEvent: (e: Event) => {
                        let parsed = this.interface.parseLog(e);
                        if (parsed) {
                            e.values = parsed.values;
                            e.decode = (data: BytesLike, topics?: Array<string>) => {
                                return this.interface.decodeEventLog(parsed.eventFragment, data, topics);
                            },
                            e.event = parsed.name;
                            e.eventSignature = parsed.signature;
                        }
                    },
                    eventTag: "*",
                    filter: { address: this.address },
                };
            }

            let fragment = this.interface.getEvent(eventName)
            if (!fragment) {
                errors.throwError("unknown event - " + eventName, errors.INVALID_ARGUMENT, { argumnet: "eventName", value: eventName });
            }

            let filter = {
                address: this.address,
                topics: [ this.interface.getEventTopic(fragment) ]
            }

            return {
                prepareEvent: (e: Event) => {
                    e.values = this.interface.decodeEventLog(fragment, e.data, e.topics);
                },
                fragment: fragment,
                eventTag: getEventTag(filter),
                filter: filter
            };
        }

        let filter: EventFilter = {
            address: this.address
        }

        // Find the matching event in the ABI; if none, we still allow filtering
        // since it may be a filter for an otherwise unknown event
        let fragment: EventFragment = null;
        if (eventName.topics && eventName.topics[0]) {
            filter.topics = eventName.topics;
            fragment = this.interface.getEvent(eventName.topics[0]);
        }

        return {
            prepareEvent: (e: Event) => {
                if (!fragment) { return; }
                e.values = this.interface.decodeEventLog(fragment, e.data, e.topics);
            },
            fragment: fragment,
            eventTag: getEventTag(filter),
            filter: filter
        }
    }

    // @TODO: move this to _EventFilter.wrapLog. Maybe into prepareEvent?
    _wrapEvent(eventFilter: _EventFilter, log: Log, listener: Listener): Event {
        let event = <Event>deepCopy(log);

        // @TODO: Move all the below stuff into prepare
        eventFilter.prepareEvent(event);

        if (eventFilter.fragment) {
            event.decode = (data: BytesLike, topics?: Array<string>) => {
                return this.interface.decodeEventLog(eventFilter.fragment, data, topics);
            },
            event.event = eventFilter.fragment.name;
            event.eventSignature = eventFilter.fragment.format();
        }

        event.removeListener = () => {
            if (!listener) { return; }
            this.removeListener(eventFilter.filter, listener);
        };

        event.getBlock = () => { return this.provider.getBlock(log.blockHash); }
        event.getTransaction = () => { return this.provider.getTransaction(log.transactionHash); }
        event.getTransactionReceipt = () => { return this.provider.getTransactionReceipt(log.transactionHash); }

        return event;
    }

    private _addEventListener(eventFilter: _EventFilter, listener: Listener, once: boolean): void {
        if (!this.provider) {
            errors.throwError("events require a provider or a signer with a provider", errors.UNSUPPORTED_OPERATION, { operation: "once" })
        }

        let wrappedListener = (log: Log) => {
            let event = this._wrapEvent(eventFilter, log, listener);
            let values = (event.values || []);
            values.push(event);
            this.emit(eventFilter.filter, ...values);
        };

        this.provider.on(eventFilter.filter, wrappedListener);
        this._events.push({ eventFilter: eventFilter, listener: listener, wrappedListener: wrappedListener, once: once });
    }

    queryFilter(event: EventFilter, fromBlockOrBlockhash?: BlockTag | string, toBlock?: BlockTag): Promise<Array<Event>> {
        let eventFilter = this._getEventFilter(event);
        let filter = shallowCopy(eventFilter.filter);

        if (typeof(fromBlockOrBlockhash) === "string" && isHexString(fromBlockOrBlockhash, 32)) {
            filter.blockhash = fromBlockOrBlockhash;
            if (toBlock != null) {
                errors.throwArgumentError("cannot specify toBlock with blockhash", "toBlock", toBlock);
            }
        } else {
             filter.fromBlock = ((fromBlockOrBlockhash != null) ? fromBlockOrBlockhash: 0);
             filter.toBlock = ((toBlock != null) ? toBlock: "latest");
        }

        return this.provider.getLogs(filter).then((logs) => {
            return logs.map((log) => this._wrapEvent(eventFilter, log, null));
        });
    }

    on(event: EventFilter | string, listener: Listener): Contract {
        this._addEventListener(this._getEventFilter(event), listener, false);
        return this;
    }

    once(event: EventFilter | string, listener: Listener): Contract {
        this._addEventListener(this._getEventFilter(event), listener, true);
        return this;
    }

    addListener(eventName: EventFilter | string, listener: Listener): Contract {
        return this.on(eventName, listener);
    }

    emit(eventName: EventFilter | string, ...args: Array<any>): boolean {
        if (!this.provider) { return false; }

        let result = false;

        let eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter((event) => {

            // Not this event (keep it for later)
            if (event.eventFilter.eventTag !== eventFilter.eventTag) { return true; }

            // Call the callback in the next event loop
            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);
            result = true;

            // Reschedule it if it not "once"
            return !(event.once);
        });

        return result;
    }

    listenerCount(eventName?: EventFilter | string): number {
        if (!this.provider) { return 0; }

        let eventFilter = this._getEventFilter(eventName);
        return this._events.filter((event) => {
            return event.eventFilter.eventTag === eventFilter.eventTag
        }).length;
    }

    listeners(eventName?: EventFilter | string): Array<Listener> {
        if (!this.provider) { return []; }

        if (eventName == null) {
            return this._events.map((event) => event.listener);
        }

        let eventFilter = this._getEventFilter(eventName);
        return this._events
            .filter((event) => (event.eventFilter.eventTag === eventFilter.eventTag))
            .map((event) => event.listener);
    }

    removeAllListeners(eventName: EventFilter | string): Contract {
        if (!this.provider) { return this; }

        let eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter((event) => {
            // Keep non-matching events
            if (event.eventFilter.eventTag !== eventFilter.eventTag) {
                return true;
            }

            // De-register this event from the provider and filter it out
            this.provider.removeListener(event.eventFilter.filter, event.wrappedListener);
            return false;
        });

        return this;
    }

    off(eventName: any, listener: Listener): Contract {
        if (!this.provider) { return this; }

        let found = false;

        let eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter((event) => {

            // Make sure this event and listener match
            if (event.eventFilter.eventTag !== eventFilter.eventTag) { return true; }
            if (event.listener !== listener) { return true; }
            this.provider.removeListener(event.eventFilter.filter, event.wrappedListener);

            // Already found a matching event in a previous loop
            if (found) { return true; }

            // Remove this event (returning false filters us out)
            found = true;
            return false;
        });

        return this;
    }

    removeListener(eventName: any, listener: Listener): Contract {
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
        if (signer && !isNamedInstance<Signer>(Signer, signer)) {
            errors.throwArgumentError("invalid signer", "signer", signer);
        }

        defineReadOnly(this, "bytecode", bytecodeHex);
        defineReadOnly(this, "interface", new.target.getInterface(contractInterface));
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

        // Get the deployment transaction (with optional overrides)
        let tx = this.getDeployTransaction(...args);

        // Send the deployment transaction
        return this.signer.sendTransaction(tx).then((tx) => {
            let address = (<any>(this.constructor)).getContractAddress(tx);
            let contract = (<any>(this.constructor)).getContract(address, this.interface, this.signer);
            defineReadOnly(contract, "deployTransaction", tx);
            return contract;
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


