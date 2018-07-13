'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */
var bn_js_1 = __importDefault(require("bn.js"));
var bytes_1 = require("./bytes");
var properties_1 = require("./properties");
var errors = __importStar(require("./errors"));
var BN_1 = new bn_js_1.default.BN(-1);
function toHex(bn) {
    var value = bn.toString(16);
    if (value[0] === '-') {
        if ((value.length % 2) === 0) {
            return '-0x0' + value.substring(1);
        }
        return "-0x" + value.substring(1);
    }
    if ((value.length % 2) === 1) {
        return '0x0' + value;
    }
    return '0x' + value;
}
function toBN(value) {
    return bigNumberify(value)._bn;
}
function toBigNumber(bn) {
    return new _BigNumber(toHex(bn));
}
;
var _BigNumber = /** @class */ (function () {
    function _BigNumber(value) {
        errors.checkNew(this, _BigNumber);
        if (typeof (value) === 'string') {
            if (bytes_1.isHexString(value)) {
                if (value == '0x') {
                    value = '0x0';
                }
                properties_1.defineReadOnly(this, '_hex', value);
            }
            else if (value[0] === '-' && bytes_1.isHexString(value.substring(1))) {
                properties_1.defineReadOnly(this, '_hex', value);
            }
            else if (value.match(/^-?[0-9]*$/)) {
                if (value == '') {
                    value = '0';
                }
                properties_1.defineReadOnly(this, '_hex', toHex(new bn_js_1.default.BN(value)));
            }
            else {
                errors.throwError('invalid BigNumber string value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
            }
        }
        else if (typeof (value) === 'number') {
            if (parseInt(String(value)) !== value) {
                errors.throwError('underflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'underflow', value: value, outputValue: parseInt(String(value)) });
            }
            try {
                properties_1.defineReadOnly(this, '_hex', toHex(new bn_js_1.default.BN(value)));
            }
            catch (error) {
                errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
            }
        }
        else if (value instanceof _BigNumber) {
            properties_1.defineReadOnly(this, '_hex', value.toHexString());
        }
        else if (value.toHexString) {
            properties_1.defineReadOnly(this, '_hex', toHex(toBN(value.toHexString())));
        }
        else if (bytes_1.isArrayish(value)) {
            properties_1.defineReadOnly(this, '_hex', toHex(new bn_js_1.default.BN(bytes_1.hexlify(value).substring(2), 16)));
        }
        else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
    }
    Object.defineProperty(_BigNumber.prototype, "_bn", {
        get: function () {
            if (this._hex[0] === '-') {
                return (new bn_js_1.default.BN(this._hex.substring(3), 16)).mul(BN_1);
            }
            return new bn_js_1.default.BN(this._hex.substring(2), 16);
        },
        enumerable: true,
        configurable: true
    });
    _BigNumber.prototype.fromTwos = function (value) {
        return toBigNumber(this._bn.fromTwos(value));
    };
    _BigNumber.prototype.toTwos = function (value) {
        return toBigNumber(this._bn.toTwos(value));
    };
    _BigNumber.prototype.add = function (other) {
        return toBigNumber(this._bn.add(toBN(other)));
    };
    _BigNumber.prototype.sub = function (other) {
        return toBigNumber(this._bn.sub(toBN(other)));
    };
    _BigNumber.prototype.div = function (other) {
        var o = bigNumberify(other);
        if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
        }
        return toBigNumber(this._bn.div(toBN(other)));
    };
    _BigNumber.prototype.mul = function (other) {
        return toBigNumber(this._bn.mul(toBN(other)));
    };
    _BigNumber.prototype.mod = function (other) {
        return toBigNumber(this._bn.mod(toBN(other)));
    };
    _BigNumber.prototype.pow = function (other) {
        return toBigNumber(this._bn.pow(toBN(other)));
    };
    _BigNumber.prototype.maskn = function (value) {
        return toBigNumber(this._bn.maskn(value));
    };
    _BigNumber.prototype.eq = function (other) {
        return this._bn.eq(toBN(other));
    };
    _BigNumber.prototype.lt = function (other) {
        return this._bn.lt(toBN(other));
    };
    _BigNumber.prototype.lte = function (other) {
        return this._bn.lte(toBN(other));
    };
    _BigNumber.prototype.gt = function (other) {
        return this._bn.gt(toBN(other));
    };
    _BigNumber.prototype.gte = function (other) {
        return this._bn.gte(toBN(other));
    };
    _BigNumber.prototype.isZero = function () {
        return this._bn.isZero();
    };
    _BigNumber.prototype.toNumber = function () {
        try {
            return this._bn.toNumber();
        }
        catch (error) {
            errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
        }
        return null;
    };
    _BigNumber.prototype.toString = function () {
        return this._bn.toString(10);
    };
    _BigNumber.prototype.toHexString = function () {
        return this._hex;
    };
    return _BigNumber;
}());
function isBigNumber(value) {
    return (value instanceof _BigNumber);
}
exports.isBigNumber = isBigNumber;
function bigNumberify(value) {
    if (value instanceof _BigNumber) {
        return value;
    }
    return new _BigNumber(value);
}
exports.bigNumberify = bigNumberify;
exports.ConstantNegativeOne = bigNumberify(-1);
exports.ConstantZero = bigNumberify(0);
exports.ConstantOne = bigNumberify(1);
exports.ConstantTwo = bigNumberify(2);
exports.ConstantWeiPerEther = bigNumberify('1000000000000000000');
