'use strict';

import { bigNumberify, ConstantZero, ConstantNegativeOne } from './bignumber.js';

import * as errors from './errors';

const names = [
    'wei',
    'kwei',
    'Mwei',
    'Gwei',
    'szabo',
    'finny',
    'ether',
];

var getUnitInfo = (function() {
    var unitInfos = {};

    function getUnitInfo(value) {
        return {
            decimals: value.length - 1,
            tenPower: bigNumberify(value)
        };
    }

    // Cache the common units
    var value = '1';
    names.forEach(function(name) {
        var info = getUnitInfo(value);
        unitInfos[name.toLowerCase()] = info;
        unitInfos[String(info.decimals)] = info;
        value += '000';
    });

    return function(name) {
        // Try the cache
        var info = unitInfos[String(name).toLowerCase()];

        if (!info && typeof(name) === 'number' && Math.trunc(name) == name && name >= 0 && name <= 256) {
            var value = '1';
            for (var i = 0; i < name; i++) { value += '0'; }
            info = getUnitInfo(value);
        }

        // Make sure we got something
        if (!info) {
            errors.throwError(
                'invalid unitType',
                errors.INVALID_ARGUMENT,
                { arg: 'name', value: name }
           );
        }

        return info;
    }
})();

export function formatUnits(value: any, unitType: string | number, options?: any): string {
    /*
    if (typeof(unitType) === 'object' && !options) {
        options = unitType;
        unitType = undefined;
    }
    if (unitType == null) { unitType = 18; }
    */

    if (!options) { options = {}; }

    var unitInfo = getUnitInfo(unitType);

    // Make sure wei is a big number (convert as necessary)
    value = bigNumberify(value);

    var negative = value.lt(ConstantZero);
    if (negative) { value = value.mul(ConstantNegativeOne); }

    var fraction = value.mod(unitInfo.tenPower).toString(10);
    while (fraction.length < unitInfo.decimals) { fraction = '0' + fraction; }

    // Strip off trailing zeros (but keep one if would otherwise be bare decimal point)
    if (!options.pad) {
        fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    }

    var whole = value.div(unitInfo.tenPower).toString(10);

    if (options.commify) {
        whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    value = whole + '.' + fraction;

    if (negative) { value = '-' + value; }

    return value;
}

export function parseUnits(value, unitType) {
    if (unitType == null) { unitType = 18; }
    var unitInfo = getUnitInfo(unitType);

    if (typeof(value) !== 'string' || !value.match(/^-?[0-9.,]+$/)) {
        errors.throwError('invalid decimal value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }

    // Remove commas
    var value = value.replace(/,/g,'');

    // Is it negative?
    var negative = (value.substring(0, 1) === '-');
    if (negative) { value = value.substring(1); }

    if (value === '.') {
        errors.throwError('missing value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }

    // Split it into a whole and fractional part
    var comps = value.split('.');
    if (comps.length > 2) {
        errors.throwError('too many decimal points', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }

    var whole = comps[0], fraction = comps[1];
    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }

    // Prevent underflow
    if (fraction.length > unitInfo.decimals) {
        errors.throwError(
            'underflow occurred',
            errors.NUMERIC_FAULT,
            { operation: 'division', fault: "underflow" }
        );
    }

    // Fully pad the string with zeros to get to wei
    while (fraction.length < unitInfo.decimals) { fraction += '0'; }

    whole = bigNumberify(whole);
    fraction = bigNumberify(fraction);

    var wei = (whole.mul(unitInfo.tenPower)).add(fraction);

    if (negative) { wei = wei.mul(ConstantNegativeOne); }

    return wei;
}

export function formatEther(wei, options) {
    return formatUnits(wei, 18, options);
}

export function parseEther(ether) {
    return parseUnits(ether, 18);
}

