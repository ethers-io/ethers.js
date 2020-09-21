"use strict";

const { major } = require("semver");

// This should be used like `node npm-skip-node8 || COMMAND`.
// - If node 8, this script returns true, skipping COMMAND
// - Otherwise, return false, running COMMAND

if (major(process.version) > 8) {
    // Node >8; return "false" (wrt to shell scripting)
    process.exit(1);
} else {
    // Node 8; return "true" (wrt to shell scripting)
    process.exit(0);
}

