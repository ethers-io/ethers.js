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
import http from "http";
import https from "https";
import { gunzipSync } from "zlib";
import { parse } from "url";
import { arrayify, concat } from "@ethersproject/bytes";
import { shallowCopy } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
function getResponse(request) {
    return new Promise((resolve, reject) => {
        request.once("response", (resp) => {
            const response = {
                statusCode: resp.statusCode,
                statusMessage: resp.statusMessage,
                headers: Object.keys(resp.headers).reduce((accum, name) => {
                    let value = resp.headers[name];
                    if (Array.isArray(value)) {
                        value = value.join(", ");
                    }
                    accum[name] = value;
                    return accum;
                }, {}),
                body: null
            };
            //resp.setEncoding("utf8");
            resp.on("data", (chunk) => {
                if (response.body == null) {
                    response.body = new Uint8Array(0);
                }
                response.body = concat([response.body, chunk]);
            });
            resp.on("end", () => {
                if (response.headers["content-encoding"] === "gzip") {
                    //const size = response.body.length;
                    response.body = arrayify(gunzipSync(response.body));
                    //console.log("Delta:", response.body.length - size, Buffer.from(response.body).toString());
                }
                resolve(response);
            });
            resp.on("error", (error) => {
                /* istanbul ignore next */
                error.response = response;
                reject(error);
            });
        });
        request.on("error", (error) => { reject(error); });
    });
}
// The URL.parse uses null instead of the empty string
function nonnull(value) {
    if (value == null) {
        return "";
    }
    return value;
}
export function getUrl(href, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options == null) {
            options = {};
        }
        // @TODO: Once we drop support for node 8, we can pass the href
        //        firectly into request and skip adding the components
        //        to this request object
        const url = parse(href);
        const request = {
            protocol: nonnull(url.protocol),
            hostname: nonnull(url.hostname),
            port: nonnull(url.port),
            path: (nonnull(url.pathname) + nonnull(url.search)),
            method: (options.method || "GET"),
            headers: shallowCopy(options.headers || {}),
        };
        if (options.allowGzip) {
            request.headers["accept-encoding"] = "gzip";
        }
        let req = null;
        switch (nonnull(url.protocol)) {
            case "http:":
                req = http.request(request);
                break;
            case "https:":
                req = https.request(request);
                break;
            default:
                /* istanbul ignore next */
                logger.throwError(`unsupported protocol ${url.protocol}`, Logger.errors.UNSUPPORTED_OPERATION, {
                    protocol: url.protocol,
                    operation: "request"
                });
        }
        if (options.body) {
            req.write(Buffer.from(options.body));
        }
        req.end();
        const response = yield getResponse(req);
        return response;
    });
}
//# sourceMappingURL=geturl.js.map