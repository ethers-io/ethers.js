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
exports.getUrl = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
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
                const body = new Uint8Array(response.body.length + chunk.length);
                body.set(response.body, 0);
                body.set(chunk, response.body.length);
                response.body = body;
            });
            resp.on("end", () => {
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
function staller(duration) {
    return new Promise((resolve) => {
        const timer = setTimeout(resolve, duration);
        timer.unref();
    });
}
function _getUrl(href, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options == null) {
            options = {};
        }
        // @TODO: Once we drop support for node 8, we can pass the href
        //        directly into request and skip adding the components
        //        to this request object
        const url = (0, url_1.parse)(href);
        const request = {
            protocol: nonnull(url.protocol),
            hostname: nonnull(url.hostname),
            port: nonnull(url.port),
            path: (nonnull(url.pathname) + nonnull(url.search)),
            method: (options.method || "GET"),
            headers: (options.headers || {}),
        };
        if (options.user && options.password) {
            request.auth = `${options.user}:${options.password}`;
        }
        let req = null;
        switch (nonnull(url.protocol)) {
            case "http:":
                req = http_1.default.request(request);
                break;
            case "https:":
                req = https_1.default.request(request);
                break;
            default:
                /* istanbul ignore next */
                throw new Error(`unsupported protocol ${url.protocol}`);
        }
        if (options.body) {
            req.write(Buffer.from(options.body));
        }
        req.end();
        const response = yield getResponse(req);
        return response;
    });
}
function getUrl(href, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let error = null;
        for (let i = 0; i < 3; i++) {
            try {
                const result = yield Promise.race([
                    _getUrl(href, options),
                    staller(30000).then((result) => { throw new Error("timeout"); })
                ]);
                return result;
            }
            catch (e) {
                error = e;
            }
            yield staller(1000);
        }
        throw error;
    });
}
exports.getUrl = getUrl;
