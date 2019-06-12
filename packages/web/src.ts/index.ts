"use strict";

import { default as _fetch, Response, RequestInfo, RequestInit } from "node-fetch";
const fetch: (url: RequestInfo, options: RequestInit) => Promise<Response> = _fetch.bind(global);

import { encode as base64Encode } from "@ethersproject/base64";
import * as errors from "@ethersproject/errors";
import { shallowCopy } from "@ethersproject/properties";
import { toUtf8Bytes } from "@ethersproject/strings";


// Exported Types
export type ConnectionInfo = {
    url: string,
    user?: string,
    password?: string,
    allowInsecureAuthentication?: boolean,
    timeout?: number,
    headers?: { [key: string]: string | number }
};

export interface OnceBlockable {
    once(eventName: "block", handler: () => void): void;
}

export type PollOptions = {
    timeout?: number,
    floor?: number,
    ceiling?: number,
    interval?: number,
    retryLimit?: number,
    onceBlock?: OnceBlockable
};



type Header = { key: string, value: string };

export function fetchJson(connection: string | ConnectionInfo, json?: string, processFunc?: (value: any) => any): Promise<any> {
    let headers: { [key: string]: Header } = { };

    let url: string = null;

    // @TODO: Allow ConnectionInfo to override some of these values
    let options: any = {
        method: "GET",
        mode: "cors",               // no-cors, cors, *same-origin
        cache: "no-cache",          // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "follow",         // manual, *follow, error
        referrer: "client",         // no-referrer, *client
    };

    let timeout = 2 * 60 * 1000;

    if (typeof(connection) === "string") {
        url = connection;

    } else if (typeof(connection) === "object") {
        if (connection == null || connection.url == null) {
            errors.throwArgumentError("missing URL", "connection.url", connection);
        }

        url = connection.url;

        if (typeof(connection.timeout) === "number" && connection.timeout > 0) {
            timeout = connection.timeout;
        }

        if (connection.headers) {
            for (let key in connection.headers) {
                headers[key.toLowerCase()] = { key: key, value: String(connection.headers[key]) };
            }
        }

        if (connection.user != null && connection.password != null) {
            if (url.substring(0, 6) !== "https:" && connection.allowInsecureAuthentication !== true) {
                errors.throwError(
                    "basic authentication requires a secure https url",
                    errors.INVALID_ARGUMENT,
                    { arg: "url", url: url, user: connection.user, password: "[REDACTED]" }
                );
            }

            let authorization = connection.user + ":" + connection.password;
            headers["authorization"] = {
                key: "Authorization",
                value: "Basic " + base64Encode(toUtf8Bytes(authorization))
            };
        }
    }

    return new Promise(function(resolve, reject) {

        let timer: any = null;
        if (timeout) {
            timer = setTimeout(() => {
                if (timer == null) { return; }
                timer = null;

                reject(errors.makeError("timeout", errors.TIMEOUT, { }));
                //setTimeout(() => {
                //    request.abort();
                //}, 0);
            }, timeout);
        }

        let cancelTimeout = () => {
            if (timer == null) { return; }
            clearTimeout(timer);
            timer = null;
        }

        if (json) {
            options.method = "POST";
            options.body = json;
            headers["content-type"] = { key: "Content-Type", value: "application/json" };
        }

        let flatHeaders: { [ key: string ]: string } = { };
        Object.keys(headers).forEach((key) => {
            let header = headers[key];
            flatHeaders[header.key] = header.value;
        });
        options.headers = flatHeaders;

        return fetch(url, options).then((response) => {
            return response.text().then((body) => {
                if (!response.ok) {
                    errors.throwError("bad response", errors.SERVER_ERROR, {
                        status: response.status,
                        body: body,
                        type: response.type,
                        url: response.url
                    });
                }

                return body;
            });

        }).then((text) => {
            let json: any = null;
            try {
                json = JSON.parse(text);
            } catch (error) {
                errors.throwError("invalid JSON", errors.SERVER_ERROR, {
                    body: text,
                    error: error,
                    url: url
                });
            }

            if (processFunc) {
                try {
                    json = processFunc(json);
                } catch (error) {
                    errors.throwError("processing response error", errors.SERVER_ERROR, {
                        body: json,
                        error: error
                    });
                }
            }

            return json;

        }, (error) => {
            throw error;
        }).then((result) => {
            cancelTimeout();
            resolve(result);
        }, (error) => {
            cancelTimeout();
            reject(error);
        });
    });
}

export function poll(func: () => Promise<any>, options?: PollOptions): Promise<any> {
    if (!options) { options = {}; }
    options = shallowCopy(options);
    if (options.floor == null) { options.floor = 0; }
    if (options.ceiling == null) { options.ceiling = 10000; }
    if (options.interval == null) { options.interval = 250; }

    return new Promise(function(resolve, reject) {

        let timer: any = null;
        let done: boolean = false;

        // Returns true if cancel was successful. Unsuccessful cancel means we're already done.
        let cancel = (): boolean => {
            if (done) { return false; }
            done = true;
            if (timer) { clearTimeout(timer); }
            return true;
        };

        if (options.timeout) {
            timer = setTimeout(() => {
                if (cancel()) { reject(new Error("timeout")); }
            }, options.timeout)
        }

        let retryLimit = options.retryLimit;

        let attempt = 0;
        function check() {
            return func().then(function(result) {

                // If we have a result, or are allowed null then we're done
                if (result !== undefined) {
                    if (cancel()) { resolve(result); }

                } else if (options.onceBlock) {
                    options.onceBlock.once("block", check);

                // Otherwise, exponential back-off (up to 10s) our next request
                } else if (!done) {
                    attempt++;
                    if (attempt > retryLimit) {
                        if (cancel()) { reject(new Error("retry limit reached")); }
                        return;
                    }

                    let timeout = options.interval * parseInt(String(Math.random() * Math.pow(2, attempt)));
                    if (timeout < options.floor) { timeout = options.floor; }
                    if (timeout > options.ceiling) { timeout = options.ceiling; }

                    setTimeout(check, timeout);
                }

                return null;
            }, function(error) {
                if (cancel()) { reject(error); }
            });
        }
        check();
    });
}

