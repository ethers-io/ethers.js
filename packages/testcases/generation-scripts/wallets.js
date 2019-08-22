'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var __1 = require("..");
var testcases = [];
var mnemonics = {
    '15db397ed5f682acb22b0afc6c8de4cdfbda7cbc': 'debris glass rich exotic window other film slow expose flight either wealth',
    '012363d61bdc53d0290a0f25e9c89f8257550fb8': 'service basket parent alcohol fault similar survey twelve hockey cloud walk panel'
};
var inputDir = path_1.resolve(__dirname, "../input/wallets");
fs_1.default.readdirSync(inputDir).forEach(function (filename) {
    var content = fs_1.default.readFileSync(path_1.resolve(inputDir, filename)).toString();
    var data = JSON.parse(content);
    var comps = filename.split(".")[0].split("-");
    testcases.push({
        name: comps[1],
        type: (data.ethaddr ? "crowdsale" : "secret-storage"),
        hasAddress: !!data.address,
        address: ("0x" + comps[2]),
        privateKey: ("0x" + comps[3]),
        mnemonic: (mnemonics[comps[2]] || null),
        password: comps[4],
        json: content
    });
});
__1.saveTests("wallets", testcases);
