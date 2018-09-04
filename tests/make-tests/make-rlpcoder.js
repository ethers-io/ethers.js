'use strict';

var rlp = require('rlp');

var utils = require('../utils.js');

var nullBuffer = Buffer.from('');
var shortBuffer = Buffer.from('Hello World');
var longBuffer = Buffer.from('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas aliquet dolor nulla, nec tincidunt massa mollis at. In mollis blandit dui, id elementum eros iaculis ut. Phasellus lobortis, ipsum quis fermentum mollis, eros nisl rutrum dui, ut luctus leo turpis ut augue. Fusce odio turpis, pharetra at venenatis in, convallis quis nibh. Duis auctor, augue sit amet venenatis vulputate, nisl nibh feugiat mauris, id molestie augue dui sed justo. Suspendisse ipsum mauris, sagittis nec laoreet non, egestas vel nibh. Pellentesque aliquet accumsan velit in dapibus. Aenean eget augue arcu. Ut mollis leo mi, eu luctus eros facilisis eu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse efficitur, justo a volutpat tempor, nibh ligula finibus turpis, eu facilisis tortor velit nec velit. Duis nec tempor lectus, non convallis sem.');

var singleLow = Buffer.from([0x02]);
var singleLessMed = Buffer.from([0x7e]);
var singleMed = Buffer.from([0x7f]);
var singleMoreMed = Buffer.from([0x80]);
var singleHigh = Buffer.from([0xff]);

var Tests = {
    nullString: nullBuffer,
    emptyArray: [],
    arrayWithNullString: [nullBuffer],
    arrayWithNullString3: [nullBuffer, nullBuffer, nullBuffer],
    threeSet: [ [], [[]], [[[]]] ],
    arrayShort2: [shortBuffer, shortBuffer],
    arrayLong2: [shortBuffer, shortBuffer],
    arrayShortLong: [shortBuffer, longBuffer],
    arrayInside: [shortBuffer, [shortBuffer, longBuffer, [shortBuffer, [shortBuffer]]], shortBuffer],
    singleLow: singleLow,
    singleLessMed: singleLessMed,
    singleMed: singleMed,
    singleMoreMed: singleMoreMed,
    singleHigh: singleHigh,
    assortedSingle1: [singleLow, singleMed, singleMoreMed, singleHigh, [singleLessMed, singleLow]],
    assortedSingle2: [[singleLow, singleLow], [singleHigh, singleHigh, singleHigh]],
    assorted: [[longBuffer], [singleMoreMed], singleLow, [singleLessMed], [[shortBuffer], [singleHigh]]],
}

function repeated(text, count) {
    var result = '';
    for (var i = 0; i < count; i++) {
        result += text;
    }
    return result;
}

[1, 2, 3, 4, 7, 8, 9, 15, 16, 17, 31, 32, 33, 53, 54, 55, 56, 57, 58, 100, 1000, 2049].forEach(function(i) {
    Tests['zeros_' + i] = Buffer.from(repeated('00', i), 'hex');
    Tests['ones_' + i] = Buffer.from(repeated('01', i), 'hex');
})

function toNestedHex(value) {
    if (Array.isArray(value)) {
        var result = [];
        value.forEach(function(value) {
            result.push(toNestedHex(value));
        });
        return result;
    } else if (Buffer.isBuffer(value)) {
        return utils.hexlify(value);
    }
    throw new Error('invalid object - '  + value);
}

var Output = [];

var testNames = Object.keys(Tests);
testNames.sort();
testNames.forEach(function(testName) {
    var test = Tests[testName];
    var encoded = rlp.encode(test);
    Output.push({
        name: testName,
        decoded: toNestedHex(test),
        encoded: '0x' + encoded.toString('hex')
    });
});
console.log(Output);

utils.saveTests('rlp-coder', Output);
