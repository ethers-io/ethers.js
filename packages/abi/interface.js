"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
var address_1 = require("@ethersproject/address");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var hash_1 = require("@ethersproject/hash");
var keccak256_1 = require("@ethersproject/keccak256");
var errors = __importStar(require("@ethersproject/errors"));
var properties_1 = require("@ethersproject/properties");
var abi_coder_1 = require("./abi-coder");
var fragments_1 = require("./fragments");
var LogDescription = /** @class */ (function (_super) {
    __extends(LogDescription, _super);
    function LogDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LogDescription;
}(properties_1.Description));
exports.LogDescription = LogDescription;
var TransactionDescription = /** @class */ (function (_super) {
    __extends(TransactionDescription, _super);
    function TransactionDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TransactionDescription;
}(properties_1.Description));
exports.TransactionDescription = TransactionDescription;
var Indexed = /** @class */ (function (_super) {
    __extends(Indexed, _super);
    function Indexed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Indexed;
}(properties_1.Description));
exports.Indexed = Indexed;
var Result = /** @class */ (function () {
    function Result() {
    }
    return Result;
}());
exports.Result = Result;
var Interface = /** @class */ (function () {
    function Interface(fragments) {
        var _newTarget = this.constructor;
        var _this = this;
        errors.checkNew(_newTarget, Interface);
        var abi = [];
        if (typeof (fragments) === "string") {
            abi = JSON.parse(fragments);
        }
        else {
            abi = fragments;
        }
        properties_1.defineReadOnly(this, "fragments", abi.map(function (fragment) {
            if (properties_1.isNamedInstance(fragments_1.Fragment, fragment)) {
                return fragment;
            }
            return fragments_1.Fragment.from(fragment);
        }).filter(function (fragment) { return (fragment != null); }));
        properties_1.defineReadOnly(this, "_abiCoder", _newTarget.getAbiCoder());
        properties_1.defineReadOnly(this, "functions", {});
        properties_1.defineReadOnly(this, "errors", {});
        properties_1.defineReadOnly(this, "events", {});
        properties_1.defineReadOnly(this, "structs", {});
        // Add all fragments by their signature
        this.fragments.forEach(function (fragment) {
            var bucket = null;
            switch (fragment.type) {
                case "constructor":
                    if (_this.deploy) {
                        errors.warn("duplicate definition - constructor");
                        return;
                    }
                    properties_1.defineReadOnly(_this, "deploy", fragment);
                    return;
                case "function":
                    bucket = _this.functions;
                    break;
                case "event":
                    bucket = _this.events;
                    break;
                default:
                    return;
            }
            var signature = fragment.format();
            if (bucket[signature]) {
                errors.warn("duplicate definition - " + signature);
                return;
            }
            bucket[signature] = fragment;
        });
        // Add any fragments with a unique name by its name (sans signature parameters)
        [this.events, this.functions].forEach(function (bucket) {
            var count = getNameCount(bucket);
            Object.keys(bucket).forEach(function (signature) {
                var fragment = bucket[signature];
                if (count[fragment.name] !== 1) {
                    errors.warn("duplicate definition - " + fragment.name);
                    return;
                }
                bucket[fragment.name] = fragment;
            });
        });
        // If we do not have a constructor use the default "constructor() payable"
        if (!this.deploy) {
            properties_1.defineReadOnly(this, "deploy", fragments_1.ConstructorFragment.from({ type: "constructor" }));
        }
    }
    Interface.getAbiCoder = function () {
        return abi_coder_1.defaultAbiCoder;
    };
    Interface.getAddress = function (address) {
        return address_1.getAddress(address);
    };
    Interface.prototype._sighashify = function (functionFragment) {
        return bytes_1.hexDataSlice(hash_1.id(functionFragment.format()), 0, 4);
    };
    Interface.prototype._topicify = function (eventFragment) {
        return hash_1.id(eventFragment.format());
    };
    Interface.prototype.getFunction = function (nameOrSignatureOrSighash) {
        if (bytes_1.isHexString(nameOrSignatureOrSighash)) {
            return getFragment(nameOrSignatureOrSighash, this.getSighash.bind(this), this.functions);
        }
        // It is a bare name, look up the function (will return null if ambiguous)
        if (nameOrSignatureOrSighash.indexOf("(") === -1) {
            return (this.functions[nameOrSignatureOrSighash.trim()] || null);
        }
        // Normlize the signature and lookup the function
        return this.functions[fragments_1.FunctionFragment.fromString(nameOrSignatureOrSighash).format()];
    };
    Interface.prototype.getEvent = function (nameOrSignatureOrTopic) {
        if (bytes_1.isHexString(nameOrSignatureOrTopic)) {
            return getFragment(nameOrSignatureOrTopic, this.getEventTopic.bind(this), this.events);
        }
        // It is a bare name, look up the function (will return null if ambiguous)
        if (nameOrSignatureOrTopic.indexOf("(") === -1) {
            return this.events[nameOrSignatureOrTopic];
        }
        return this.events[fragments_1.EventFragment.fromString(nameOrSignatureOrTopic).format()];
    };
    Interface.prototype.getSighash = function (functionFragment) {
        if (typeof (functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }
        return this._sighashify(functionFragment);
    };
    Interface.prototype.getEventTopic = function (eventFragment) {
        if (typeof (eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }
        return this._topicify(eventFragment);
    };
    Interface.prototype._encodeParams = function (params, values) {
        return this._abiCoder.encode(params, values);
    };
    Interface.prototype.encodeDeploy = function (values) {
        return this._encodeParams(this.deploy.inputs, values || []);
    };
    Interface.prototype.encodeFunctionData = function (functionFragment, values) {
        if (typeof (functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }
        return bytes_1.hexlify(bytes_1.concat([
            this.getSighash(functionFragment),
            this._encodeParams(functionFragment.inputs, values || [])
        ]));
    };
    Interface.prototype.decodeFunctionResult = function (functionFragment, data) {
        if (typeof (functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }
        var bytes = bytes_1.arrayify(data);
        var reason = null;
        var errorSignature = null;
        switch (bytes.length % this._abiCoder._getWordSize()) {
            case 0:
                try {
                    return this._abiCoder.decode(functionFragment.outputs, bytes);
                }
                catch (error) { }
                break;
            case 4:
                if (bytes_1.hexlify(bytes.slice(0, 4)) === "0x08c379a0") {
                    errorSignature = "Error(string)";
                    reason = this._abiCoder.decode(["string"], bytes.slice(4));
                }
                break;
        }
        return errors.throwError("call revert exception", errors.CALL_EXCEPTION, {
            method: functionFragment.format(),
            errorSignature: errorSignature,
            errorArgs: [reason],
            reason: reason
        });
    };
    Interface.prototype.encodeFilterTopics = function (eventFragment, values) {
        var _this = this;
        if (typeof (eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }
        if (values.length > eventFragment.inputs.length) {
            errors.throwError("too many arguments for " + eventFragment.format(), errors.UNEXPECTED_ARGUMENT, {
                argument: "values",
                value: values
            });
        }
        var topics = [];
        if (!eventFragment.anonymous) {
            topics.push(this.getEventTopic(eventFragment));
        }
        values.forEach(function (value, index) {
            var param = eventFragment.inputs[index];
            if (!param.indexed) {
                if (value != null) {
                    errors.throwArgumentError("cannot filter non-indexed parameters; must be null", ("contract." + param.name), value);
                }
                return;
            }
            if (value == null) {
                topics.push(null);
            }
            else if (param.type === "string") {
                topics.push(hash_1.id(value));
            }
            else if (param.type === "bytes") {
                topics.push(keccak256_1.keccak256(bytes_1.hexlify(value)));
            }
            else if (param.type.indexOf("[") !== -1 || param.type.substring(0, 5) === "tuple") {
                errors.throwArgumentError("filtering with tuples or arrays not supported", ("contract." + param.name), value);
            }
            else {
                // Check addresses are valid
                if (param.type === "address") {
                    _this._abiCoder.encode(["address"], [value]);
                }
                topics.push(bytes_1.hexZeroPad(bytes_1.hexlify(value), 32));
            }
        });
        // Trim off trailing nulls
        while (topics.length && topics[topics.length - 1] === null) {
            topics.pop();
        }
        return topics;
    };
    Interface.prototype.decodeEventLog = function (eventFragment, data, topics) {
        if (typeof (eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }
        if (topics != null && !eventFragment.anonymous) {
            topics = topics.slice(1);
        }
        var indexed = [];
        var nonIndexed = [];
        var dynamic = [];
        eventFragment.inputs.forEach(function (param, index) {
            if (param.indexed) {
                if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
                    indexed.push(fragments_1.ParamType.fromObject({ type: "bytes32", name: param.name }));
                    dynamic.push(true);
                }
                else {
                    indexed.push(param);
                    dynamic.push(false);
                }
            }
            else {
                nonIndexed.push(param);
                dynamic.push(false);
            }
        });
        var resultIndexed = (topics != null) ? this._abiCoder.decode(indexed, bytes_1.concat(topics)) : null;
        var resultNonIndexed = this._abiCoder.decode(nonIndexed, data);
        var result = [];
        var nonIndexedIndex = 0, indexedIndex = 0;
        eventFragment.inputs.forEach(function (param, index) {
            if (param.indexed) {
                if (resultIndexed == null) {
                    result[index] = new Indexed({ hash: null });
                }
                else if (dynamic[index]) {
                    result[index] = new Indexed({ hash: resultIndexed[indexedIndex++] });
                }
                else {
                    result[index] = resultIndexed[indexedIndex++];
                }
            }
            else {
                result[index] = resultNonIndexed[nonIndexedIndex++];
            }
            //if (param.name && result[param.name] == null) { result[param.name] = result[index]; }
        });
        return result;
    };
    Interface.prototype.parseTransaction = function (tx) {
        var fragment = this.getFunction(tx.data.substring(0, 10).toLowerCase());
        if (!fragment) {
            return null;
        }
        return new TransactionDescription({
            args: this._abiCoder.decode(fragment.inputs, "0x" + tx.data.substring(10)),
            functionFragment: fragment,
            name: fragment.name,
            signature: fragment.format(),
            sighash: this.getSighash(fragment),
            value: bignumber_1.BigNumber.from(tx.value || "0"),
        });
    };
    Interface.prototype.parseLog = function (log) {
        var fragment = this.getEvent(log.topics[0]);
        if (!fragment || fragment.anonymous) {
            return null;
        }
        // @TODO: If anonymous, and the only method, and the input count matches, should we parse?
        return new LogDescription({
            eventFragment: fragment,
            name: fragment.name,
            signature: fragment.format(),
            topic: this.getEventTopic(fragment),
            values: this.decodeEventLog(fragment, log.data, log.topics)
        });
    };
    return Interface;
}());
exports.Interface = Interface;
function getFragment(hash, calcFunc, items) {
    for (var signature in items) {
        if (signature.indexOf("(") === -1) {
            continue;
        }
        var fragment = items[signature];
        if (calcFunc(fragment) === hash) {
            return fragment;
        }
    }
    return null;
}
function getNameCount(fragments) {
    var unique = {};
    // Count each name
    for (var signature in fragments) {
        var name_1 = fragments[signature].name;
        if (!unique[name_1]) {
            unique[name_1] = 0;
        }
        unique[name_1]++;
    }
    return unique;
}
