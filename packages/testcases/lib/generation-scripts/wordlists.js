'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var __1 = require("..");
var testcases = [];
["cz", "en", "es", "fr", "it", "ja", "ko", "zh_cn", "zh_tw"].forEach(function (locale) {
    var content = fs_1.default.readFileSync(path_1.resolve(__dirname, "../../input/wordlists", "lang-" + locale + ".txt")).toString();
    testcases.push({
        content: content,
        locale: locale
    });
});
__1.saveTests("wordlists", testcases);
