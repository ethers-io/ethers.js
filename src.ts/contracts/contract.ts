'use strict';

import { EventDescription, Interface } from './interface';

import { Block, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from '../providers/provider';
import { Signer } from '../wallet/wallet';

import { defaultAbiCoder, formatSignature, ParamType, parseSignature } from '../utils/abi-coder';
import { getContractAddress } from '../utils/address';
import { BigNumber, ConstantZero } from '../utils/bignumber';
import { hexDataLength, hexDataSlice, isHexString } from '../utils/bytes';
import { defineReadOnly, jsonCopy, shallowCopy } from '../utils/properties';
import { poll } from '../utils/web';

import * as errors from '../utils/errors';

var allowedTransactionKeys: { [ key: string ]: boolean } = {
    data: true, from: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true
}

// Recursively replaces ENS names with promises to resolve the name and
// stalls until all promises have returned
// @TODO: Expand this to resolve any promises too
function resolveAddresses(provider: Provider, value: any, paramType: ParamType | Array<ParamType>): Promise<any> {
    if (Array.isArray(paramType)) {
        var promises: Array<Promise<string>> = [];
        paramType.forEach((paramType, index) => {
            var v = null;
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

    if (paramType.components) {
        return resolveAddresses(provider, value, paramType.components);
    }

    return Promise.resolve(value);
}

type RunFunction = (...params: Array<any>) => Promise<any>;

function runMethod(contract: Contract, functionName: string, estimateOnly: boolean): RunFunction {
    let method = contract.interface.functions[functionName];
    return function(...params): Promise<any> {
        var tx: any = {}

        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof(params[params.length - 1]) === 'object') {
            tx = shallowCopy(params.pop());

            // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
            for (var key in tx) {
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

        // Send to the contract address
        tx.to = contract.addressPromise;

        return resolveAddresses(contract.provider, params, method.inputs).then((params) => {
            tx.data = method.encode(params);
            if (method.type === 'call') {

                // Call (constant functions) always cost 0 ether
                if (estimateOnly) {
                    return Promise.resolve(ConstantZero);
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

                return contract.provider.call(tx).then((value) => {

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

                if (!contract.signer) {
                    errors.throwError('sending a transaction require a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' })
                }

                // Make sure they aren't overriding something they shouldn't
                if (tx.from != null) {
                    errors.throwError('cannot override from in a transaction', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' })
                }

                return contract.signer.sendTransaction(tx);
            }

            throw new Error('invalid type - ' + method.type);
            return null;
        });
    }
}

export type Listener = (...args: Array<any>) => void;

export type EventFilter = {
    address?: string;
    topics?: Array<string>;
    // @TODO: Support OR-style topcis; backwards compatible to make this change
    //topics?: Array<string | Array<string>>
};

export type ContractEstimate = (...params: Array<any>) => Promise<BigNumber>;
export type ContractFunction = (...params: Array<any>) => Promise<any>;
export type ContractFilter = (...params: Array<any>) => EventFilter;

export interface Event extends Log {
    args: Array<any>;
    decode: (data: string, topics?: Array<string>) => any;
    event: string;
    eventSignature: string;

    removeListener: () => void;

    getBlock: () => Promise<Block>;
    getTransaction: () => Promise<TransactionResponse>;
    getTransactionReceipt: () => Promise<TransactionReceipt>;
}

function getEventTag(filter: EventFilter): string {
    return (filter.address || '') + (filter.topics ? filter.topics.join(':'): '');
}

interface Bucket<T> {
    [name: string]: T;
}

type _EventFilter = {
    decode: (log: Log) => Array<any>;
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


export type ErrorCallback = (error: Error) => void;
export type Contractish = Array<string | ParamType> | Interface | string;
export class Contract {
    readonly address: string;
    readonly interface: Interface;

    readonly signer: Signer;
    readonly provider: Provider;

    readonly estimate: Bucket<ContractEstimate>;
    readonly functions: Bucket<ContractFunction>;

    readonly filters: Bucket<ContractFilter>;

    readonly addressPromise: Promise<string>;

    // This is only set if the contract was created with a call to deploy
    readonly deployTransaction: TransactionResponse;

    private _onerror: ErrorCallback;

    // https://github.com/Microsoft/TypeScript/issues/5453
    // Once this issue is resolved (there are open PR) we can do this nicer
    // by making addressOrName default to null for 2 operand calls. :)

    constructor(addressOrName: string, contractInterface: Contractish, signerOrProvider: Signer | Provider) {
        errors.checkNew(this, Contract);

        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);
        if (contractInterface instanceof Interface) {
            defineReadOnly(this, 'interface', contractInterface);
        } else {
            defineReadOnly(this, 'interface', new Interface(contractInterface));
        }

        if (signerOrProvider instanceof Signer) {
            defineReadOnly(this, 'provider', signerOrProvider.provider);
            defineReadOnly(this, 'signer', signerOrProvider);
        } else if (signerOrProvider instanceof Provider) {
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

        // Not connected to an on-chain instance, so do not connect functions and events
        if (!addressOrName) {
            defineReadOnly(this, 'address', null);
            defineReadOnly(this, 'addressPromise', Promise.resolve(null));
            return;
        }

        this._events = [];

        defineReadOnly(this, 'address', addressOrName);
        defineReadOnly(this, 'addressPromise', this.provider.resolveName(addressOrName).then((address) => {
            if (address == null) { throw new Error('name not found'); }
            return address;
        }).catch((error: Error) => {
            console.log('ERROR: Cannot find Contract - ' + addressOrName);
            throw error;
        }));

        Object.keys(this.interface.functions).forEach((name) => {
            var run = runMethod(this, name, false);

            if ((<any>this)[name] == null) {
                defineReadOnly(this, name, run);
            } else {
                console.log('WARNING: Multiple definitions for ' + name);
            }

            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, run);
                defineReadOnly(this.estimate, name, runMethod(this, name, true));
            }
        });
    }

    get onerror() { return this._onerror; }

    set onerror(callback: ErrorCallback) {
        this._onerror = callback;
    }

    // @TODO: Allow timeout?
    deployed(): Promise<Contract> {
        // If we were just deployed, we know the transaction we should occur in
        if (this.deployTransaction) {
            return this.deployTransaction.wait().then(() => {
                return this;
            });
        }

        // Otherwise, poll for our code to be deployed
        return poll(() => {
            return this.provider.getCode(this.address).then((code) => {
                if (code === '0x') { return undefined; }
                return this;
            });
        }, { onceBlock: this.provider });
    }

    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>

    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>

    fallback(overrides?: TransactionRequest): Promise<TransactionResponse> {
        if (!this.signer) {
            errors.throwError('sending a transaction require a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction(fallback)' })
        }

        var tx: TransactionRequest = shallowCopy(overrides || {});

        ['from', 'to'].forEach(function(key) {
            if ((<any>tx)[key] == null) { return; }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        tx.to = this.addressPromise;
        return this.signer.sendTransaction(tx);
    }

    // Reconnect to a different signer or provider
    connect(signerOrProvider: Signer | Provider): Contract {
        return new Contract(this.address, this.interface, signerOrProvider);
    }

    // Re-attach to a different on=chain instance of this contract
    attach(addressOrName: string): Contract {
        return new Contract(addressOrName, this.interface, this.signer || this.provider);
    }

    // Deploy the contract with the bytecode, resolving to the deployed address.
    // Use contract.deployTransaction.wait() to wait until the contract has
    // been mined.
    deploy(bytecode: string, ...args: Array<any>): Promise<Contract> {
        if (this.signer == null) {
            throw new Error('missing signer'); // @TODO: errors.throwError
        }

        // A lot of common tools do not prefix bytecode with a 0x
        if (typeof(bytecode) === 'string' && bytecode.match(/^[0-9a-f]*$/i) && (bytecode.length % 2) == 0) {
            bytecode = '0x' + bytecode;
        }

        if (!isHexString(bytecode)) {
            errors.throwError('bytecode must be a valid hex string', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }

        if ((bytecode.length % 2) !== 0) {
            errors.throwError('bytecode must be valid data (even length)', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }

        let tx: TransactionRequest = { };
        if (args.length === this.interface.deployFunction.inputs.length + 1) {
            tx = shallowCopy(args.pop());
            for (var key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error('unknown transaction override ' + key);
                }
            }
        }

        ['data', 'from', 'to'].forEach(function(key) {
            if ((<any>tx)[key] == null) { return; }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        tx.data = this.interface.deployFunction.encode(bytecode, args);

        errors.checkArgumentCount(args.length, this.interface.deployFunction.inputs.length, 'in Contract constructor');

        // @TODO: overrides of args.length = this.interface.deployFunction.inputs.length + 1
        return this.signer.sendTransaction(tx).then((tx) => {
            let contract = new Contract(getContractAddress(tx), this.interface, this.signer || this.provider);
            defineReadOnly(contract, 'deployTransaction', tx);
            return contract;
        });
    }

    private _events: Array<_Event>;

    _getEventFilter(eventName: EventFilter | string): _EventFilter {
        if (typeof(eventName) === 'string') {

            // Listen for any event
            if (eventName === '*') {
                return {
                    decode: (log: Log) => {
                        return [ this.interface.parseLog(log) ];
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
                decode: (log: Log) => {
                    return event.decode(log.data, log.topics)
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
            for (var name in this.interface.events) {
                if (name.indexOf('(') === -1) { continue; }
                let e = this.interface.events[name];
                if (e.topic === eventName.topics[0].toLowerCase()) {
                    event = e;
                    break;
                }
            }
        }

        return {
            decode: (log: Log) => {
                if (event) { return event.decode(log.data, log.topics) }
                return [ log ]
            },
            event: event,
            eventTag: getEventTag(filter),
            filter: filter
        }
    }

    _addEventListener(eventFilter: _EventFilter, listener: Listener, once: boolean): void {
        if (!this.provider) {
            errors.throwError('events require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'once' })
        }

        let wrappedListener = (log: Log) => {
            let decoded = Array.prototype.slice.call(eventFilter.decode(log));

            let event = jsonCopy(log);
            event.args = decoded;
            event.decode = eventFilter.event.decode;
            event.event = eventFilter.event.name;
            event.eventSignature = eventFilter.event.signature;

            event.removeListener = () => { this.removeListener(eventFilter.filter, listener); };

            event.getBlock = () => { return this.provider.getBlock(log.blockHash); }
            event.getTransaction = () => { return this.provider.getTransactionReceipt(log.transactionHash); }
            event.getTransactionReceipt = () => { return this.provider.getTransactionReceipt(log.transactionHash); }

            decoded.push(event);
            this.emit(eventFilter.filter, ...decoded);
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

    addEventLisener(eventName: EventFilter | string, listener: Listener): Contract {
        return this.on(eventName, listener);
    }

    emit(eventName: EventFilter | string, ...args: Array<any>): boolean {
        if (!this.provider) { return false; }

        let result = false;

        let eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter((event) => {
            if (event.eventFilter.eventTag !== eventFilter.eventTag) { return true; }
            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);
            result = true;
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
            return event.eventFilter.eventTag !== eventFilter.eventTag
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
