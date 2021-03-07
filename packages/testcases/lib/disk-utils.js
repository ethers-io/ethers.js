"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadData = exports.loadTests = exports.saveTests = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var zlib_1 = __importDefault(require("zlib"));
function saveTests(tag, data) {
    var filename = path_1.default.resolve(__dirname, '../testcases', tag + '.json.gz');
    fs_1.default.writeFileSync(filename, zlib_1.default.gzipSync(JSON.stringify(data, undefined, ' ') + '\n'));
    console.log('Save testcase: ' + filename);
}
exports.saveTests = saveTests;
function loadTests(tag) {
    var filename = path_1.default.resolve(__dirname, '../testcases', tag + '.json.gz');
    return JSON.parse(zlib_1.default.gunzipSync(fs_1.default.readFileSync(filename)).toString());
}
exports.loadTests = loadTests;
function loadData(filename) {
    return fs_1.default.readFileSync(path_1.default.resolve(__dirname, filename));
}
exports.loadData = loadData;
//# sourceMappingURL=disk-utils.js.map