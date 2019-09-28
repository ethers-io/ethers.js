"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var base64_1 = require("@ethersproject/base64");
var properties_1 = require("@ethersproject/properties");
var strings_1 = require("@ethersproject/strings");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
function fetchJson(connection, json, processFunc) {
    var headers = {};
    var url = null;
    // @TODO: Allow ConnectionInfo to override some of these values
    var options = {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrer: "client",
    };
    var allow304 = false;
    var timeout = 2 * 60 * 1000;
    if (typeof (connection) === "string") {
        url = connection;
    }
    else if (typeof (connection) === "object") {
        if (connection == null || connection.url == null) {
            logger.throwArgumentError("missing URL", "connection.url", connection);
        }
        url = connection.url;
        if (typeof (connection.timeout) === "number" && connection.timeout > 0) {
            timeout = connection.timeout;
        }
        if (connection.headers) {
            for (var key in connection.headers) {
                headers[key.toLowerCase()] = { key: key, value: String(connection.headers[key]) };
                if (["if-none-match", "if-modified-since"].indexOf(key.toLowerCase()) >= 0) {
                    allow304 = true;
                }
            }
        }
        if (connection.user != null && connection.password != null) {
            if (url.substring(0, 6) !== "https:" && connection.allowInsecureAuthentication !== true) {
                logger.throwError("basic authentication requires a secure https url", logger_1.Logger.errors.INVALID_ARGUMENT, { argument: "url", url: url, user: connection.user, password: "[REDACTED]" });
            }
            var authorization = connection.user + ":" + connection.password;
            headers["authorization"] = {
                key: "Authorization",
                value: "Basic " + base64_1.encode(strings_1.toUtf8Bytes(authorization))
            };
        }
    }
    return new Promise(function (resolve, reject) {
        var timer = null;
        if (timeout) {
            timer = setTimeout(function () {
                if (timer == null) {
                    return;
                }
                timer = null;
                reject(logger.makeError("timeout", logger_1.Logger.errors.TIMEOUT, { timeout: timeout }));
            }, timeout);
        }
        var cancelTimeout = function () {
            if (timer == null) {
                return;
            }
            clearTimeout(timer);
            timer = null;
        };
        if (json) {
            options.method = "POST";
            options.body = json;
            headers["content-type"] = { key: "Content-Type", value: "application/json" };
        }
        var flatHeaders = {};
        Object.keys(headers).forEach(function (key) {
            var header = headers[key];
            flatHeaders[header.key] = header.value;
        });
        options.headers = flatHeaders;
        return cross_fetch_1.default(url, options).then(function (response) {
            return response.text().then(function (body) {
                var json = null;
                if (allow304 && response.status === 304) {
                    // Leave json as null
                }
                else if (!response.ok) {
                    logger.throwError("bad response", logger_1.Logger.errors.SERVER_ERROR, {
                        status: response.status,
                        body: body,
                        type: response.type,
                        url: response.url
                    });
                }
                else {
                    try {
                        json = JSON.parse(body);
                    }
                    catch (error) {
                        logger.throwError("invalid JSON", logger_1.Logger.errors.SERVER_ERROR, {
                            body: body,
                            error: error,
                            url: url
                        });
                    }
                }
                if (processFunc) {
                    try {
                        var headers_1 = {};
                        if (response.headers.forEach) {
                            response.headers.forEach(function (value, key) {
                                headers_1[key.toLowerCase()] = value;
                            });
                        }
                        else {
                            ((response.headers).keys)().forEach(function (key) {
                                headers_1[key.toLowerCase()] = response.headers.get(key);
                            });
                        }
                        json = processFunc(json, {
                            statusCode: response.status,
                            status: response.statusText,
                            headers: headers_1
                        });
                    }
                    catch (error) {
                        logger.throwError("processing response error", logger_1.Logger.errors.SERVER_ERROR, {
                            body: json,
                            error: error
                        });
                    }
                }
                return json;
            });
        }, function (error) {
            throw error;
        }).then(function (result) {
            cancelTimeout();
            resolve(result);
        }, function (error) {
            cancelTimeout();
            reject(error);
        });
    });
}
exports.fetchJson = fetchJson;
function poll(func, options) {
    if (!options) {
        options = {};
    }
    options = properties_1.shallowCopy(options);
    if (options.floor == null) {
        options.floor = 0;
    }
    if (options.ceiling == null) {
        options.ceiling = 10000;
    }
    if (options.interval == null) {
        options.interval = 250;
    }
    return new Promise(function (resolve, reject) {
        var timer = null;
        var done = false;
        // Returns true if cancel was successful. Unsuccessful cancel means we're already done.
        var cancel = function () {
            if (done) {
                return false;
            }
            done = true;
            if (timer) {
                clearTimeout(timer);
            }
            return true;
        };
        if (options.timeout) {
            timer = setTimeout(function () {
                if (cancel()) {
                    reject(new Error("timeout"));
                }
            }, options.timeout);
        }
        var retryLimit = options.retryLimit;
        var attempt = 0;
        function check() {
            return func().then(function (result) {
                // If we have a result, or are allowed null then we're done
                if (result !== undefined) {
                    if (cancel()) {
                        resolve(result);
                    }
                }
                else if (options.onceBlock) {
                    options.onceBlock.once("block", check);
                    // Otherwise, exponential back-off (up to 10s) our next request
                }
                else if (!done) {
                    attempt++;
                    if (attempt > retryLimit) {
                        if (cancel()) {
                            reject(new Error("retry limit reached"));
                        }
                        return;
                    }
                    var timeout = options.interval * parseInt(String(Math.random() * Math.pow(2, attempt)));
                    if (timeout < options.floor) {
                        timeout = options.floor;
                    }
                    if (timeout > options.ceiling) {
                        timeout = options.ceiling;
                    }
                    setTimeout(check, timeout);
                }
                return null;
            }, function (error) {
                if (cancel()) {
                    reject(error);
                }
            });
        }
        check();
    });
}
exports.poll = poll;
