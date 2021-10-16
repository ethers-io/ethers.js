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
exports.getGitTag = void 0;
const run_1 = require("./run");
// Returns the most recent git commit hash for a given filename
function getGitTag(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, run_1.run)("git", ["log", "-n", "1", "--", filename]);
        if (!result.ok) {
            throw new Error(`git log error`);
        }
        let log = result.stdout.trim();
        if (!log) {
            return null;
        }
        const hashMatch = log.match(/^commit\s+([0-9a-f]{40})\n/i);
        if (!hashMatch) {
            return null;
        }
        return hashMatch[1];
    });
}
exports.getGitTag = getGitTag;
//getGitTag("/Users/ricmoo/Development/ethers/ethers.js/packages/abi").then(console.log);
