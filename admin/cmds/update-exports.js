"use strict";

const fs = require("fs");
const { resolve } = require("path");

const sourceEthers = fs.readFileSync(resolve(__dirname, "../../packages/ethers/src.ts/ethers.ts")).toString();
const targets = sourceEthers.match(/export\s*{\s*((.|\s)*)}/)[1].trim();

const output = `"use strict";

// To modify this file, you must update ./admin/cmds/update-exports.js

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

fs.writeFileSync(resolve(__dirname, "../../packages/ethers/src.ts/index.ts"), output);
