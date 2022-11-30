import assert from 'assert';
import { wordlists } from "../wordlists/wordlists.js";
import { loadTests } from "./utils.js";
describe('Check Wordlists', function () {
    const tests = loadTests("wordlists");
    tests.forEach((test) => {
        let wordlist = wordlists[test.locale];
        if (wordlist == null) {
            return;
        }
        it(`matches wordlists: ${test.locale}`, function () {
            const words = test.content.split('\n');
            let check = "";
            for (let i = 0; i < 2048; i++) {
                let word = wordlist.getWord(i);
                check += (word + "\n");
                assert.equal(word, words[i]);
                assert.equal(wordlist.getWordIndex(word), i);
            }
            assert.equal(check, test.content);
        });
    });
    tests.forEach((test) => {
        let wordlist = wordlists[test.locale];
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
            assert.deepStrictEqual(words2, words, "split words");
            assert.deepStrictEqual(phrase2, phrase, "re-joined words");
        });
    });
    tests.forEach((test) => {
        let wordlist = wordlists[test.locale];
        if (wordlist == null) {
            return;
        }
        it(`handles out-of-range values: ${test.locale}`, function () {
            assert.equal(wordlist.getWordIndex("foobar"), -1);
            assert.throws(() => {
                wordlist.getWord(-1);
            }, (error) => {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid word index/) &&
                    error.argument === "index" &&
                    error.value === -1);
            });
            assert.throws(() => {
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