'use strict';

import { Zero } from './constants';

import * as errors from './errors';

import { defaultAbiCoder, formatSignature, parseSignature } from './utils/abi-coder';
import { getAddress, getContractAddress } from './utils/address';
import { BigNumber, bigNumberify } from './utils/bignumber';
import { hexDataLength, hexDataSlice, hexlify, isArrayish, isHexString } from './utils/bytes';
import { Indexed, Interface } from './utils/interface';
import { defineReadOnly, deepCopy, shallowCopy } from './utils/properties';
import { UnsignedTransaction } from './utils/transaction';


///////////////////////////////
// Imported Abstracts

import { BlockTag, Provider } from './providers/abstract-provider';
import { Signer } from './abstract-signer';

///////////////////////////////
// Imported Types

import { Arrayish } from './utils/bytes';
import { EventDescription } from './utils/interface';
import { EventFragment, FunctionFragment, ParamType } from './utils/abi-coder';
import { Block, Listener, Log, TransactionReceipt, TransactionRequest, TransactionResponse } from './providers/abstract-provider';

///////////////////////////////
// Exported Types

export type ContractFunction = (...params: Array<any>) => Promise<any>;

export type EventFilter = {
    address?: string;
    topics?: Array<string>;
    // @TODO: Support OR-style topcis; backwards compatible to make this change
    //topics?: Array<string | Array<string>>
};

// The (n + 1)th parameter passed to contract event callbacks
export interface Event extends Log {
    args?: Array<any>;
    decode?: (data: string, topics?: Array<string>) => any;
    event?: string;
    eventSignature?: string;

    removeListener: () => void;

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

export class VoidSigner extends Signer {
    readonly address: string;

    constructor(address: string, provider: Provider) {
        super();
        defineReadOnly(this, 'address', address);
        defineReadOnly(this, 'provider', provider);
    }

    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    _fail(message: string, operation: string): Promise<any> {
        return Promise.resolve().then(() => {
            errors.throwError(message, errors.UNSUPPORTED_OPERATION, { operation: operation });
        });
    }

    signMessage(message: Arrayish | string): Promise<string> {
        return this._fail('VoidSigner cannot sign messages', 'signMessage');
    }

    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        return this._fail('VoidSigner cannot sign transactions', 'sendTransaction');
    }

    connect(provider: Provider): VoidSigner {
        return new VoidSigner(this.address, provider);
    }
}

const allowedTransactionKeys: { [ key: string ]: boolean } = {
    chainId: true, data: true, from: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true
}

// Recursively replaces ENS names with promises to resolve the name and
// stalls until all promises have returned
// @TODO: Expand this to resolve any promises too
function resolveAddresses(provider: Provider, value: any, paramType: ParamType | Array<ParamType>): Promise<any> {
    if (Array.isArray(paramType)) {
        let promises: Array<Promise<any>> = [];
        paramType.forEach((paramType, index) => {
            let v = null;
            if (Array.isArray(value)) {
                v = value[index];
            } else {
                v = value[paramType.name];
            }
            promises.push(resolveAddresses(provider, v, paramType));
        });
        return Promise.all(promises);
    }

    if (paramType.type === 'address') {
        return provider.resolveName(value);
    }

    if (paramType.type === 'tuple') {
        return resolveAddresses(provider, value, paramType.components);
    }

    // Strips one level of array indexing off the end to recuse into
    let isArrayMatch = paramType.type.match(/(.*)(\[[0-9]*\]$)/);
    if (isArrayMatch) {
        if (!Array.isArray(value)) { throw new Error('invalid value for array'); }
        var promises: Array<Promise<any>> = [];
        var subParamType = {
            components: paramType.components,
            type: isArrayMatch[1],
        };
        value.forEach((v) => {
            promises.push(resolveAddresses(provider, v, subParamType));
        });
        return Promise.all(promises);
    }

    return Promise.resolve(value);
}

type RunFunction = (...params: Array<any>) => Promise<any>;

