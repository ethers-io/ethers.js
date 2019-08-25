'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var __1 = require("..");
var testcases = JSON.parse(fs_1.default.readFileSync(path_1.resolve(__dirname, "../input/nameprep-josefsson-idn.json")).toString());
__1.saveTests("nameprep", testcases);
