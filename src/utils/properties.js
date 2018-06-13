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
function defineDeferredReadOnly(object, name, value) {
    var _value = value;
    var setter = function (value) {
        _value = value;
    };
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function () { return _value; },
        set: setter
    });
    return setter;
}
exports.defineDeferredReadOnly = defineDeferredReadOnly;
function resolveProperties(object) {
    var result = {};
    var promises = [];
    Object.keys(object).forEach(function (key) {
        var value = object[key];
        if (value instanceof Promise) {
            promises.push(value.then(function (value) { result[key] = value; }));
        }
        else {
            result[key] = value;
        }
    });
    return Promise.all(promises).then(function () {
        return object;
    });
}
exports.resolveProperties = resolveProperties;
