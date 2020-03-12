"use strict";

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

import { terser } from "rollup-plugin-terser";

import { createFilter } from 'rollup-pluginutils';

function Replacer(options = {}) {
    const filter = createFilter(options.include, options.exclude);
    let suffixes = Object.keys(options.replace);
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
                    let newCode = options.replace[suffix];
                    console.log(`Replace: ${ id } (${ code.length } => ${ newCode.length })`);
                    return {
                        code: newCode,
                        map: { mappings: '' }
                    };
                }
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

export default commandLineArgs => {
    let minify = commandLineArgs.configMinify;
    let buildModule = commandLineArgs.configModule;
    let testing = commandLineArgs.configTest;

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

    const replacer = Replacer({
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
                "elliptic": [ "ec" ],
                "scrypt-js": [ "scrypt", "syncScrypt" ],
            },
        }),
    ];

    if (minify) {
        output.push("min");
        plugins.push(terser());
    }

    let outputFile = (("packages/") +
                      (testing ? "tests": "ethers") +
                      ("/dist/ethers." + output.join(".") + ".js"));

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
