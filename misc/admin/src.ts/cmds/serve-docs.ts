import fs from "fs";
import { createServer, Server } from "http";
import { resolve as _resolve } from "path";

import { resolve } from "../path";

export function getMime(filename: string): string {
    switch (filename.split('.').pop().toLowerCase()) {
        case 'css':      return 'text/css';
        case 'doctree':  return 'application/x-doctree';
        case 'eot':      return 'application/vnd.ms-fontobject';
        case 'gif':      return 'image/gif';
        case 'html':     return 'text/html';
        case 'ico':      return 'image/x-icon';
        case 'js':       return 'application/javascript';
        case 'jpg':      return 'image/jpeg';
        case 'jpeg':     return 'image/jpeg';
        case 'json':     return 'application/json';
        case 'md':       return 'text/markdown';
        case 'pickle':   return 'application/x-pickle';
        case 'png':      return 'image/png';
        case 'svg':      return 'image/svg+xml';
        case 'ttf':      return 'application/x-font-ttf';
        case 'txt':      return 'text/plain';
        case 'woff':     return 'application/font-woff';
    }
    console.log('NO MIME', filename);

    return "application/octet-stream";
}

export type Options = {
    port?: number;
    redirects?: Record<string, string>;
};

export function start(root: string, options: Options): Server {
    if (root == null) { throw new Error("root required"); }
    if (options == null) { options = { }; }
    if (options.port == null) { options.port = 8000; }
    root = _resolve(root);

    const server = createServer((req, resp) => {
        const url = req.url.split("?")[0];

        // Follow redirects in options
        if (options.redirects && options.redirects[url]) {
            resp.writeHead(301, { Location: options.redirects[url] });
            resp.end();
            return;
        }

        let filename = _resolve(root, "." + url);

        // Make sure we aren't crawling out of our sandbox
        if (url[0] !== "/" || filename.substring(0, filename.length) !== filename) {
            resp.writeHead(403);
            resp.end();
            return;
        }

        try {
            const stat = fs.statSync(filename);
            if (stat.isDirectory()) {
                // Redirect bare directory to its path (i.e. "/foo" => "/foo/")
                if (url[url.length - 1] !== "/") {
                    resp.writeHead(301, { Location: url + "/" });
                    resp.end();
                    return;
                }

                filename += "/index.html";
            }

            const content = fs.readFileSync(filename);

            resp.writeHead(200, {
                "Content-Length": content.length,
                "Content-Type": getMime(filename)
            });
            resp.end(content);
            return;

        } catch (error) {
            if (error.code === "ENOENT") {
                resp.writeHead(404, { });
                resp.end();
                return;
            }

            resp.writeHead(500, { });
            resp.end();
            return;
        }
    });

    server.listen(options.port, () => {
        console.log(`Server running on: http://localhost:${ options.port }`);
    });

    return server;
}

start(resolve("docs"), {
    redirects: {
        "/": "/v5/"
    }
});

