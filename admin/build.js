"use strict";

const fs = require("fs");
const resolve = require("path").resolve;
const spawn = require("child_process").spawn;

const { dirnames } = require("./local");
const { loadPackage, savePackage } = require("./local");
const { loadJson, saveJson } = require("./utils");

function run(progname, args, ignoreErrorStream) {
    return new Promise((resolve, reject) => {
        const proc = spawn(progname, args);

        let stdout = Buffer.from([]);
        let stderr = Buffer.from([]);

        proc.stdout.on("data", (data) => {
            stdout = Buffer.concat([ stdout, data ]);
        });

        proc.stderr.on("data", (data) => {
            stderr = Buffer.concat([ stdout, data ]);
        });

        proc.on("error", (error) => {
            console.log("ERROR");
            console.log(stderr.toString());
            error.stderr = stderr.toString();
            error.stdout = stdout.toString();
            reject(error);
        });

        proc.on("close", (code) => {
            if ((stderr.length && !ignoreErrorStream) || code !== 0) {
                console.log("ERROR");
                console.log(stderr.toString());

                let error = new Error(`stderr not empty: ${ progname } ${ JSON.stringify(args) }`);
                error.stderr = stderr.toString();
                error.stdout = stdout.toString();
                error.statusCode = code;
                reject(error);
            } else {
                resolve(stdout.toString());
            }
        });
    });
}

function setupConfig(outDir, moduleType, targetType) {

    // Configure the tsconfit.package.json...
    const path = resolve(__dirname, "../tsconfig.package.json");
    const content = loadJson(path);
    content.compilerOptions.module = moduleType;
    content.compilerOptions.target = targetType;
    saveJson(path, content);

    // Configure the browser field for every pacakge, copying the
    // browser.umd filed for UMD and browser.esm for ESM
    dirnames.forEach((dirname) => {
        let info = loadPackage(dirname);

        if (info._ethers_nobuild) { return; }

        if (targetType === "es2015") {
            if (info["browser.esm"]) {
                info.browser = info["browser.esm"];
            }
        } else if (targetType === "es5") {
            if (info["browser.umd"]) {
                info.browser = info["browser.umd"];
            }
        } else {
            throw new Error("unsupported target");
        }
        savePackage(dirname, info);

        let path = resolve(__dirname, "../packages", dirname, "tsconfig.json");
        let content = loadJson(path);
        content.compilerOptions.outDir = outDir;
        saveJson(path, content);
    });
}

function setupBuild(buildModule) {
    if (buildModule) {
        setupConfig("./lib.esm/", "es2015", "es2015");
    } else {
        setupConfig("./lib/", "commonjs", "es5");
    }
}

function runBuild(buildModule) {
    setupBuild(buildModule);

    // Compile
    return run("npx", [ "tsc", "--build", resolve(__dirname, "../tsconfig.project.json"), "--force" ]);
}

function runDist() {
    return run("npm", [ "run", "_dist" ], true);
}

module.exports = {
    run: run,
    runDist: runDist,
    runBuild: runBuild,
    setupBuild: setupBuild
};
