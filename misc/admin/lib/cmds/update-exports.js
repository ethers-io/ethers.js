"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const log_1 = require("../log");
const path_1 = require("../path");
const sourceEthers = fs_1.default.readFileSync((0, path_1.resolve)("packages/ethers/src.ts/ethers.ts")).toString();
const targets = sourceEthers.match(/export\s*{\s*((.|\s)*)}/)[1].trim();
////////////////////
// Begin template
////////////////////
const output = `"use strict";

// To modify this file, you must update ./misc/admin/lib/cmds/update-exports.js

import * as ethers from "./ethers";

try {
    const anyGlobal = (window as any);

    if (anyGlobal._ethers == null) {
        anyGlobal._ethers = ethers;
    }
} catch (error) { }

export { ethers };

export {
    ${targets}
} from "./ethers";
`;
////////////////////
// End template
////////////////////
console.log(log_1.colorify.bold(`Flattening exports...`));
fs_1.default.writeFileSync((0, path_1.resolve)("packages/ethers/src.ts/index.ts"), output);
