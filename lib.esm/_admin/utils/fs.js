import fs from "fs";
import { resolve } from "./path.js";
export function atomicWrite(path, value) {
    const tmp = resolve(".atomic-tmp");
    fs.writeFileSync(tmp, value);
    fs.renameSync(tmp, path);
}
//# sourceMappingURL=fs.js.map