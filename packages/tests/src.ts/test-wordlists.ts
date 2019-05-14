'use strict';

import assert from 'assert';

import { ethers } from "@ethersproject/ethers";
import { loadTests, TestCase } from "@ethersproject/testcases";


function checkWordlist(content: string, wordlist: ethers.Wordlist): void {
    let words = content.split('\n');
    it('matches wordlists for ' + wordlist.locale, function() {
        for (let i = 0; i < 2048; i++) {
            let actual = wordlist.getWord(i);
            let expected = words[i];
            assert.equal(actual, expected, 'failed to match word ' + i + ': ' + words[i] + ' !=' + wordlist.getWord(i));
        }
    });
}

describe('Check Wordlists', function() {
    let tests: Array<TestCase.Wordlist> = loadTests("wordlists");
    tests.forEach((test) => {
        let wordlist = (<{ [ locale: string ]: ethers.Wordlist }>(ethers.wordlists))[test.locale];
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
