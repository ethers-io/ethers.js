'use strict';

var assert = require('assert');

var utils = require('./utils');

// Set this to true to compare results against Web3 coder
var testWeb3 = false;


var FORMAT_WEB3 = 'web3';

var web3Coder = null;
if (testWeb3) {
    web3Coder = require('web3/lib/solidity/coder');
}


function equals(a, b) {
    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    if (testWeb3) {
        if (a.toJSON && a.minus) { a = utils.bigNumberify(a.toString(10)); }
        if (b.toJSON && b.minus) { b = utils.bigNumberify(b.toString(10)); }
    }

    // BigNumber
    if (a.eq) {
        if (!a.eq(b)) { return false; }
        return true;
    }

    // Uint8Array
    if (a.buffer) {
        if (!utils.isHexString(b)) { return false; }
        b = utils.arrayify(b);

        if (!b.buffer || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }

        return true;
    }

    if (testWeb3) {
        if (a.match && a.match(/^0x[0-9A-Fa-f]{40}$/)) { a = a.toLowerCase(); }
        if (b.match && b.match(/^0x[0-9A-Fa-f]{40}$/)) { b = b.toLowerCase(); }
    }

    // Something else
    return a === b;
}


function getValues(object, format) {
   if (Array.isArray(object)) {
       var result = [];
       object.forEach(function(object) {
           result.push(getValues(object, format));
       });
       return result;
   }

   switch (object.type) {
       case 'number':
           if (format === FORMAT_WEB3) {
                var value = utils.bigNumberify(object.value);
                value.round = function() {
                    return this;
                }
                value.lessThan = function(other) {
                    return this.lt(other);
                }
                var toString = value.toString.bind(value);
                var toHexString = value.toHexString.bind(value);
                Object.defineProperty(value, 'toString', {
                    value: function(format) {
                        if (format === 16) { return toHexString().substring(2); }
                        return toString();
                    }
                });
                return value;
           }
           return utils.bigNumberify(object.value);

       case 'boolean':
       case 'string':
           return object.value;

       case 'buffer':
           if (format === FORMAT_WEB3) {
               return object.value.toLowerCase();
           }
           return utils.arrayify(object.value);

       default:
           throw new Error('invalid type - ' + object.type);
   }
}

describe('Contract Interface ABI Encoding', function() {
    var Interface = require('../contracts/index.js').Interface;

    var tests = utils.loadTests('contract-interface');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.normalizedValues));
        var types = JSON.parse(test.types);
        var result = test.result;

        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';

        it(('encodes paramters - ' + test.name + ' - ' + test.types), function() {
            var encoded = Interface.encodeParams(types, values);
            assert.equal(encoded, result, 'encoded data - ' + title);

            if (testWeb3) {
                var valuesWeb3 = getValues(JSON.parse(test.normalizedValues), FORMAT_WEB3);
                var web3Encoded = '0x' + web3Coder.encodeParams(types, valuesWeb3);
                assert.equal(web3Encoded, result, 'web3 encoded data - ' + title);
            }
        });
    });
});

describe('Contract Interface ABI Decoding', function() {
    var Interface = require('../contracts/index.js').Interface;

    var tests = utils.loadTests('contract-interface');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.normalizedValues));
        var valuesWeb3 = getValues(JSON.parse(test.normalizedValues), FORMAT_WEB3);
        var types = JSON.parse(test.types);
        var result = test.result;

        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';

        it(('decodes parameters - ' + test.name + ' - ' + test.types), function() {
            var decoded = Interface.decodeParams(types, result);
            var decodedArray = Array.prototype.slice.call(decoded);;

            assert.ok(equals(values, decodedArray), 'decoded parameters - ' + title);

            if (testWeb3) {
                var badWeb3 = [ 'random-1116' ];
                if (badWeb3.indexOf(test.name) >= 0) {
                    asset.ok(false, 'This testcase hangs in Web3');
                } else {
                    var web3Decoded = web3Coder.decodeParams(types, result.substring(2));
                    //console.dir(valuesWeb3, { depth: null });
                    //console.dir(web3Decoded, { depth: null });
                    assert.ok(equals(valuesWeb3, web3Decoded), 'web3 decoded data - ' + title);
                }
            }
        });
    });
});
