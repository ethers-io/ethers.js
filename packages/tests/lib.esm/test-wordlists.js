'use strict';
import assert from 'assert';
import { ethers } from "ethers";
import { loadTests } from "@ethersproject/testcases";
function checkWordlist(content, wordlist) {
    let words = content.split('\n');
    it('matches wordlists for ' + wordlist.locale, function () {
        for (let i = 0; i < 2048; i++) {
            let actual = wordlist.getWord(i);
            let expected = words[i];
            assert.equal(actual, expected, 'failed to match word ' + i + ': ' + words[i] + ' !=' + wordlist.getWord(i));
        }
    });
}
describe('Check Wordlists', function () {
    let tests = loadTests("wordlists");
    tests.forEach((test) => {
        let wordlist = (ethers.wordlists)[test.locale];
        checkWordlist(test.content, wordlist);
    });
    /*
        checkWordlist('./wordlists/lang-es.txt', ethers.wordlists.es);
        checkWordlist('./wordlists/lang-fr.txt', ethers.wordlists.fr);
        checkWordlist('./wordlists/lang-it.txt', ethers.wordlists.it);
        checkWordlist('./wordlists/lang-ja.txt', ethers.wordlists.ja);
        checkWordlist('./wordlists/lang-ko.txt', ethers.wordlists.ko);
        checkWordlist('./wordlists/lang-zh_cn.txt', ethers.wordlists.zh);
        checkWordlist('./wordlists/lang-zh_cn.txt', ethers.wordlists.zh_cn);
        checkWordlist('./wordlists/lang-zh_tw.txt', ethers.wordlists.zh_tw);
    */
});
