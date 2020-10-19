"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const index_1 = require("../../lib/index");
const ethers_1 = require("../../../ethers");
const TestCase = __importStar(require("../../lib/testcases"));
exports.TestCase = TestCase;
function sha256(value) {
    return crypto_1.createHash("sha256").update(value).digest();
}
const words = "lorem ipsum dolor sit amet  consectetur adipiscing elit  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua  ut enim ad minim veniam  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat  duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur  excepteur sint occaecat cupidatat non proident  sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");
class AbstractTest {
    constructor(seed) {
        this.seed = seed;
        this._seed = sha256(Buffer.from(seed));
    }
    _nextWord() {
        const result = this._seed;
        this._seed = sha256(this._seed);
        return result;
    }
    randomBytes(lower, upper) {
        if (!upper) {
            upper = lower;
        }
        if (upper === 0 && upper === lower) {
            return Buffer.alloc(0);
        }
        let result = this._nextWord();
        while (result.length < upper) {
            result = Buffer.concat([result, this._nextWord()]);
        }
        const top = this._nextWord();
        const percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
        return result.slice(0, lower + Math.floor((upper - lower) * percent));
    }
    randomFloat() {
        const top = this._nextWord();
        return ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    }
    randomInteger(lower, upper) {
        return lower + Math.floor((upper - lower) * this.randomFloat());
    }
    randomChoice(choice) {
        return choice[this.randomInteger(0, choice.length)];
    }
    randomAddress() {
        while (true) {
            const address = this.randomHexString(20);
            if (address.match(/[a-f]/i)) {
                return ethers_1.ethers.utils.getAddress(address);
            }
        }
    }
    randomHexString(lower, upper) {
        return "0x" + this.randomBytes(lower, upper).toString("hex");
    }
    randomString(lower, upper) {
        if (!upper) {
            upper = lower;
        }
        if (upper === 0 && upper === lower) {
            return "";
        }
        const length = this.randomInteger(lower, upper);
        let result = "";
        while (result.length < length + 1) {
            result += this.randomChoice(words) + " ";
        }
        return result.substring(0, length);
    }
}
exports.AbstractTest = AbstractTest;
function saveTests(tag, tests) {
    // @TODO : copy defn files over for testcase.ts and testcase.d.ts
    index_1.saveTests(tag, tests);
}
exports.saveTests = saveTests;
