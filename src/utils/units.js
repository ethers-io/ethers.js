'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_1 = require("./bignumber");
var errors = __importStar(require("./errors"));
var names = [
    'wei',
    'kwei',
    'Mwei',
    'Gwei',
    'szabo',
    'finny',
    'ether',
];
var getUnitInfo = (function () {
    var unitInfos = {};
    function getUnitInfo(value) {
        return {
            decimals: value.length - 1,
            tenPower: bignumber_1.bigNumberify(value)
        };
    }
    // Cache the common units
    var value = '1';
    names.forEach(function (name) {
        var info = getUnitInfo(value);
        unitInfos[name.toLowerCase()] = info;
        unitInfos[String(info.decimals)] = info;
        value += '000';
    });
    return function (name) {
        // Try the cache
        var info = unitInfos[String(name).toLowerCase()];
        if (!info && typeof (name) === 'number' && Math.trunc(name) == name && name >= 0 && name <= 256) {
            var value = '1';
            for (var i = 0; i < name; i++) {
                value += '0';
            }
            info = getUnitInfo(value);
        }
        // Make sure we got something
        if (!info) {
            errors.throwError('invalid unitType', errors.INVALID_ARGUMENT, { arg: 'name', value: name });
        }
        return info;
    };
})();
function formatUnits(value, unitType, options) {
    /*
    if (typeof(unitType) === 'object' && !options) {
        options = unitType;
        unitType = undefined;
    }
    if (unitType == null) { unitType = 18; }
    */
    if (!options) {
        options = {};
    }
    var unitInfo = getUnitInfo(unitType);
    // Make sure wei is a big number (convert as necessary)
    value = bignumber_1.bigNumberify(value);
    var negative = value.lt(bignumber_1.ConstantZero);
    if (negative) {
        value = value.mul(bignumber_1.ConstantNegativeOne);
    }
    var fraction = value.mod(unitInfo.tenPower).toString(10);
    while (fraction.length < unitInfo.decimals) {
        fraction = '0' + fraction;
    }
    // Strip off trailing zeros (but keep one if would otherwise be bare decimal point)
    if (!options.pad) {
        fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    }
    var whole = value.div(unitInfo.tenPower).toString(10);
    if (options.commify) {
        whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    value = whole + '.' + fraction;
    if (negative) {
        value = '-' + value;
    }
    return value;
}
exports.formatUnits = formatUnits;
function parseUnits(value, unitType) {
    if (unitType == null) {
        unitType = 18;
    }
    var unitInfo = getUnitInfo(unitType);
    if (typeof (value) !== 'string' || !value.match(/^-?[0-9.,]+$/)) {
        errors.throwError('invalid decimal value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }
    // Remove commas
    var value = value.replace(/,/g, '');
    // Is it negative?
    var negative = (value.substring(0, 1) === '-');
    if (negative) {
        value = value.substring(1);
    }
    if (value === '.') {
        errors.throwError('missing value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }
    // Split it into a whole and fractional part
    var comps = value.split('.');
    if (comps.length > 2) {
        errors.throwError('too many decimal points', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }
    var whole = comps[0], fraction = comps[1];
    if (!whole) {
        whole = '0';
    }
    if (!fraction) {
        fraction = '0';
    }
    // Prevent underflow
    if (fraction.length > unitInfo.decimals) {
        errors.throwError('underflow occurred', errors.NUMERIC_FAULT, { operation: 'division', fault: "underflow" });
    }
    // Fully pad the string with zeros to get to wei
    while (fraction.length < unitInfo.decimals) {
        fraction += '0';
    }
    whole = bignumber_1.bigNumberify(whole);
    fraction = bignumber_1.bigNumberify(fraction);
    var wei = (whole.mul(unitInfo.tenPower)).add(fraction);
    if (negative) {
        wei = wei.mul(bignumber_1.ConstantNegativeOne);
    }
    return wei;
}
exports.parseUnits = parseUnits;
function formatEther(wei, options) {
    return formatUnits(wei, 18, options);
}
exports.formatEther = formatEther;
function parseEther(ether) {
    return parseUnits(ether, 18);
}
exports.parseEther = parseEther;
