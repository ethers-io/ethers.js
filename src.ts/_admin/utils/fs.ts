import fs from "fs";

import { resolve } from "./path.js";

export function atomicWrite(path: string, value: string | Uint8Array): void {
    const tmp = resolve(".atomic-tmp");
    fs.writeFileSync(tmp, value);
    fs.renameSync(tmp, path);
}
