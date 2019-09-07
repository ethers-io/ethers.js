"use strict";

const fs = require("fs");
const { resolve } = require("path");

const sourceEthers = fs.readFileSync(resolve(__dirname, "../../packages/ethers/src.ts/ethers.ts")).toString();
const targets = sourceEthers.match(/export\s*{\s*((.|\s)*)}/)[1].trim();

const output = `"use strict";

import * as ethers from "./ethers";

export { ethers };

export {
    ${ targets }
} from "./ethers";
`;

fs.writeFileSync(resolve(__dirname, "../../packages/ethers/src.ts/index.ts"), output);
