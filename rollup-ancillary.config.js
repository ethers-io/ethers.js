"use strict";

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import _globals from 'rollup-plugin-node-globals';

import { terser } from "rollup-plugin-terser";

function getConfig(project, minify) {

    const suffix = [ "esm" ];

    const plugins = [
        resolve({
            mainFields: [ "browser", "module", "main" ],
            preferBuiltins: false
        }),
        commonjs({
            namedExports: {
                "bn.js": [ "BN" ],
                "elliptic": [ "ec" ],
                "scrypt-js": [ "scrypt" ],
                "u2f-api": [ "isSupported", "sign" ],
                "js-sha3": [ null ]
            },
        }),
        _globals(),
    ];

    if (minify) {
        suffix.push("min");
        plugins.push(terser());
    }

    return {
      input: `packages/${ project }/lib.esm/index.js`,
      output: {
        file: `packages/${ project }/dist/hardware-wallets.${ suffix.join(".") }.js`,
        format: "esm",
        name: "_ethersAncillary",
        exports: "named"
      },
      context: "window",
      treeshake: false,
      plugins: plugins
  };
}

export default [
    getConfig("hardware-wallets", false),
    getConfig("hardware-wallets", true),
]

