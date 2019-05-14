"use stricT";

const depgraph = require("../depgraph");
const { log } = require("../log");
const { loadJson, resolve, saveJson } = require("../utils");

(async function() {
    log(`<bold:Updating dependency-graph build order (tsconfig.project.json)...>`);
    let ordered = depgraph.getOrdered(true);

    let path = resolve("tsconfig.project.json")

    let projectConfig = loadJson(path);
    projectConfig.references = ordered.map((name) => ({ path: ("./packages/" + name) }));
    saveJson(path, projectConfig);
})();
