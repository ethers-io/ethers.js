'use strict';

var assert = require('assert');

if (global.ethers) {
    console.log('Using global ethers; ' + __filename);
    var ethers = global.ethers;
} else {
    var ethers = require('..');
}

var utils = require('./utils');

function equals(actual, expected) {

    // Array (treat recursively)
    if (Array.isArray(actual)) {
        if (!Array.isArray(expected) || actual.length !== expected.length) { return false; }
        for (var i = 0; i < actual.length; i++) {
            if (!equals(actual[i], expected[i])) { return false; }
        }
        return true;
    }

    if (typeof(actual) === 'number') { actual = utils.bigNumberify(actual); }
    if (typeof(expected) === 'number') { expected = utils.bigNumberify(expected); }

    // BigNumber
    if (actual.eq) {
        if (typeof(expected) === 'string' && expected.match(/^-?0x[0-9A-Fa-f]*$/)) {
            var neg = (expected.substring(0, 1) === '-');
            if (neg) { expected = expected.substring(1); }
            expected = utils.bigNumberify(expected);
            if (neg) { expected = expected.mul(-1); }
        }
        if (!actual.eq(expected)) { return false; }
        return true;
    }

    // Uint8Array
    if (expected.buffer) {
        if (!utils.isHexString(actual)) { return false; }
        actual = utils.arrayify(actual);

        if (!actual.buffer || actual.length !== expected.length) { return false; }
        for (var i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) { return false; }
        }

        return true;
    }

    // Maybe address?
    try {
        var actualAddress = ethers.utils.getAddress(actual);
        var expectedAddress = ethers.utils.getAddress(expected);
        return (actualAddress === expectedAddress);
    } catch (error) { }

    // Something else
    return (actual === expected);
}


function getValues(object, format, named) {
   if (Array.isArray(object)) {
       var result = [];
       object.forEach(function(object) {
           result.push(getValues(object, format, named));
       });
       return result;
   }

   switch (object.type) {
       case 'number':
           return utils.bigNumberify(object.value);

       case 'boolean':
       case 'string':
           return object.value;

       case 'buffer':
           return utils.arrayify(object.value);

       case 'tuple':
           var result = getValues(object.value, format, named);
           if (named) {
               var namedResult = {};
               result.forEach(function(value, index) {
                   namedResult['r' + String(index)] = value;
               });
               return namedResult;
           }
           return result;

       default:
           throw new Error('invalid type - ' + object.type);
   }
}

describe('ABI Coder Encoding', function() {
    var coder = ethers.utils.AbiCoder.defaultCoder;

    var tests = utils.loadTests('contract-interface');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.normalizedValues));
        var types = JSON.parse(test.types);
        var result = test.result;

        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';

        it(('encodes paramters - ' + test.name + ' - ' + test.types), function() {
            var encoded = coder.encode(types, values);
            assert.equal(encoded, result, 'encoded data - ' + title);
        });
    });
});

describe('ABI Coder Decoding', function() {
    var coder = ethers.utils.AbiCoder.defaultCoder;

    var tests = utils.loadTests('contract-interface');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.normalizedValues));
        var types = JSON.parse(test.types);
        var result = test.result;

        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';

        it(('decodes parameters - ' + test.name + ' - ' + test.types), function() {
            var decoded = coder.decode(types, result);

            assert.ok(equals(decoded, values), 'decoded parameters - ' + title);
        });
    });
});

describe('ABI Coder ABIv2 Encoding', function() {
    var coder = ethers.utils.AbiCoder.defaultCoder;

    var tests = utils.loadTests('contract-interface-abi2');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.values));
        var namedValues = getValues(JSON.parse(test.values), undefined, true);
        var types = JSON.parse(test.types);
        var expected = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.value + ')';

        it(('encodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function() {
            var encoded = coder.encode(types, values);
            assert.equal(encoded, expected, 'encoded positional parameters - ' + title);

            var outputNames = [];
            JSON.parse(test.interface)[0].outputs.forEach(function(output) {
                outputNames.push(output.name);
            });
            var namedEncoded = coder.encode(outputNames, types, values);
            assert.equal(namedEncoded, expected, 'encoded named parameters - ' + title);
        });
    });
});

describe('ABI Coder ABIv2 Decoding', function() {
    var coder = ethers.utils.AbiCoder.defaultCoder;

    var tests = utils.loadTests('contract-interface-abi2');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.values));
        var types = JSON.parse(test.types);
        var result = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.values + ')';

        it(('decodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function() {
            var decoded = coder.decode(types, result);
            assert.ok(equals(decoded, values), 'decoded positional parameters - ' + title);
        });
    });
});

describe('Test Contract Events', function() {

    var tests = utils.loadTests('contract-events');
    tests.forEach(function(test, index) {
        it(('decodes event parameters - ' + test.name + ' - ' + test.types), function() {
            var contract = new ethers.Interface(test.interface);
            var event = contract.events.testEvent;
            var parsed = event.parse(test.topics, test.data);

            test.normalizedValues.forEach(function(expected, index) {
                if (test.hashed[index]) {
                    assert.ok(equals(parsed[index].hash, expected), 'parsed event indexed parameter matches - ' + index);
                } else {
                    assert.ok(equals(parsed[index], expected), 'parsed event parameter matches - ' + index);
                }
            });
        });
    });

    tests.forEach(function(test, index) {
        it(('decodes event data - ' + test.name + ' - ' + test.types), function() {
            var contract = new ethers.Interface(test.interface);
            var event = contract.events.testEvent;
            var parsed = event.parse(test.data);

            test.normalizedValues.forEach(function(expected, index) {
                if (test.indexed[index]) {
                    assert.ok((parsed[index].indexed && parsed[index].hash == null), 'parsed event data has empty Indexed - ' + index);
                } else {
                    assert.ok(equals(parsed[index], expected), 'parsed event data matches - ' + index);
                }
            });
        });
    });

});

describe('Test Interface Signatures', function() {
    var Interface = ethers.Interface;

    var tests = utils.loadTests('contract-signatures');
    tests.forEach(function(test) {
        var contract = new Interface(test.abi);
        it('derives the correct signature - ' + test.name, function() {
            assert.equal(contract.functions.testSig.signature, test.signature,
                'derived the correct signature');
            assert.equal(contract.functions.testSig.sighash, test.sigHash,
                'derived the correct signature hash');
        })
    });
});

describe('Test Invalid Input', function() {
    var coder = ethers.utils.AbiCoder.defaultCoder;
    it('null input failed', function() {
        assert.throws(function() {
            var result = coder.decode([ 'bool' ], '0x');
            console.log(result);
        }, function(error) {
            assert.equal(error.reason, 'insufficient data for boolean type', 'got invalid bool');
            return true;
        }, 'null bytes throws an error');
    });
});
