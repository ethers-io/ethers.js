"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}
exports.defineReadOnly = defineReadOnly;
// Crawl up the constructor chain to find a static method
function getStatic(ctor, key) {
    for (var i = 0; i < 32; i++) {
        if (ctor[key]) {
            return ctor[key];
        }
        if (!ctor.prototype || typeof (ctor.prototype) !== "object") {
            break;
        }
        ctor = Object.getPrototypeOf(ctor.prototype).constructor;
    }
    return null;
}
exports.getStatic = getStatic;
function resolveProperties(object) {
    var promises = Object.keys(object).map(function (key) {
        var value = object[key];
        if (!(value instanceof Promise)) {
            return Promise.resolve({ key: key, value: value });
        }
        return value.then(function (value) {
            return { key: key, value: value };
        });
    });
    return Promise.all(promises).then(function (results) {
        var result = {};
        return results.reduce(function (accum, result) {
            accum[result.key] = result.value;
            return accum;
        }, result);
    });
}
exports.resolveProperties = resolveProperties;
function checkProperties(object, properties) {
    if (!object || typeof (object) !== "object") {
        logger.throwArgumentError("invalid object", "object", object);
    }
    Object.keys(object).forEach(function (key) {
        if (!properties[key]) {
            logger.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
        }
    });
}
exports.checkProperties = checkProperties;
function shallowCopy(object) {
    var result = {};
    for (var key in object) {
        result[key] = object[key];
    }
    return result;
}
exports.shallowCopy = shallowCopy;
var opaque = { bigint: true, boolean: true, number: true, string: true };
// Returns a new copy of object, such that no properties may be replaced.
// New properties may be added only to objects.
function deepCopy(object) {
    // Opaque objects are not mutable, so safe to copy by assignment
    if (object === undefined || object === null || opaque[typeof (object)]) {
        return object;
    }
    // Arrays are mutable, so we need to create a copy
    if (Array.isArray(object)) {
        return Object.freeze(object.map(function (item) { return deepCopy(item); }));
    }
    if (typeof (object) === "object") {
        // Immutable objects are safe to just use
        if (Object.isFrozen(object)) {
            return object;
        }
        var result = {};
        for (var key in object) {
            var value = object[key];
            if (value === undefined) {
                continue;
            }
            defineReadOnly(result, key, deepCopy(value));
        }
        return result;
    }
    // The function type is also immutable, so safe to copy by assignment
    if (typeof (object) === "function") {
        return object;
    }
    throw new Error("Cannot deepCopy " + typeof (object));
}
exports.deepCopy = deepCopy;
var Description = /** @class */ (function () {
    function Description(info) {
        for (var key in info) {
            this[key] = deepCopy(info[key]);
        }
        Object.freeze(this);
    }
    return Description;
}());
exports.Description = Description;
