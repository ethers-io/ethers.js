"use strict";

const fs = require("fs");
const resolve = require("path").resolve;
const spawn = require("child_process").spawn;

const local = require("./local");

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

                let error = new Error("stderr not empty");
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

function runBuild() {
    return run("npx", [ "tsc", "--build", resolve(__dirname, "../tsconfig.project.json") ]);
}

function runDist() {
    return run("npx", [ "lerna", "run", "dist" ], true);
}

module.exports = {
    run: run,
    runDist: runDist,
    runBuild: runBuild
};
