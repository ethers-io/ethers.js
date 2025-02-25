
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

    // Mocha
    copy(resolve("node_modules/mocha/mocha.css"),
      resolve("output/karma/mocha.css"));
    copy(resolve("node_modules/mocha/mocha.js"),
      resolve("output/karma/mocha.js"));

    // Shims
    copy(resolve("packages/shims/dist/index.js"),
      resolve("output/karma/shims.js"));

    // ESM library and tests
    copy(resolve("misc/testing/test-esm.html"),
      resolve("output/karma/test-esm.html"));
    copy(resolve("packages/ethers/dist/ethers.esm.js"),
      resolve("output/karma/ethers.esm.js"));
    copy(resolve("packages/tests/dist/tests.esm.js"),
      resolve("output/karma/tests.esm.js"), (data) => {
        return data.replace(/^(import [^;]* from ')(ethers)(';)/, (all, prefix, id, suffix) => {
            return prefix + "./ethers.esm.js" + suffix;
        });
    });

    // UMD library and tests
    copy(resolve("misc/testing/test-umd.html"),
      resolve("output/karma/test-umd.html"));
    copy(resolve("packages/ethers/dist/ethers.umd.js"),
      resolve("output/karma/ethers.umd.js"));
    copy(resolve("packages/tests/dist/tests.umd.js"),
      resolve("output/karma/tests.umd.js"));
})();
