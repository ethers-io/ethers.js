/**
 *
 *
 *  Paths
 *  /index.js => dist/ethers.js
 *  /tests/utils.js => in-memory hijack
 *  /static/* => output/*
 *    - index.html
 *    - assert.js
 *  /tests/* => lib.esm/_tests/*
 */

// See: https://vanilla.aslushnikov.com/?Console

import fs from "fs";
import child_process from "child_process";
import zlib from "zlib";

import { WebSocket } from "ws";

import { createServer, Server } from "http";
import { join, resolve } from "path";

const mimes: Record<string, string> = {
  css: "text/css",
  doctree: "application/x-doctree",
  eot: "application/vnd.ms-fontobject",
  gif: "image/gif",
  html: "text/html",
  ico: "image/x-icon",
  js: "application/javascript",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  json: "application/json",
  map: "application/json",
  md: "text/markdown",
  png: "image/png",
  svg: "image/svg+xml",
  ttf: "application/x-font-ttf",
  txt: "text/plain",
  woff: "application/font-woff"
};

export function getMime(filename: string): string {
    const mime = mimes[(filename.split('.').pop() || "").toLowerCase()];

    if (mime == null) {
      console.log(`WARN: NO MIME for ${ filename }`);
      return "application/octet-stream";
    }

    return mime;
}

type Responser = {
    resolve: (result: any) => void;
    reject: (error: Error) => void;
};

export class CDPSession {
    readonly websocket: WebSocket;

    #id: number;
    #resp: Map<number, Responser>;

    #readyOpen: Promise<void>;
    #readyPage: Promise<void>;

    #target: string;
    #session: string;

    #done: Promise<number>;
    #exit: (status: number) => void;

    constructor(url: string) {
        this.websocket = new WebSocket(url);
        this.#id = 1;
        this.#resp = new Map();

        this.#exit = (status: number) => { };
        this.#done = new Promise((resolve) => {
            this.#exit = resolve;
        });

        this.#target = "";
        this.#session = "";

        const readyOpen: Promise<void> = new Promise((resolve, reject) => {
            this.websocket.onopen = async () => { resolve(); };
        });

        const readyPage = (async () => {
            await readyOpen;

            const target = await this._send("Target.getTargets", { });
            if (target.targetInfos.length) {
                this.#target = target.targetInfos[0].targetId;
            } else {
                const target = await this._send("Target.createTarget", { url: "" });
                this.#target = target.targetId;
            }

            const attached = await this._send("Target.attachToTarget", {
                targetId: this.#target,
                flatten: true
            });

            this.#session = attached.sessionId;
        })();

        this.#readyOpen = readyOpen;
        this.#readyPage = readyPage;

        this.websocket.onmessage = (_msg) => {
            const msg = JSON.parse(_msg.data);

            if (msg.id != null) {
                const responder = this.#resp.get(msg.id);
                this.#resp.delete(msg.id);

                if (responder == null) {
                    console.log("WARN: unknown request ${ msg.id }");
                    return;
                }

                if (msg.error) {
                    responder.reject(new Error(msg.error));
                } else {
                    responder.resolve(msg.result);
                }
            } else {
                if (msg.method === "Console.messageAdded") {
                    const text = msg.params.message.text;
                    if (text.startsWith("#status")) {
                        this.#exit(parseInt(text.split("=").pop()));
                    }
                    console.log(text);
                    //console.log(msg.params.message.text, `${ msg.params.message.url }:${ msg.params.message.line }`);
                } else if (msg.method === "Target.attachedToTarget") {
                } else {
                    console.log(`WARN: Unhandled event - ${ JSON.stringify(msg) }`);
                }
            }
        };

        this.websocket.onerror = (error) => {
            console.log(`WARN: WebSocket error - ${ JSON.stringify(error) }`);
        };
    }

    get target(): string {
        return this.#target;
    }

    get ready(): Promise<void> {
        return (async () => {
            await this.#readyOpen;
            await this.#readyPage;
        })();
    }

    get done(): Promise<number> {
        return this.#done;
    }

    async send(method: string, params: any): Promise<any> {
        await this.#readyOpen;
        await this.#readyPage;

        return this._send(method, params);
    }

    async _send(method: string, params: any): Promise<any> {
        const id = this.#id++;

        const payload: any = { id, method, params };
        if (this.#session) { payload.sessionId = this.#session; }

        this.websocket.send(JSON.stringify(payload));

        return new Promise((resolve, reject) => {
            this.#resp.set(id, { resolve, reject });
        });
    }

    async navigate(url: string): Promise<void> {
        await this.send("Page.navigate", { url });
    }
}

export type Options = {
    port?: number;
    redirects?: Record<string, string>;
};


