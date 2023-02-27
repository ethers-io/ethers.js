import { getVersions } from "./utils/npm.js";
import { resolve } from "./utils/path.js";
import { getDiff } from "./utils/git.js";
(async function () {
    let versions = await getVersions("ethers");
    versions = versions.filter((h) => (h.version.match(/^6\.[0-9]+\.[0-9]+$/)));
    for (let i = 1; i < versions.length; i++) {
        const tag0 = versions[i - 1].gitHead, tag1 = versions[i].gitHead;
        const diff = await getDiff(resolve("dist/ethers.js"), tag0, tag1);
        console.log(diff);
    }
})();
//# sourceMappingURL=generate-diffs.js.map