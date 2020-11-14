"use strict";

import commonjs from '@rollup/plugin-commonjs';
import resolveNode from "@rollup/plugin-node-resolve";

const plugins = [
    resolveNode(),
    commonjs()
];

export default {
    input: "packages/shims/src/index.js",
    output: {
        file: `packages/shims/dist/index.js`,
        format: "umd",
        name: `_ethers_shims`,
        exports: "named"
    },
    context: "window",
    treeshake: false,
    plugins
};
