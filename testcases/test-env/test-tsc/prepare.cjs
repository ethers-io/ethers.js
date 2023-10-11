const fs = require("fs");

function replace(filename, key, value) {
    let data = fs.readFileSync(filename).toString();
    data = data.replace(key, value);
    fs.writeFileSync(filename, data);
}

// TypeScript moduleResolution: node, node16, nodenext
const tsModuleResolution = process.argv[2];

// Package module: commonjs, es2020
const pModule = process.argv[3];

// TypeScript module: node=pModule, otherwise=pModuleResolution
const tsModule = ({
    node16: "node16",
    nodenext: "nodenext"
})[tsModuleResolution] || pModule;

// Package type: commonjs, module
const pType = (pModule === "commonjs") ? "commonjs": "module";


// Replace necessary properties in tsconfig.json and package.json
replace("tsconfig.json", "${TS_MODULE_RESOLUTION}", tsModuleResolution);
replace("tsconfig.json", "${TS_MODULE}", tsModule);
replace("package.json", "${PKG_TYPE}", pType);

// JavaScript
fs.writeFileSync("index.ts", fs.readFileSync("js-" + pType + ".ts"));
