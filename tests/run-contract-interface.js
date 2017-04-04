'use strict';

var utils = (function() {
    var bigNumber = require('../utils/bignumber');
    var convert = require('../utils/convert');

    return {
        arrayify: convert.arrayify,
        bigNumberify: bigNumber.bigNumberify,

        isHexString: convert.isHexString,
    };
})();


function equals(a, b) {
    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
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

    // Something else
    return a === b;
}

function getValues(object) {
   if (Array.isArray(object)) {
       var result = [];
       object.forEach(function(object) {
           result.push(getValues(object));
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

       default:
           throw new Error('invalid type - ' + object.type);
   }
}


function testContractInterface(test) {
    var Interface = require('../contracts/index.js').Interface;

    var testcases = require('./tests/contract-interface.json');
    testcases.forEach(function(testcase) {
        var values = getValues(JSON.parse(testcase.normalizedValues));
        var types = JSON.parse(testcase.types);

        var result = testcase.result;

        try {
            var encoded = Interface.encodeParams(types, values);
            test.equal(result, encoded, 'failed to encode data - ' + testcase.name);

        } catch (error) {
            test.ok(false, 'Failed Encode (' + testcase.name + ') - ' + error.message);
        }

        try {
            var decoded = Interface.decodeParams(types, result);

            var decodedArray = Array.prototype.slice.call(decoded);;

            test.ok(equals(values, decodedArray), 'failed to decode parameters - ' + testcase.name);

        } catch (error) {
            test.ok(false, 'Failed Decode (' + testcase.name + ') - ' + error.message);
        }
    });

    test.done();
}

module.exports = {
    "contract-interface": testContractInterface,
}
