"use strict";

// This files has a lot of overlap with rollup-pre-alias.config.js
// - should we pull some of this functionality out?

import commonjs from '@rollup/plugin-commonjs';
import resolveNode from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";

import sourcemaps from 'rollup-plugin-sourcemaps';

// We only need this for its version (we inject it into a require)
import elliptic from "elliptic";

function addUtilsReplace(plugins) {

    // Remove the buffer check from BN.js
    plugins.push(replace({
        "require('buffer')": "/*RicMoo:ethers:require(buffer)*/(null)",
        include: "**/lib/bn.js",
        delimiters: [ '', '' ]
    }));

    // Remove the util from inhjerits (forces browser inherits)
    plugins.push(replace({
        "require('util')": "/*RicMoo:ethers:require(util)*/(null)",
        include: "**/inherits/inherits.js",
        delimiters: [ '', '' ]
    }));

    return plugins;
}

function addLangReplace(plugins) {

    plugins.push(replace({
        'require("./wordlists")': 'require("./browser-wordlists")/*RicMoo:ethers:require(wordlists)*/',
        include: "**/wordlists/lib/index.js",
        delimiters: [ '', '' ]
    }));

    return plugins;
}

function addEllipticReplace(plugins) {

    // Replace the package.json in elliptic
    plugins.push(replace({
        "require('../package.json')": `/*RicMoo:ethers*/{ version: "${ elliptic.version }" }`,
        include: "**/lib/elliptic.js",
        delimiters: [ '', '' ]
    }));

    // Nuke a bunch of requires we don't need in elliptic
    const thrower = "(function() { throw new Error('unsupported'); })";
    const crash = "(null).crash()";
    [
        { name: "./edwards", filename: "curve/index.js" },
        { name: "./mont", filename: "curve/index.js" },
        { name: "./elliptic/eddsa", filename: "lib/elliptic.js" },
        { name: "brorand", filename: "ec/index.js", text: thrower },
        { name: "brorand", filename: "lib/elliptic.js", text: thrower },
        { name: "./precomputed/secp256k1", filename: "elliptic/curves.js", text: crash },
    ].forEach(({ name, filename, text }) => {
        if (text == null) { text = "(null)"; }
        const replacement = {
            include: `**/${ filename }`,
            delimiters: [ '', '' ]
        };
        replacement[`require('${ name }')`] = `/*RicMoo:ethers:require(${ name })*/${ text }`,
        plugins.push(replace(replacement));
    });

    return plugins;
}

function getUmdConfig() {
    const plugins = [ ];

    plugins.push(sourcemaps());

    addUtilsReplace(plugins);
    addEllipticReplace(plugins);
    addLangReplace(plugins);

    plugins.push(resolveNode({
        mainFields: [ "browser", "main" ]
    }));
    plugins.push(commonjs({ }));

    return {
        input: `packages/ethers/lib/index.js`,
        output: {
            file: `packages/ethers/dist/ethers.umd.js`,
            format: "umd",
            name: "ethers",
            sourcemap: true
        },
        context: "commonjsGlobal",
        treeshake: false,
        plugins
    };
}

function getEsmConfig() {
    const plugins = [ ];

    plugins.push(sourcemaps());

    addUtilsReplace(plugins);

    // Note: We do not need to replace the elliptic problems because they
    //       were addressed when aliasing (in rollup-pre-alias.config.js)

    plugins.push(resolveNode({ }));
    plugins.push(commonjs({ }));

    return {
        input: `packages/ethers/lib.esm/index.js`,
        output: {
            file: `packages/ethers/dist/ethers.esm.js`,
            format: "esm",
            sourcemap: true
        },
        context: "commonjsGlobal",
        treeshake: false,
        plugins
    };
}

/*
function getConfig() {
    const plugins = [ ];

    // Remove the buffer check from BN.js
    plugins.push(replace({
        "require('buffer')": "/ * RicMoo:ethers * /(null)",
        include: "* * / lib/bn.js",
        delimiters: [ '', '' ]
    }));
    plugins.push(resolveNode({
        preferBuiltins: true
    }));
    plugins.push(commonjs({ }));

    return {
        input: `packages/ethers/lib.esm/index.js`,
        output: {
            file: `packages/ethers/dist/test-esm.js`,
            //preserveModules: true,
            format: "esm",
            //name: `ethers`,
            sourcemap: true,
            exports: "named"
        },
        context: "window",
        treeshake: false,
        //external,
        plugins
    };
}
*/
const configs = [
    getEsmConfig(),
    getUmdConfig()
];

export default configs;
