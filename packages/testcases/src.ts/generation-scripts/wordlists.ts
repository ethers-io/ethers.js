'use strict';

import fs from "fs";
import { resolve } from "path";

import { saveTests, TestCase } from "..";

const testcases: Array<TestCase.Wordlist> = [];

["cz", "en", "es", "fr", "it", "ja", "ko", "zh_cn", "zh_tw"].forEach((locale) => {
   let content = fs.readFileSync(resolve(__dirname, "../../input/wordlists", "lang-" + locale + ".txt")).toString();
    testcases.push({
        content: content,
        locale: locale
    })
});

saveTests("wordlists", testcases);
