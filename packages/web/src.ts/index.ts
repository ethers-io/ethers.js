"use strict";

import { encode as base64Encode } from "@ethersproject/base64";
import { shallowCopy } from "@ethersproject/properties";
import { toUtf8Bytes } from "@ethersproject/strings";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { getUrl, GetUrlResponse } from "./geturl";

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

export interface OncePollable {
    once(eventName: "poll", handler: () => void): void;
}

export type PollOptions = {
    timeout?: number,
    floor?: number,
    ceiling?: number,
    interval?: number,
    retryLimit?: number,
    onceBlock?: OnceBlockable
    oncePoll?: OncePollable
};

export type FetchJsonResponse = {
    statusCode: number;
    headers: { [ header: string ]: string };
};


type Header = { key: string, value: string };

export function fetchJson(connection: string | ConnectionInfo, json?: string, processFunc?: (value: any, response: FetchJsonResponse) => any): Promise<any> {
    const headers: { [key: string]: Header } = { };

    let url: string = null;

    // @TODO: Allow ConnectionInfo to override some of these values
    const options: any = {
        method: "GET",
    };

    let allow304 = false;

    let timeout = 2 * 60 * 1000;

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
        let timer: NodeJS.Timer = null;
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

    const runningFetch = (async function() {

        let response: GetUrlResponse = null;
        try {
            response = await getUrl(url, options);
        } catch (error) {
            response = (<any>error).response;
            if (response == null) {
                logger.throwError("missing response", Logger.errors.SERVER_ERROR, {
                    serverError: error,
                    url: url
                });
            }
        }


        let body = response.body;

        if (allow304 && response.statusCode === 304) {
            body = null;

        } else if (response.statusCode < 200 || response.statusCode >= 300) {
            runningTimeout.cancel();
            logger.throwError("bad response", Logger.errors.SERVER_ERROR, {
                status: response.statusCode,
                headers: response.headers,
                body: body,
                url: url
            });
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
                json = await processFunc(json, response);
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

        let timer: NodeJS.Timer = null;
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

                } else if (options.oncePoll) {
                    options.oncePoll.once("poll", check);

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

