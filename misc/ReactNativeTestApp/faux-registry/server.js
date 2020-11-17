"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const { createServer } = require("http");
const { URL } = require("url");
const { resolve } = require("path");

const http = require("http");
const https = require("https");

const PORT = 8043;

function getPath(...path) {
    return resolve(__dirname, "../../../", ...path);
}

function loadJson(filename) {
    return JSON.parse(fs.readFileSync(filename).toString());
}

function getPackageInfo(name) {
    const info = loadJson(getPath("packages", name, "package.json"));

    // Create the npm packaged tarball
    const child = spawnSync("npm", [ "pack", getPath("packages", name), "--json" ], { cwd: resolve(__dirname) });
    if (child.status !== 0) { throw new Error("npm pack failed"); }
    const filename = JSON.parse(child.stdout.toString())[0].filename;

    info.dist = {
        tarball: `http:/\/localhost:${ PORT }/__packages__/${ filename }`
    };
    info.maintainers = [ info.author ];

    const versions = { };
    versions[info.version] = info;

    const time = { };
    time[info.version] = "2020-11-17T00:00:00.000Z";

    return JSON.stringify({
        "dist-tags": { latest: info.version },
        name: info.name,

        readmeFilename: "README.md",
        readme: "README",

        author: info.author,
        _id: info.name,
        bugs: info.bugs,
        description: info.description,
        homepage: info.homepage,
        license: info.license,
        repository: info.repository,
        maintainers: info.maintainers,

        time: time,
        versions: versions,
    });
}

async function readStream(stream) {
    let data = Buffer.alloc(0);
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => {
            data = Buffer.concat([ data, chunk ]);
        });

        stream.on("end", () => {
            resolve(data);
        });

        stream.on("error", (error) => {
            reject(error);
        });
    });
}

async function forwardRequest(req) {
    const newReq = new URL(req.url, "https:/\/registry.npmjs.org");
    newReq.method = req.method;

    let body = null;
    if (req.method === "POST") {
        body = await readStream(req);
    }

    return new Promise((resolve, reject) => {
        const req = https.request(newReq, (resp) => {
            readStream(resp).then(resolve, reject);
        });

        req.on("error", (error) => {
            reject(error);
        });

        if (body != null) { req.write(body); }

        req.end();
    });
}

const server = createServer(async (req, resp) => {
    const method = req.method;
    const url = new URL(req.url, `http:/\/localhost:${ PORT }`);
    const packageName = (url.pathname ? url.pathname: "/").substring(1).replace(/%([0-9a-f][0-9a-f])/ig, (all, escape) => {
        return String.fromCharCode(parseInt(escape, 16));
    });

    let result = null;
    if (packageName === "ethers") {
        result = getPackageInfo("ethers");
        console.log(`Using local ${ packageName }...`);
    } else if (packageName.split("/")[0] === "@ethersproject") {
        result = getPackageInfo(packageName.split("/").pop());
        console.log(`Using local ${ packageName }...`);
    } else if (packageName.split("/")[0] === "__packages__") {
        const filename = packageName.split("/").pop();
        result = fs.readFileSync(resolve(__dirname, filename));
        console.log(`Using local ${ filename }...`);
    } else {
        result = await forwardRequest(req);
    }

    resp.write(result);
    resp.end();
});

server.listen(PORT, () => {
    console.log(`Started faux-registry on ${ PORT }...`);
});
