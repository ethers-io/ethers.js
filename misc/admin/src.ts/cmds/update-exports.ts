"use strict";

import fs from "fs";

import { colorify } from "../log";
import { resolve } from "../path";

const sourceEthers = fs.readFileSync(resolve("packages/ethers/src.ts/ethers.ts")).toString();
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
    ${ targets }
} from "./ethers";
`;

////////////////////
// End template
////////////////////

console.log(colorify.bold(`Flattening exports...`))

fs.writeFileSync(resolve("packages/ethers/src.ts/index.ts"), output);
