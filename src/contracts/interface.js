'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
var abi_coder_1 = require("../utils/abi-coder");
var bignumber_1 = require("../utils/bignumber");
var convert_1 = require("../utils/convert");
var keccak256_1 = require("../utils/keccak256");
var utf8_1 = require("../utils/utf8");
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../utils/errors"));
function parseParams(params) {
    var names = [];
    var types = [];
    params.forEach(function (param) {
        if (param.components != null) {
            if (param.type.substring(0, 5) !== 'tuple') {
                throw new Error('internal error; report on GitHub');
            }
            var suffix = '';
            var arrayBracket = param.type.indexOf('[');
            if (arrayBracket >= 0) {
                suffix = param.type.substring(arrayBracket);
            }
            var result = parseParams(param.components);
            names.push({ name: (param.name || null), names: result.names });
            types.push('tuple(' + result.types.join(',') + ')' + suffix);
        }
        else {
            names.push(param.name || null);
            types.push(param.type);
        }
    });
    return {
        names: names,
        types: types
    };
}
var Indexed = /** @class */ (function () {
    function Indexed(value) {
        properties_1.defineReadOnly(this, 'hash', value);
    }
    return Indexed;
}());
exports.Indexed = Indexed;
var Description = /** @class */ (function () {
    function Description(info) {
        for (var key in info) {
            var value = info[key];
            if (value != null && typeof (value) === 'object') {
                properties_1.defineFrozen(this, key, info[key]);
            }
            else {
                properties_1.defineReadOnly(this, key, info[key]);
            }
        }
    }
    return Description;
}());
exports.Description = Description;
var DeployDescription = /** @class */ (function (_super) {
    __extends(DeployDescription, _super);
    function DeployDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DeployDescription.prototype.encode = function (bytecode, params) {
        if (!convert_1.isHexString(bytecode)) {
            errors.throwError('invalid contract bytecode', errors.INVALID_ARGUMENT, {
                arg: 'bytecode',
                type: typeof (bytecode),
                value: bytecode
            });
        }
        if (params.length < this.inputs.length) {
            errors.throwError('missing constructor argument', errors.MISSING_ARGUMENT, {
                arg: (this.inputs[params.length].name || 'unknown'),
                count: params.length,
                expectedCount: this.inputs.length
            });
        }
        else if (params.length > this.inputs.length) {
            errors.throwError('too many constructor arguments', errors.UNEXPECTED_ARGUMENT, {
                count: params.length,
                expectedCount: this.inputs.length
            });
        }
        try {
            return (bytecode + abi_coder_1.defaultAbiCoder.encode(this.inputs, params).substring(2));
        }
        catch (error) {
            errors.throwError('invalid constructor argument', errors.INVALID_ARGUMENT, {
                arg: error.arg,
                reason: error.reason,
                value: error.value
            });
        }
        return null;
    };
    return DeployDescription;
}(Description));
exports.DeployDescription = DeployDescription;
var FunctionDescription = /** @class */ (function (_super) {
    __extends(FunctionDescription, _super);
    function FunctionDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FunctionDescription.prototype.encode = function (params) {
        if (params.length < this.inputs.length) {
            errors.throwError('missing input argument', errors.MISSING_ARGUMENT, {
                arg: (this.inputs[params.length].name || 'unknown'),
                count: params.length,
                expectedCount: this.inputs.length,
                name: this.name
            });
        }
        else if (params.length > this.inputs.length) {
            errors.throwError('too many input arguments', errors.UNEXPECTED_ARGUMENT, {
                count: params.length,
                expectedCount: this.inputs.length
            });
        }
        try {
            return this.sighash + abi_coder_1.defaultAbiCoder.encode(this.inputs, params).substring(2);
        }
        catch (error) {
            errors.throwError('invalid input argument', errors.INVALID_ARGUMENT, {
                arg: error.arg,
                reason: error.reason,
                value: error.value
            });
        }
        return null;
    };
    FunctionDescription.prototype.decode = function (data) {
        try {
            return abi_coder_1.defaultAbiCoder.decode(this.outputs, convert_1.arrayify(data));
        }
        catch (error) {
            errors.throwError('invalid data for function output', errors.INVALID_ARGUMENT, {
                arg: 'data',
                errorArg: error.arg,
                errorValue: error.value,
                value: data,
                reason: error.reason
            });
        }
    };
    return FunctionDescription;
}(Description));
exports.FunctionDescription = FunctionDescription;
// @TODO: Make this a class
function Result() { }
var EventDescription = /** @class */ (function (_super) {
    __extends(EventDescription, _super);
    function EventDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EventDescription.prototype.decode = function (data, topics) {
        // Strip the signature off of non-anonymous topics
        if (topics != null && !this.anonymous) {
            topics = topics.slice(1);
        }
        var inputIndexed = [], inputNonIndexed = [];
        var inputDynamic = [];
        this.inputs.forEach(function (param, index) {
            if (param.indexed) {
                if (param.type === 'string' || param.type === 'bytes' || param.type.indexOf('[') >= 0 || param.type.substring(0, 5) === 'tuple') {
                    inputIndexed.push({ type: 'bytes32', name: (param.name || '') });
                    inputDynamic.push(true);
                }
                else {
                    inputIndexed.push(param);
                    inputDynamic.push(false);
                }
            }
            else {
                inputNonIndexed.push(param);
                inputDynamic.push(false);
            }
        });
        if (topics != null) {
            var resultIndexed = abi_coder_1.defaultAbiCoder.decode(inputIndexed, convert_1.concat(topics));
        }
        var resultNonIndexed = abi_coder_1.defaultAbiCoder.decode(inputNonIndexed, convert_1.arrayify(data));
        var result = new Result();
        var nonIndexedIndex = 0, indexedIndex = 0;
        this.inputs.forEach(function (input, index) {
            if (input.indexed) {
                if (topics == null) {
                    result[index] = new Indexed(null);
                }
                else if (inputDynamic[index]) {
                    result[index] = new Indexed(resultIndexed[indexedIndex++]);
                }
                else {
                    result[index] = resultIndexed[indexedIndex++];
                }
            }
            else {
                result[index] = resultNonIndexed[nonIndexedIndex++];
            }
            if (input.name) {
                result[input.name] = result[index];
            }
        });
        result.length = this.inputs.length;
        return result;
    };
    return EventDescription;
}(Description));
exports.EventDescription = EventDescription;
// @TODO:
//export class Result {
//    [prop: string]: any;
//}
function addMethod(method) {
    switch (method.type) {
        case 'constructor': {
            var description = new DeployDescription({
                inputs: method.inputs,
                payable: (method.payable == null || !!method.payable),
                type: 'deploy'
            });
            if (!this.deployFunction) {
                this.deployFunction = description;
            }
            break;
        }
        case 'function': {
            // @TODO: See event
            var signature = '(' + parseParams(method.inputs).types.join(',') + ')';
            signature = signature.replace(/tuple/g, '');
            signature = method.name + signature;
            var sighash = keccak256_1.keccak256(utf8_1.toUtf8Bytes(signature)).substring(0, 10);
            var description = new FunctionDescription({
                inputs: method.inputs,
                outputs: method.outputs,
                payable: (method.payable == null || !!method.payable),
                type: ((method.constant) ? 'call' : 'transaction'),
                signature: signature,
                sighash: sighash,
            });
            // Expose the first (and hopefully unique named function
            if (method.name && this.functions[method.name] == null) {
                properties_1.defineReadOnly(this.functions, method.name, description);
            }
            // Expose all methods by their signature, for overloaded functions
            if (this.functions[description.signature] == null) {
                properties_1.defineReadOnly(this.functions, description.signature, description);
            }
            break;
        }
        case 'event': {
            // @TODO: method.params instead? As well? Different fomrat?
            //let inputParams = parseParams(method.inputs);
            // @TODO: Don't use parseParams (create new function in ABI, formatSignature)
            var signature = '(' + parseParams(method.inputs).types.join(',') + ')';
            signature = signature.replace(/tuple/g, '');
            signature = method.name + signature;
            var description = new EventDescription({
                name: method.name,
                signature: signature,
                inputs: method.inputs,
                topics: [keccak256_1.keccak256(utf8_1.toUtf8Bytes(signature))],
                anonymous: (!!method.anonymous),
                type: 'event'
            });
            // Expose the first (and hopefully unique) event name
            if (method.name && this.events[method.name] == null) {
                properties_1.defineReadOnly(this.events, method.name, description);
            }
            // Expose all events by their signature, for overloaded functions
            if (this.events[description.signature] == null) {
                properties_1.defineReadOnly(this.events, description.signature, description);
            }
            break;
        }
        case 'fallback':
            // Nothing to do for fallback
            break;
        default:
            console.log('WARNING: unsupported ABI type - ' + method.type);
            break;
    }
}
var Interface = /** @class */ (function () {
    function Interface(abi) {
        errors.checkNew(this, Interface);
        if (typeof (abi) === 'string') {
            try {
                abi = JSON.parse(abi);
            }
            catch (error) {
                errors.throwError('could not parse ABI JSON', errors.INVALID_ARGUMENT, {
                    arg: 'abi',
                    errorMessage: error.message,
                    value: abi
                });
            }
            if (!Array.isArray(abi)) {
                errors.throwError('invalid abi', errors.INVALID_ARGUMENT, { arg: 'abi', value: abi });
                return null;
            }
        }
        properties_1.defineReadOnly(this, 'functions', {});
        properties_1.defineReadOnly(this, 'events', {});
        // Convert any supported ABI format into a standard ABI format
        var _abi = [];
        abi.forEach(function (fragment) {
            if (typeof (fragment) === 'string') {
                fragment = abi_coder_1.parseSignature(fragment);
            }
            _abi.push(fragment);
        });
        properties_1.defineFrozen(this, 'abi', _abi);
        _abi.forEach(addMethod, this);
        // If there wasn't a constructor, create the default constructor
        if (!this.deployFunction) {
            addMethod.call(this, { type: 'constructor', inputs: [] });
        }
    }
    Interface.prototype.parseTransaction = function (tx) {
        var sighash = tx.data.substring(0, 10).toLowerCase();
        for (var name in this.functions) {
            if (name.indexOf('(') === -1) {
                continue;
            }
            var func = this.functions[name];
            if (func.sighash === sighash) {
                var result = abi_coder_1.defaultAbiCoder.decode(func.inputs, '0x' + tx.data.substring(10));
                return {
                    args: result,
                    signature: func.signature,
                    sighash: func.sighash,
                    decode: func.decode,
                    value: bignumber_1.bigNumberify(tx.value || 0),
                };
            }
        }
        return null;
    };
    return Interface;
}());
exports.Interface = Interface;
