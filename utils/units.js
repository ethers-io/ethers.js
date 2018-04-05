var bigNumberify = require('./bignumber.js').bigNumberify;
var throwError = require('./throw-error');

var zero = new bigNumberify(0);
var negative1 = new bigNumberify(-1);

var names = [
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

        if (!info && typeof(name) === 'number' && parseInt(name) == name && name >= 0 && name <= 256) {
            var value = '1';
            for (var i = 0; i < name; i++) { value += '0'; }
            info = getUnitInfo(value);
        }

        // Make sure we got something
        if (!info) { throwError('invalid unitType', { unitType: name }); }

        return info;
    }
})();

function formatUnits(value, unitType, options) {
    if (typeof(unitType) === 'object' && !options) {
        options = unitType;
        unitType = undefined;
    }

    if (unitType == null) { unitType = 18; }
    var unitInfo = getUnitInfo(unitType);

    // Make sure wei is a big number (convert as necessary)
    value = bigNumberify(value);

    if (!options) { options = {}; }

    var negative = value.lt(zero);
    if (negative) { value = value.mul(negative1); }

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

    var value = whole + '.' + fraction;

    if (negative) { value = '-' + value; }

    return value;
}

function parseUnits(value, unitType) {
    if (unitType == null) { unitType = 18; }
    var unitInfo = getUnitInfo(unitType);

    if (typeof(value) !== 'string' || !value.match(/^-?[0-9.,]+$/)) {
        throwError('invalid value', { input: value });
    }

    // Remove commas
    var value = value.replace(/,/g,'');

    // Is it negative?
    var negative = (value.substring(0, 1) === '-');
    if (negative) { value = value.substring(1); }

    if (value === '.') { throwError('invalid value', { input: value }); }

    // Split it into a whole and fractional part
    var comps = value.split('.');
    if (comps.length > 2) { throwError('too many decimal points', { input: value }); }

    var whole = comps[0], fraction = comps[1];
    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }

    // Prevent underflow
    if (fraction.length > unitInfo.decimals) {
        throwError('too many decimal places', { input: value, decimals: fraction.length });
    }

    // Fully pad the string with zeros to get to wei
    while (fraction.length < unitInfo.decimals) { fraction += '0'; }

    whole = bigNumberify(whole);
    fraction = bigNumberify(fraction);

    var wei = (whole.mul(unitInfo.tenPower)).add(fraction);

    if (negative) { wei = wei.mul(negative1); }

    return wei;
}

function formatEther(wei, options) {
    return formatUnits(wei, 18, options);
}

function parseEther(ether) {
    return parseUnits(ether, 18);
}

module.exports = {
    formatEther: formatEther,
    parseEther: parseEther,

    formatUnits: formatUnits,
    parseUnits: parseUnits,
}
