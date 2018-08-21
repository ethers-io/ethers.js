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
var address_1 = require("../utils/address");
var abi_coder_1 = require("../utils/abi-coder");
var bignumber_1 = require("../utils/bignumber");
var bytes_1 = require("../utils/bytes");
var hash_1 = require("../utils/hash");
var keccak256_1 = require("../utils/keccak256");
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../utils/errors"));
///////////////////////////////
var _Indexed = /** @class */ (function () {
    function _Indexed(hash) {
        properties_1.setType(this, 'Indexed');
        properties_1.defineReadOnly(this, 'hash', hash);
    }
    return _Indexed;
}());
var Description = /** @class */ (function () {
    function Description(info) {
        properties_1.setType(this, 'Description');
        for (var key in info) {
            properties_1.defineReadOnly(this, key, properties_1.deepCopy(info[key], true));
        }
        Object.freeze(this);
    }
    return Description;
}());
var _DeployDescription = /** @class */ (function (_super) {
    __extends(_DeployDescription, _super);
    function _DeployDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    _DeployDescription.prototype.encode = function (bytecode, params) {
        if (!bytes_1.isHexString(bytecode)) {
            errors.throwError('invalid contract bytecode', errors.INVALID_ARGUMENT, {
                arg: 'bytecode',
                value: bytecode
            });
        }
        errors.checkArgumentCount(params.length, this.inputs.length, 'in Interface constructor');
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
    return _DeployDescription;
}(Description));
var _FunctionDescription = /** @class */ (function (_super) {
    __extends(_FunctionDescription, _super);
    function _FunctionDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    _FunctionDescription.prototype.encode = function (params) {
        errors.checkArgumentCount(params.length, this.inputs.length, 'in interface function ' + this.name);
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
    _FunctionDescription.prototype.decode = function (data) {
        try {
            return abi_coder_1.defaultAbiCoder.decode(this.outputs, bytes_1.arrayify(data));
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
    return _FunctionDescription;
}(Description));
var Result = /** @class */ (function (_super) {
    __extends(Result, _super);
    function Result() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Result;
}(Description));
var _EventDescription = /** @class */ (function (_super) {
    __extends(_EventDescription, _super);
    function _EventDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    _EventDescription.prototype.encodeTopics = function (params) {
        var _this = this;
        if (params.length > this.inputs.length) {
            errors.throwError('too many arguments for ' + this.name, errors.UNEXPECTED_ARGUMENT, { maxCount: params.length, expectedCount: this.inputs.length });
        }
        var topics = [];
        if (!this.anonymous) {
            topics.push(this.topic);
        }
        params.forEach(function (arg, index) {
            if (arg === null) {
                topics.push(null);
                return;
            }
            var param = _this.inputs[index];
            if (!param.indexed) {
                errors.throwError('cannot filter non-indexed parameters; must be null', errors.INVALID_ARGUMENT, { argument: (param.name || index), value: arg });
            }
            if (param.type === 'string') {
                topics.push(hash_1.id(arg));
            }
            else if (param.type === 'bytes') {
                topics.push(keccak256_1.keccak256(arg));
            }
            else if (param.type.indexOf('[') !== -1 || param.type.substring(0, 5) === 'tuple') {
                errors.throwError('filtering with tuples or arrays not implemented yet; bug us on GitHub', errors.NOT_IMPLEMENTED, { operation: 'filter(array|tuple)' });
            }
            else {
                if (param.type === 'address') {
                    address_1.getAddress(arg);
                }
                topics.push(bytes_1.hexZeroPad(bytes_1.hexlify(arg), 32).toLowerCase());
            }
        });
        // Trim off trailing nulls
        while (topics.length && topics[topics.length - 1] === null) {
            topics.pop();
        }
        return topics;
    };
    _EventDescription.prototype.decode = function (data, topics) {
        // Strip the signature off of non-anonymous topics
        if (topics != null && !this.anonymous) {
            topics = topics.slice(1);
        }
        var inputIndexed = [];
        var inputNonIndexed = [];
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
            var resultIndexed = abi_coder_1.defaultAbiCoder.decode(inputIndexed, bytes_1.concat(topics));
        }
        var resultNonIndexed = abi_coder_1.defaultAbiCoder.decode(inputNonIndexed, bytes_1.arrayify(data));
        var result = {};
        var nonIndexedIndex = 0, indexedIndex = 0;
        this.inputs.forEach(function (input, index) {
            if (input.indexed) {
                if (topics == null) {
                    result[index] = new _Indexed(null);
                }
                else if (inputDynamic[index]) {
                    result[index] = new _Indexed(resultIndexed[indexedIndex++]);
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
        return new Result(result);
    };
    return _EventDescription;
}(Description));
var _TransactionDescription = /** @class */ (function (_super) {
    __extends(_TransactionDescription, _super);
    function _TransactionDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return _TransactionDescription;
}(Description));
var _LogDescription = /** @class */ (function (_super) {
    __extends(_LogDescription, _super);
    function _LogDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return _LogDescription;
}(Description));
function addMethod(method) {
    switch (method.type) {
        case 'constructor': {
            var description = new _DeployDescription({
                inputs: method.inputs,
                payable: (method.payable == null || !!method.payable)
            });
            if (!this.deployFunction) {
                this.deployFunction = description;
            }
            break;
        }
        case 'function': {
            var signature = abi_coder_1.formatSignature(method).replace(/tuple/g, '');
            var sighash = hash_1.id(signature).substring(0, 10);
            var description = new _FunctionDescription({
                inputs: method.inputs,
                outputs: method.outputs,
                gas: method.gas,
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
            var signature = abi_coder_1.formatSignature(method).replace(/tuple/g, '');
            var description = new _EventDescription({
                name: method.name,
                signature: signature,
                inputs: method.inputs,
                topic: hash_1.id(signature),
                anonymous: (!!method.anonymous)
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
            // @TODO: We should probable do some validation; create abiCoder.formatSignature for checking
            _abi.push(fragment);
        });
        properties_1.defineReadOnly(this, 'abi', properties_1.deepCopy(_abi, true));
        _abi.forEach(addMethod, this);
        // If there wasn't a constructor, create the default constructor
        if (!this.deployFunction) {
            addMethod.call(this, { type: 'constructor', inputs: [] });
        }
        properties_1.setType(this, 'Interface');
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
                return new _TransactionDescription({
                    args: result,
                    decode: func.decode,
                    name: name,
                    signature: func.signature,
                    sighash: func.sighash,
                    value: bignumber_1.bigNumberify(tx.value || null),
                });
            }
        }
        return null;
    };
    Interface.prototype.parseLog = function (log) {
        for (var name in this.events) {
            if (name.indexOf('(') === -1) {
                continue;
            }
            var event = this.events[name];
            if (event.anonymous) {
                continue;
            }
            if (event.topic !== log.topics[0]) {
                continue;
            }
            // @TODO: If anonymous, and the only method, and the input count matches, should we parse and return it?
            return new _LogDescription({
                decode: event.decode,
                name: event.name,
                signature: event.signature,
                topic: event.topic,
                values: event.decode(log.data, log.topics)
            });
        }
        return null;
    };
    Interface.isInterface = function (value) {
        return properties_1.isType(value, 'Interface');
    };
    Interface.isIndexed = function (value) {
        return properties_1.isType(value, 'Indexed');
    };
    return Interface;
}());
exports.Interface = Interface;
