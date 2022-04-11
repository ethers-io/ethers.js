var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FetchRequest_props;
import { getStore, setStore } from "@ethersproject/properties";
import { toUtf8Bytes } from "@ethersproject/strings";
import { logger } from "./logger.js";
function check(value, type, name) {
    if (typeof (value) !== type) {
        throw new Error(`invalid ${name}`);
    }
    return value;
}
export class FetchRequest {
    constructor(url) {
        _FetchRequest_props.set(this, void 0);
        __classPrivateFieldSet(this, _FetchRequest_props, {
            allowInsecure: false,
            gzip: false,
            headers: {},
            method: "",
            timeout: 300,
            url: check(url, "string", "url")
        }, "f");
    }
    // URL
    get url() { return getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "url"); }
    set url(url) {
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "url", check(url, "string", "url"));
    }
    // Body
    get body() {
        const body = getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body");
        if (body == null) {
            return null;
        }
        if (this.isFrozen()) {
            return new Uint8Array(body);
        }
        return body;
    }
    set body(body) {
        if (body == null) {
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body", undefined);
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "bodyType", undefined);
        }
        else if (typeof (body) === "string") {
            // @TODO: utf8-check
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body", toUtf8Bytes(body));
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "bodyType", "text/plain");
        }
        else if (body instanceof Uint8Array) {
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body", body);
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "bodyType", "application/octet-stream");
        }
        else if (typeof (body) === "object") {
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body", toUtf8Bytes(JSON.stringify(body)));
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "bodyType", "application/json");
        }
        else {
            throw new Error("invalid body");
        }
    }
    hasBody() {
        return (getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body") != null);
    }
    // Method (default: GET with no body, POST with a body)
    get method() {
        const method = getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "method");
        if (method) {
            return method.toUpperCase();
        }
        if (this.body) {
            return "POST";
        }
        return "GET";
    }
    set method(method) {
        if (method == null) {
            method = "";
        }
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "method", check(method, "string", "method"));
    }
    // Headers (automatically fills content-type if not explicitly set)
    get headers() {
        const headers = Object.assign({}, getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "headers"));
        const bodyType = getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "bodyType");
        if (this.credentials) { /* TODO */ }
        ;
        if (this.allowGzip) {
            headers["accept-encoding"] = "gzip";
        }
        if (headers["content-type"] == null && bodyType) {
            headers["content-type"] = bodyType;
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
        const headers = getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "headers");
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "headers", headers);
        headers[check(key, "string", "key").toLowerCase()] = String(value);
    }
    clearHeaders() {
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "headers", {});
    }
    [(_FetchRequest_props = new WeakMap(), Symbol.iterator)]() {
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
        return getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "creds") || null;
    }
    setCredentials(username, password) {
        if (username.match(/:/)) {
            logger.throwArgumentError("invalid basic authentication username", "username", "[REDACTED]");
        }
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "creds", `${username}:${password}`);
        // @TODO:
        //const auth = username + ":" + password;
        //this.setHeader("authorization", "Basic " + base64Encode(toUtf8Bytes(auth)))
        //this.setHeader("authorization", "Basic TODO:" + auth);
    }
    // Configure the request to allow gzipped responses
    get allowGzip() {
        return getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "gzip");
    }
    set allowGzip(value) {
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "gzip", !!value);
    }
    // Allow credentials to be sent over an insecure (non-HTTPS) channel
    get allowInsecureAuthentication() {
        return !!getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "allowInsecure");
    }
    set allowInsecureAuthentication(value) {
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "allowInsecure", check(value, "boolean", "allowInsecureAuthentication"));
    }
    // Timeout (seconds)
    get timeout() { return getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "timeout"); }
    set timeout(timeout) {
        timeout = check(timeout, "number", "timeout");
        if (timeout <= 0) {
            throw new Error("invalid timerout");
        }
        setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "timeout", timeout);
    }
    redirect(location) {
        // Redirection; for now we only support absolute locataions
        const current = this.url.split(":")[0].toLowerCase();
        const target = location.split(":")[0].toLowerCase();
        if (this.method !== "GET" || (current === "https" && target === "http") ||
            !location.match(/^https?:/)) {
            return logger.throwError(`unsupported redirect`, "UNSUPPORTED_OPERATION", {
                operation: `redirect(${this.method} ${JSON.stringify(this.url)} => ${JSON.stringify(location)})`
            });
        }
        // Create a copy of this request, with a new URL
        const req = new FetchRequest(location);
        req.method = "GET";
        req.allowGzip = this.allowGzip;
        req.timeout = this.timeout;
        setStore(__classPrivateFieldGet(req, _FetchRequest_props, "f"), "body", getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body"));
        setStore(__classPrivateFieldGet(req, _FetchRequest_props, "f"), "headers", Object.assign({}, getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "headers")));
        setStore(__classPrivateFieldGet(req, _FetchRequest_props, "f"), "bodyType", getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "bodyType"));
        // Do not forward credentials unless on the same domain; only absolute
        //req.allowInsecure = false;
        // paths are currently supported; may want a way to specify to forward?
        //setStore(req.#props, "creds", getStore(this.#pros, "creds"));
        return req;
    }
    clone() {
        const clone = new FetchRequest(this.url);
        // Preserve "default method" (i.e. null)
        setStore(__classPrivateFieldGet(clone, _FetchRequest_props, "f"), "method", getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "method"));
        // Preserve "default body" with type, copying the Uint8Array is present
        const body = getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body");
        setStore(__classPrivateFieldGet(clone, _FetchRequest_props, "f"), "body", (body == null) ? undefined : new Uint8Array(body));
        setStore(__classPrivateFieldGet(clone, _FetchRequest_props, "f"), "bodyType", getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "bodyType"));
        // Preserve "default headers"
        setStore(__classPrivateFieldGet(clone, _FetchRequest_props, "f"), "headers", Object.assign({}, getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "headers")));
        // Credentials is readonly, so we copy internally
        setStore(__classPrivateFieldGet(clone, _FetchRequest_props, "f"), "creds", getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "creds"));
        if (this.allowGzip) {
            clone.allowGzip = true;
        }
        clone.timeout = this.timeout;
        if (this.allowInsecureAuthentication) {
            clone.allowInsecureAuthentication = true;
        }
        return clone;
    }
    freeze() {
        // Copy the body so any changes to previous access do not modify it
        const body = getStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body");
        if (body != null) {
            setStore(__classPrivateFieldGet(this, _FetchRequest_props, "f"), "body", new Uint8Array(body));
        }
        Object.freeze(__classPrivateFieldGet(this, _FetchRequest_props, "f").headers);
        Object.freeze(__classPrivateFieldGet(this, _FetchRequest_props, "f"));
        return this;
    }
    isFrozen() {
        return Object.isFrozen(__classPrivateFieldGet(this, _FetchRequest_props, "f"));
    }
}
//# sourceMappingURL=request.js.map