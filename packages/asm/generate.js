"use strict";

const fs = require("fs");

const jison = require("jison")

const grammar = fs.readFileSync("grammar.jison").toString();

const parser = new jison.Parser(grammar);

const parserSource = parser.generate({ moduleName: "parser" });

fs.writeFileSync("./lib/_parser.js", parserSource);
