"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var xmlhttprequest_1 = require("xmlhttprequest");
var utf8_1 = require("./utf8");
var base64_1 = require("./base64");
var errors = __importStar(require("./errors"));
function fetchJson(url, json, processFunc) {
    var headers = [];
    if (typeof (url) === 'object' && url.url != null) {
        if (url.url == null) {
            errors.throwError('missing URL', errors.MISSING_ARGUMENT, { arg: 'url' });
        }
        if (url.user != null && url.password != null) {
            if (url.url.substring(0, 6) !== 'https:' && url.allowInsecure !== true) {
                errors.throwError('basic authentication requires a secure https url', errors.INVALID_ARGUMENT, { arg: 'url', url: url.url, user: url.user, password: '[REDACTED]' });
            }
            var authorization = url.user + ':' + url.password;
            headers.push({
                key: 'Authorization',
                value: 'Basic ' + base64_1.encode(utf8_1.toUtf8Bytes(authorization))
            });
        }
        url = url.url;
    }
    return new Promise(function (resolve, reject) {
        var request = new xmlhttprequest_1.XMLHttpRequest();
        if (json) {
            request.open('POST', url, true);
            headers.push({ key: 'Content-Type', value: 'application/json' });
        }
        else {
            request.open('GET', url, true);
        }
        headers.forEach(function (header) {
            request.setRequestHeader(header.key, header.value);
        });
        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }
            try {
                var result = JSON.parse(request.responseText);
            }
            catch (error) {
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
                    error.url = url;
                    error.body = json;
                    error.responseText = request.responseText;
                    reject(error);
                    return;
                }
            }
            if (request.status != 200) {
                // @TODO: not any!
                var error = new Error('invalid response - ' + request.status);
                error.statusCode = request.statusCode;
                reject(error);
                return;
            }
            resolve(result);
        };
        request.onerror = function (error) {
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
            // @TODO: not any!
            var connectionError = new Error('connection error');
            connectionError.error = error;
            reject(connectionError);
        }
    });
}
exports.fetchJson = fetchJson;
