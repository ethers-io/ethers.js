'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var ethers_1 = require("ethers");
var testcases_1 = require("@ethersproject/testcases");
function checkWordlist(content, wordlist) {
    var words = content.split('\n');
    it('matches wordlists for ' + wordlist.locale, function () {
        for (var i = 0; i < 2048; i++) {
            var actual = wordlist.getWord(i);
            var expected = words[i];
            assert_1.default.equal(actual, expected, 'failed to match word ' + i + ': ' + words[i] + ' !=' + wordlist.getWord(i));
        }
    });
    it("splitting and joining are equivalent", function () {
        var words = [];
        for (var i = 0; i < 12; i++) {
            words.push(wordlist.getWord(i));
        }
        var phrase = wordlist.join(words);
        var words2 = wordlist.split(phrase);
        var phrase2 = wordlist.join(words2);
        assert_1.default.deepStrictEqual(words2, words, "split words");
        assert_1.default.deepStrictEqual(phrase2, phrase, "re-joined words");
    });
}
describe('Check Wordlists', function () {
    var tests = (0, testcases_1.loadTests)("wordlists");
    tests.forEach(function (test) {
        var wordlist = (ethers_1.ethers.wordlists)[test.locale];
        if (wordlist == null) {
            return;
        }
        checkWordlist(test.content, wordlist);
    });
});
//# sourceMappingURL=test-wordlists.js.map