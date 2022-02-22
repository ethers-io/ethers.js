"use strict";

import fs from "fs";

import { colorify } from "../log";
import { resolve } from "../path";

const sourceEthers = fs.readFileSync(resolve("packages/hethers/src.ts/hethers.ts")).toString();
const targets = sourceEthers.match(/export\s*{\s*((.|\s)*)}/)[1].trim();

////////////////////
// Begin template
////////////////////

const output = `"use strict";

// To modify this file, you must update ./misc/admin/lib/cmds/update-exports.js

import * as hethers from "./hethers";

try {
    const anyGlobal = (window as any);

    if (anyGlobal._hethers == null) {
        anyGlobal._hethers = hethers;
    }
} catch (error) { }

export { hethers };

export {
    ${ targets }
} from "./hethers";
`;

////////////////////
// End template
////////////////////

console.log(colorify.bold(`Flattening exports...`))

fs.writeFileSync(resolve("packages/hethers/src.ts/index.ts"), output);
