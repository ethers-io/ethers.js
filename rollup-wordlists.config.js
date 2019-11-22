"use strict";

/**
 *  This rollup config is to generate the browser versions of the
 *  BIP-039 mnemonic wordlists. Keep in mind English (en) does not
 *  get generated as it is included by default in related libraries.
 *
 *  The output dist files are placed in:
 *   - packages/wordlists/dist/wordlist-{ language tag }.{ format; umd or ems }.js
 */

import path from "path"
import fs from "fs";

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import _globals from "rollup-plugin-node-globals";

import { createFilter } from 'rollup-pluginutils';

const replaceUtils = [
    "@ethersproject/bytes",
    "@ethersproject/hash",
    "@ethersproject/logger",
    "@ethersproject/properties",
    "@ethersproject/strings",
];

function wordlister(format, options = {}) {
    const filter = createFilter(options.include, options.exclude);

    return {
        name: "file-replacer",
        resolveId(source, importer) {
            if (replaceUtils.indexOf(source) >= 0) {
                const filename = path.resolve(path.dirname(importer), "./browser-utils.js");
                return { id: filename, external: false };
            }
        },
        transform(code, id) {
            if (id.match(/wordlists\/lib(.esm)?\/wordlist.js$/)) {
                return {
                    code: code.replace("exportWordlist = false;", "exportWordlist = true ;"),
                    map: { mapping: "" }
                }
            }

            return null;
        }
    };
}


function getConfig(lang, input, format) {

    const plugins = [
        _globals(),
        wordlister(format),
        commonjs()
    ];

    return {
      input: input,
      output: {
        file: (`./packages/wordlists/dist/wordlist-${ lang }.${ format }.js`),
        format: format,
        name: ("_ethers_" + lang),
        exports: "named",
      },
      treeshake: false,
      plugins: plugins
    };
}

const outputs = [ ];
[ "es", "fr", "it", "ja", "ko", "zh" ].forEach((lang) => {
    outputs.push(getConfig(lang, `./packages/wordlists/lib/lang-${ lang }.js`, "umd"));
    outputs.push(getConfig(lang, `./packages/wordlists/lib.esm/lang-${ lang }.js`, "esm"));
});

export default outputs;
