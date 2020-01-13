'use strict';

import assert from 'assert';

import { ethers } from "ethers";
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
});
