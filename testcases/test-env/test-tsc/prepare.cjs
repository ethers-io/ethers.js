const fs = require("fs");

function replace(filename, key, value) {
    let data = fs.readFileSync(filename).toString();
    data = data.replace(key, value);
    fs.writeFileSync(filename, data);
}

// moduleResolution: node, node16, nodenext
replace("tsconfig.json", "${TS_MODULE_RESOLUTION}", process.argv[2]);

// module: commonjs, es2020
replace("tsconfig.json", "${TS_MODULE}", process.argv[3]);

// type: commonjs, module
const type = (process.argv[3] === "commonjs") ? "commonjs": "module";
replace("package.json", "${PKG_TYPE}", type);

// JavaScript
fs.writeFileSync("index.ts", fs.readFileSync("js-" + type + ".ts"));
