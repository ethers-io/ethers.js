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
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("../build");
const log_1 = require("../log");
const path_1 = require("../path");
const utils_1 = require("../utils");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        process.argv.slice(2).forEach((arg) => {
            console.log(log_1.colorify.bold("Setting Option:"), arg);
            switch (arg) {
                case "esm":
                    (0, build_1.setupBuild)(true);
                    break;
                case "cjs":
                    (0, build_1.setupBuild)(false);
                    break;
                // This will remove the browser field entirely, so make sure
                // to set esm of cjs first as they will restore the browser
                // field
                case "browser-lang-all": {
                    const filename = (0, path_1.getPackageJsonPath)("wordlists");
                    const info = (0, utils_1.loadJson)(filename);
                    delete info.browser;
                    (0, utils_1.saveJson)(filename, info, true);
                    break;
                }
                default:
                    throw new Error(`Unknown option: ${JSON.stringify(arg)}`);
            }
        });
    });
})().catch((error) => {
    console.log(`Error running ${process.argv[0]}: ${error.message}`);
    process.exit(1);
});
