
import { getStore, setStore } from "@ethersproject/properties";
import { toUtf8Bytes } from "@ethersproject/strings";

import { logger } from "./logger.js";

import type { Freezable, Frozen } from "@ethersproject/properties";


function check<T>(value: T, type: string, name: string): T {
    if (typeof(value) !== type) {
        throw new Error(`invalid ${ name }`);
    }
    return value;
}

export interface FetchRequestWithBody extends FetchRequest {
    body: Uint8Array;
}

export class FetchRequest implements Freezable<FetchRequest>, Iterable<[ key: string, value: string ]> {
    #props: {
        allowInsecure: boolean,
        gzip: boolean;
        headers: Record<string, string>,
        method: string,
        timeout: number,
        url: string,

        body?: Uint8Array,
        bodyType?: string,
        creds?: string,
    };

    // URL
    get url(): string { return getStore(this.#props, "url"); }
    set url(url: string) {
        setStore(this.#props, "url", check(url, "string", "url"));
    }

    // Body
    get body(): null | Uint8Array {
        const body = getStore(this.#props, "body");
        if (body == null) { return null; }
        if (this.isFrozen()) { return new Uint8Array(body); }
        return body;
    }
    set body(body: null | string | Readonly<object> | Readonly<Uint8Array>) {
        if (body == null) {
            setStore(this.#props, "body", undefined);
            setStore(this.#props, "bodyType", undefined);
        } else if (typeof(body) === "string") {
             // @TODO: utf8-check
            setStore(this.#props, "body", toUtf8Bytes(body));
            setStore(this.#props, "bodyType", "text/plain");
        } else if (body instanceof Uint8Array) {
            setStore(this.#props, "body", body);
            setStore(this.#props, "bodyType", "application/octet-stream");
        } else if (typeof(body) === "object") {
            setStore(this.#props, "body", toUtf8Bytes(JSON.stringify(body)));
            setStore(this.#props, "bodyType", "application/json");
        } else {
            throw new Error("invalid body");
        }
    }
    hasBody(): this is FetchRequestWithBody {
        return (getStore(this.#props, "body") != null);
    }

    // Method (default: GET with no body, POST with a body)
    get method(): string {
        const method = getStore(this.#props, "method");
        if (method) { return method.toUpperCase(); }
        if (this.body) { return "POST"; }
        return "GET";
    }
    set method(method: null | string) {
        if (method == null) { method = ""; }
        setStore(this.#props, "method", check(method, "string", "method"));
    }

    // Headers (automatically fills content-type if not explicitly set)
    get headers(): Readonly<Record<string, string>> {
        const headers = Object.assign({ }, getStore(this.#props, "headers"));
        const bodyType = getStore(this.#props, "bodyType");

        if (this.credentials) { /* TODO */ };

        if (this.allowGzip) {
            headers["accept-encoding"] = "gzip";
        }

        if (headers["content-type"] == null && bodyType) {
            headers["content-type"] = bodyType;
        }
        if (this.body) { headers["content-length"] = String(this.body.length); }

        return Object.freeze(headers);
    }
    getHeader(key: string): string {
        return this.headers[key.toLowerCase()];
    }
    setHeader(key: string, value: string | number): void {
        const headers = getStore(this.#props, "headers");
        setStore(this.#props, "headers", headers);
        headers[check(key, "string", "key").toLowerCase()] = String(value);
    }
    clearHeaders(): void {
        setStore(this.#props, "headers", { });
    }

    [Symbol.iterator](): Iterator<[ key: string, value: string ]> {
        const headers = this.headers;
        const keys = Object.keys(headers);
        let index = 0;
        return {
            next: () => {
                if (index < keys.length) {
                    const key = keys[index++];
                    return {
                        value: [ key, headers[key] ], done: false
                    }
                }
                return { value: undefined, done: true };
            }
        };
    }

    // Configure an Authorization header
    get credentials(): null | string {
        return getStore(this.#props, "creds") || null;
    }
    setCredentials(username: string, password: string): void {
        if (username.match(/:/)) {
            logger.throwArgumentError("invalid basic authentication username", "username", "[REDACTED]");
        }
        setStore(this.#props, "creds", `${ username }:${ password }`);
        // @TODO:
        //const auth = username + ":" + password;
        //this.setHeader("authorization", "Basic " + base64Encode(toUtf8Bytes(auth)))
        //this.setHeader("authorization", "Basic TODO:" + auth);
    }

    // Configure the request to allow gzipped responses
    get allowGzip(): boolean {
        return getStore(this.#props, "gzip");
    }
    set allowGzip(value: boolean) {
        setStore(this.#props, "gzip", !!value);
    }

    // Allow credentials to be sent over an insecure (non-HTTPS) channel
    get allowInsecureAuthentication(): boolean {
        return !!getStore(this.#props, "allowInsecure");
    }
    set allowInsecureAuthentication(value: boolean) {
        setStore(this.#props, "allowInsecure", check(value, "boolean", "allowInsecureAuthentication"));
    }

    // Timeout (seconds)
    get timeout(): number { return getStore(this.#props, "timeout"); }
    set timeout(timeout: number) {
        timeout = check(timeout, "number", "timeout");
        if (timeout <= 0) { throw new Error("invalid timerout"); }
        setStore(this.#props, "timeout", timeout);
    }

    constructor(url: string) {
        this.#props = {
            allowInsecure: false,
            gzip: false,
            headers: { },
            method: "",
            timeout: 300,
            url: check(url, "string", "url")
        };
    }

    redirect(location: string): FetchRequest {
        // Redirection; for now we only support absolute locataions
        const current = this.url.split(":")[0].toLowerCase();
        const target = location.split(":")[0].toLowerCase();
        if (this.method !== "GET" || (current === "https" && target === "http") ||
          !location.match(/^https?:/)) {
            return logger.throwError(`unsupported redirect`, "UNSUPPORTED_OPERATION", {
                operation: `redirect(${ this.method } ${ JSON.stringify(this.url) } => ${ JSON.stringify(location) })`
            });
        }

        // Create a copy of this request, with a new URL
        const req = new FetchRequest(location);
        req.method = "GET";
        req.allowGzip = this.allowGzip;
        req.timeout = this.timeout;
        setStore(req.#props, "body", getStore(this.#props, "body"));
        setStore(req.#props, "headers", Object.assign({}, getStore(this.#props, "headers")));
        setStore(req.#props, "bodyType", getStore(this.#props, "bodyType"));

        // Do not forward credentials unless on the same domain; only absolute
        //req.allowInsecure = false;
        // paths are currently supported; may want a way to specify to forward?
        //setStore(req.#props, "creds", getStore(this.#pros, "creds"));

        return req;
    }

    clone(): FetchRequest {
        const clone = new FetchRequest(this.url);

        // Preserve "default method" (i.e. null)
        setStore(clone.#props, "method", getStore(this.#props, "method"));

        // Preserve "default body" with type, copying the Uint8Array is present
        const body = getStore(this.#props, "body");
        setStore(clone.#props, "body", (body == null) ? undefined: new Uint8Array(body));
        setStore(clone.#props, "bodyType", getStore(this.#props, "bodyType"));

        // Preserve "default headers"
        setStore(clone.#props, "headers", Object.assign({ }, getStore(this.#props, "headers")));

        // Credentials is readonly, so we copy internally
        setStore(clone.#props, "creds", getStore(this.#props, "creds"));

        if (this.allowGzip) { clone.allowGzip = true; }

        clone.timeout = this.timeout;
        if (this.allowInsecureAuthentication) { clone.allowInsecureAuthentication = true; }

        return clone;
    }

    freeze(): Frozen<FetchRequest> {
        // Copy the body so any changes to previous access do not modify it
        const body = getStore(this.#props, "body");
        if (body != null) { setStore(this.#props, "body", new Uint8Array(body)); }

        Object.freeze(this.#props.headers);
        Object.freeze(this.#props);

        return this;
    }

    isFrozen(): boolean {
        return Object.isFrozen(this.#props);
    }
}
