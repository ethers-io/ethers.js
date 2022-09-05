import { atomicWrite } from "./utils/fs.js";
import { resolve } from "./utils/path.js";
import { loadJson } from "./utils/json.js";

const version = loadJson(resolve("package.json")).version;

const content = `export const version = "${ version }";\n`;
atomicWrite(resolve("src.ts/_version.ts"), content);
