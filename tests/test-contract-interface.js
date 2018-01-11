'use strict';

var assert = require('assert');

var utils = require('./utils');

// Set this to true to compare results against Web3 coder
var testWeb3 = false;
var testEthereumLib = false;


var FORMAT_WEB3             = 'web3';
var FORMAT_ETHEREUM_LIB     = 'ethereum-lib';

var web3Coder = null;
if (testWeb3) {
    console.log('Web3 Version:', require('web3/package.json').version);
    web3Coder = require('web3/lib/solidity/coder');
}

var ethereumLibCoder = null;
if (testEthereumLib) {
    console.log('EthereumLib (abi) Version:', require('ethereumjs-abi/package.json').version);
    ethereumLibCoder = require('ethereumjs-abi');
}

function equals(actual, expected) {

    // Array (treat recursively)
    if (Array.isArray(actual)) {
        if (!Array.isArray(expected) || actual.length !== expected.length) { return false; }
        for (var i = 0; i < actual.length; i++) {
            if (!equals(actual[i], expected[i])) { return false; }
        }
        return true;
    }

    if (testWeb3) {
        if (actual.toJSON && actual.minus) { actual = utils.bigNumberify(actual.toString(10)); }
        if (expected.toJSON && expected.minus) { expected = utils.bigNumberify(expected.toString(10)); }
    }

    // EthereumLib returns addresses as 160-bit big numbers
    if (testEthereumLib) {
        if (actual.match && actual.match(/^0x[0-9A-Fa-f]{40}$/) && expected.imul) {
            actual = utils.bigNumberify(actual);
        }
        if (expected.match && expected.match(/^0x[0-9A-Fa-f]{40}$/) && actual.imul) {
            expected = utils.bigNumberify(actual);
        }
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

    if (testEthereumLib) {
        if (actual.buffer) { a = '0x' + (new Buffer(actual)).toString('hex'); }
        if (expected.buffer) { b = '0x' + (new Buffer(expected)).toString('hex'); }
        if (Buffer.isBuffer(actual)) { actual = '0x' + actual.toString('hex'); }
        if (Buffer.isBuffer(expected)) { expected = '0x' + expected.toString('hex'); }
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

    if (testWeb3 || true) {
        if (actual.match && actual.match(/^0x[0-9A-Fa-f]{40}$/)) { actual = actual.toLowerCase(); }
        if (expected.match && expected.match(/^0x[0-9A-Fa-f]{40}$/)) { expected = expected.toLowerCase(); }
    }

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
        var types = JSON.parse(test.types);
        var result = test.result;

        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';

        it(('decodes parameters - ' + test.name + ' - ' + test.types), function() {
            var decoded = Interface.decodeParams(types, result);
            //var decodedArray = Array.prototype.slice.call(decoded);;

            assert.ok(equals(decoded, values), 'decoded parameters - ' + title);

            if (testWeb3) {
                var badWeb3 = [ 'random-1116' ];
                if (badWeb3.indexOf(test.name) >= 0) {
                    assert.ok(false, 'This testcase hangs in Web3');
                } else {
                    var valuesWeb3 = getValues(JSON.parse(test.normalizedValues), FORMAT_WEB3);
                    var web3Decoded = web3Coder.decodeParams(types, result.substring(2));
                    //console.dir(valuesWeb3, { depth: null });
                    //console.dir(web3Decoded, { depth: null });
                    assert.ok(equals(valuesWeb3, web3Decoded), 'web3 decoded data - ' + title);
                }
            }

            if (testEthereumLib) {
                // Bugs (I think)
                // - Addresses are returned as Big Numbers (not a bug; but odd?)
                // - random-1969: offset bug when decoding
                // - bytes[3][]; the regex is unhappy

                var badEthereumLib = [
                    // Bug in elementaryName(name); should read 'return 'int256' + name.slice(3)'
                    'sol-23', 'sol-24', 'random-22', 'random-220', 'random-254', 'random-431', 'random-468', 'random-537', 'random-544', 'random-566', 'random-604', 'random-708', 'random-713', 'random-761', 'random-767', 'random-884', 'random-934', 'random-937', 'random-963', 'random-1048', 'random-1103', 'random-1189', 'random-1326', 'random-1441', 'random-1456', 'random-1592', 'random-1741', 'random-1834', 'random-1862', 'random-1876', 'random-1895',

                    // I think the problem is the regex; fails on things like 'bytes[3][]';
                    // throws 'Cannot read property '1' of null' errors
                    'random-9', 'random-19', 'random-22', 'random-33', 'random-35', 'random-52', 'random-57', 'random-58', 'random-61', 'random-67', 'random-86', 'random-103', 'random-116', 'random-136', 'random-147', 'random-171', 'random-173', 'random-175', 'random-220', 'random-251', 'random-254', 'random-298', 'random-301', 'random-341', 'random-343', 'random-357', 'random-392', 'random-405', 'random-419', 'random-429', 'random-431', 'random-435', 'random-457', 'random-461', 'random-466', 'random-468', 'random-471', 'random-472', 'random-477', 'random-483', 'random-484', 'random-488', 'random-493', 'random-500', 'random-505', 'random-515', 'random-519', 'random-537', 'random-541', 'random-544', 'random-562', 'random-566', 'random-573', 'random-582', 'random-587', 'random-588', 'random-604', 'random-607', 'random-621', 'random-629', 'random-633', 'random-642', 'random-643', 'random-650', 'random-660', 'random-671', 'random-674', 'random-691', 'random-708', 'random-712', 'random-713', 'random-740', 'random-741', 'random-747', 'random-761', 'random-763', 'random-767', 'random-772', 'random-781', 'random-810', 'random-820', 'random-823', 'random-869', 'random-884', 'random-891', 'random-903', 'random-925', 'random-934', 'random-937', 'random-938', 'random-962', 'random-963', 'random-964', 'random-988', 'random-999', 'random-1002', 'random-1017', 'random-1046', 'random-1048', 'random-1050', 'random-1068', 'random-1075', 'random-1079', 'random-1100', 'random-1103', 'random-1104', 'random-1116', 'random-1117', 'random-1152', 'random-1168', 'random-1189', 'random-1197', 'random-1202', 'random-1217', 'random-1240', 'random-1246', 'random-1247', 'random-1257', 'random-1263', 'random-1267', 'random-1275', 'random-1293', 'random-1303', 'random-1308', 'random-1310', 'random-1326', 'random-1338', 'random-1348', 'random-1371', 'random-1393', 'random-1401', 'random-1406', 'random-1410', 'random-1441', 'random-1449', 'random-1456', 'random-1476', 'random-1478', 'random-1498', 'random-1508', 'random-1529', 'random-1553', 'random-1555', 'random-1576', 'random-1592', 'random-1597', 'random-1598', 'random-1601', 'random-1620', 'random-1627', 'random-1662', 'random-1672', 'random-1713', 'random-1741', 'random-1747', 'random-1756', 'random-1759', 'random-1761', 'random-1762', 'random-1783', 'random-1790', 'random-1795', 'random-1797', 'random-1800', 'random-1807', 'random-1814', 'random-1820', 'random-1823', 'random-1829', 'random-1834', 'random-1841', 'random-1853', 'random-1854', 'random-1862', 'random-1865', 'random-1866', 'random-1869', 'random-1876', 'random-1883', 'random-1895', 'random-1896', 'random-1897', 'random-1912', 'random-1929', 'random-1935', 'random-1965', 'random-1988', 'random-1995',

                    // I think these are offset bugs; throws 'Decoded uint exceeds width: ...' errors
                    'random-640', 'random-1358', 'random-1381', 'random-1969',
                ];

                if (badEthereumLib.indexOf(test.name) >= 0) {
                    assert.ok(false, 'This testcase seems to fail');

                } else {
                    var resultBuffer = new Buffer(result.substring(2), 'hex');
                    var valuesEthereumLib = getValues(JSON.parse(test.normalizedValues), FORMAT_ETHEREUM_LIB);
                    var ethereumLibDecoded = ethereumLibCoder.rawDecode(types, resultBuffer);
                    assert.ok(equals(valuesEthereumLib, ethereumLibDecoded),
                        'ethereum-lib decoded data - ' + title);
                }
            }
        });

    });
});

