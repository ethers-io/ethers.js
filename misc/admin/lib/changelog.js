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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const local = __importStar(require("./local"));
const log_1 = require("./log");
const npm = __importStar(require("./npm"));
const path_1 = require("./path");
const run_1 = require("./run");
const utils_1 = require("./utils");
const changelogPath = path_1.resolve("CHANGELOG.md");
function generate() {
    return __awaiter(this, void 0, void 0, function* () {
        const lines = fs_1.default.readFileSync(changelogPath).toString().trim().split("\n");
        let firstLine = null;
        const versions = Object.keys(lines.reduce((accum, line, index) => {
            const match = line.match(/^ethers\/v([^ ]*)/);
            if (match) {
                if (firstLine == null) {
                    firstLine = index;
                }
                accum[match[1]] = true;
            }
            return accum;
        }, {}));
        const version = local.getPackage("ethers").version;
        ;
        const published = yield npm.getPackage("ethers");
        if (versions.indexOf(version) >= 0) {
            const line = `Version ${version} already in CHANGELOG. Please edit before committing.`;
            console.log(log_1.colorify.red(utils_1.repeat("=", line.length)));
            console.log(log_1.colorify.red(line));
            console.log(log_1.colorify.red(utils_1.repeat("=", line.length)));
        }
        const gitResult = yield run_1.run("git", ["log", (published.gitHead + "..")]);
        if (!gitResult.ok) {
            console.log(gitResult);
            throw new Error("Error running git log");
        }
        let changes = [];
        gitResult.stdout.split("\n").forEach((line) => {
            if (line.toLowerCase().substring(0, 6) === "commit") {
                changes.push({
                    commit: line.substring(6).trim(),
                    date: null,
                    body: ""
                });
            }
            else if (line.toLowerCase().substring(0, 5) === "date:") {
                changes[changes.length - 1].date = utils_1.getDateTime(new Date(line.substring(5).trim()));
            }
            else if (line.substring(0, 1) === " ") {
                line = line.trim();
                if (line === "") {
                    return;
                }
                changes[changes.length - 1].body += line + " ";
            }
        });
        const output = [];
        for (let i = 0; i < firstLine; i++) {
            output.push(lines[i]);
        }
        const newTitle = `ethers/v${version} (${utils_1.getDateTime(new Date())})`;
        output.push(newTitle);
        output.push(utils_1.repeat("-", newTitle.length));
        output.push("");
        changes.forEach((change) => {
            let body = change.body.trim();
            let linkMatch = body.match(/(\((.*#.*)\))/);
            let commit = `[${change.commit.substring(0, 7)}](https://github.com/ethers-io/ethers.js/commit/${change.commit})`;
            let link = commit;
            if (linkMatch) {
                body = body.replace(/ *(\(.*#.*)\) */, "");
                link = linkMatch[2].replace(/#([0-9]+)/g, (all, issue) => {
                    return `[#${issue}](https://github.com/ethers-io/ethers.js/issues/${issue})`;
                }) + "; " + commit;
            }
            output.push(`  - ${body} (${link})`);
        });
        output.push("");
        for (let i = firstLine; i < lines.length; i++) {
            output.push(lines[i]);
        }
        return output.join("\n");
    });
}
exports.generate = generate;
function getLatestChange() {
    let result = null;
    const lines = fs_1.default.readFileSync(changelogPath).toString().split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/ethers\/([^\(]*)\(([^\)]*)\)/);
        if (match) {
            if (result) {
                break;
            }
            result = {
                title: line.trim(),
                version: match[1].trim(),
                date: match[2].trim(),
                content: ""
            };
        }
        else if (result) {
            if (!line.trim().match(/^-+$/)) {
                result.content += line.trim() + "\n";
            }
        }
    }
    result.content = result.content.trim();
    return result;
}
exports.getLatestChange = getLatestChange;
