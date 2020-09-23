"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const fs_1 = __importDefault(require("fs"));
const local = __importStar(require("./local"));
const log_1 = require("./log");
const npm = __importStar(require("./npm"));
const path_1 = require("./path");
const utils_1 = require("./utils");
const changelogPath = path_1.resolve("CHANGELOG.md");
function generate() {
    return __awaiter(this, void 0, void 0, function* () {
        const lines = fs_1.default.readFileSync(changelogPath).toString().trim().split("\n");
        const versions = Object.keys(lines.reduce((accum, line) => {
            const match = line.match(/^ethers\/v([^ ]*)/);
            if (match) {
                accum[match[1]] = true;
            }
            return accum;
        }, {}));
        const version = local.getPackage("ethers").version;
        ;
        const publishedVersion = (yield npm.getPackage("ethers")).version;
        console.log(versions, version, publishedVersion);
        if (versions.indexOf(version) >= 0) {
            const line = `Version ${version} already in CHANGELOG. Please edit before committing.`;
            console.log(log_1.colorify.red(utils_1.repeat("=", line.length)));
            console.log(log_1.colorify.red(line));
            console.log(log_1.colorify.red(utils_1.repeat("=", line.length)));
        }
    });
}
exports.generate = generate;
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield generate();
    });
})();
