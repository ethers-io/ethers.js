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
Object.defineProperty(exports, "__esModule", { value: true });
/** bundle-testcases
 *
 * This sript converts all the testase data (including needed
 * text files) into a single JSON file.
 *
 * All gzip files (mostly .json.gz) are decompressed and recompressed
 * using deflate, so a much more simple deflate library can be used.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const zlib_1 = __importDefault(require("zlib"));
const log_1 = require("../log");
const path_2 = require("../path");
const utils_1 = require("../utils");
const config = {
    dirs: [
        "./input/easyseed-bip39",
        "./testcases",
        "./input/wordlists"
    ]
};
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(log_1.colorify.bold(`Bundling Testcase Data...`));
        const data = { "_": JSON.stringify({ name: "browser-fs", config: config }) };
        config.dirs.forEach((dirname) => {
            let fulldirname = (0, path_2.resolve)("packages/testcases", dirname);
            fs_1.default.readdirSync(fulldirname).forEach((filename) => {
                const key = (0, path_1.join)(dirname, filename);
                const content = fs_1.default.readFileSync((0, path_1.join)(fulldirname, filename));
                if (filename.split(".").pop() === "gz") {
                    const contentData = zlib_1.default.gunzipSync(content);
                    data[key] = String(contentData.length) + "," + zlib_1.default.deflateRawSync(contentData).toString("base64");
                }
                else {
                    data[key] = content.toString("base64");
                }
                //console.log(`  - Added ${ key } (${ data[key].length } bytes)`);
            });
        });
        (0, utils_1.mkdir)((0, path_2.resolve)("packages/testcases/lib"));
        (0, utils_1.mkdir)((0, path_2.resolve)("packages/testcases/lib._esm"));
        (0, utils_1.mkdir)((0, path_2.resolve)("packages/testcases/lib.esm"));
        // We write it out to all needed places
        fs_1.default.writeFileSync((0, path_2.resolve)("packages/testcases/lib/browser-data.json"), JSON.stringify(data));
        fs_1.default.writeFileSync((0, path_2.resolve)("packages/testcases/lib._esm/browser-data.json"), JSON.stringify(data));
        fs_1.default.writeFileSync((0, path_2.resolve)("packages/testcases/lib.esm/browser-data.json"), JSON.stringify(data));
        // Write it to the TypeScript source last, in case it is running it will
        // be regenerated overwriting the above files, but with identical content
        fs_1.default.writeFileSync((0, path_2.resolve)("packages/testcases/src.ts/browser-data.json"), JSON.stringify(data));
    });
})();
