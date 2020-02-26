"use strict";

import path from "path"
import fs from "fs";

import builtins from '@erquhart/rollup-plugin-node-builtins';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import _globals from "rollup-plugin-node-globals";

const undef = "module.exports = undefined;";
const empty = "module.exports = {};";

import { createFilter } from 'rollup-pluginutils';

function replacer(libPath, options = {}) {
    const filter = createFilter(options.include, options.exclude);

    return {
        name: "file-replacer",
        resolveId(id, importee) {
            if (id == "ethers") {
                return path.resolve(importee.match(/^(.*\/packages\/)/)[1], `./tests/${ libPath }/browser-ethers.js`);
            }
            //return null;
        },
        transform(code, id) {
            if (id.match(/\/browser-fs\.json$/)) {
                const config = JSON.parse(code);
                const data = { "_": { name: "browser-fs", config: config } };
                config.dirs.forEach((dirname) => {
                    let fulldirname = path.resolve(path.dirname(id), "..", dirname);
                    fs.readdirSync(fulldirname).forEach((filename) => {
                        const key = path.join(dirname, filename);
                        const content = fs.readFileSync(path.resolve(fulldirname, filename));
                        data[key] = content.toString("base64");
                        console.log(`Added ${ key } (${ content.length } bytes)`);
                    });
                });

                return {
                     code: JSON.stringify(data),
                     map: { mappings: '' }
                };
            }

            return null;
        }
    };
}

export default commandLineArgs => {
    let buildModule = commandLineArgs.configModule;

    let input = "./packages/tests/lib/index.js"
    let format = "umd";
    let mainFields = [ "browser", "main" ];
    let libPath = "lib";

    if (buildModule) {
        input = "./packages/tests/lib.esm/index.js";
        format = "esm";
        mainFields = [ "browser", "module", "main" ];
        libPath = "lib.esm";
    }

    const plugins = [
        replacer(libPath),
        json(),
        commonjs({ }),
        builtins(),
        resolve({
            mainFields: mainFields
        }),
        _globals(),
    ];

    return {
      input: input,
      output: {
        file: ("./packages/tests/dist/tests." + format + ".js"),
        format: format,
        name: "testing"
      },
      treeshake: false,
      plugins: plugins
  };
}
