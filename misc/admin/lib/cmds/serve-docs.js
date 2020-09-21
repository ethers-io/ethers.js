"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const path_1 = require("path");
function getMime(filename) {
    switch (filename.split('.').pop().toLowerCase()) {
        case 'css': return 'text/css';
        case 'doctree': return 'application/x-doctree';
        case 'eot': return 'application/vnd.ms-fontobject';
        case 'gif': return 'image/gif';
        case 'html': return 'text/html';
        case 'js': return 'application/javascript';
        case 'jpg': return 'image/jpeg';
        case 'jpeg': return 'image/jpeg';
        case 'md': return 'text/markdown';
        case 'pickle': return 'application/x-pickle';
        case 'png': return 'image/png';
        case 'svg': return 'image/svg+xml';
        case 'ttf': return 'application/x-font-ttf';
        case 'txt': return 'text/plain';
        case 'woff': return 'application/font-woff';
    }
    console.log('NO MIME', filename);
    return "application/octet-stream";
}
exports.getMime = getMime;
function start(root, options) {
    if (root == null) {
        throw new Error("root required");
    }
    if (options == null) {
        options = {};
    }
    if (options.port == null) {
        options.port = 8000;
    }
    root = path_1.resolve(root);
    const server = http_1.createServer((req, resp) => {
        // Follow redirects in options
        if (options.redirects && options.redirects[req.url]) {
            resp.writeHead(301, { Location: options.redirects[req.url] });
            resp.end();
            return;
        }
        let filename = path_1.resolve(root, "." + req.url);
        // Make sure we aren't crawling out of our sandbox
        if (req.url[0] !== "/" || filename.substring(0, filename.length) !== filename) {
            resp.writeHead(403);
            resp.end();
            return;
        }
        try {
            const stat = fs_1.default.statSync(filename);
            if (stat.isDirectory()) {
                // Redirect bare directory to its path (i.e. "/foo" => "/foo/")
                if (req.url[req.url.length - 1] !== "/") {
                    resp.writeHead(301, { Location: req.url + "/" });
                    resp.end();
                    return;
                }
                filename += "/index.html";
            }
            const content = fs_1.default.readFileSync(filename);
            resp.writeHead(200, {
                "Content-Length": content.length,
                "Content-Type": getMime(filename)
            });
            resp.end(content);
            return;
        }
        catch (error) {
            if (error.code === "ENOENT") {
                resp.writeHead(404, {});
                resp.end();
                return;
            }
            resp.writeHead(500, {});
            resp.end();
            return;
        }
    });
    server.listen(options.port, () => {
        console.log(`Server running on: http://localhost:${options.port}`);
    });
    return server;
}
exports.start = start;
start(path_1.resolve(__dirname, "../../docs"), {
    redirects: {
        "/": "/v5/"
    }
});
