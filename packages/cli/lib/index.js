"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cli = __importStar(require("./cli"));
exports.cli = cli;
var prompt = __importStar(require("./prompt"));
exports.prompt = prompt;
var solc = __importStar(require("./solc"));
exports.solc = solc;
var typescript = __importStar(require("./typescript"));
exports.typescript = typescript;
//# sourceMappingURL=index.js.map