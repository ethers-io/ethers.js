'use strict';

import { Interface } from './interface.js';

import { ParamType } from '../utils/abi-coder';
import { BigNumber, ConstantZero } from '../utils/bignumber.js';
import { defineReadOnly, resolveProperties } from '../utils/properties';

import * as errors from '../utils/errors';

var allowedTransactionKeys = {
    data: true, from: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true
}

function copyObject(object) {
    var result = {};
    for (var key in object) {
        result[key] = object[key];
    }
    return result;
}


function runMethod(contract, functionName, estimateOnly) {
    let method = contract.interface.functions[functionName];
    return function(...params): Promise<any> {
        var transaction: any = {}

        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof(params[params.length - 1]) === 'object') {
            transaction = copyObject(params.pop());

            // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
            for (var key in transaction) {
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
            if (transaction[key] != null) {
                throw new Error('cannot override ' + key) ;
            }
        });

        // Send to the contract address
        transaction.to = contract.addressPromise;

        transaction.data = method.encode(params);
        if (method.type === 'call') {

            // Call (constant functions) always cost 0 ether
            if (estimateOnly) {
                return Promise.resolve(ConstantZero);
            }

            // Check overrides make sense
            ['gasLimit', 'gasPrice', 'value'].forEach(function(key) {
                if (transaction[key] != null) {
                    throw new Error('call cannot override ' + key) ;
                }
            });

            if (transaction.from == null && contract.signer) {
                if (contract.signer.address) {
                    transaction.from = contract.signer.address;
                } else if (contract.signer.getAddress) {
                    transaction.from = contract.signer.getAddress();
                }
            }

            return resolveProperties(transaction).then((transaction) => {
                return contract.provider.call(transaction).then((value) => {
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
            });

        } else if (method.type === 'transaction') {
            if (!contract.signer) { return Promise.reject(new Error('missing signer')); }

            // Make sure they aren't overriding something they shouldn't
            if (transaction.from != null) {
                throw new Error('transaction cannot override from') ;
            }

            // Only computing the transaction estimate
            if (estimateOnly) {
                if (contract.signer.estimateGas) {
                    return contract.signer.estimateGas(transaction);
                }

                if (contract.signer.address) {
                    transaction.from = contract.signer.address;
                } else if (contract.signer.getAddress) {
                    transaction.from = contract.signer.getAddress();
                }

                return resolveProperties(transaction).then((transaction) => {
                    return contract.provider.estimateGas(transaction);
                });
            }

            // If the signer supports sendTrasaction, use it
            if (contract.signer.sendTransaction) {
                return contract.signer.sendTransaction(transaction);
            }

            if (!contract.signer.sign) {
                return Promise.reject(new Error('custom signer does not support signing'));
            }

            if (transaction.chainId == null) {
                transaction.chainId = contract.provider.getNetwork().then((network) => {
                    return network.chainId;
                });
            }

            if (transaction.gasLimit == null) {
                if (contract.signer.defaultGasLimit) {
                    transaction.gasLimit = contract.signer.defaultGasLimit;
                } else {
                    transaction.gasLimit = 200000;
                }
            }

            if (!transaction.nonce) {
                if (contract.signer.getTransactionCount) {
                    transaction.nonce = contract.signer.getTransactionCount();
                } else if (contract.signer.address) {
                    transaction.nonce = contract.provider.getTransactionCount(contract.signer.address);
                } else if (contract.signer.getAddress) {
                    transaction.nonce = contract.provider.getTransactionCount(contract.signer.getAddress());
                } else {
                    throw new Error('cannot determine nonce');
                }
            }

            if (!transaction.gasPrice) {
                if (contract.signer.defaultGasPrice) {
                    transaction.gasPrice = contract.signer.defaultGasPrice;
                } else {
                    transaction.gasPrice = contract.provider.getGasPrice();
                }
            }

            return resolveProperties(transaction).then((transaction) => {
                let signedTransaction = contract.signer.sign(transaction);
                return contract.provider.sendTransaction(signedTransaction);
            });
        }

        throw new Error('unsupport type - ' + method.type);
    }
}
interface Provider {
}

interface Signer {
    call(data: string);
    sendTransaction(tx: any): Promise<any>; // @TODO:
}

export type ContractEstimate = (...params: Array<any>) => Promise<BigNumber>;
export type ContractFunction = (...params: Array<any>) => Promise<any>;
export type ContractEvent = (...params: Array<any>) => void;

interface Bucket<T> {
    [name: string]: T;
}

export class Contract {
    readonly address: string;
    readonly interface: Interface;
    readonly signer: Signer;
    readonly provider: Provider;

    readonly estimate: Bucket<ContractEstimate>;
    readonly functions: Bucket<ContractFunction>;
    readonly events: Bucket<ContractEvent>;

    readonly addressPromise: Promise<string>;

    constructor(addressOrName: string, contractInterface: Array<string | ParamType> | Interface | string, signerOrProvider: any) {
        //if (!(this instanceof Contract)) { throw new Error('missing new'); }

        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);
        if (contractInterface instanceof Interface) {
            defineReadOnly(this, 'interface', contractInterface);
        } else {
            defineReadOnly(this, 'interface', new Interface(contractInterface));
        }

        if (!signerOrProvider) { throw new Error('missing signer or provider'); }

        var signer = signerOrProvider;
        var provider = null;

        if (signerOrProvider.provider) {
            provider = signerOrProvider.provider;
        } else {
            provider = signerOrProvider;
            signer = null;
        }

        defineReadOnly(this, 'address', addressOrName);
        defineReadOnly(this, 'signer', signer);
        defineReadOnly(this, 'provider', provider);

        defineReadOnly(this, 'addressPromise', provider.resolveName(addressOrName));

        defineReadOnly(this, 'estimate', { });
        defineReadOnly(this, 'events', { });
        defineReadOnly(this, 'functions', { });

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

            let addressPromise = this.addressPromise;
            function handleEvent(log) {
                addressPromise.then((address) => {
                    // Not meant for us (the topics just has the same name)
                    if (address != log.address) { return; }

                    try {
                        let result = eventInfo.decode(log.data, log.topics);

                        // Some useful things to have with the log
                        log.args = result;
                        log.event = eventName;
                        log.parse = eventInfo.parse;
                        log.removeListener = function() {
                            provider.removeListener(eventInfo.topics, handleEvent);
                        }

                        log.getBlock = function() { return provider.getBlock(log.blockHash);; }
                        log.getTransaction = function() { return provider.getTransaction(log.transactionHash); }
                        log.getTransactionReceipt = function() { return provider.getTransactionReceipt(log.transactionHash); }
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

                    if (!value && eventCallback) {
                        provider.removeListener(eventInfo.topics, handleEvent);

                    } else if (value && !eventCallback) {
                        provider.on(eventInfo.topics, handleEvent);
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

    connect(signerOrProvider) {
        return new Contract(this.address, this.interface, signerOrProvider);
    }

    deploy(bytecode, ...args) {
        if (this.signer == null) {
            throw new Error('missing signer'); // @TODO: errors.throwError
        }

        // @TODO: overrides of args.length = this.interface.deployFunction.inputs.length + 1

        return this.signer.sendTransaction({
            data: this.interface.deployFunction.encode(bytecode, args)
        });
    }
}
