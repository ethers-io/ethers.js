"use strict";

import commonjs from '@rollup/plugin-commonjs';
//import inject from '@rollup/plugin-inject';
import resolveNode from "@rollup/plugin-node-resolve";

import nodePolyfills from "rollup-plugin-node-polyfills";

import json from "@rollup/plugin-json";

function getConfig(format) {

    // ESM config
    let input = "./packages/tests/lib.esm/index.js";
    let mainFields = undefined;
    let globals = undefined;

    if (format === "umd") {
        input = "./packages/tests/lib/index.js";
        mainFields = [ "browser", "main" ];
        globals = { ethers: "ethers"  };
    }

    const plugins = [
        json(),
        /*
        inject({
            modules: {
                Buffer: [ "buffer", "Buffer" ],
            },
            include: "* * /test-utils.js"
        }),
        */
        commonjs({
        }),
        nodePolyfills({
            assert: true
        }),
        resolveNode({ mainFields }),
    ];

    return {
      input: input,
      output: {
        file: ("./packages/tests/dist/tests." + format + ".js"),
        name: "testing",
        format,
        globals
      },
      context: "window",
      treeshake: false,
      external: [ "ethers" ],
      plugins: plugins
  };
}

const configs = [
    getConfig("umd"),
    getConfig("esm"),
];

export default configs;
