'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var browserify_zlib_1 = __importDefault(require("browserify-zlib"));
var data = __importStar(require("./browser-fs.json"));
function loadTests(tag) {
    var filename = 'testcases/' + tag + ".json.gz";
    console.log("loading:", filename);
    return JSON.parse(browserify_zlib_1.default.gunzipSync(new Buffer(data[filename], "base64")).toString());
}
exports.loadTests = loadTests;
function loadData(filename) {
    // Strip any leading relative paths (e.g. "./foo" => "foo")
    filename = path_1.default.join(filename);
    console.log("loading:", filename);
    return new Buffer(data[filename], "base64");
}
exports.loadData = loadData;
