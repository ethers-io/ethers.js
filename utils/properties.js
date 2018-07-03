'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}
exports.defineReadOnly = defineReadOnly;
function defineFrozen(object, name, value) {
    var frozen = JSON.stringify(value);
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function () { return JSON.parse(frozen); }
    });
}
exports.defineFrozen = defineFrozen;
function resolveProperties(object) {
    var result = {};
    var promises = [];
    Object.keys(object).forEach(function (key) {
        var value = object[key];
        if (value instanceof Promise) {
            promises.push(value.then(function (value) {
                result[key] = value;
                return null;
            }));
        }
        else {
            result[key] = value;
        }
    });
    return Promise.all(promises).then(function () {
        return result;
    });
}
exports.resolveProperties = resolveProperties;
function shallowCopy(object) {
    var result = {};
    for (var key in object) {
        result[key] = object[key];
    }
    return result;
}
exports.shallowCopy = shallowCopy;
function jsonCopy(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.jsonCopy = jsonCopy;
