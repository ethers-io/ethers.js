import {getLatestRelease} from "../github";
import {bumpVersions} from "./bump-version-type";

(async function() {
    let latestRelease = await getLatestRelease('auto');
    if (latestRelease && latestRelease.prerelease) {
        let name = latestRelease.name.toLowerCase();

        if (name.includes('minor')) {
            await bumpVersions('minor');
        }
        else if (name.includes('major')) {
            await bumpVersions('major');
        }
    }
})();
