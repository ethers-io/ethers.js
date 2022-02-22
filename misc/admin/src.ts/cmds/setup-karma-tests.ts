
import fs from "fs";

import { resolve } from "../path";
import { mkdir } from "../utils";

function copy(src: string, dst: string, transform?: (data: string) => string): void {
    let data = fs.readFileSync(resolve(src));
    if (transform) {
        data = Buffer.from(transform(data.toString()));
    }
    fs.writeFileSync(dst, data);
}

(async function() {
    await mkdir(resolve("output/karma"));

    copy(resolve("packages/hethers/dist/hethers.esm.js"), resolve("output/karma/hethers.esm.js"));
    copy(resolve("packages/tests/dist/tests.esm.js"), resolve("output/karma/tests.esm.js"), (data) => {
        return data.replace(/^(import [^;]* from ')(hethers)(';)/, (all, prefix, id, suffix) => {
            return prefix + "./hethers.esm.js" + suffix;
        });
    });

    copy(resolve("packages/hethers/dist/hethers.umd.js"), resolve("output/karma/hethers.umd.js"));
    copy(resolve("packages/tests/dist/tests.umd.js"), resolve("output/karma/tests.umd.js"));
})();
