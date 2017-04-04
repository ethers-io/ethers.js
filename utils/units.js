var bigNumberify = require('./bignumber.js').bigNumberify;
var throwError = require('./throw-error');

var zero = new bigNumberify(0);
var negative1 = new bigNumberify(-1);
var tenPower18 = new bigNumberify('1000000000000000000');

function formatEther(wei, options) {
    wei = bigNumberify(wei);

    if (!options) { options = {}; }

    var negative = wei.lt(zero);
    if (negative) { wei = wei.mul(negative1); }

    var fraction = wei.mod(tenPower18).toString(10);
    while (fraction.length < 18) { fraction = '0' + fraction; }

    if (!options.pad) {
        fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    }

    var whole = wei.div(tenPower18).toString(10);

    if (options.commify) {
        whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    var value = whole + '.' + fraction;

    if (negative) { value = '-' + value; }

    return value;
}

function parseEther(ether) {
    if (typeof(ether) !== 'string' || !ether.match(/^-?[0-9.,]+$/)) {
        throwError('invalid value', { input: ether });
    }

    var value = ether.replace(/,/g,'');

    // Is it negative?
    var negative = (value.substring(0, 1) === '-');
    if (negative) { value = value.substring(1); }

    if (value === '.') { throwError('invalid value', { input: ether }); }

    // Split it into a whole and fractional part
    var comps = value.split('.');
    if (comps.length > 2) { throwError('too many decimal points', { input: ether }); }

    var whole = comps[0], fraction = comps[1];
    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }
    if (fraction.length > 18) { throwError('too many decimal places', { input: ether, decimals: fraction.length }); }

    while (fraction.length < 18) { fraction += '0'; }

    whole = bigNumberify(whole);
    fraction = bigNumberify(fraction);

    var wei = (whole.mul(tenPower18)).add(fraction);

    if (negative) { wei = wei.mul(negative1); }

    return wei;
}

module.exports = {
    formatEther: formatEther,
    parseEther: parseEther,
}
