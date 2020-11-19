"use strict";

const fs = require("fs");
const { resolve } = require("path");

const jison = require("jison")

const grammar = fs.readFileSync(resolve(__dirname, "grammar.jison")).toString();

const parser = new jison.Parser(grammar);

const parserSource = parser.generate({ moduleName: "parser" });

const esmSuffix = `

// Added By ../generate.js
const parse = exports.parse;
export { parse, parser }
`;

fs.writeFileSync(resolve(__dirname, "./lib/_parser.js"), parserSource);
fs.writeFileSync(resolve(__dirname, "./lib._esm/_parser.js"), parserSource + esmSuffix);
