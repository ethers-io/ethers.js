"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

function start(options) {
    if (options == null) { options = { }; }
    if (options.port == null) { options.port = 8042; }

    const server = http.createServer((req, resp) => {

        // Make sure we aren't crawling out of our sandbox
        if (req.url[0] !== "/") {
            resp.writeHead(403);
            resp.end();
            return;
        }

        req.setEncoding('utf8');

        let result = "";

        req.on("data", (chunk) => {
            result += chunk;
        });

        req.on('end', () => {
            console.log(result);

            const content = "ok";
            resp.writeHead(200, {
                "Content-Length": content.length,
                "Content-Type": "text/plain"
            });
            resp.end(content);

            const match = result.match(/^# status:(\d+)/);
            if (match) {
                process.exit(parseInt(match[1]));
            }
        });

    });

    server.listen(options.port, () => {
        console.log(`Server running on: http://localhost:${ options.port }`);
    });

    return server;
}

start({ });


