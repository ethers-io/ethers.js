"use strict";

import fetch from "cross-fetch";

import { encode as base64Encode } from "@ethersproject/base64";
import { shallowCopy } from "@ethersproject/properties";
import { toUtf8Bytes } from "@ethersproject/strings";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

// Exported Types
export type ConnectionInfo = {
    url: string,
    user?: string,
    password?: string,
    allowInsecureAuthentication?: boolean,
    throttleLimit?: number,
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

export type FetchJsonResponse = {
    statusCode: number;
    status: string;
    headers: { [ header: string ]: string };
};


type Header = { key: string, value: string };

function getResponse(response: Response): FetchJsonResponse {
    const headers: { [ header: string ]: string } = { };
    if (response.headers.forEach) {
        response.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });
    } else {
        (<() => Array<string>>((<any>(response.headers)).keys))().forEach((key) => {
            headers[key.toLowerCase()] = response.headers.get(key);
        });
    }

    return {
        statusCode: response.status,
        status: response.statusText,
        headers: headers
    };
}
export function fetchJson(connection: string | ConnectionInfo, json?: string, processFunc?: (value: any, response: FetchJsonResponse) => any): Promise<any> {
    const headers: { [key: string]: Header } = { };

    let url: string = null;

    // @TODO: Allow ConnectionInfo to override some of these values
    const options: any = {
        method: "GET",
        mode: "cors",               // no-cors, cors, *same-origin
        cache: "no-cache",          // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "follow",         // manual, *follow, error
        referrer: "client",         // no-referrer, *client
    };

    let allow304 = false;

    let timeout = 2 * 60 * 1000;
    let throttle = 25;
    if (options.throttleLimit) { throttle = options.throttleLimit; }

    if (typeof(connection) === "string") {
        url = connection;

    } else if (typeof(connection) === "object") {
        if (connection == null || connection.url == null) {
            logger.throwArgumentError("missing URL", "connection.url", connection);
        }

        url = connection.url;

        if (typeof(connection.timeout) === "number" && connection.timeout > 0) {
            timeout = connection.timeout;
        }

        if (connection.headers) {
            for (const key in connection.headers) {
                headers[key.toLowerCase()] = { key: key, value: String(connection.headers[key]) };
                if (["if-none-match", "if-modified-since"].indexOf(key.toLowerCase()) >= 0) {
                    allow304 = true;
                }
            }
        }

        if (connection.user != null && connection.password != null) {
            if (url.substring(0, 6) !== "https:" && connection.allowInsecureAuthentication !== true) {
                logger.throwError(
                    "basic authentication requires a secure https url",
                    Logger.errors.INVALID_ARGUMENT,
                    { argument: "url", url: url, user: connection.user, password: "[REDACTED]" }
                );
            }

            const authorization = connection.user + ":" + connection.password;
            headers["authorization"] = {
                key: "Authorization",
                value: "Basic " + base64Encode(toUtf8Bytes(authorization))
            };
        }
    }

    if (json) {
        options.method = "POST";
        options.body = json;
        headers["content-type"] = { key: "Content-Type", value: "application/json" };
    }

    const flatHeaders: { [ key: string ]: string } = { };
    Object.keys(headers).forEach((key) => {
        const header = headers[key];
        flatHeaders[header.key] = header.value;
    });
    options.headers = flatHeaders;

    const runningTimeout = (function() {
        let timer: any = null;
        const promise = new Promise(function(resolve, reject) {
            if (timeout) {
                timer = setTimeout(() => {
                    if (timer == null) { return; }
                    timer = null;

                    reject(logger.makeError("timeout", Logger.errors.TIMEOUT, { timeout: timeout }));
                }, timeout);
            }
        });

        const cancel = function() {
            if (timer == null) { return; }
            clearTimeout(timer);
            timer = null;
        }

        return { promise, cancel };
    })();
    if (throttle == 100) {
        console.log(throttle);
    }

    const runningFetch = (async function() {

        let response: Response = null;
        let body: string = null;

        while (true) {
            try {
            response = await fetch(url, options);
            } catch (error) {
                console.log(error);
            }
            body = await response.text();

            if (allow304 && response.status === 304) {
                // Leave body as null
                break;

            } else if (!response.ok) {
                runningTimeout.cancel();
                logger.throwError("bad response", Logger.errors.SERVER_ERROR, {
                    status: response.status,
                    body: body,
                    type: response.type,
                    url: response.url
                });

            } else {
                break;
            }
        }

        runningTimeout.cancel();

        let json: any = null;
        if (body != null) {
            try {
                json = JSON.parse(body);
            } catch (error) {
                logger.throwError("invalid JSON", Logger.errors.SERVER_ERROR, {
                    body: body,
                    error: error,
                    url: url
                });
            }
        }

        if (processFunc) {
            try {
                json = await processFunc(json, getResponse(response));
            } catch (error) {
                logger.throwError("processing response error", Logger.errors.SERVER_ERROR, {
                    body: json,
                    error: error
                });
            }
        }

        return json;
    })();

    return Promise.race([ runningTimeout.promise, runningFetch ]);
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
        const cancel = (): boolean => {
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

        const retryLimit = options.retryLimit;

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

