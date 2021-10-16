import fs from "fs";
import { dirname, join } from "path";

import { getOrdered } from "../depgraph";
import { resolve } from "../path";
import { loadJson, mkdir } from "../utils";
import { colorify } from "../log";

//function diff(a: string, b: string): boolean {
//    return (Buffer.compare(fs.readFileSync(a), fs.readFileSync(b)) !== 0);
//}

async function alias(name: string): Promise<void> {
    console.log(`  Aliasing: ${ name }`);

    const baseDir = resolve("packages", name);

    const info = loadJson(resolve(baseDir, "package.json"));
    const replacements: Record<string, string> = info["_ethers.alias"] || { };
    const skip = Object.keys(replacements).reduce((accum, key) => {
        const replace = replacements[key];
        accum[replace] = true;
        accum[replace + ".map"] = true;
        accum[replace.replace(/\.js$/, ".d.ts")] = true;
        accum[replace.replace(/\.js$/, ".d.ts.map")] = true;
        return accum;
    }, <Record<string, boolean>>({ }));

    const transforms: Array<{ input: string, output: string, transform?: (content: string) => string }> = [ ];
    const recurse = function(input: string, output: string) {
        fs.readdirSync(join(baseDir, input)).forEach((filename) => {
            const stat = fs.statSync(join(baseDir, input, filename));
            if (stat.isDirectory()) {
                recurse(join(input, filename), join(output, filename));
                return;
            }
            if (skip[filename]) { return; }

            let inputFilename = filename;
            let transform: (content: string) => string = null;

            if (filename.match(/\.js(on)?$/)) {
                // JavaScript; swap in any replacement
                // e.g. (filename = geturl.js) => (inputFilename = browser-geturl.js)
                //      + transform (//# sourceMappingURL=browser-geturl.js.map) to
                //                  (//# sourceMappingURL=geturl.js.map)
                const replace = replacements[filename];

                // Skip!
                if (replace === "") { return; }

                if (replace) {
                    inputFilename = replace;
                    transform = function(content: string) {
                        content = content.replace(/^(\/\/# sourceMappingURL=)(.*)$/mg, (all, prefix, mapFilename) => {
                            return prefix + filename + ".map";
                        });
                        return content;
                    }
                }

            } else if (filename.match(/\.d\.ts$/)) {
                // TypeScript definietion file
                // e.g. (filename = geturl.d.ts) => diff(geturl.d.ts, browser-geturl.d.ts)
                // We do not need to swap anything out, but we need to ensure
                // the definition of the node and browser are identical
                const replace = replacements[filename.replace(/\.d\.ts$/i, ".js")];

                // Skip!
                if (replace === "") { return; }

                if (replace) {
                    inputFilename = replace.replace(/\.js$/i, ".d.ts");
                    transform = function(content: string) {
                        content = content.replace(/(\/\/# sourceMappingURL=)(.*)$/g, (all, prefix, mapFilename) => {
                            return prefix + filename + ".map";
                        });
                        return content;
                    }
                    //if (diff(join(baseDir, input, filename), join(baseDir, input, inputFilename))) {
                    //    console.log(`Warning: TypeScript Definition files differ: ${ filename } != ${ inputFilename }`);
                    //}
                }

            } else if (filename.match(/\.map$/)) {
                // Map files; swap in the replacement
                // e.g. (filename = geturl.js.map) => (inputFilename = browser-geturl.js.map)
                //      + transform the map JSON to reference "geturl.js"
                // We need to swap in the replacement and update its data
                const replace = replacements[filename.replace(/\.d.ts\.map$|\.js\.map$/i, ".js")];

                // Skip!
                if (replace === "") { return; }

                if (replace) {
                    if (filename.match(/\.js\.map$/)) {
                        inputFilename = replace + ".map";
                    } else if (filename.match(/\.d\.ts\.map$/)) {
                        inputFilename = replace.replace(/\.js$/, ".d.ts.map");
                    } else {
                        throw new Error(`unhandled map extension: ${ filename }`);
                    }

                    transform = function(content: string) {
                        const data = JSON.parse(content);
                        data["file"] = filename.replace(/\.map$/, "");
                        return JSON.stringify(data);
                    }
                }
            }

            transforms.push({ input: join(input, inputFilename), output: join(output, filename), transform });
        });
    };
    recurse("lib._esm", "lib.esm");

    transforms.forEach(({ input, output, transform }) => {
        const sourceFile = join(baseDir, input);
        let content = fs.readFileSync(sourceFile).toString();

        if (transform) { content = transform(content); }

        const targetFile = join(baseDir, output);
        const targetDir = dirname(targetFile);
        mkdir(targetDir);

        fs.writeFileSync(targetFile, content);
    });
}

(async function() {
    console.log(colorify.bold(`Aliasing Node ESM to Browser ESM...`));
    const dirnames = getOrdered(true);
    for (let i = 0; i < dirnames.length; i++) {
        //if (dirnames[i] !== "signing-key") { continue; }
        await alias(dirnames[i]);
    }
})();
