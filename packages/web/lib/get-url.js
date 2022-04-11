import http from "http";
import https from "https";
import { gunzipSync } from "zlib";
import { arrayify } from "@ethersproject/bytes";
import { logger } from "./logger.js";
import { FetchResponse } from "./response.js";
export async function getUrl(req, timeout) {
    const protocol = req.url.split(":")[0].toLowerCase();
    if (protocol !== "http" && protocol !== "https") {
        logger.throwError(`unsupported protocol ${protocol}`, "UNSUPPORTED_OPERATION", {
            info: { protocol },
            operation: "request"
        });
    }
    if (req.credentials && !req.allowInsecureAuthentication) {
        logger.throwError("insecure authorized connections unsupported", "UNSUPPORTED_OPERATION", {
            operation: "request"
        });
    }
    const method = req.method;
    const headers = Object.assign({}, req.headers);
    const options = { method, headers };
    const request = ((protocol === "http") ? http : https).request(req.url, options);
    request.setTimeout(timeout);
    const body = req.body;
    if (body) {
        request.write(Buffer.from(body));
    }
    request.end();
    return new Promise((resolve, reject) => {
        request.once("response", (resp) => {
            const statusCode = resp.statusCode || 0;
            const statusMessage = resp.statusMessage || "";
            const headers = Object.keys(resp.headers || {}).reduce((accum, name) => {
                let value = resp.headers[name] || "";
                if (Array.isArray(value)) {
                    value = value.join(", ");
                }
                accum[name] = value;
                return accum;
            }, {});
            let body = null;
            //resp.setEncoding("utf8");
            resp.on("data", (chunk) => {
                if (body == null) {
                    body = chunk;
                }
                else {
                    const newBody = new Uint8Array(body.length + chunk.length);
                    newBody.set(body, 0);
                    newBody.set(chunk, body.length);
                    body = newBody;
                }
            });
            resp.on("end", () => {
                if (headers["content-encoding"] === "gzip" && body) {
                    body = arrayify(gunzipSync(body));
                }
                resolve(new FetchResponse(statusCode, statusMessage, headers, body, req));
            });
            resp.on("error", (error) => {
                error.response = new FetchResponse(statusCode, statusMessage, headers, body, req);
                reject(error);
            });
        });
        request.on("error", (error) => { reject(error); });
    });
}
//# sourceMappingURL=get-url.js.map