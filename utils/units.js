var utils = require('./utils.js');

var zero = new utils.BN(0);
var negative1 = new utils.BN(-1);
var tenPower18 = new utils.BN('1000000000000000000');

function formatEther(wei, options) {

    if (typeof(wei) === 'number') {
        // @TODO: Warn if truncation will occur?
        wei = new utils.BN(wei);
    } else if (utils.isHexString(wei)) {
        wei = new utils.BN(wei.substring(2), 16);
    }

    if (!options) { options = {}; }

    if (!(wei instanceof utils.BN)) { throw new Error('invalid wei'); }

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
    if (typeof(ether) !== 'string' || !ether.match(/^-?[0-9.]+$/)) {
        throw new Error('invalid value');
    }

    // Is it negative?
    var negative = (ether.substring(0, 1) === '-');
    if (negative) { ether = ether.substring(1); }

    if (ether === '.') { throw new Error('invalid value'); }

    // Split it into a whole and fractional part
    var comps = ether.split('.');
    if (comps.length > 2) { throw new Error('too many decimal points'); }

    var whole = comps[0], fraction = comps[1];
    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }
    if (fraction.length > 18) { throw new Error('too many decimal places'); }

    while (fraction.length < 18) { fraction += '0'; }

    whole = new utils.BN(whole);
    fraction = new utils.BN(fraction);

    var wei = (whole.mul(tenPower18)).add(fraction);

    if (negative) { wei = wei.mul(negative1); }

    return wei;
}

module.exports = {
    formatEther: formatEther,
    parseEther: parseEther,
}
