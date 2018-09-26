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

const unitInfos: { [key: string]: UnitInfo } = {};

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
    let info = unitInfos[String(name).toLowerCase()];

    if (!info && typeof(name) === 'number' && parseInt(String(name)) == name && name >= 0 && name <= 256) {
        let value = '1';
        for (let i = 0; i < name; i++) { value += '0'; }
        info = _getUnitInfo(value);
    }

    // Make sure we got something
    if (!info) {
        errors.throwError('invalid unitType', errors.INVALID_ARGUMENT, { argument: 'name', value: name });
    }

    return info;
}

// Some environments have issues with RegEx that contain back-tracking, so we cannot
// use them.
export function commify(value: string | number): string {
    let comps = String(value).split('.');

    if (comps.length > 2 || !comps[0].match(/^-?[0-9]*$/) || (comps[1] && !comps[1].match(/^[0-9]*$/)) || value === '.' || value === '-.') {
        errors.throwError('invalid value', errors.INVALID_ARGUMENT, { argument: 'value', value: value });
    }

    // Make sure we have at least one whole digit (0 if none)
    let whole = comps[0];

    let negative = '';
    if (whole.substring(0, 1) === '-') {
        negative = '-';
        whole = whole.substring(1);
    }

    // Make sure we have at least 1 whole digit with no leading zeros
    while (whole.substring(0, 1) === '0') { whole = whole.substring(1); }
    if (whole === '') { whole = '0'; }

    let suffix = '';
    if (comps.length === 2) { suffix = '.' + (comps[1] || '0'); }

    let formatted = [];
    while (whole.length) {
        if (whole.length <= 3) {
            formatted.unshift(whole);
            break;
        } else {
            let index = whole.length - 3;
            formatted.unshift(whole.substring(index));
            whole = whole.substring(0, index);
        }
    }

    return negative + formatted.join(',') + suffix;
}

export function formatUnits(value: BigNumberish, unitType?: string | number): string {
    let unitInfo = getUnitInfo(unitType);

    // Make sure wei is a big number (convert as necessary)
    value = bigNumberify(value);

    let negative = value.lt(Zero);
    if (negative) { value = value.mul(NegativeOne); }

    let fraction = value.mod(unitInfo.tenPower).toString();
    while (fraction.length < unitInfo.decimals) { fraction = '0' + fraction; }

    // Strip training 0
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];

    let whole = value.div(unitInfo.tenPower).toString();

    value = whole + '.' + fraction;

    if (negative) { value = '-' + value; }

    return value;
}

export function parseUnits(value: string, unitType?: string | number): BigNumber {
    if (unitType == null) { unitType = 18; }
    let unitInfo = getUnitInfo(unitType);

    if (typeof(value) !== 'string' || !value.match(/^-?[0-9.,]+$/)) {
        errors.throwError('invalid decimal value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }

    if (unitInfo.decimals === 0) {
        return bigNumberify(value);
    }

    // Is it negative?
    let negative = (value.substring(0, 1) === '-');
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

export function formatEther(wei: BigNumberish): string {
    return formatUnits(wei, 18);
}

export function parseEther(ether: string): BigNumber {
    return parseUnits(ether, 18);
}

