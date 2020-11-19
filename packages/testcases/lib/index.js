'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var disk_utils_1 = require("./disk-utils");
exports.loadData = disk_utils_1.loadData;
exports.loadTests = disk_utils_1.loadTests;
exports.saveTests = disk_utils_1.saveTests;
var random_1 = require("./random");
exports.randomBytes = random_1.randomBytes;
exports.randomHexString = random_1.randomHexString;
exports.randomNumber = random_1.randomNumber;
var TestCase = __importStar(require("./testcases"));
exports.TestCase = TestCase;
//# sourceMappingURL=index.js.map