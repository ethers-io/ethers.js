const fs = require("fs");
const http = require("http");
const path = require("path");

function getMime(filename) {
    const comps = filename.split('.');
    const ext = comps[comps.length - 1];
    switch (ext.toLowerCase()) {
        case 'css':      return 'text/css';
        case 'doctree':  return 'application/x-doctree';
        case 'eot':      return 'application/vnd.ms-fontobject';
        case 'gif':      return 'image/gif';
        case 'html':     return 'text/html';
        case 'js':       return 'application/javascript';
        case 'jpg':      return 'image/jpeg';
        case 'jpeg':     return 'image/jpeg';
        case 'md':       return 'text/markdown';
        case 'pickle':   return 'application/x-pickle';
        case 'png':      return 'image/png';
        case 'svg':      return 'image/svg+xml';
        case 'ttf':      return 'application/x-font-ttf';
        case 'txt':      return 'text/plain';
        case 'woff':     return 'application/font-woff';
    }
    console.log('NO MIME', filename);
    return undefined;
}

function start(root, options) {
    if (root == null) { throw new Error("root required"); }
    if (options == null) { options = { }; }
    if (options.port == null) { options.port = 8000; }
    root = path.resolve(root);

    const server = http.createServer((req, resp) => {

        // Follow redirects in options
        if (options.redirects && options.redirects[req.url]) {
            resp.writeHead(301, { Location: options.redirects[req.url] });
            resp.end();
            return;
        }

        let filename = path.resolve(root, "." + req.url);

        // Make sure we aren't crawling out of our sandbox
        if (req.url[0] !== "/" || filename.substring(0, filename.length) !== filename) {
            resp.writeHead(403);
            resp.end();
            return;
        }

        try {
            const stat = fs.statSync(filename);
            if (stat.isDirectory()) {

                // Redirect bare directory to its path (i.e. "/foo" => "/foo/")
                if (req.url[req.url.length - 1] !== "/") {
                    resp.writeHead(301, { Location: req.url + "/" });
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
        console.log(`Listening on port: ${ options.port }`);
    });

    return server;
}

start(path.resolve(__dirname, "../../docs"), {
    redirects: {
        "/": "/v5/"
    }
});
