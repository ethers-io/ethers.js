"use strict";

const config = require("../config");
const { syncIssues } = require("../github");

(async function() {
    const user = await config.get("github-user");
    const password = await config.get("github-readonly");
    await syncIssues(user, password);
})();
