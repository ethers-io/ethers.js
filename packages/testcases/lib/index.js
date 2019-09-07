'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var browserify_zlib_1 = __importDefault(require("browserify-zlib"));
var bytes_1 = require("@ethersproject/bytes");
var keccak256_1 = require("@ethersproject/keccak256");
var strings_1 = require("@ethersproject/strings");
function saveTests(tag, data) {
    //let filename = path.resolve(__dirname, 'testcases', tag + '.json.gz');
    var filename = path_1.default.resolve('../testcases', tag + '.json.gz');
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
function randomBytes(seed, lower, upper) {
    if (!upper) {
        upper = lower;
    }
    if (upper === 0 && upper === lower) {
        return new Uint8Array(0);
    }
    var result = bytes_1.arrayify(keccak256_1.keccak256(strings_1.toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = bytes_1.concat([result, keccak256_1.keccak256(result)]);
    }
    var top = bytes_1.arrayify(keccak256_1.keccak256(result));
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}
exports.randomBytes = randomBytes;
function randomHexString(seed, lower, upper) {
    return bytes_1.hexlify(randomBytes(seed, lower, upper));
}
exports.randomHexString = randomHexString;
function randomNumber(seed, lower, upper) {
    var top = randomBytes(seed, 3);
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}
exports.randomNumber = randomNumber;
