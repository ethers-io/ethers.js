"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchResponse = exports.FetchRequest = exports.FetchCancelSignal = exports.getIpfsGatewayFunc = void 0;
const base64_js_1 = require("./base64.js");
const data_js_1 = require("./data.js");
const logger_js_1 = require("./logger.js");
const properties_js_1 = require("./properties.js");
const utf8_js_1 = require("./utf8.js");
const geturl_js_1 = require("./geturl.js");
const MAX_ATTEMPTS = 12;
const SLOT_INTERVAL = 250;
// The global FetchGetUrlFunc implementation.
let getUrlFunc = geturl_js_1.getUrl;
const reData = new RegExp("^data:([^;:]*)?(;base64)?,(.*)$", "i");
const reIpfs = new RegExp("^ipfs:/\/(ipfs/)?(.*)$", "i");
// If locked, new Gateways cannot be added
let locked = false;
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs
async function gatewayData(url, signal) {
    try {
        const match = url.match(reData);
        if (!match) {
            throw new Error("invalid data");
        }
        return new FetchResponse(200, "OK", {
            "content-type": (match[1] || "text/plain"),
        }, (match[1] ? (0, base64_js_1.decodeBase64)(match[3]) : unpercent(match[3])));
    }
    catch (error) {
        return new FetchResponse(599, "BAD REQUEST (invalid data: URI)", {}, null, new FetchRequest(url));
    }
}
function getIpfsGatewayFunc(base) {
    async function gatewayIpfs(url, signal) {
        try {
            const match = url.match(reIpfs);
            if (!match) {
                throw new Error("invalid link");
            }
            return new FetchRequest(`${base}${match[2]}`);
        }
        catch (error) {
            return new FetchResponse(599, "BAD REQUEST (invalid IPFS URI)", {}, null, new FetchRequest(url));
        }
    }
    return gatewayIpfs;
}
exports.getIpfsGatewayFunc = getIpfsGatewayFunc;
const Gateways = {
    "data": gatewayData,
    "ipfs": getIpfsGatewayFunc("https:/\/gateway.ipfs.io/ipfs/")
};
const fetchSignals = new WeakMap();
class FetchCancelSignal {
    #listeners;
    #cancelled;
    constructor(request) {
        this.#listeners = [];
        this.#cancelled = false;
        fetchSignals.set(request, () => {
            if (this.#cancelled) {
                return;
            }
            this.#cancelled = true;
            for (const listener of this.#listeners) {
                setTimeout(() => { listener(); }, 0);
            }
            this.#listeners = [];
        });
    }
    addListener(listener) {
        if (this.#cancelled) {
            logger_js_1.logger.throwError("singal already cancelled", "UNSUPPORTED_OPERATION", {
                operation: "fetchCancelSignal.addCancelListener"
            });
        }
        this.#listeners.push(listener);
    }
    get cancelled() { return this.cancelled; }
    checkSignal() {
        if (!this.cancelled) {
            return;
        }
        logger_js_1.logger.throwError("cancelled", "CANCELLED", {});
    }
}
exports.FetchCancelSignal = FetchCancelSignal;
// Check the signal, throwing if it is cancelled
function checkSignal(signal) {
    if (signal == null) {
        throw new Error("missing signal; should not happen");
    }
    signal.checkSignal();
    return signal;
}
class FetchRequest {
    #allowInsecure;
    #gzip;
    #headers;
    #method;
    #timeout;
    #url;
    #body;
    #bodyType;
    #creds;
    // Hooks
    #preflight;
    #process;
    #retry;
    #signal;
    // URL
    get url() { return this.#url; }
    set url(url) {
        this.#url = String(url);
    }
    // Body
    get body() {
        if (this.#body == null) {
            return null;
        }
        return new Uint8Array(this.#body);
    }
    set body(body) {
        if (body == null) {
            this.#body = undefined;
            this.#bodyType = undefined;
        }
        else if (typeof (body) === "string") {
            this.#body = (0, utf8_js_1.toUtf8Bytes)(body);
            this.#bodyType = "text/plain";
        }
        else if (body instanceof Uint8Array) {
            this.#body = body;
            this.#bodyType = "application/octet-stream";
        }
        else if (typeof (body) === "object") {
            this.#body = (0, utf8_js_1.toUtf8Bytes)(JSON.stringify(body));
            this.#bodyType = "application/json";
        }
        else {
            throw new Error("invalid body");
        }
    }
    hasBody() {
        return (this.#body != null);
    }
    // Method (default: GET with no body, POST with a body)
    get method() {
        if (this.#method) {
            return this.#method;
        }
        if (this.hasBody()) {
            return "POST";
        }
        return "GET";
    }
    set method(method) {
        if (method == null) {
            method = "";
        }
        this.#method = String(method).toUpperCase();
    }
    // Headers (automatically fills content-type if not explicitly set)
    get headers() {
        const headers = Object.assign({}, this.#headers);
        if (this.#creds) {
            headers["authorization"] = `Basic ${(0, base64_js_1.encodeBase64)((0, utf8_js_1.toUtf8Bytes)(this.#creds))}`;
        }
        ;
        if (this.allowGzip) {
            headers["accept-encoding"] = "gzip";
        }
        if (headers["content-type"] == null && this.#bodyType) {
            headers["content-type"] = this.#bodyType;
        }
        if (this.body) {
            headers["content-length"] = String(this.body.length);
        }
        return Object.freeze(headers);
    }
    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }
    setHeader(key, value) {
        this.#headers[String(key).toLowerCase()] = String(value);
    }
    clearHeaders() {
        this.#headers = {};
    }
    [Symbol.iterator]() {
        const headers = this.headers;
        const keys = Object.keys(headers);
        let index = 0;
        return {
            next: () => {
                if (index < keys.length) {
                    const key = keys[index++];
                    return {
                        value: [key, headers[key]], done: false
                    };
                }
                return { value: undefined, done: true };
            }
        };
    }
    // Configure an Authorization header
    get credentials() {
        return this.#creds || null;
    }
    setCredentials(username, password) {
        if (username.match(/:/)) {
            logger_js_1.logger.throwArgumentError("invalid basic authentication username", "username", "[REDACTED]");
        }
        this.#creds = `${username}:${password}`;
    }
    // Configure the request to allow gzipped responses
    get allowGzip() {
        return this.#gzip;
    }
    set allowGzip(value) {
        this.#gzip = !!value;
    }
    // Allow credentials to be sent over an insecure (non-HTTPS) channel
    get allowInsecureAuthentication() {
        return !!this.#allowInsecure;
    }
    set allowInsecureAuthentication(value) {
        this.#allowInsecure = !!value;
    }
    // Timeout (milliseconds)
    get timeout() { return this.#timeout; }
    set timeout(timeout) {
        (0, logger_js_1.assertArgument)(timeout >= 0, "timeout must be non-zero", "timeout", timeout);
        this.#timeout = timeout;
    }
    // Preflight called before each request is sent
    get preflightFunc() {
        return this.#preflight || null;
    }
    set preflightFunc(preflight) {
        this.#preflight = preflight;
    }
    // Preflight called before each request is sent
    get processFunc() {
        return this.#process || null;
    }
    set processFunc(process) {
        this.#process = process;
    }
    // Preflight called before each request is sent
    get retryFunc() {
        return this.#retry || null;
    }
    set retryFunc(retry) {
        this.#retry = retry;
    }
    constructor(url) {
        this.#url = String(url);
        this.#allowInsecure = false;
        this.#gzip = false;
        this.#headers = {};
        this.#method = "";
        this.#timeout = 300;
    }
    async #send(attempt, expires, delay, _request, _response) {
        if (attempt >= MAX_ATTEMPTS) {
            return _response.makeServerError("exceeded maximum retry limit");
        }
        if (getTime() > expires) {
            return logger_js_1.logger.throwError("timeout", "TIMEOUT", {
                operation: "request.send", reason: "timeout", request: _request
            });
        }
        if (delay > 0) {
            await wait(delay);
        }
        let req = this.clone();
        const scheme = (req.url.split(":")[0] || "").toLowerCase();
        // Process any Gateways
        if (scheme in Gateways) {
            const result = await Gateways[scheme](req.url, checkSignal(_request.#signal));
            if (result instanceof FetchResponse) {
                let response = result;
                if (this.processFunc) {
                    checkSignal(_request.#signal);
                    try {
                        response = await this.processFunc(req, response);
                    }
                    catch (error) {
                        // Something went wrong during processing; throw a 5xx server error
                        if (error.throttle == null || typeof (error.stall) !== "number") {
                            response.makeServerError("error in post-processing function", error).assertOk();
                        }
                        // Ignore throttling
                    }
                }
                return response;
            }
            req = result;
        }
        // We have a preflight function; update the request
        if (this.preflightFunc) {
            req = await this.preflightFunc(req);
        }
        const resp = await getUrlFunc(req, checkSignal(_request.#signal));
        let response = new FetchResponse(resp.statusCode, resp.statusMessage, resp.headers, resp.body, _request);
        if (response.statusCode === 301 || response.statusCode === 302) {
            // Redirect
            try {
                const location = response.headers.location || "";
                return req.redirect(location).#send(attempt + 1, expires, 0, _request, response);
            }
            catch (error) { }
            // Things won't get any better on another attempt; abort
            return response;
        }
        else if (response.statusCode === 429) {
            // Throttle
            if (this.retryFunc == null || (await this.retryFunc(req, response, attempt))) {
                const retryAfter = response.headers["retry-after"];
                let delay = SLOT_INTERVAL * Math.trunc(Math.random() * Math.pow(2, attempt));
                if (typeof (retryAfter) === "string" && retryAfter.match(/^[1-9][0-9]*$/)) {
                    delay = parseInt(retryAfter);
                }
                return req.clone().#send(attempt + 1, expires, delay, _request, response);
            }
        }
        if (this.processFunc) {
            checkSignal(_request.#signal);
            try {
                response = await this.processFunc(req, response);
            }
            catch (error) {
                // Something went wrong during processing; throw a 5xx server error
                if (error.throttle == null || typeof (error.stall) !== "number") {
                    response.makeServerError("error in post-processing function", error).assertOk();
                }
                // Throttle
                let delay = SLOT_INTERVAL * Math.trunc(Math.random() * Math.pow(2, attempt));
                ;
                if (error.stall >= 0) {
                    delay = error.stall;
                }
                return req.clone().#send(attempt + 1, expires, delay, _request, response);
            }
        }
        return response;
    }
    send() {
        if (this.#signal != null) {
            return logger_js_1.logger.throwError("request already sent", "UNSUPPORTED_OPERATION", { operation: "fetchRequest.send" });
        }
        this.#signal = new FetchCancelSignal(this);
        return this.#send(0, getTime() + this.timeout, 0, this, new FetchResponse(0, "", {}, null, this));
    }
    cancel() {
        if (this.#signal == null) {
            return logger_js_1.logger.throwError("request has not been sent", "UNSUPPORTED_OPERATION", { operation: "fetchRequest.cancel" });
        }
        const signal = fetchSignals.get(this);
        if (!signal) {
            throw new Error("missing signal; should not happen");
        }
        signal();
    }
    /**
     *  Returns a new [[FetchRequest]] that represents the redirection
     *  to %%location%%.
     */
    redirect(location) {
        // Redirection; for now we only support absolute locataions
        const current = this.url.split(":")[0].toLowerCase();
        const target = location.split(":")[0].toLowerCase();
        // Don't allow redirecting:
        // - non-GET requests
        // - downgrading the security (e.g. https => http)
        // - to non-HTTP (or non-HTTPS) protocols [this could be relaxed?]
        if (this.method !== "GET" || (current === "https" && target === "http") || !location.match(/^https?:/)) {
            return logger_js_1.logger.throwError(`unsupported redirect`, "UNSUPPORTED_OPERATION", {
                operation: `redirect(${this.method} ${JSON.stringify(this.url)} => ${JSON.stringify(location)})`
            });
        }
        // Create a copy of this request, with a new URL
        const req = new FetchRequest(location);
        req.method = "GET";
        req.allowGzip = this.allowGzip;
        req.timeout = this.timeout;
        req.#headers = Object.assign({}, this.#headers);
        if (this.#body) {
            req.#body = new Uint8Array(this.#body);
        }
        req.#bodyType = this.#bodyType;
        // Do not forward credentials unless on the same domain; only absolute
        //req.allowInsecure = false;
        // paths are currently supported; may want a way to specify to forward?
        //setStore(req.#props, "creds", getStore(this.#pros, "creds"));
        return req;
    }
    clone() {
        const clone = new FetchRequest(this.url);
        // Preserve "default method" (i.e. null)
        clone.#method = this.#method;
        // Preserve "default body" with type, copying the Uint8Array is present
        if (this.#body) {
            clone.#body = this.#body;
        }
        clone.#bodyType = this.#bodyType;
        // Preserve "default headers"
        clone.#headers = Object.assign({}, this.#headers);
        // Credentials is readonly, so we copy internally
        clone.#creds = this.#creds;
        if (this.allowGzip) {
            clone.allowGzip = true;
        }
        clone.timeout = this.timeout;
        if (this.allowInsecureAuthentication) {
            clone.allowInsecureAuthentication = true;
        }
        clone.#preflight = this.#preflight;
        clone.#process = this.#process;
        clone.#retry = this.#retry;
        return clone;
    }
    static lockConfig() {
        locked = true;
    }
    static getGateway(scheme) {
        return Gateways[scheme.toLowerCase()] || null;
    }
    static registerGateway(scheme, func) {
        scheme = scheme.toLowerCase();
        if (scheme === "http" || scheme === "https") {
            throw new Error(`cannot intercept ${scheme}; use registerGetUrl`);
        }
        if (locked) {
            throw new Error("gateways locked");
        }
        Gateways[scheme] = func;
    }
    static registerGetUrl(getUrl) {
        if (locked) {
            throw new Error("gateways locked");
        }
        getUrlFunc = getUrl;
    }
}
exports.FetchRequest = FetchRequest;
;
class FetchResponse {
    #statusCode;
    #statusMessage;
    #headers;
    #body;
    #request;
    #error;
    toString() {
        return `<Response status=${this.statusCode} body=${this.#body ? (0, data_js_1.hexlify)(this.#body) : "null"}>`;
    }
    get statusCode() { return this.#statusCode; }
    get statusMessage() { return this.#statusMessage; }
    get headers() { return this.#headers; }
    get body() {
        return (this.#body == null) ? null : new Uint8Array(this.#body);
    }
    get bodyText() {
        try {
            return (this.#body == null) ? "" : (0, utf8_js_1.toUtf8String)(this.#body);
        }
        catch (error) {
            return logger_js_1.logger.throwError("response body is not valid UTF-8 data", "UNSUPPORTED_OPERATION", {
                operation: "bodyText", info: { response: this }
            });
        }
    }
    get bodyJson() {
        try {
            return JSON.parse(this.bodyText);
        }
        catch (error) {
            return logger_js_1.logger.throwError("response body is not valid JSON", "UNSUPPORTED_OPERATION", {
                operation: "bodyJson", info: { response: this }
            });
        }
    }
    [Symbol.iterator]() {
        const headers = this.headers;
        const keys = Object.keys(headers);
        let index = 0;
        return {
            next: () => {
                if (index < keys.length) {
                    const key = keys[index++];
                    return {
                        value: [key, headers[key]], done: false
                    };
                }
                return { value: undefined, done: true };
            }
        };
    }
    constructor(statusCode, statusMessage, headers, body, request) {
        this.#statusCode = statusCode;
        this.#statusMessage = statusMessage;
        this.#headers = Object.freeze(Object.assign({}, Object.keys(headers).reduce((accum, k) => {
            accum[k.toLowerCase()] = String(headers[k]);
            return accum;
        }, {})));
        this.#body = ((body == null) ? null : new Uint8Array(body));
        this.#request = (request || null);
        this.#error = { message: "" };
    }
    makeServerError(message, error) {
        let statusMessage;
        if (!message) {
            message = `${this.statusCode} ${this.statusMessage}`;
            statusMessage = `CLIENT ESCALATED SERVER ERROR (${message})`;
        }
        else {
            statusMessage = `CLIENT ESCALATED SERVER ERROR (${this.statusCode} ${this.statusMessage}; ${message})`;
        }
        const response = new FetchResponse(599, statusMessage, this.headers, this.body, this.#request || undefined);
        response.#error = { message, error };
        return response;
    }
    throwThrottleError(message, stall) {
        if (stall == null) {
            stall = -1;
        }
        else if (typeof (stall) !== "number" || !Number.isInteger(stall) || stall < 0) {
            return logger_js_1.logger.throwArgumentError("invalid stall timeout", "stall", stall);
        }
        const error = new Error(message || "throttling requests");
        (0, properties_js_1.defineProperties)(error, { stall, throttle: true });
        throw error;
    }
    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }
    hasBody() {
        return (this.#body != null);
    }
    get request() { return this.#request; }
    ok() {
        return (this.#error.message === "" && this.statusCode >= 200 && this.statusCode < 300);
    }
    assertOk() {
        if (this.ok()) {
            return;
        }
        let { message, error } = this.#error;
        if (message === "") {
            message = `server response ${this.statusCode} ${this.statusMessage}`;
        }
        logger_js_1.logger.throwError(message, "SERVER_ERROR", {
            request: (this.request || "unknown request"), response: this, error
        });
    }
}
exports.FetchResponse = FetchResponse;
function getTime() { return (new Date()).getTime(); }
function unpercent(value) {
    return (0, utf8_js_1.toUtf8Bytes)(value.replace(/%([0-9a-f][0-9a-f])/gi, (all, code) => {
        return String.fromCharCode(parseInt(code, 16));
    }));
}
function wait(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
//# sourceMappingURL=fetch.js.map