
var fs = require('fs');

var ethers = require('../src')
var tb = ethers.utils.toUtf8Bytes;
var hex = ethers.utils.hexlify;

// There are 58 Hangul used in total
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

var words = fs.readFileSync('./lang-kr.txt').toString().split('\x0a');

function getHangul(code) {
    if (code >= 40) {
        code = code + 168 - 40;
    } else if (code >= 19) {
        code = code + 97 - 19;
    }
    return [ 225, (code >> 6) + 132, (code & 0x3f) + 128 ];
}

function getCode(b1, b2) {
    var v = ((b1 - 132) << 6 | (b2 - 128));
    if (v >= 168) {
        v = v - 168 + 40;
    } else if (v >= 97) {
        v = v - 97 + 19;
    }

    let check = getHangul(v);
    if (check[1] != b1 || check[2] != b2) {
        console.log(b1, b2, getHangul(v), v);
    }

    return v;
}

var tally = {};
var output = [ '', '', '', '', '', '', '', '' ];
words.forEach((word, index) => {
    if (!word) { return; }
    for (var i = 0; i < word.length; i++) {
        var g = tb(word[i]);
        output[word.length - 4] += code[getCode(g[1], g[2])]
    }
    if (!tally[word.length]) { tally[word.length] = 0; }
    tally[word.length]++;
});

console.log(output);

// Check against our final implementation
(function() {
    var lang = require('../src/wordlists/lang-kr.js').langKr;

    var count = 0;
    words.forEach((word, index) => {
        if (!word) { return; }
        if (word !== lang.getWord(index)) {
            console.log(word, lang.getWord(index));
            count++;
        }
    });

    console.log('Bad:', count);
})();
