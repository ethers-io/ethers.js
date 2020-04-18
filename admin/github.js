"use strict";

const fs = require("fs");
const { resolve } = require("path");
const zlib = require("zlib");

const { id } = require("../packages/hash");
const { fetchJson } = require("../packages/web");

const CacheDir = resolve(__dirname, "../github-cache/");

function addResponse(result, response) {
    return { result, response };
}

function loadFile(filename) {
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
    //return JSON.parse(fs.readFileSync(filename).toString());
}

// @TODO: atomic
function saveFile(filename, content) {
    fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(content)));
    //fs.writeFileSync(filename, JSON.stringify(content));
}

function mockFetchJson(url, body, headers) {
    return {
        result: null,
        response: {
            statusCode: 304
        }
    }
}

async function _fetchGitHub(user, password, fetchJson, url) {
    const result = [ ];
    while (true) {

        const filename = resolve(CacheDir, id(url).substring(2, 14));

        const headers = {
            "User-Agent": "ethers-io",
        };

        let items = null;
        let link = null;
        try {
            const data = loadFile(filename);
            headers["if-none-match"] = data.etag;
            items = data.items;
            link = data.link;
        } catch (error) {
            if (error.code !== "ENOENT") { throw error; }
        }

        const fetch = await fetchJson({
            url: url,
            user: user,
            password: password,
            headers: headers
        }, null, addResponse);

        // Cached response is good; use it!
        if (fetch.response.statusCode !== 304) {
            items = fetch.result;
            if (fetch.response.headers) {
                link = (fetch.response.headers.link || null);
            }
            if (fetch.response.headers.etag){
                saveFile(filename, {
                    timestamp: (new Date()).getTime(),
                    url: url,
                    link: link,
                    etag: fetch.response.headers.etag,
                    items: items,
                    version: 1
                });
            }
        }

        items.forEach((item) => { result.push(item)});

        url = null;
        (link || "").split(",").forEach((item) => {
            if (item.indexOf('rel="next"') >= 0) {
                const match = item.match(/<([^>]*)>/);
                if (match) { url = match[1]; }
            }
        });

        if (!url) { break; }
    }
    return result;
}

async function fetchGitHub(user, password, url, cacheOnly) {
    if (cacheOnly) {
        return await _fetchGitHub("none", "none", mockFetchJson, url);
    }

    const results = await _fetchGitHub(user, password, fetchJson, url);
    return results;
}


async function _getIssues(user, password) {
    const cacheOnly = (user == null);

    let issues = await fetchGitHub(user, password, "https:/\/api.github.com/repos/ethers-io/ethers.js/issues?state=all&per_page=100", cacheOnly)
    if (!cacheOnly) { console.log(`Found ${ issues.length } issues`); }
    const result = [ ];
    for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        let comments = await fetchGitHub(user, password, issue.comments_url, cacheOnly);
        result.push({ issue, comments});
        if (!cacheOnly) { console.log(`  Issue ${ issue.number }: ${ comments.length } comments`); }
    }
    result.sort((a, b) => (a.issue.number - b.issue.number));
    return result;
}

function getIssues() {
    return _getIssues();
}

function syncIssues(user, password) {
    return _getIssues(user, password);
}

async function createRelease(user, password, tagName, title, body, prerelease, commit) {
    const payload = {
        tag_name: tagName,
        target_commitish: (commit || "master"),
        name: title,
        body: body,
        //draft: true,
        draft: false,
        prerelease: !!prerelease
    };

    const headers = {
        "User-Agent": "ethers-io",
    };

    const result = await fetchJson({
        url: "https://api.github.com/repos/ethers-io/ethers.js/releases",
        user: user,
        password: password,
        headers: headers
    }, JSON.stringify(payload));


    return result.html_url;
}

module.exports = {
    getIssues,
    syncIssues,
    createRelease,
}

