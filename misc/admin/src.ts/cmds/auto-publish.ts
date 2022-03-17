import {getLatestRelease, deleteRelease, createRelease} from "../github";
import { publishAll, getPublishOptions } from "../npm";
import {exec} from "child_process";

(async function() {
    const {publishNames} = await getPublishOptions();
    await publishAll('auto');
    if (publishNames.indexOf("hethers") >= 0) {
        let latestRelease = await getLatestRelease('auto');

        if (latestRelease && latestRelease.prerelease) {
            await deleteRelease(latestRelease.id.toString(), 'auto');

            const { tag_name } = latestRelease;

            // Delete the tag:
            await exec(`git push --delete origin ${tag_name}`);

            // Recreate the tag:
            await exec(`git tag ${tag_name}`);
            await exec(`git push origin --tags`);
        }

        await createRelease('auto');
    }
})();
