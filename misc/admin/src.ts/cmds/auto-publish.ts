import {getLatestRelease, deleteRelease, createRelease} from "../github";
import { publishAll, getPublishOptions } from "../npm";

(async function() {
    const {publishNames} = await getPublishOptions();
    await publishAll('auto');
    if (publishNames.indexOf("hethers") >= 0) {
        let latestRelease = await getLatestRelease('auto');

        if (latestRelease && latestRelease.prerelease) {
            await deleteRelease(latestRelease.id.toString(), 'auto');
        }

        await createRelease('auto');
    }
})();
