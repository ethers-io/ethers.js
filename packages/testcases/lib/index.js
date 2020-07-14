'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var browserify_zlib_1 = __importDefault(require("browserify-zlib"));
var random_1 = require("./random");
exports.randomBytes = random_1.randomBytes;
exports.randomHexString = random_1.randomHexString;
exports.randomNumber = random_1.randomNumber;
function saveTests(tag, data) {
    //let filename = path.resolve(__dirname, 'testcases', tag + '.json.gz');
    var filename = path_1.default.resolve(__dirname, '../testcases', tag + '.json.gz');
    fs_1.default.writeFileSync(filename, browserify_zlib_1.default.gzipSync(JSON.stringify(data, undefined, ' ') + '\n'));
    console.log('Save testcase: ' + filename);
}
exports.saveTests = saveTests;
function loadTests(tag) {
    var filename = path_1.default.resolve(__dirname, '../testcases', tag + '.json.gz');
    return JSON.parse(browserify_zlib_1.default.gunzipSync(fs_1.default.readFileSync(filename)).toString());
}
exports.loadTests = loadTests;
function loadData(filename) {
    return fs_1.default.readFileSync(path_1.default.resolve(__dirname, filename));
}
exports.loadData = loadData;
//# sourceMappingURL=index.js.map