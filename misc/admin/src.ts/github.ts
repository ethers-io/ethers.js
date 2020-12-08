import fs from "fs";
import zlib from "zlib";

import { keccak_256 } from "js-sha3";

import { getUrl, GetUrlResponse, Options } from "./geturl";
import { resolve } from "./path";

type GetUrlFunc = (href: string, options?: Options) => Promise<GetUrlResponse>;


async function _fetchGitHub(user: string, password: string, getUrlFunc: GetUrlFunc, url: string): Promise<Array<any>> {
    const result: Array<any> = [ ];
    while (true) {

        const filename = resolve(
            "github-cache",
            Buffer.from(keccak_256.create().update(Buffer.from(url)).digest()).toString("hex").substring(0, 12)
        );

        const headers: Record<string, string> = {
            "User-Agent": "ethers-io",
        };

        let items: Array<any> = null;
        let link: string = null;
        try {
            const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
            headers["if-none-match"] = data.etag;
            items = data.items;
            link = data.link;
console.log("Loaded", filename);
        } catch (error) {
console.log("not found", filename);
            if (error.code !== "ENOENT") { throw error; }
        }

        const response = await getUrl(url, { headers, user, password });
console.log(response.statusCode);
        // Cached response is good; use it!
        if (response.statusCode !== 304) {
            items = JSON.parse(Buffer.from(response.body).toString());
            if (response.headers) {
                link = (response.headers.link || null);
            }
            if (response.headers.etag){
console.log(response.headers.etag);
                fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify({
                    timestamp: (new Date()).getTime(),
                    url: url,
                    link: link,
                    etag: response.headers.etag,
                    items: items,
                    version: 1
                })));
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

export async function fetchGitHub(user: string, password: string, url: string, cacheOnly?: boolean) {
    if (cacheOnly) {
        const mockFetchJson = function(url: string, options?: Options): Promise<GetUrlResponse> {
            return Promise.resolve({
                statusCode: 304,
                statusMessage: "NOT MODIFIED",
                headers: { },
                body: new Uint8Array(0)
            });
        }

        return await _fetchGitHub("none", "none", mockFetchJson, url);
    }

    return await _fetchGitHub(user, password, getUrl, url);
}

async function _getIssues(user: string, password: string): Promise<Array<any>> {
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

export async function getIssues(): Promise<Array<any>> {
    return await _getIssues(null, null);
}

export async function syncIssues(user: string, password: string): Promise<Array<any>> {
    return await _getIssues(user, password);
}

export async function createRelease(user: string, password: string, tagName: string, title: string, body: string, prerelease?: boolean, commit?: string): Promise<string> {
    const result = await getUrl("https:/\/api.github.com/repos/ethers-io/ethers.js/releases", {
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
}

