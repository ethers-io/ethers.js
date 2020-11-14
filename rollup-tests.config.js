"use strict";

import commonjs from '@rollup/plugin-commonjs';
//import inject from '@rollup/plugin-inject';
import resolveNode from "@rollup/plugin-node-resolve";

import nodePolyfills from "rollup-plugin-node-polyfills";

import json from "@rollup/plugin-json";

function getConfig(format, input, mainFields) {
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
        resolveNode({
            mainFields,
            //preferBuiltins: true
        }),
    ];

    return {
      input: input,
      output: {
        file: ("./packages/tests/dist/tests." + format + ".js"),
        format: format,
        name: "testing"
      },
      context: "window",
      treeshake: false,
      plugins: plugins
  };
}

const configs = [
    getConfig("umd", "./packages/tests/lib/index.js", [ "_browser-all", "browser", "main" ]),
    getConfig("esm", "./packages/tests/lib.esm/index.js", undefined),
];

export default configs;

