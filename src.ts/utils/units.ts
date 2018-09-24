'use strict';

import { Zero, NegativeOne } from '../constants';

import * as errors from '../errors';

import { BigNumber, bigNumberify } from './bignumber';

// Imported Types
import { BigNumberish } from './bignumber';


const names = [
    'wei',
    'kwei',
    'Mwei',
    'Gwei',
    'szabo',
    'finney',
    'ether',
];

type UnitInfo = {
    decimals: number;
    tenPower: BigNumber;
};

var unitInfos: { [key: string]: UnitInfo } = {};

function _getUnitInfo(value: string): UnitInfo {
    return {
        decimals: value.length - 1,
        tenPower: bigNumberify(value)
    };
}

// Build cache of common units
(function() {

    // Cache the common units
    let value = '1';
    names.forEach(function(name) {
        let info = _getUnitInfo(value);
        unitInfos[name.toLowerCase()] = info;
        unitInfos[String(info.decimals)] = info;
        value += '000';
    });
})();

function getUnitInfo(name: string | number): UnitInfo {

    // Try the cache
    var info = unitInfos[String(name).toLowerCase()];

    if (!info && typeof(name) === 'number' && parseInt(String(name)) == name && name >= 0 && name <= 256) {
        var value = '1';
        for (var i = 0; i < name; i++) { value += '0'; }
        info = _getUnitInfo(value);
    }

    // Make sure we got something
    if (!info) {
        errors.throwError('invalid unitType', errors.INVALID_ARGUMENT, { arg: 'name', value: name });
    }

    return info;
}

export function formatUnits(value: BigNumberish, unitType?: string | number, options?: any): string {
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

    var negative = value.lt(Zero);
    if (negative) { value = value.mul(NegativeOne); }

    var fraction = value.mod(unitInfo.tenPower).toString();
    while (fraction.length < unitInfo.decimals) { fraction = '0' + fraction; }

    // Strip off trailing zeros (but keep one if would otherwise be bare decimal point)
    if (!options.pad) {
        fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    }

    var whole = value.div(unitInfo.tenPower).toString();

    if (options.commify) {
        whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    value = whole + '.' + fraction;

    if (negative) { value = '-' + value; }

    return value;
}

export function parseUnits(value: string, unitType?: string | number): BigNumber {
    if (unitType == null) { unitType = 18; }
    var unitInfo = getUnitInfo(unitType);

    if (typeof(value) !== 'string' || !value.match(/^-?[0-9.,]+$/)) {
        errors.throwError('invalid decimal value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }

    // Remove commas
    var value = value.replace(/,/g,'');

    if (unitInfo.decimals === 0) {
        return bigNumberify(value);
    }

    // Is it negative?
    var negative = (value.substring(0, 1) === '-');
    if (negative) { value = value.substring(1); }

    if (value === '.') {
        errors.throwError('missing value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }

    // Split it into a whole and fractional part
    let comps = value.split('.');
    if (comps.length > 2) {
        errors.throwError('too many decimal points', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }

    let whole = comps[0], fraction = comps[1];
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

    let wholeValue = bigNumberify(whole);
    let fractionValue = bigNumberify(fraction);

    let wei = (wholeValue.mul(unitInfo.tenPower)).add(fractionValue);

    if (negative) { wei = wei.mul(NegativeOne); }

    return wei;
}

export function formatEther(wei: BigNumberish, options?: any): string {
    return formatUnits(wei, 18, options);
}

export function parseEther(ether: string): BigNumber {
    return parseUnits(ether, 18);
}

