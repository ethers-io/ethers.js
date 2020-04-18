"use strict";

import path from "path";

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

import { terser } from "rollup-plugin-terser";

import { createFilter } from 'rollup-pluginutils';

function Replacer(basePath, options = {}) {
    const filter = createFilter(options.include, options.exclude);
    const suffixes = Object.keys(options.replace);
    const pathUp = path.resolve(basePath, "..");
    return {
        name: "file-replacer",
        transform(code, id) {
            /*
            console.log("------");
            console.log("NAME", id, id.match("node-resolve:empty.js$"));
            console.log(code);
            console.log("------");
            */

            if (!filter(id)) { return null; }

            for (let i = 0; i < suffixes.length; i++) {
                const suffix = suffixes[i];
                if (id.match(new RegExp(suffix))) {
                    const newCode = options.replace[suffix];
                    console.log(`Replace: ${ id.substring(pathUp.length + 1) } (${ code.length } => ${ newCode.length })`);
                    return {
                        code: newCode,
                        map: { mappings: '' }
                    };
                }

            }

            if (id.substring(0, basePath.length) !== basePath) {
                console.log(`Keep:    ${ id.substring(pathUp.length + 1) }`);
            }

            return null;
        }
    };
}

const undef = "module.exports = undefined;";
const empty = "module.exports = {};";
const brorand = "module.exports = function(length) { var result = new Uint8Array(length); (global.crypto || global.msCrypto).getRandomValues(result); return result; }";

const ellipticPackage = (function() {
    const ellipticPackage = require('./node_modules/elliptic/package.json');
    return JSON.stringify({ version: ellipticPackage.version });
})();

function getConfig(minify, buildModule, testing) {
    let input = "packages/ethers/lib/index.js"
    let output = [ "umd" ];
    let format = "umd";
    let mainFields = [ "browser", "main" ];

    if (buildModule) {
        input = "packages/ethers/lib.esm/index.js";
        output = [ "esm" ];
        format = "esm";
        mainFields = [ "browser", "module", "main" ];
    }

    const replacer = Replacer(path.resolve("packages"), {
        replace: {
            // Remove the precomputed secp256k1 points
            "elliptic/lib/elliptic/precomputed/secp256k1.js$": undef,

            // Remove curves we don't care about
            "elliptic/curve/edwards.js$": empty,
            "elliptic/curve/mont.js$": empty,
            "elliptic/lib/elliptic/eddsa/.*$": empty,

            // We only use the version from this JSON package
            "elliptic/package.json$" : ellipticPackage,

            // Remove unneeded hashing algorithms
            "hash.js/lib/hash/sha/1.js$": empty,
            "hash.js/lib/hash/sha/224.js$": empty,
            "hash.js/lib/hash/sha/384.js$": empty,

            // Swap out borland for the random bytes we already have
            "brorand/index.js$": brorand,
        }
    });

    const plugins = [
        replacer,
        json(),
        resolve({
            mainFields: mainFields
        }),
        commonjs({
            namedExports: {
                "bn.js": [ "BN" ],
                "hash.js": [ "hmac", "ripemd160", "sha256", "sha512" ],
                "elliptic": [ "ec" ],
                "scrypt-js": [ "scrypt", "syncScrypt" ],
            },
        }),
    ];

    if (minify) {
        output.push("min");
        plugins.push(terser());
    }

    const outputFile = [
        "packages",
        (testing ? "tests": "ethers"),
        ("/dist/ethers." + output.join(".") + ".js")
    ].join("/");

    return {
      input: input,
      output: {
        file: outputFile,
        format: format,
        name: "ethers",
        exports: "named"
      },
      context: "window",
      treeshake: false,
      plugins: plugins
  };
}

export default commandLineArgs => {
    const testing = commandLineArgs.configTest;
    const buildModule = commandLineArgs.configModule;

    return [
        getConfig(false, buildModule, testing),
        getConfig(true, buildModule, testing),
    ];
}