describe('Contract Interface ABI v2 Decoding', function() {
    var Interface = require('../contracts/index.js').Interface;

    var tests = utils.loadTests('contract-interface-abi2');

    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.values));
        var types = JSON.parse(test.types);
        var result = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.values + ')';

        it(('decodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function() {
            var decoded = Interface.decodeParams(types, result);
            assert.ok(equals(decoded, values), 'decoded parameters - ' + title);
        });
    });
});

describe('Contract Interface ABI v2 Encoding', function() {
    var Interface = require('../contracts/index.js').Interface;

    var tests = utils.loadTests('contract-interface-abi2');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.values));
        var namedValues = getValues(JSON.parse(test.values), undefined, true);
        var types = JSON.parse(test.types);
        var expected = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.value + ')';

        it(('encodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function() {
            var encoded = Interface.encodeParams(types, values);
            assert.equal(encoded, expected, 'encoded positional parameters - ' + title);

            var contractInterface = new Interface(test.interface);
            var outputNames = contractInterface.functions.test.outputs.names;
            var namedEncoded = Interface.encodeParams(outputNames, types, values);
            assert.equal(namedEncoded, expected, 'encoded named parameters - ' + title);
        });
    });
});

/*
describe('Contract Interface ABI v2 Named Decoding', function() {
    var Interface = require('../contracts').Interface;

    var name = "random-1939";

    var abi = [{"constant":true,"inputs":[],"name":"test","outputs":[{"name":"r0","type":"bytes"},{"components":[{"name":"a","type":"address"},{"components":[{"name":"a","type":"uint168"}],"name":"b","type":"tuple"},{"components":[{"components":[{"name":"a","type":"int40"},{"name":"b","type":"bytes"}],"name":"a","type":"tuple"}],"name":"c","type":"tuple"}],"name":"r1","type":"tuple[2]"}],"payable":false,"stateMutability":"pure","type":"function"}];
    var result = '0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000001c3b89443bbb68b4c937b8b3a3b973b271eb657a2fd8615546c73c3ee50000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000b446da3c1c4a8418ce5f6201bcceee5069ac73dd0000000000000000000000000000db730a804e1e646d9b132cf899440de4a09a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000c018ec00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000032b26b4052e530418d47dfde4b67e735e1818a03098ddbb26b050f18961016299e9374f2dea29763411dcb9213c13040a2cc010000000000000000000000000000000000000000000000000000b446da3c1c4a8418ce5f6201bcceee5069ac73dd0000000000000000000000000000db730a804e1e646d9b132cf899440de4a09a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000c018ec00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000032b26b4052e530418d47dfde4b67e735e1818a03098ddbb26b050f18961016299e9374f2dea29763411dcb9213c13040a2cc010000000000000000000000000000';
    var types = ["bytes","tuple(address,tuple(uint168),tuple(tuple(int40,bytes)))[2]"]
    var values = [{"type":"buffer","value":"0x3b89443bbb68b4c937b8b3a3b973b271eb657a2fd8615546c73c3ee5"},[{"type":"tuple","value":[{"type":"string","value":"0xB446dA3C1c4a8418Ce5f6201bCceee5069Ac73DD"},{"type":"tuple","value":[{"type":"number","value":"19116737049729793555492062790071228687491226"}]},{"type":"tuple","value":[{"type":"tuple","value":[{"type":"number","value":"12589292"},{"type":"buffer","value":"0xb26b4052e530418d47dfde4b67e735e1818a03098ddbb26b050f18961016299e9374f2dea29763411dcb9213c13040a2cc01"}]}]}]},{"type":"tuple","value":[{"type":"string","value":"0xB446dA3C1c4a8418Ce5f6201bCceee5069Ac73DD"},{"type":"tuple","value":[{"type":"number","value":"19116737049729793555492062790071228687491226"}]},{"type":"tuple","value":[{"type":"tuple","value":[{"type":"number","value":"12589292"},{"type":"buffer","value":"0xb26b4052e530418d47dfde4b67e735e1818a03098ddbb26b050f18961016299e9374f2dea29763411dcb9213c13040a2cc01"}]}]}]}]];

    it('decodes exporting named values', function() {
        var iface = new Interface(abi);
        var info = iface.functions.test();
        var decoded = info.parse(result);
        //console.dir(decoded, { depth: null });
    });
});
*/

describe('Test Contract Events', function() {
    var Interface = require('../contracts').Interface;

    var tests = utils.loadTests('contract-events');
    tests.forEach(function(test, index) {
        it(('decodes event parameters - ' + test.name + ' - ' + test.types), function() {
            var contract = new Interface(test.interface);
            var event = contract.events.testEvent();
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
            var contract = new Interface(test.interface);
            var event = contract.events.testEvent();
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
    var Interface = require('../contracts').Interface;

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
