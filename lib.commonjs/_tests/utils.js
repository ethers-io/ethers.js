"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.loadTests = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
// Find the package root (based on the nyc output/ folder)
const root = (function () {
    let root = process.cwd();
    while (true) {
        if (fs_1.default.existsSync(path_1.default.join(root, "output"))) {
            return root;
        }
        const parent = path_1.default.join(root, "..");
        if (parent === root) {
            break;
        }
        root = parent;
    }
    throw new Error("could not find root");
})();
// Load the tests
function loadTests(tag) {
    const filename = path_1.default.resolve(root, "testcases", tag + ".json.gz");
    return JSON.parse(zlib_1.default.gunzipSync(fs_1.default.readFileSync(filename)).toString());
}
exports.loadTests = loadTests;
function log(context, text) {
    if (context && context.test && typeof (context.test._ethersLog) === "function") {
        context.test._ethersLog(text);
    }
    else {
        console.log(text);
    }
}
exports.log = log;
//# sourceMappingURL=utils.js.map