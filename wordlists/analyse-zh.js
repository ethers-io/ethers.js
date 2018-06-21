var fs = require('fs');

var ethers = require('../src');
var tb = ethers.utils.toUtf8Bytes;

// Notes
// Byte 0 is always 228 + x, x := [ 0, 5 ]
// Byte 1 is always 128 + x, x := [ 0, 63 ]
// Byte 2 is always 128 + x, x := [ 0, 63 ]

// Encoding for byte 1 (range [ 0, 6 ])
// - Which indicates starting byte (from 228) and number of common bytes with simplified
var style = "~!@#$%^&*_-=[]{}|;:,.()<>?"
if (style.length < 4 * 6) { throw new Error(); }

// Encoding points for bytes in the range [ 0, 63 ]
//   - index => value
var codes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";


var output = '';
var outputDelta = '';

var wordsCN = fs.readFileSync('lang-zh_cn.txt').toString().split('\x0a');
var wordsTW = fs.readFileSync('lang-zh_tw.txt').toString().split('\x0a');
wordsCN.forEach(function(wordCN, index) {
    if (wordCN.length === 0) { return; }
    var wordTW = wordsTW[index];

    var wCN = tb(wordCN);
    var wTW = tb(wordTW);

    // The front style
    var s = wCN[0] - 228;

    // Common bytes with Traditional
    let common = 0;
    while (wCN[common] == wTW[common] && common < 3) { common++; }

    output += style[s * 4 + common];
    output += codes[wCN[1] - 128];
    output += codes[wCN[2] - 128];

    for (var i = common; i < 3; i++) {
        outputDelta += codes[wTW[i] - ((i == 0) ? 228: 128)];
    }
});

console.log('Data:', output);
console.log('Traditional Delta:', outputDelta);

// Check against our final implementation
(function() {
    var langZhCn = require('../src/wordlists/lang-zh.js').langZhCn;

    var count = 0;
    wordsCN.forEach((word, index) => {
        if (!word) { return; }
        if (word !== langZhCn.getWord(index)) {
            console.log(word, langZnCn.getWord(index));
            count++;
        }
    });
    console.log('Bad CN:', count);


    var langZhTw = require('../src/wordlists/lang-zh.js').langZhTw;

    var count = 0;
    wordsTW.forEach((word, index) => {
        if (!word) { return; }
        if (word !== langZhTw.getWord(index)) {
            console.log(word, langZhTw.getWord(index));
            count++;
        }
    });
    console.log('Bad TW:', count);
})();
