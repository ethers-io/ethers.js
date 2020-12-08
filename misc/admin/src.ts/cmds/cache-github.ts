import { config } from "../config";
import { syncIssues } from "../github";

(async function() {
    const user = await config.get("github-user");
    const password = await config.get("github-readonly");
    await syncIssues(user, password);
})();
