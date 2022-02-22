'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const hethers = require('hethers');
const testcases = [];

const mnemonics = {
    '15db397ed5f682acb22b0afc6c8de4cdfbda7cbc': 'debris glass rich exotic window other film slow expose flight either wealth',
    '012363d61bdc53d0290a0f25e9c89f8257550fb8': 'service basket parent alcohol fault similar survey twelve hockey cloud walk panel'
};

const inputDir = path.resolve(__dirname, "../../input/wallets");
fs.readdirSync(inputDir).forEach((filename, index) => {
   let content = fs.readFileSync(path.resolve(inputDir, filename)).toString();
   let data = JSON.parse(content);
   const comps = filename.split(".")[0].split("-");
   testcases.push({
       name: comps[1],
       type: "secret-storage",
       hasAddress: !!data.address,
       address: hethers.utils.getAddressFromAccount(`0.0.${index + 1000}`),
       alias: hethers.utils.computeAlias("0x" + comps[3]),
       privateKey: ("0x" + comps[3]),
       mnemonic: (mnemonics[comps[2]] || null),
       password: comps[4],
       json: content
   });
});

saveTests1("wallets", testcases);

function saveTests1(tag, data) {
    let filename = path.resolve(__dirname, '../../testcases', tag + '.json.gz');

    fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(data, undefined, ' ') + '\n'));

    console.log('Save testcase: ' + filename);
}