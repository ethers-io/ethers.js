'use strict';

var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);


function checkWordlist(filename, wordlist) {
    var words = utils.loadText(filename).split('\n');
    it('matches wordlists for ' + wordlist.locale, function() {
        for (var i = 0; i < 2048; i++) {
            var actual = wordlist.getWord(i);
            var expected = words[i];
            assert.equal(actual, expected, 'failed to match word ' + i + ': ' + words[i] + ' !=' + wordlist.getWord(i));
        }
    });
}

describe('Check Wordlists', function() {
    checkWordlist('./wordlist-generation/lang-en.txt', ethers.wordlists.en);
    checkWordlist('./wordlist-generation/lang-es.txt', ethers.wordlists.es);
    checkWordlist('./wordlist-generation/lang-fr.txt', ethers.wordlists.fr);
    checkWordlist('./wordlist-generation/lang-it.txt', ethers.wordlists.it);
    checkWordlist('./wordlist-generation/lang-ja.txt', ethers.wordlists.ja);
    checkWordlist('./wordlist-generation/lang-ko.txt', ethers.wordlists.ko);
    checkWordlist('./wordlist-generation/lang-zh_cn.txt', ethers.wordlists.zh);
    checkWordlist('./wordlist-generation/lang-zh_cn.txt', ethers.wordlists.zh_cn);
    checkWordlist('./wordlist-generation/lang-zh_tw.txt', ethers.wordlists.zh_tw);
});
