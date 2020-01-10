"use strict";

const { resolve } = require("path");
const fs = require("fs");

const ts = require("typescript");

function getDefinitions(source) {
    const sourceFile = ts.createSourceFile("filename.ts", source);

    const defs = [ ];

    function add(type, name, pos) {
        const lineNo = sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
        name = type + "." + name
        defs.push({ type, name, lineNo });
    }

    let lastClass = null, lastEnum = null;
    function visit(node, depth) {
        if (ts.isConstructorDeclaration(node)) {
            add("constructor", lastClass, node.body.pos);
        } else if (ts.isFunctionDeclaration(node)) {
            add("function", node.name.text, node.name.end);
        } else if (ts.isConstructorDeclaration(node)) {
            add("constructor", lastClass, node.pos);
        } else if (ts.isClassDeclaration(node)) {
            lastClass = node.name.escapedText;
            add("class", lastClass, node.name.end);
        } else if (ts.isMethodDeclaration(node)) {
            if (lastClass == null) { throw new Error("missing class"); }
            if (ts.hasStaticModifier(node)) {
                add("staticmethod", (lastClass + "." + node.name.text), node.name.end);
            } else {
                add("method", (lastClass + "." + node.name.text), node.name.end);
            }
        } else if (ts.isEnumDeclaration(node)) {
            lastEnum = node.name.escapedText;
            add("enum", lastEnum, node.name.end);
        } else if (ts.isEnumMember(node)) {
            add("enum", (lastEnum + "." + node.name.escapedText), node.name.end);
        } else if (ts.isVariableDeclaration(node)) {
            if (depth === 3) {
                add("var", node.name.escapedText, node.name.end);
            }
        }
        ts.forEachChild(node, (node) => { return visit(node, depth + 1); });
    }

    visit(sourceFile, 0);

    return defs;
}

const getSourceUrl = (function(path, include, exclude) {
    console.log("Scanning TypeScript Sources...");
    const Link = "https://github.com/ethers-io/ethers.js/blob/ethers-v5-beta/packages$FILENAME#L$LINE";
    const Root = resolve(__dirname, path);

    const readdir = function(path) {
        if (path.match(exclude)) { return [ ]; }

        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
            return fs.readdirSync(path).reduce((result, filename) => {
                readdir(resolve(path, filename)).forEach((file) => {
                    result.push(file);
                });
                return result;
            }, [ ]);
        }

        if (path.match(include)) {
            const source = fs.readFileSync(path).toString();
            return [ { filename: path.substring(Root.length), defs: getDefinitions(source) } ]
        }

        return [ ];
    }

    const defs = readdir(Root);

    return function getSourceUrl(key) {
        const comps = key.split(":");
        if (comps.length !== 2) { throw new Error("unsupported key"); }

        const pathCheck = new RegExp("(^|[^a-zA-Z0-9_])" + comps[0].split("/").join("/(.*/)*") + "($|[^a-zA-Z0-9_])");

        let match = comps[1];
        if (match.indexOf("(" /* fix: )*/)) {
            match = new RegExp("(^|\\.)" + match.split("(" /* fix: ) */)[0] + "$");
        } else if (match[0] === "=") {
            match = new RegExp("^" + match.substring(1) + "$");
        } else {
            match = new RegExp("(^|\\.)" + match + "$");
        }

        const result = [ ];
        defs.forEach((def) => {
            if (!def.filename.match(pathCheck)) { return; }
            def.defs.forEach((d) => {
                if (!d.name.match(match)) { return; }
                result.push({ filename: def.filename, lineNo: d.lineNo });
            });
        });

        if (result.length > 1) {
            throw new Error(`Amibguous TypeScript link: ${ key } in [ ${ result.map((r) => JSON.stringify(r.filename + ":" + r.lineNo)).join(", ") }]`);
        } else if (result.length === 0) {
            throw new Error(`No matching TypeScript link: ${ key }`);
        }

        return Link
            .replace("$LINE", String(result[0].lineNo))
            .replace("$FILENAME", result[0].filename);
    }
})("../packages/", new RegExp("packages/.*/src.ts/.*\.ts$"), new RegExp("/node_modules/|src.ts/.*browser.*"));

module.exports = {
  title: "ethers",
  foo: "Bat",
  subtitle: "v5.0-beta",
  logo: "logo.svg",
  link: "https://docs-beta.ethers.io",
  markdown: {
      "banner": "-----\n\nDocumentation: [html](https://docs-beta.ethers.io/)\n\n-----\n\n"
  },
  getSourceUrl: getSourceUrl
};
