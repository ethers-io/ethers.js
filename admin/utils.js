"use strict";

const fs = require("fs");
const _resolve = require("path").resolve;

function repeat(chr, length) {
    let result = chr;
    while (result.length < length) { result += chr; }
    return result;
}

function zpad(value) {
    value = String(value);
    while (value.length < 2) { value = "0" + value; }
    return value;
}

function today() {
    let now = new Date();
    return [ now.getFullYear(), zpad(now.getMonth() + 1), zpad(now.getDate()) ].join("-");
}

function loadJson(filename) {
    return JSON.parse(fs.readFileSync(filename).toString());
}

// @TODO: atomic write
function saveJson(filename, json) {
    fs.writeFileSync(filename, JSON.stringify(json, null, 2) + "\n");
}

function resolve(...args) {
    args = args.slice();
    args.unshift("..");
    args.unshift(__dirname);
    return _resolve.apply(null, args);
}

module.exports = {
    resolve: resolve,

    loadJson: loadJson,
    saveJson: saveJson,

    repeat: repeat,
    today: today
}
