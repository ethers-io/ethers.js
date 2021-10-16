"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const depgraph_1 = require("../depgraph");
const path_2 = require("../path");
const utils_1 = require("../utils");
const log_1 = require("../log");
//function diff(a: string, b: string): boolean {
//    return (Buffer.compare(fs.readFileSync(a), fs.readFileSync(b)) !== 0);
//}
function alias(name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`  Aliasing: ${name}`);
        const baseDir = (0, path_2.resolve)("packages", name);
        const info = (0, utils_1.loadJson)((0, path_2.resolve)(baseDir, "package.json"));
        const replacements = info["_ethers.alias"] || {};
        const skip = Object.keys(replacements).reduce((accum, key) => {
            const replace = replacements[key];
            accum[replace] = true;
            accum[replace + ".map"] = true;
            accum[replace.replace(/\.js$/, ".d.ts")] = true;
            accum[replace.replace(/\.js$/, ".d.ts.map")] = true;
            return accum;
        }, ({}));
        const transforms = [];
        const recurse = function (input, output) {
            fs_1.default.readdirSync((0, path_1.join)(baseDir, input)).forEach((filename) => {
                const stat = fs_1.default.statSync((0, path_1.join)(baseDir, input, filename));
                if (stat.isDirectory()) {
                    recurse((0, path_1.join)(input, filename), (0, path_1.join)(output, filename));
                    return;
                }
                if (skip[filename]) {
                    return;
                }
                let inputFilename = filename;
                let transform = null;
                if (filename.match(/\.js(on)?$/)) {
                    // JavaScript; swap in any replacement
                    // e.g. (filename = geturl.js) => (inputFilename = browser-geturl.js)
                    //      + transform (//# sourceMappingURL=browser-geturl.js.map) to
                    //                  (//# sourceMappingURL=geturl.js.map)
                    const replace = replacements[filename];
                    // Skip!
                    if (replace === "") {
                        return;
                    }
                    if (replace) {
                        inputFilename = replace;
                        transform = function (content) {
                            content = content.replace(/^(\/\/# sourceMappingURL=)(.*)$/mg, (all, prefix, mapFilename) => {
                                return prefix + filename + ".map";
                            });
                            return content;
                        };
                    }
                }
                else if (filename.match(/\.d\.ts$/)) {
                    // TypeScript definietion file
                    // e.g. (filename = geturl.d.ts) => diff(geturl.d.ts, browser-geturl.d.ts)
                    // We do not need to swap anything out, but we need to ensure
                    // the definition of the node and browser are identical
                    const replace = replacements[filename.replace(/\.d\.ts$/i, ".js")];
                    // Skip!
                    if (replace === "") {
                        return;
                    }
                    if (replace) {
                        inputFilename = replace.replace(/\.js$/i, ".d.ts");
                        transform = function (content) {
                            content = content.replace(/(\/\/# sourceMappingURL=)(.*)$/g, (all, prefix, mapFilename) => {
                                return prefix + filename + ".map";
                            });
                            return content;
                        };
                        //if (diff(join(baseDir, input, filename), join(baseDir, input, inputFilename))) {
                        //    console.log(`Warning: TypeScript Definition files differ: ${ filename } != ${ inputFilename }`);
                        //}
                    }
                }
                else if (filename.match(/\.map$/)) {
                    // Map files; swap in the replacement
                    // e.g. (filename = geturl.js.map) => (inputFilename = browser-geturl.js.map)
                    //      + transform the map JSON to reference "geturl.js"
                    // We need to swap in the replacement and update its data
                    const replace = replacements[filename.replace(/\.d.ts\.map$|\.js\.map$/i, ".js")];
                    // Skip!
                    if (replace === "") {
                        return;
                    }
                    if (replace) {
                        if (filename.match(/\.js\.map$/)) {
                            inputFilename = replace + ".map";
                        }
                        else if (filename.match(/\.d\.ts\.map$/)) {
                            inputFilename = replace.replace(/\.js$/, ".d.ts.map");
                        }
                        else {
                            throw new Error(`unhandled map extension: ${filename}`);
                        }
                        transform = function (content) {
                            const data = JSON.parse(content);
                            data["file"] = filename.replace(/\.map$/, "");
                            return JSON.stringify(data);
                        };
                    }
                }
                transforms.push({ input: (0, path_1.join)(input, inputFilename), output: (0, path_1.join)(output, filename), transform });
            });
        };
        recurse("lib._esm", "lib.esm");
        transforms.forEach(({ input, output, transform }) => {
            const sourceFile = (0, path_1.join)(baseDir, input);
            let content = fs_1.default.readFileSync(sourceFile).toString();
            if (transform) {
                content = transform(content);
            }
            const targetFile = (0, path_1.join)(baseDir, output);
            const targetDir = (0, path_1.dirname)(targetFile);
            (0, utils_1.mkdir)(targetDir);
            fs_1.default.writeFileSync(targetFile, content);
        });
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(log_1.colorify.bold(`Aliasing Node ESM to Browser ESM...`));
        const dirnames = (0, depgraph_1.getOrdered)(true);
        for (let i = 0; i < dirnames.length; i++) {
            //if (dirnames[i] !== "signing-key") { continue; }
            yield alias(dirnames[i]);
        }
    });
})();
