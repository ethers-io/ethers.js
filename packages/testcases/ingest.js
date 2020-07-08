"use strict";

const fs = require("fs");
const { resolve } = require("path");

const { saveTests } = require("./lib/index");

function ingest(tag) {
    const data = JSON.parse(fs.readFileSync(resolve(__dirname, "input", tag + ".json")).toString());
    saveTests(tag, data);
}

ingest("bignumber")
