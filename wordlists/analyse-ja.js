/**
 *  There are only 54 kana used, which can be encoded in the printable range A-Z a-z.
 *  The list is also fairly sorted (with only a few UTF-8 gotchas), so we can groupt
 *  words together by length, eliminating the need for separators.
 */

var fs = require('fs')

var ethers = require('../src')

var words = fs.readFileSync('lang-ja.txt').toString().split('\x0a')

var output = [ '', '', '', '', '', '', '' ];

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
var nextCode = 0;

var mapping = { };
var reverseMap = {};

words.forEach((word, index) => {

    if (word.length === 0) { return; }

    for (var i = 0; i < word.length; i++) {
        var b = ethers.utils.toUtf8Bytes(word[i]);
        var v = ((b[1] === 129) ? 0: 0x40) | (b[2] - 128);
        if (!mapping[v]) {
            mapping[v] = code[nextCode++];
            reverseMap[mapping[v]] = v;
        }

        output[word.length - 3] += mapping[v];
    }
});

console.log('Data:', output);

(function(mapping) {
    var m = [];
    while (m.length < 92) { m.push('~'); }
    for (var key in mapping) {
        m[mapping[key]] = key;
    }
    console.log('Map:', m.join(''));
})(reverseMap);

// Check the wordlist matches the official wordlist.
(function() {
    var lang = require('../src/wordlists/lang-ja.js').langJa;

    // Check against our final implementation
    var count = 0;
    words.forEach((word, index) => {
        if (!word) { return; }
        if (word !== lang.getWord(index)) {
            console.log(word, lang.getWord(index));
            count++;
        }
    });

    console.log('Bad:', count);
})()
