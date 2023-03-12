import { getChanges } from "./utils/changelog.js";
import { getDateTime } from "./utils/date.js";
import { resolve } from "./utils/path.js";
import { run } from "./utils/run.js";
import { getVersions } from "./utils/npm.js";


const version = process.argv[2] || null;

(async function() {

    // Get the change from the CHANGELOG
    const changes = getChanges();
    const change = version ? changes.filter((c) => (c.version === version))[0]: changes.shift();
    if (change == null) { throw new Error(`version not found: ${ version }`); }
    console.log(change);

    // Find the gitHead and release date
    const versions = await getVersions("ethers");
    const ver = versions.filter((c) => (c.version === change.version))[0];
    if (ver == null) { throw new Error(`no npm version found: ${ change.version }`); }
    console.log(ver);

    const title = `${ change.title.split("(")[0].trim() } (${ getDateTime(new Date(ver.date) ) })`;

    const args = [
        "release", "create", `v${ change.version }`,
//        "--draft", // DEBUGGING
        "--title", title,
        "--target", ver.gitHead,
        "--notes", change.body.join("\n"),
    ];
    console.log(args);
    const result = await run("gh", args, resolve("."));
    console.log("Published");
    console.log(`See: ${ (result.stdout || "").trim() }`);
})().catch((e) => {
    console.log("ERROR");
    console.log(e);
});
