"use strict";

const { prompt } = require("../../packages/cli");
const config = require("../config");

if (process.argv.length !== 3) {
    console.log("Usage: set-config KEY");
    process.exit(1);
}

const key = process.argv[2];

(async function() {
    const value = await prompt.getPassword("Value: ");
    await config.set(key, value);
})();