const TestData = (function() {
  function load(tag: string): any {
    const filename = resolve("testcases", tag + ".json.gz");
    const data = zlib.gunzipSync(fs.readFileSync(filename));
    return [ String(data.length), zlib.deflateRawSync(data).toString("base64") ].join(",");
  }

  let data: Array<string> = [ ];
  data.push(`import { ethers } from "/index.js";`);
  data.push(`import { inflate } from "/static/tiny-inflate.js";`);
  data.push(`const fs = new Map();`);
  for (const filename of fs.readdirSync("testcases")) {
    if (!filename.endsWith(".json.gz")) { continue; }
    const tag = filename.split(".")[0];
    data.push(`fs.set(${ JSON.stringify(tag) }, ${ JSON.stringify(load(tag)) });`);
  }
  data.push(`export function loadTests(tag) {`);
  data.push(`  const data = fs.get(tag);`);
  data.push(`  if (data == null) { throw new Error("missing tag: " + tag); }`);
  data.push(`  const comps = data.split(",");`);
  data.push(`  const result = new Uint8Array(parseInt(comps[0]));`);
  data.push(`  inflate(ethers.decodeBase64(comps[1]), result);`);
  data.push(`  return JSON.parse(ethers.toUtf8String(result))`);
  data.push(`}`);

  return data.join("\n");
})();


export function start(_root: string, options: Options): Promise<Server> {

    if (options == null) { options = { }; }
    if (options.port == null) { options.port = 8000; }

    const server = createServer((req, resp) => {
        const url = (req.url || "").split("?")[0];

        let transform = false;

        let filename: string;
        if (url === "/") {
            filename = "./misc/test-browser/index.html";
        } else if (url === "/ethers.js" || url === "/index.js") {
            filename = "./dist/ethers.js";
        } else if (url === "/ethers.js.map") {
            filename = "./dist/ethers.js.map";

        } else if (url.startsWith("/static/")) {
            filename = "./misc/test-browser/" + url.substring(8);

        } else if (url === "/tests/utils.js") {
            //console.log({ status: 200, content: `<<in-memory ${ TestData.length } bytes>>` });
            resp.writeHead(200, {
                "Content-Length": TestData.length,
                "Content-Type": getMime("testdata.js")
            });
            resp.end(TestData);
            return;

        } else if (url.startsWith("/tests/")) {
            transform = true;
            filename = join("./lib.esm/_tests", url.substring(7));
        } else {
            //console.log("FALLBACK");
            filename = url.substring(1);
        }

        // Make sure we aren't crawling out of our sandbox
        if (url[0] !== "/" || filename.substring(0, filename.length) !== filename) {
            //console.log({ status: 403, reason: "escaping" });
            resp.writeHead(403);
            resp.end();
            return;
        }

        try {
            const stat = fs.statSync(filename);
            if (stat.isDirectory()) {
                // Redirect bare directory to its path (i.e. "/foo" => "/foo/")
                if (url[url.length - 1] !== "/") {
                    //console.log({ status: 301, location: (url + "/") });
                    resp.writeHead(301, { Location: url + "/" });
                    resp.end();
                    return;
                }

                filename += "/index.html";
            }

            let content = fs.readFileSync(filename);
            if (transform) {
                content = Buffer.from(content.toString().replace(/import ([^;]*) from "([^"]*)";/g, (all, names, filename) => {
                    switch (filename) {
                        case "assert":
                        //case "path":
                        //case "fs":
                        //case "zlib":
                            return `import ${ names} from "/static/${ filename }.js"`;
                    }
                    return all;
                }));
            }

            //console.log({ status: 200, filename });
            resp.writeHead(200, {
                "Content-Length": content.length,
                "Content-Type": getMime(filename)
            });
            resp.end(content);
            return;

        } catch (error: any) {
            if (error.code === "ENOENT") {
                //console.log({ status: 404, filename });
                console.log(`WARN: Not found - ${ filename }`)
                resp.writeHead(404, { });
                resp.end();
                return;
            }

            //console.log({ status: 500, error: error.toString() });
            console.log(`WARN: Server error - ${ error.toString() }`);
            resp.writeHead(500, { });
            resp.end();
            return;
        }
    });

    return new Promise((resolve, reject) => {
        server.listen(options.port, () => {
            console.log(`Server running on: http://localhost:${ options.port }`);
            resolve(server);
        });
    });
}


(async function() {
    await start(resolve("."), { port: 8000 });

    const cmds = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/chromium"
    ].filter((f) => { try { fs.accessSync(f); return true; } catch (error) { return false; } });

    if (cmds.length === 0) { throw new Error("no installed browser found"); }

    const cmd = cmds[0];

    const args = [ "--headless", "--disable-gpu", "--remote-debugging-port=8022" ];
    const browser = child_process.spawn(cmd, args);

    let url: string = await new Promise((resolve, reject) => {
        browser.stdout.on("data", (data) => {
            console.log("OUT", data.toString());
        });

        browser.stderr.on("data", (data) => {
            const text = data.toString();
            for (const line of text.split("\n")) {
                const match = line.match(/^DevTools listening on (.*)$/)
                if (match) {
                    resolve(match[1]);
                    return;
                }
            }
        });
    });
    console.log("URL:", url);

    const session = new CDPSession(url);
    await session.ready;
    await session.send("Console.enable", { });
    await session.navigate("http:/\/localhost:8000");

    const status = await session.done;
    console.log("STATUS:", status);
    process.exit(status);
})();

