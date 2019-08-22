'use strict';

import fs from "fs";
import { resolve } from "path";

import { saveTests, TestCase } from "..";

const testcases: Array<TestCase.Wallet> = [];

const mnemonics: { [ address: string ]: string } = {
    '15db397ed5f682acb22b0afc6c8de4cdfbda7cbc': 'debris glass rich exotic window other film slow expose flight either wealth',
    '012363d61bdc53d0290a0f25e9c89f8257550fb8': 'service basket parent alcohol fault similar survey twelve hockey cloud walk panel'
};

const inputDir = resolve(__dirname, "../input/wallets");
fs.readdirSync(inputDir).forEach((filename) => {
   let content = fs.readFileSync(resolve(inputDir, filename)).toString();
   let data = JSON.parse(content);
   const comps = filename.split(".")[0].split("-");
   testcases.push({
       name: comps[1],
       type: (data.ethaddr ? "crowdsale": "secret-storage"),
       hasAddress: !!data.address,
       address: ("0x" + comps[2]),
       privateKey: ("0x" + comps[3]),
       mnemonic: (mnemonics[comps[2]] || null),
       password: comps[4],
       json: content
   });
});

saveTests("wallets", testcases);

