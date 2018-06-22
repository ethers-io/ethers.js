'use strict';

import { Interface } from './interface';

import { Provider, TransactionRequest, TransactionResponse } from '../providers/provider';
import { Signer } from '../wallet/wallet';

import { getContractAddress } from '../utils/address';
import { isHexString } from '../utils/bytes';
import { ParamType } from '../utils/abi-coder';
import { BigNumber, ConstantZero } from '../utils/bignumber';
import { defineReadOnly, shallowCopy } from '../utils/properties';

import * as errors from '../utils/errors';

var allowedTransactionKeys = {
    data: true, from: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true
}

// Recursively replaces ENS names with promises to resolve the name and
// stalls until all promises have returned
// @TODO: Expand this to resolve any promises too
function resolveAddresses(provider, value, paramType): Promise<any> {
    if (Array.isArray(paramType)) {
        var promises = [];
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
                                value: params
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

export type ContractEstimate = (...params: Array<any>) => Promise<BigNumber>;
export type ContractFunction = (...params: Array<any>) => Promise<any>;
export type ContractEvent = (...params: Array<any>) => void;

interface Bucket<T> {
    [name: string]: T;
}

export type Contractish = Array<string | ParamType> | Interface | string;
export class Contract {
    readonly address: string;
    readonly interface: Interface;

    readonly signer: Signer;
    readonly provider: Provider;

    readonly estimate: Bucket<ContractEstimate>;
    readonly functions: Bucket<ContractFunction>;
    readonly events: Bucket<ContractEvent>;

    readonly addressPromise: Promise<string>;

    // This is only set if the contract was created with a call to deploy
    readonly deployTransaction: TransactionResponse;

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
        defineReadOnly(this, 'events', { });
        defineReadOnly(this, 'functions', { });

        // Not connected to an on-chain instance, so do not connect functions and events
        if (!addressOrName) {
            defineReadOnly(this, 'address', null);
            defineReadOnly(this, 'addressPromise', Promise.resolve(null));
            return;
        }

        defineReadOnly(this, 'address', addressOrName);
        defineReadOnly(this, 'addressPromise', this.provider.resolveName(addressOrName));

        Object.keys(this.interface.functions).forEach((name) => {
            var run = runMethod(this, name, false);

            if (this[name] == null) {
                defineReadOnly(this, name, run);
            } else {
                console.log('WARNING: Multiple definitions for ' + name);
            }

            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, run);
                defineReadOnly(this.estimate, name, runMethod(this, name, true));
            }
        });

        Object.keys(this.interface.events).forEach((eventName) => {
            let eventInfo = this.interface.events[eventName];

            let eventCallback = null;

            let contract = this;
            function handleEvent(log) {
                contract.addressPromise.then((address) => {
                    // Not meant for us (the topics just has the same name)
                    if (address != log.address) { return; }

                    try {
                        let result = eventInfo.decode(log.data, log.topics);

                        // Some useful things to have with the log
                        log.args = result;
                        log.event = eventName;
                        log.parse = eventInfo.parse;
                        log.removeListener = function() {
                            contract.provider.removeListener([ eventInfo.topic ], handleEvent);
                        }

                        log.getBlock = function() { return contract.provider.getBlock(log.blockHash);; }
                        log.getTransaction = function() { return contract.provider.getTransaction(log.transactionHash); }
                        log.getTransactionReceipt = function() { return contract.provider.getTransactionReceipt(log.transactionHash); }
                        log.eventSignature = eventInfo.signature;

                        eventCallback.apply(log, Array.prototype.slice.call(result));
                    } catch (error) {
                        console.log(error);
                    }
                });
            }

            var property = {
                enumerable: true,
                get: function() {
                    return eventCallback;
                },
                set: function(value) {
                    if (!value) { value = null; }

                    if (!contract.provider) {
                        errors.throwError('events require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'events' })
                    }

                    if (!value && eventCallback) {
                        contract.provider.removeListener([ eventInfo.topic ], handleEvent);

                    } else if (value && !eventCallback) {
                        contract.provider.on([ eventInfo.topic ], handleEvent);
                    }

                    eventCallback = value;
                }
            };

            var propertyName = 'on' + eventName.toLowerCase();
            if (this[propertyName] == null) {
                Object.defineProperty(this, propertyName, property);
            }

            Object.defineProperty(this.events, eventName, property);

        }, this);
    }

    fallback(overrides?: TransactionRequest): Promise<TransactionResponse> {
        if (!this.signer) {
            errors.throwError('sending a transaction require a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction(fallback)' })
        }

        var tx: TransactionRequest = shallowCopy(overrides || {});

        ['from', 'to'].forEach(function(key) {
            if (tx.to == null) { return; }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        tx.to = this.addressPromise;
        return this.signer.sendTransaction(tx);
    }

    callFallback(overrides?: TransactionRequest): Promise<string> {
        if (!this.provider) {
            errors.throwError('call (constant functions) require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'call(fallback)' })
        }

        var tx: TransactionRequest = shallowCopy(overrides || {});

        ['to', 'value'].forEach(function(key) {
            if (tx.to == null) { return; }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        tx.to = this.addressPromise;
        return this.provider.call(tx);
    }

    // Reconnect to a different signer or provider
    connect(signerOrProvider: Signer | Provider): Contract {
        return new Contract(this.address, this.interface, signerOrProvider);
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

        // @TODO: overrides of args.length = this.interface.deployFunction.inputs.length + 1
        return this.signer.sendTransaction({
            data: this.interface.deployFunction.encode(bytecode, args)
        }).then((tx) => {
            let contract = new Contract(getContractAddress(tx), this.interface, this.signer || this.provider);
            defineReadOnly(contract, 'deployTransaction', tx);
            return contract;
        });
    }
}
