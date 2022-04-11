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
var _FetchResponse_props, _FetchResponse_error;
import { hexlify } from "@ethersproject/bytes";
import { defineProperties, getStore } from "@ethersproject/properties";
import { toUtf8String } from "@ethersproject/strings";
import { logger } from "./logger.js";
;
export class FetchResponse {
    constructor(statusCode, statusMessage, headers, body, request) {
        _FetchResponse_props.set(this, void 0);
        _FetchResponse_error.set(this, void 0);
        __classPrivateFieldSet(this, _FetchResponse_props, {
            statusCode,
            statusMessage,
            headers: Object.freeze(Object.assign({}, Object.keys(headers).reduce((accum, k) => {
                accum[k.toLowerCase()] = headers[k];
                return accum;
            }, {}))),
            body: ((body == null) ? null : new Uint8Array(body)),
            request: (request || null),
        }, "f");
        __classPrivateFieldSet(this, _FetchResponse_error, { message: "" }, "f");
    }
    toString() {
        const body = getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "body");
        return `<Response status=${this.statusCode} body=${body ? hexlify(body) : "null"}>`;
    }
    get statusCode() { return getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "statusCode"); }
    get statusMessage() { return getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "statusMessage"); }
    get headers() { return getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "headers"); }
    get body() {
        const body = getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "body");
        return (body == null) ? null : new Uint8Array(body);
    }
    get bodyText() {
        try {
            const body = getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "body");
            return (body == null) ? "" : toUtf8String(body);
        }
        catch (error) {
            return logger.throwError("response body is not valid UTF-8 data", "UNSUPPORTED_OPERATION", {
                operation: "bodyText", info: { response: this }
            });
        }
    }
    get bodyJson() {
        try {
            return JSON.parse(this.bodyText);
        }
        catch (error) {
            return logger.throwError("response body is not valid JSON", "UNSUPPORTED_OPERATION", {
                operation: "bodyJson", info: { response: this }
            });
        }
    }
    [(_FetchResponse_props = new WeakMap(), _FetchResponse_error = new WeakMap(), Symbol.iterator)]() {
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
    makeServerError(message, error) {
        let statusMessage;
        if (!message) {
            message = `${this.statusCode} ${this.statusMessage}`;
            statusMessage = `CLIENT ESCALATED SERVER ERROR (${message})`;
        }
        else {
            statusMessage = `CLIENT ESCALATED SERVER ERROR (${this.statusCode} ${this.statusMessage}; ${message})`;
        }
        const response = new FetchResponse(599, statusMessage, this.headers, this.body, getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "request") || undefined);
        __classPrivateFieldSet(response, _FetchResponse_error, { message, error }, "f");
        return response;
    }
    throwThrottleError(message, stall) {
        if (stall == null) {
            stall = 1000;
        }
        if (typeof (stall) !== "number" || !Number.isInteger(stall) || stall < 0) {
            logger.throwArgumentError("invalid stall timeout", "stall", stall);
        }
        const error = new Error(message || "throttling requests");
        defineProperties(error, { stall, throttle: true });
        throw error;
    }
    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }
    hasBody() {
        const body = getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "body");
        return (body != null);
    }
    get request() { return getStore(__classPrivateFieldGet(this, _FetchResponse_props, "f"), "request"); }
    ok() {
        return (__classPrivateFieldGet(this, _FetchResponse_error, "f").message === "" && this.statusCode >= 200 && this.statusCode < 300);
    }
    assertOk() {
        if (this.ok()) {
            return;
        }
        let { message, error } = __classPrivateFieldGet(this, _FetchResponse_error, "f");
        if (message === "") {
            message = `server response ${this.statusCode} ${this.statusMessage}`;
        }
        logger.throwError(message, "SERVER_ERROR", {
            request: (this.request || "unknown request"), response: this, error
        });
    }
}
//# sourceMappingURL=response.js.map