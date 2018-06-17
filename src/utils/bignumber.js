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
var convert_1 = require("./convert");
var properties_1 = require("./properties");
var errors = __importStar(require("../utils/errors"));
function _isBigNumber(value) {
    return isBigNumber(value);
}
var BigNumber = /** @class */ (function () {
    function BigNumber(value) {
        errors.checkNew(this, BigNumber);
        if (typeof (value) === 'string') {
            if (convert_1.isHexString(value)) {
                if (value == '0x') {
                    value = '0x0';
                }
                properties_1.defineReadOnly(this, '_bn', new bn_js_1.default.BN(value.substring(2), 16));
            }
            else if (value[0] === '-' && convert_1.isHexString(value.substring(1))) {
                properties_1.defineReadOnly(this, '_bn', (new bn_js_1.default.BN(value.substring(3), 16)).mul(exports.ConstantNegativeOne._bn));
            }
            else if (value.match(/^-?[0-9]*$/)) {
                if (value == '') {
                    value = '0';
                }
                properties_1.defineReadOnly(this, '_bn', new bn_js_1.default.BN(value));
            }
        }
        else if (typeof (value) === 'number') {
            if (Math.trunc(value) !== value) {
                errors.throwError('underflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'underflow', value: value, outputValue: Math.trunc(value) });
            }
            try {
                properties_1.defineReadOnly(this, '_bn', new bn_js_1.default.BN(value));
            }
            catch (error) {
                errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
            }
        }
        else if (bn_js_1.default.BN.isBN(value)) {
            properties_1.defineReadOnly(this, '_bn', value);
        }
        else if (_isBigNumber(value)) {
            properties_1.defineReadOnly(this, '_bn', value._bn);
        }
        else if (convert_1.isArrayish(value)) {
            properties_1.defineReadOnly(this, '_bn', new bn_js_1.default.BN(convert_1.hexlify(value).substring(2), 16));
        }
        else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
    }
    BigNumber.prototype.fromTwos = function (value) {
        return new BigNumber(this._bn.fromTwos(value));
    };
    BigNumber.prototype.toTwos = function (value) {
        return new BigNumber(this._bn.toTwos(value));
    };
    BigNumber.prototype.add = function (other) {
        return new BigNumber(this._bn.add(bigNumberify(other)._bn));
    };
    BigNumber.prototype.sub = function (other) {
        return new BigNumber(this._bn.sub(bigNumberify(other)._bn));
    };
    BigNumber.prototype.div = function (other) {
        var o = bigNumberify(other)._bn;
        if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
        }
        return new BigNumber(this._bn.div(o));
    };
    BigNumber.prototype.mul = function (other) {
        return new BigNumber(this._bn.mul(bigNumberify(other)._bn));
    };
    BigNumber.prototype.mod = function (other) {
        return new BigNumber(this._bn.mod(bigNumberify(other)._bn));
    };
    BigNumber.prototype.pow = function (other) {
        return new BigNumber(this._bn.pow(bigNumberify(other)._bn));
    };
    BigNumber.prototype.maskn = function (value) {
        return new BigNumber(this._bn.maskn(value));
    };
    BigNumber.prototype.eq = function (other) {
        return this._bn.eq(bigNumberify(other)._bn);
    };
    BigNumber.prototype.lt = function (other) {
        return this._bn.lt(bigNumberify(other)._bn);
    };
    BigNumber.prototype.lte = function (other) {
        return this._bn.lte(bigNumberify(other)._bn);
    };
    BigNumber.prototype.gt = function (other) {
        return this._bn.gt(bigNumberify(other)._bn);
    };
    BigNumber.prototype.gte = function (other) {
        return this._bn.gte(bigNumberify(other)._bn);
    };
    BigNumber.prototype.isZero = function () {
        return this._bn.isZero();
    };
    BigNumber.prototype.toNumber = function () {
        try {
            return this._bn.toNumber();
        }
        catch (error) {
            errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
        }
        return null;
    };
    BigNumber.prototype.toString = function () {
        return this._bn.toString(10);
    };
    BigNumber.prototype.toHexString = function () {
        var hex = this._bn.toString(16);
        if (hex.length % 2) {
            hex = '0' + hex;
        }
        return '0x' + hex;
    };
    return BigNumber;
}());
exports.BigNumber = BigNumber;
function isBigNumber(value) {
    return (value._bn && value._bn.mod);
}
exports.isBigNumber = isBigNumber;
function bigNumberify(value) {
    if (_isBigNumber(value)) {
        return value;
    }
    return new BigNumber(value);
}
exports.bigNumberify = bigNumberify;
exports.ConstantNegativeOne = bigNumberify(-1);
exports.ConstantZero = bigNumberify(0);
exports.ConstantOne = bigNumberify(1);
exports.ConstantTwo = bigNumberify(2);
exports.ConstantWeiPerEther = bigNumberify(new bn_js_1.default.BN('1000000000000000000'));
