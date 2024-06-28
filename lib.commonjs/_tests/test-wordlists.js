"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const index_js_1 = require("../index.js");
const utils_js_1 = require("./utils.js");
describe('Check Wordlists', function () {
    const tests = (0, utils_js_1.loadTests)("wordlists");
    tests.forEach((test) => {
        let wordlist = index_js_1.wordlists[test.locale];
        if (wordlist == null) {
            return;
        }
        it(`matches wordlists: ${test.locale}`, function () {
            const words = test.content.split('\n');
            let check = "";
            for (let i = 0; i < 2048; i++) {
                let word = wordlist.getWord(i);
                check += (word + "\n");
                assert_1.default.equal(word, words[i]);
                assert_1.default.equal(wordlist.getWordIndex(word), i);
            }
            assert_1.default.equal(check, test.content);
        });
    });
    tests.forEach((test) => {
        let wordlist = index_js_1.wordlists[test.locale];
        if (wordlist == null) {
            return;
        }
        it(`splitting and joining are equivalent: ${test.locale}`, function () {
            const words = [];
            for (let i = 0; i < 12; i++) {
                words.push(wordlist.getWord(i));
            }
            const phrase = wordlist.join(words);
            const words2 = wordlist.split(phrase);
            const phrase2 = wordlist.join(words2);
            assert_1.default.deepEqual(words2, words, "split words");
            assert_1.default.deepEqual(phrase2, phrase, "re-joined words");
        });
    });
    tests.forEach((test) => {
        let wordlist = index_js_1.wordlists[test.locale];
        if (wordlist == null) {
            return;
        }
        it(`handles out-of-range values: ${test.locale}`, function () {
            assert_1.default.equal(wordlist.getWordIndex("foobar"), -1);
            assert_1.default.throws(() => {
                wordlist.getWord(-1);
            }, (error) => {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid word index/) &&
                    error.argument === "index" &&
                    error.value === -1);
            });
            assert_1.default.throws(() => {
                wordlist.getWord(2048);
            }, (error) => {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid word index/) &&
                    error.argument === "index" &&
                    error.value === 2048);
            });
        });
    });
});
//# sourceMappingURL=test-wordlists.js.map