function runMethod(contract: Contract, functionName: string, estimateOnly: boolean): RunFunction {
    let method = contract.interface.functions[functionName];
    return function(...params): Promise<any> {
        let tx: any = {}

        let blockTag: BlockTag = null;

        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof(params[params.length - 1]) === 'object') {
            tx = shallowCopy(params.pop());

            if (tx.blockTag != null) {
                blockTag = tx.blockTag;
            }

            delete tx.blockTag;

            // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
            for (let key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error('unknown transaction override ' + key);
                }
            }
        }

        if (params.length != method.inputs.length) {
            throw new Error('incorrect number of arguments');
        }

        // Check overrides make sense
        ['data', 'to'].forEach(function(key) {
            if (tx[key] != null) {
                errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key })
            }
        });

        tx.to = contract._deployed(blockTag).then(() => {
            return contract.addressPromise;
        });

        return resolveAddresses(contract.provider, params, method.inputs).then((params) => {
            tx.data = method.encode(params);
            if (method.type === 'call') {

                // Call (constant functions) always cost 0 ether
                if (estimateOnly) {
                    return Promise.resolve(Zero);
                }

                if (!contract.provider) {
                    errors.throwError('call (constant functions) require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'call' })
                }

                // Check overrides make sense
                ['gasLimit', 'gasPrice', 'value'].forEach(function(key) {
                    if (tx[key] != null) {
                        throw new Error('call cannot override ' + key) ;
                    }
                });

                if (tx.from == null && contract.signer) {
                    tx.from = contract.signer.getAddress()
                }

                return contract.provider.call(tx, blockTag).then((value) => {
                    if ((hexDataLength(value) % 32) === 4 && hexDataSlice(value, 0, 4) === '0x08c379a0') {
                        let reason = defaultAbiCoder.decode([ 'string' ], hexDataSlice(value, 4));
                        errors.throwError('call revert exception', errors.CALL_EXCEPTION, {
                            address: contract.address,
                            args: params,
                            method: method.signature,
                            errorSignature: 'Error(string)',
                            errorArgs: [ reason ],
                            reason: reason,
                            transaction: tx
                        });
                    }

                    try {
                        let result = method.decode(value);
                        if (method.outputs.length === 1) {
                            result = result[0];
                        }
                        return result;

                    } catch (error) {
                        if (value === '0x' && method.outputs.length > 0) {
                            errors.throwError('call exception', errors.CALL_EXCEPTION, {
                                address: contract.address,
                                method: method.signature,
                                args: params
                            });
                        }
                        throw error;
                    }
                });

            } else if (method.type === 'transaction') {

                // Only computing the transaction estimate
                if (estimateOnly) {
                    if (!contract.provider) {
                        errors.throwError('estimate gas require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'estimateGas' })
                    }

                    if (tx.from == null && contract.signer) {
                        tx.from = contract.signer.getAddress()
                    }

                    return contract.provider.estimateGas(tx);
                }

                if (tx.gasLimit == null && method.gas != null) {
                    tx.gasLimit = bigNumberify(method.gas).add(21000);
                }

                if (!contract.signer) {
                    errors.throwError('sending a transaction requires a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' })
                }

                // Make sure they aren't overriding something they shouldn't
                if (tx.from != null) {
                    errors.throwError('cannot override from in a transaction', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' })
                }

                return contract.signer.sendTransaction(tx).then((tx) => {
                    let wait = tx.wait.bind(tx);

                    tx.wait = (confirmations?: number) => {
                        return wait(confirmations).then((receipt: ContractReceipt) => {
                            receipt.events = receipt.logs.map((log) => {
                                 let event: Event = (<Event>deepCopy(log));

                                 let parsed = contract.interface.parseLog(log);
                                 if (parsed) {
                                     event.args = parsed.values;
                                     event.decode = parsed.decode;
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
            }

            throw new Error('invalid type - ' + method.type);
            return null;
        });
    }
}

function getEventTag(filter: EventFilter): string {
    if (filter.address && (filter.topics == null || filter.topics.length === 0)) {
        return '*';
    }
    return (filter.address || '*') + '@' + (filter.topics ? filter.topics.join(':'): '');
}

interface Bucket<T> {
    [name: string]: T;
}

type _EventFilter = {
    prepareEvent: (event: Event) => Array<any>;
    event?: EventDescription;
    eventTag: string;
    filter: EventFilter;
};

type _Event = {
    eventFilter: _EventFilter;
    listener: Listener;
    once: boolean;
    wrappedListener: Listener;
};

export class Contract {
    readonly address: string;
    readonly interface: Interface;

    readonly signer: Signer;
    readonly provider: Provider;

    readonly estimate: Bucket<(...params: Array<any>) => Promise<BigNumber>>;
    readonly functions: Bucket<ContractFunction>;

    readonly filters: Bucket<(...params: Array<any>) => EventFilter>;

    readonly [name: string]: ContractFunction | any;

    readonly addressPromise: Promise<string>;

    // This is only set if the contract was created with a call to deploy
    readonly deployTransaction: TransactionResponse;

    private _deployedPromise: Promise<Contract>;

    // https://github.com/Microsoft/TypeScript/issues/5453
    // Once this issue is resolved (there are open PR) we can do this nicer
    // by making addressOrName default to null for 2 operand calls. :)

    // ParamType is not actually correct here, but for legacy reasons,
    // we need it. See #721.
    constructor(addressOrName: string, contractInterface: Array<string | FunctionFragment | EventFragment | ParamType> | string | Interface, signerOrProvider: Signer | Provider) {
        errors.checkNew(this, Contract);

        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);

        if (Interface.isInterface(contractInterface)) {
            defineReadOnly(this, 'interface', contractInterface);
        } else {
            defineReadOnly(this, 'interface', new Interface(contractInterface));
        }

        if (Signer.isSigner(signerOrProvider)) {
            defineReadOnly(this, 'provider', signerOrProvider.provider);
            defineReadOnly(this, 'signer', signerOrProvider);
        } else if (Provider.isProvider(signerOrProvider)) {
            defineReadOnly(this, 'provider', signerOrProvider);
            defineReadOnly(this, 'signer', null);
        } else {
            errors.throwError('invalid signer or provider', errors.INVALID_ARGUMENT, { arg: 'signerOrProvider', value: signerOrProvider });
        }

        defineReadOnly(this, 'estimate', { });
        defineReadOnly(this, 'functions', { });

        defineReadOnly(this, 'filters', { });

        Object.keys(this.interface.events).forEach((eventName) => {
            let event = this.interface.events[eventName];
            defineReadOnly(this.filters, eventName, (...args: Array<any>) => {
                return {
                    address: this.address,
                    topics: event.encodeTopics(args)
                }
            });
        });

        this._events = [];

        defineReadOnly(this, 'address', addressOrName);
        if (this.provider) {
            defineReadOnly(this, 'addressPromise', this.provider.resolveName(addressOrName).then((address) => {
                if (address == null) { throw new Error('name not found'); }
                return address;
            }).catch((error: Error) => {
                throw error;
            }));
        } else {
            try {
                defineReadOnly(this, 'addressPromise', Promise.resolve(getAddress(addressOrName)));
            } catch (error) {
                // Without a provider, we cannot use ENS names
                errors.throwError('provider is required to use non-address contract address', errors.INVALID_ARGUMENT, { argument: 'addressOrName', value: addressOrName });
            }
        }

        Object.keys(this.interface.functions).forEach((name) => {
            let run = runMethod(this, name, false);

            if ((<any>this)[name] == null) {
                defineReadOnly(this, name, run);
            } else {
                errors.warn('WARNING: Multiple definitions for ' + name);
            }

            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, run);
                defineReadOnly(this.estimate, name, runMethod(this, name, true));
            }
        });
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
                    if (code === '0x') {
                        errors.throwError('contract not deployed', errors.UNSUPPORTED_OPERATION, {
                            contractAddress: this.address,
                            operation: 'getDeployed'
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
            errors.throwError('sending a transaction requires a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction(fallback)' })
        }

        var tx: TransactionRequest = shallowCopy(overrides || {});

        ['from', 'to'].forEach(function(key) {
            if ((<any>tx)[key] == null) { return; }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        tx.to = this.addressPromise;
        return this.deployed().then(() => {
            return this.signer.sendTransaction(tx);
        });
    }

    // Reconnect to a different signer or provider
    connect(signerOrProvider: Signer | Provider | string): Contract {
        if (typeof(signerOrProvider) === 'string') {
            signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
        }

        let contract = new Contract(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            defineReadOnly(contract, 'deployTransaction', this.deployTransaction);
        }
        return contract;
    }

    // Re-attach to a different on=chain instance of this contract
    attach(addressOrName: string): Contract {
        return new Contract(addressOrName, this.interface, this.signer || this.provider);
    }

    static isIndexed(value: any): value is Indexed {
        return Interface.isIndexed(value);
    }

    private _events: Array<_Event>;

    private _getEventFilter(eventName: EventFilter | string): _EventFilter {
        if (typeof(eventName) === 'string') {

            // Listen for any event
            if (eventName === '*') {
                return {
                    prepareEvent: (e: Event) => {
                        let parsed = this.interface.parseLog(e);
                        if (parsed) {
                            e.args = parsed.values;
                            e.decode = parsed.decode;
                            e.event = parsed.name;
                            e.eventSignature = parsed.signature;
                        }
                        return [ e ];
                    },
                    eventTag: '*',
                    filter: { address: this.address },
                };
            }

            // Normalize the eventName
            if (eventName.indexOf('(') !== -1) {
                eventName = formatSignature(parseSignature('event ' + eventName));
            }

            let event = this.interface.events[eventName];
            if (!event) {
                errors.throwError('unknown event - ' + eventName, errors.INVALID_ARGUMENT, { argumnet: 'eventName', value: eventName });
            }

            let filter = {
                address: this.address,
                topics: [ event.topic ]
            }

            return {
                prepareEvent: (e: Event) => {
                    let args = event.decode(e.data, e.topics);
                    e.args = args;

                    let result = Array.prototype.slice.call(args);
                    result.push(e);

                    return result;
                },
                event: event,
                eventTag: getEventTag(filter),
                filter: filter
            };
        }

        let filter: EventFilter = {
            address: this.address
        }

        // Find the matching event in the ABI; if none, we still allow filtering
        // since it may be a filter for an otherwise unknown event
        let event: EventDescription = null;
        if (eventName.topics && eventName.topics[0]) {
            filter.topics = eventName.topics;
            for (let name in this.interface.events) {
                if (name.indexOf('(') === -1) { continue; }
                let e = this.interface.events[name];
                if (e.topic === eventName.topics[0].toLowerCase()) {
                    event = e;
                    break;
                }
            }
        }

        return {
            prepareEvent: (e: Event) => {
                if (!event) { return [ e ]; }

                let args = event.decode(e.data, e.topics);
                e.args = args;

                let result = Array.prototype.slice.call(args);
                result.push(e);

                return result;
            },
            event: event,
            eventTag: getEventTag(filter),
            filter: filter
        }
    }

    private _addEventListener(eventFilter: _EventFilter, listener: Listener, once: boolean): void {
        if (!this.provider) {
            errors.throwError('events require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'once' })
        }

        let wrappedListener = (log: Log) => {

            let event: Event = (<Event>deepCopy(log));

            let args = eventFilter.prepareEvent(event);

            if (eventFilter.event) {
                event.decode = eventFilter.event.decode;
                event.event = eventFilter.event.name;
                event.eventSignature = eventFilter.event.signature;
            }

            event.removeListener = () => { this.removeListener(eventFilter.filter, listener); };

            event.getBlock = () => { return this.provider.getBlock(log.blockHash); }
            event.getTransaction = () => { return this.provider.getTransaction(log.transactionHash); }
            event.getTransactionReceipt = () => { return this.provider.getTransactionReceipt(log.transactionHash); }

            this.emit(eventFilter.filter, ...args);
        };

        this.provider.on(eventFilter.filter, wrappedListener);
        this._events.push({ eventFilter: eventFilter, listener: listener, wrappedListener: wrappedListener, once: once });
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

    listeners(eventName: EventFilter | string): Array<Listener> {
        if (!this.provider) { return []; }

        let eventFilter = this._getEventFilter(eventName);
        return this._events.filter((event) => {
            return event.eventFilter.eventTag === eventFilter.eventTag
        }).map((event) => { return event.listener; });
    }

    removeAllListeners(eventName: EventFilter | string): Contract {
        if (!this.provider) { return this; }

        let eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter((event) => {

            // Keep all other events
            if (event.eventFilter.eventTag !== eventFilter.eventTag) {
                return true;
            }

            // Deregister this event from the provider and filter it out
            this.provider.removeListener(event.eventFilter.filter, event.wrappedListener);
            return false;
        });

        return this;
    }

    removeListener(eventName: any, listener: Listener): Contract {
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

            // REmove this event (returning false filters us out)
            found = true;
            return false;
        });

        return this;
    }

}

export class ContractFactory {

    readonly interface: Interface;
    readonly bytecode: string;
    readonly signer: Signer;

    // ParamType is not actually correct here, but for legacy reasons,
    // we need it. See #721.
    constructor(contractInterface: Array<string | FunctionFragment | EventFragment | ParamType> | string | Interface, bytecode: Arrayish | string | { object: string }, signer?: Signer) {

        let bytecodeHex: string = null;

        // Allow the bytecode object from the Solidity compiler
        if (typeof(bytecode) === 'string') {
            bytecodeHex = bytecode;
        } else if (isArrayish(bytecode)) {
            bytecodeHex = hexlify(bytecode);
        } else if (typeof(bytecode.object) === 'string') {
            bytecodeHex = (<any>bytecode).object;
        } else {
            errors.throwError('bytecode must be a valid hex string', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }

        // Make sure it is 0x prefixed
        if (bytecodeHex.substring(0, 2) !== '0x') {
            bytecodeHex = '0x' + bytecodeHex;
        }

        if (!isHexString(bytecodeHex)) {
            errors.throwError('bytecode must be a valid hex string', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }

        if ((bytecodeHex.length % 2) !== 0) {
            errors.throwError('bytecode must be valid data (even length)', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }

        defineReadOnly(this, 'bytecode', bytecodeHex);

        if (Interface.isInterface(contractInterface)) {
            defineReadOnly(this, 'interface', contractInterface);
        } else {
            defineReadOnly(this, 'interface', new Interface(contractInterface));
        }

        if (signer && !Signer.isSigner(signer)) {
            errors.throwError('invalid signer', errors.INVALID_ARGUMENT, { arg: 'signer', value: null });
        }

        defineReadOnly(this, 'signer', signer || null);
    }

    getDeployTransaction(...args: Array<any>): UnsignedTransaction {

        let tx: UnsignedTransaction = { };

        // If we have 1 additional argument, we allow transaction overrides
        if (args.length === this.interface.deployFunction.inputs.length + 1) {
            tx = shallowCopy(args.pop());
            for (let key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error('unknown transaction override ' + key);
                }
            }
        }

        // Do not allow these to be overridden in a deployment transaction
        ['data', 'from', 'to'].forEach((key) => {
            if ((<any>tx)[key] == null) { return; }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        // Make sure the call matches the constructor signature
        errors.checkArgumentCount(args.length, this.interface.deployFunction.inputs.length, ' in Contract constructor');

        // Set the data to the bytecode + the encoded constructor arguments
        tx.data = this.interface.deployFunction.encode(this.bytecode, args);

        return tx
    }

    deploy(...args: Array<any>): Promise<Contract> {

        // Get the deployment transaction (with optional overrides)
        let tx = this.getDeployTransaction(...args);

        // Send the deployment transaction
        return this.signer.sendTransaction(tx).then((tx) => {
            let contract = new Contract(getContractAddress(tx), this.interface, this.signer);
            defineReadOnly(contract, 'deployTransaction', tx);
            return contract;
        });
    }

    attach(address: string): Contract {
        return new Contract(address, this.interface, this.signer);
    }

    connect(signer: Signer) {
        return new ContractFactory(this.interface, this.bytecode, signer);
    }

    static fromSolidity(compilerOutput: any, signer?: Signer): ContractFactory {
        if (compilerOutput == null) {
            errors.throwError('missing compiler output', errors.MISSING_ARGUMENT, { argument: 'compilerOutput' });
        }

        if (typeof(compilerOutput) === 'string') {
            compilerOutput = JSON.parse(compilerOutput);
        }

        let abi = compilerOutput.abi;

        let bytecode: any = null;
        if (compilerOutput.bytecode) {
            bytecode = compilerOutput.bytecode;
        } else if (compilerOutput.evm && compilerOutput.evm.bytecode) {
            bytecode = compilerOutput.evm.bytecode;
        }


        return new ContractFactory(abi, bytecode, signer);
    }
}

