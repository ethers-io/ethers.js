"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors = __importStar(require("@ethersproject/errors"));
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}
exports.defineReadOnly = defineReadOnly;
// There are some issues with instanceof with npm link, so we use this
// to ensure types are what we expect. We use this for a little extra
// protection to make sure the correct types are being passed around.
function getType(object) {
    var type = typeof (object);
    if (type !== "function") {
        return null;
    }
    var types = [];
    var obj = object;
    while (true) {
        var type_1 = obj.name;
        if (!type_1) {
            break;
        }
        types.push(type_1);
        obj = Object.getPrototypeOf(obj);
    }
    return types.join(" ");
}
function hasSuffix(text, suffix) {
    return text.substring(text.length - suffix.length) === suffix;
}
function isNamedInstance(type, value) {
    var name = getType(type);
    if (!name) {
        return false;
    }
    // Not a string...
    if (typeof (value) !== "string") {
        // Not an instance...
        if (typeof (value) !== "object") {
            return false;
        }
        // Get the instance type
        value = getType(value.constructor);
    }
    return (name === value || hasSuffix(value, " " + name));
}
exports.isNamedInstance = isNamedInstance;
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
function checkProperties(object, properties) {
    if (!object || typeof (object) !== "object") {
        errors.throwError("invalid object", errors.INVALID_ARGUMENT, {
            argument: "object",
            value: object
        });
    }
    Object.keys(object).forEach(function (key) {
        if (!properties[key]) {
            errors.throwError("invalid object key - " + key, errors.INVALID_ARGUMENT, {
                argument: "transaction",
                value: object,
                key: key
            });
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
var opaque = { boolean: true, number: true, string: true };
function deepCopy(object, frozen) {
    // Opaque objects are not mutable, so safe to copy by assignment
    if (object === undefined || object === null || opaque[typeof (object)]) {
        return object;
    }
    // Arrays are mutable, so we need to create a copy
    if (Array.isArray(object)) {
        var result = object.map(function (item) { return deepCopy(item, frozen); });
        if (frozen) {
            Object.freeze(result);
        }
        return result;
    }
    if (typeof (object) === "object") {
        // Some internal objects, which are already immutable
        if (isNamedInstance("BigNumber", object)) {
            return object;
        }
        if (isNamedInstance("Description", object)) {
            return object;
        }
        if (isNamedInstance("Indexed", object)) {
            return object;
        }
        var result = {};
        for (var key in object) {
            var value = object[key];
            if (value === undefined) {
                continue;
            }
            defineReadOnly(result, key, deepCopy(value, frozen));
        }
        if (frozen) {
            Object.freeze(result);
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
            defineReadOnly(this, key, deepCopy(info[key], true));
        }
        Object.freeze(this);
    }
    Description.isType = function (value) {
        return isNamedInstance(this, value);
    };
    return Description;
}());
exports.Description = Description;
