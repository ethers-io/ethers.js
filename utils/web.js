'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var xmlhttprequest_1 = require("xmlhttprequest");
var base64_1 = require("./base64");
var utf8_1 = require("./utf8");
var errors = __importStar(require("./errors"));
function fetchJson(connection, json, processFunc) {
    var headers = {};
    var url = null;
    var timeout = 2 * 60 * 1000;
    if (typeof (connection) === 'string') {
        url = connection;
    }
    else if (typeof (connection) === 'object') {
        if (connection.url == null) {
            errors.throwError('missing URL', errors.MISSING_ARGUMENT, { arg: 'url' });
        }
        url = connection.url;
        if (typeof (connection.timeout) === 'number' && connection.timeout > 0) {
            timeout = connection.timeout;
        }
        if (connection.headers) {
            for (var key in connection.headers) {
                headers[key.toLowerCase()] = { key: key, value: String(connection.headers[key]) };
            }
        }
        if (connection.user != null && connection.password != null) {
            if (url.substring(0, 6) !== 'https:' && connection.allowInsecure !== true) {
                errors.throwError('basic authentication requires a secure https url', errors.INVALID_ARGUMENT, { arg: 'url', url: url, user: connection.user, password: '[REDACTED]' });
            }
            var authorization = connection.user + ':' + connection.password;
            headers['authorization'] = {
                key: 'Authorization',
                value: 'Basic ' + base64_1.encode(utf8_1.toUtf8Bytes(authorization))
            };
        }
    }
    return new Promise(function (resolve, reject) {
        var request = new xmlhttprequest_1.XMLHttpRequest();
        var timer = null;
        timer = setTimeout(function () {
            if (timer == null) {
                return;
            }
            timer = null;
            reject(new Error('timeout'));
            setTimeout(function () {
                request.abort();
            }, 0);
        }, timeout);
        var cancelTimeout = function () {
            if (timer == null) {
                return;
            }
            clearTimeout(timer);
            timer = null;
        };
        if (json) {
            request.open('POST', url, true);
            headers['content-type'] = { key: 'Content-Type', value: 'application/json' };
        }
        else {
            request.open('GET', url, true);
        }
        Object.keys(headers).forEach(function (key) {
            var header = headers[key];
            request.setRequestHeader(header.key, header.value);
        });
        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }
            var result = null;
            try {
                result = JSON.parse(request.responseText);
            }
            catch (error) {
                cancelTimeout();
                // @TODO: not any!
                var jsonError = new Error('invalid json response');
                jsonError.orginialError = error;
                jsonError.responseText = request.responseText;
                jsonError.url = url;
                reject(jsonError);
                return;
            }
            if (processFunc) {
                try {
                    result = processFunc(result);
                }
                catch (error) {
                    cancelTimeout();
                    error.url = url;
                    error.body = json;
                    error.responseText = request.responseText;
                    reject(error);
                    return;
                }
            }
            if (request.status != 200) {
                cancelTimeout();
                // @TODO: not any!
                var error = new Error('invalid response - ' + request.status);
                error.statusCode = request.status;
                reject(error);
                return;
            }
            cancelTimeout();
            resolve(result);
        };
        request.onerror = function (error) {
            cancelTimeout();
            reject(error);
        };
        try {
            if (json) {
                request.send(json);
            }
            else {
                request.send();
            }
        }
        catch (error) {
            cancelTimeout();
            // @TODO: not any!
            var connectionError = new Error('connection error');
            connectionError.error = error;
            reject(connectionError);
        }
    });
}
exports.fetchJson = fetchJson;
function poll(func, options) {
    if (!options) {
        options = {};
    }
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
                    reject(new Error('timeout'));
                }
            }, options.timeout);
        }
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
                    options.onceBlock.once('block', check);
                    // Otherwise, exponential back-off (up to 10s) our next request
                }
                else if (!done) {
                    attempt++;
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
