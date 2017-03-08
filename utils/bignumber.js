/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. In the future we can swap out
 *  the underlying BN.js library for something smaller.
 */

var BN = require('bn.js');

var defineProperty = require('./properties.js').defineProperty;
var convert = require('./convert.js');

function BigNumber(value) {
    if (!(this instanceof BigNumber)) { throw new Error('missing new'); }

    if (convert.isHexString(value)) {
        if (value == '0x') { value = '0x0'; }
        value = new BN(value.substring(2), 16);

    } else if (typeof(value) === 'string' && value.match(/^-?[0-9]*$/)) {
        if (value == '') { value = '0'; }
        value = new BN(value);

    } else if (typeof(value) === 'number' && parseInt(value) == value) {
        value = new BN(value);

    } else if (BN.isBN(value)) {
        //value = value

    } else if (value instanceof BigNumber) {
        value = value._bn;

    } else if (convert.isArrayish(value)) {
        value = new BN(convert.hexlify(value).substring(2), 16);

    } else {
        throw new Error('invalid value');
    }

    defineProperty(this, '_bn', value);
}

defineProperty(BigNumber, 'constantNegativeOne', bigNumberify(-1));
defineProperty(BigNumber, 'constantZero', bigNumberify(0));
defineProperty(BigNumber, 'constantOne', bigNumberify(1));
defineProperty(BigNumber, 'constantTwo', bigNumberify(2));
defineProperty(BigNumber, 'constantWeiPerEther', bigNumberify(new BN('1000000000000000000')));


defineProperty(BigNumber.prototype, 'fromTwos', function(value) {
    return new BigNumber(this._bn.fromTwos(value));
});

defineProperty(BigNumber.prototype, 'toTwos', function(value) {
    return new BigNumber(this._bn.toTwos(value));
});


defineProperty(BigNumber.prototype, 'add', function(other) {
    return new BigNumber(this._bn.add(bigNumberify(other)._bn));
});

defineProperty(BigNumber.prototype, 'sub', function(other) {
    return new BigNumber(this._bn.sub(bigNumberify(other)._bn));
});


defineProperty(BigNumber.prototype, 'div', function(other) {
    return new BigNumber(this._bn.div(bigNumberify(other)._bn));
});

defineProperty(BigNumber.prototype, 'mul', function(other) {
    return new BigNumber(this._bn.mul(bigNumberify(other)._bn));
});

defineProperty(BigNumber.prototype, 'mod', function(other) {
    return new BigNumber(this._bn.mod(bigNumberify(other)._bn));
});


defineProperty(BigNumber.prototype, 'maskn', function(value) {
    return new BigNumber(this._bn.maskn(value));
});



defineProperty(BigNumber.prototype, 'eq', function(other) {
    return this._bn.eq(bigNumberify(other)._bn);
});

defineProperty(BigNumber.prototype, 'lt', function(other) {
    return this._bn.lt(bigNumberify(other)._bn);
});

defineProperty(BigNumber.prototype, 'lte', function(other) {
    return this._bn.lte(bigNumberify(other)._bn);
});

defineProperty(BigNumber.prototype, 'gte', function(other) {
    return this._bn.gte(bigNumberify(other)._bn);
});


defineProperty(BigNumber.prototype, 'isZero', function() {
    return this._bn.isZero();
});


defineProperty(BigNumber.prototype, 'toNumber', function(base) {
    return this._bn.toNumber();
});

defineProperty(BigNumber.prototype, 'toString', function() {
    //return this._bn.toString(base || 10);
    return this._bn.toString(10);
});

defineProperty(BigNumber.prototype, 'toHexString', function() {
    var hex = this._bn.toString(16);
    if (hex.length % 2) { hex = '0' + hex; }
    return '0x' + hex;
});


function isBigNumber(value) {
    return (value instanceof BigNumber);
}

function bigNumberify(value, name) {
    if (value instanceof BigNumber) { return value; }

    try {
        return new BigNumber(value);

    } catch (error) {
        console.log(error);
        if (name) {
            throw new Error('invalid arrayify object (' + name + ')');
        }
        throw new Error('invalid arrayify object');
    }
}

module.exports = {
    isBigNumber: isBigNumber,
    bigNumberify: bigNumberify
};
