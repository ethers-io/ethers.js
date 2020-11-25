
import { computeTarballHash, updateJson } from "../local";
import { colorify, getProgressBar } from "../log";
import { dirnames, getPackageJsonPath } from "../path";

(async function() {
    const progress = getProgressBar(colorify.bold("Updating package.json hashes"));

    // Updating all tarball hashes now that versions have been updated
    for (let i = 0; i < dirnames.length; i++) {
        progress(i / dirnames.length);

        const dirname = dirnames[i];

        //const gitHead = await getGitTag(resolve("packages", dirname));
        const tarballHash = computeTarballHash(dirname);

        updateJson(getPackageJsonPath(dirname), { tarballHash }, true);
    }

    progress(1);

})().catch((error) => {
    console.log(error);
    process.exit(1);
});;

