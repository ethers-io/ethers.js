import { hexlify } from "@ethersproject/bytes";
import { defineProperties, getStore } from "@ethersproject/properties";
import { toUtf8String } from "@ethersproject/strings";

import { logger } from "./logger.js";

import type { FetchRequest } from "./request.js";

export interface FetchResponseWithBody extends FetchResponse {
    body: Readonly<Uint8Array>;
}

interface ThrottleError extends Error {
    stall: number;
    throttle: true;
};

export class FetchResponse implements Iterable<[ key: string, value: string ]> {
    #props: {
        statusCode: number,
        statusMessage: string,
        headers: Readonly<Record<string, string>>,
        body: null | Readonly<Uint8Array>,
        request: null | FetchRequest,
    }
    #error: { error?: Error, message: string };

    toString(): string {
        const body = getStore(this.#props, "body");
        return `<Response status=${ this.statusCode } body=${ body ? hexlify(body): "null" }>`;
    }

    get statusCode(): number { return getStore(this.#props, "statusCode"); }
    get statusMessage(): string { return getStore(this.#props, "statusMessage"); }
    get headers() { return getStore(this.#props, "headers"); }
    get body(): null | Readonly<Uint8Array> {
        const body = getStore(this.#props, "body");
        return (body == null) ? null: new Uint8Array(body);
    }
    get bodyText(): string {
        try {
            const body = getStore(this.#props, "body");
            return (body == null) ? "": toUtf8String(body);
        } catch (error) {
            return logger.throwError("response body is not valid UTF-8 data", "UNSUPPORTED_OPERATION", {
                operation: "bodyText", info: { response: this }
            });
        }
    }
    get bodyJson(): any {
        try {
            return JSON.parse(this.bodyText);
        } catch (error) {
            return logger.throwError("response body is not valid JSON", "UNSUPPORTED_OPERATION", {
                operation: "bodyJson", info: { response: this }
            });
        }
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

    constructor(statusCode: number, statusMessage: string, headers: Readonly<Record<string, string>>, body: null | Uint8Array, request?: FetchRequest) {
        this.#props = {
            statusCode,
            statusMessage,
            headers: Object.freeze(Object.assign({ }, Object.keys(headers).reduce((accum, k) => {
                accum[k.toLowerCase()] = headers[k];
                return accum;
            }, <Record<string, string>>{ }))),
            body: ((body == null) ? null: new Uint8Array(body)),
            request: (request || null),
        };
        this.#error = { message: "" };
    }

    makeServerError(message?: string, error?: Error): FetchResponse {
        let statusMessage: string;
        if (!message) {
            message = `${ this.statusCode } ${ this.statusMessage }`;
            statusMessage = `CLIENT ESCALATED SERVER ERROR (${ message })`;
        } else {
            statusMessage = `CLIENT ESCALATED SERVER ERROR (${ this.statusCode } ${ this.statusMessage }; ${ message })`;
        }
        const response = new FetchResponse(599, statusMessage, this.headers,
            this.body, getStore(this.#props, "request") || undefined);
        response.#error = { message, error };
        return response;
    }

    throwThrottleError(message?: string, stall?: number): never {
        if (stall == null) { stall = 1000; }
        if (typeof(stall) !== "number" || !Number.isInteger(stall) || stall < 0) {
            logger.throwArgumentError("invalid stall timeout", "stall", stall);
        }

        const error = new Error(message || "throttling requests");

        defineProperties(<ThrottleError>error, { stall, throttle: true });

        throw error;
    }

    getHeader(key: string): string {
        return this.headers[key.toLowerCase()];
    }

    hasBody(): this is FetchResponseWithBody {
        const body = getStore(this.#props, "body");
        return (body != null);
    }

    get request(): null | FetchRequest { return getStore(this.#props, "request"); }

    ok(): boolean {
        return (this.#error.message === "" && this.statusCode >= 200 && this.statusCode < 300);
    }

    assertOk(): void {
        if (this.ok()) { return; }
        let { message, error } = this.#error;
        if (message === "") {
            message = `server response ${ this.statusCode } ${ this.statusMessage }`;
        }
        logger.throwError(message, "SERVER_ERROR", {
            request: (this.request || "unknown request"), response: this, error
        });
    }
}
