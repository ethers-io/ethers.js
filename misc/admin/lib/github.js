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
exports.createRelease = exports.syncIssues = exports.getIssues = exports.fetchGitHub = void 0;
const fs_1 = __importDefault(require("fs"));
const zlib_1 = __importDefault(require("zlib"));
const js_sha3_1 = require("js-sha3");
const geturl_1 = require("./geturl");
const path_1 = require("./path");
function _fetchGitHub(user, password, getUrlFunc, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        while (true) {
            const filename = (0, path_1.resolve)("github-cache", Buffer.from(js_sha3_1.keccak_256.create().update(Buffer.from(url)).digest()).toString("hex").substring(0, 12));
            const headers = {
                "User-Agent": "ethers-io",
            };
            let items = null;
            let link = null;
            try {
                const data = JSON.parse(zlib_1.default.gunzipSync(fs_1.default.readFileSync(filename)).toString());
                headers["if-none-match"] = data.etag;
                items = data.items;
                link = data.link;
                console.log("Loaded", filename);
            }
            catch (error) {
                console.log("not found", filename);
                if (error.code !== "ENOENT") {
                    throw error;
                }
            }
            const response = yield (0, geturl_1.getUrl)(url, { headers, user, password });
            console.log(response.statusCode);
            // Cached response is good; use it!
            if (response.statusCode !== 304) {
                items = JSON.parse(Buffer.from(response.body).toString());
                if (response.headers) {
                    link = (response.headers.link || null);
                }
                if (response.headers.etag) {
                    console.log(response.headers.etag);
                    fs_1.default.writeFileSync(filename, zlib_1.default.gzipSync(JSON.stringify({
                        timestamp: (new Date()).getTime(),
                        url: url,
                        link: link,
                        etag: response.headers.etag,
                        items: items,
                        version: 1
                    })));
                }
            }
            items.forEach((item) => { result.push(item); });
            url = null;
            (link || "").split(",").forEach((item) => {
                if (item.indexOf('rel="next"') >= 0) {
                    const match = item.match(/<([^>]*)>/);
                    if (match) {
                        url = match[1];
                    }
                }
            });
            if (!url) {
                break;
            }
        }
        return result;
    });
}
function fetchGitHub(user, password, url, cacheOnly) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cacheOnly) {
            const mockFetchJson = function (url, options) {
                return Promise.resolve({
                    statusCode: 304,
                    statusMessage: "NOT MODIFIED",
                    headers: {},
                    body: new Uint8Array(0)
                });
            };
            return yield _fetchGitHub("none", "none", mockFetchJson, url);
        }
        return yield _fetchGitHub(user, password, geturl_1.getUrl, url);
    });
}
exports.fetchGitHub = fetchGitHub;
function _getIssues(user, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheOnly = (user == null);
        let issues = yield fetchGitHub(user, password, "https:/\/api.github.com/repos/ethers-io/ethers.js/issues?state=all&per_page=100", cacheOnly);
        if (!cacheOnly) {
            console.log(`Found ${issues.length} issues`);
        }
        const result = [];
        for (let i = 0; i < issues.length; i++) {
            const issue = issues[i];
            let comments = yield fetchGitHub(user, password, issue.comments_url, cacheOnly);
            result.push({ issue, comments });
            if (!cacheOnly) {
                console.log(`  Issue ${issue.number}: ${comments.length} comments`);
            }
        }
        result.sort((a, b) => (a.issue.number - b.issue.number));
        return result;
    });
}
function getIssues() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _getIssues(null, null);
    });
}
exports.getIssues = getIssues;
function syncIssues(user, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _getIssues(user, password);
    });
}
exports.syncIssues = syncIssues;
function createRelease(user, password, tagName, title, body, prerelease, commit) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, geturl_1.getUrl)("https:/\/api.github.com/repos/ethers-io/ethers.js/releases", {
            body: Buffer.from(JSON.stringify({
                tag_name: tagName,
                target_commitish: (commit || "master"),
                name: title,
                body: body,
                //draft: true,
                draft: false,
                prerelease: !!prerelease
            })),
            method: "POST",
            headers: {
                "User-Agent": "ethers-io"
            },
            user: user,
            password: password
        });
        return JSON.parse(Buffer.from(result.body).toString("utf8")).html_url;
    });
}
exports.createRelease = createRelease;
