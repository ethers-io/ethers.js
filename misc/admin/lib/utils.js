"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateTime = exports.mkdir = exports.resolveProperties = exports.saveJson = exports.loadJson = exports.atomicWrite = exports.sortRecords = exports.sha256 = exports.repeat = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const crypto_1 = require("crypto");
function repeat(char, length) {
    if (char.length === 0) {
        return "";
    }
    let output = char;
    while (output.length < length) {
        output = output + output;
    }
    return output.substring(0, length);
}
exports.repeat = repeat;
function sha256(content) {
    const hasher = (0, crypto_1.createHash)("sha256");
    hasher.update(content);
    return "0x" + hasher.digest("hex");
}
exports.sha256 = sha256;
function sortRecords(record) {
    const keys = Object.keys(record);
    keys.sort();
    return keys.reduce((accum, name) => {
        accum[name] = record[name];
        return accum;
    }, {});
}
exports.sortRecords = sortRecords;
function atomicWrite(path, value) {
    const tmp = (0, path_1.resolve)(__dirname, "../../../.atomic-tmp");
    fs_1.default.writeFileSync(tmp, value);
    fs_1.default.renameSync(tmp, path);
}
exports.atomicWrite = atomicWrite;
function loadJson(path) {
    return JSON.parse(fs_1.default.readFileSync(path).toString());
}
exports.loadJson = loadJson;
function saveJson(filename, data, sort) {
    let replacer = undefined;
    if (sort) {
        replacer = (key, value) => {
            if (Array.isArray(value)) {
                // pass
            }
            else if (value && typeof (value) === "object") {
                const keys = Object.keys(value);
                keys.sort();
                return keys.reduce((accum, key) => {
                    accum[key] = value[key];
                    return accum;
                }, {});
            }
            return value;
        };
    }
    atomicWrite(filename, JSON.stringify(data, replacer, 2) + "\n");
}
exports.saveJson = saveJson;
function resolveProperties(props) {
    return __awaiter(this, void 0, void 0, function* () {
        const keys = Object.keys(props);
        const promises = yield Promise.all(keys.map((k) => props[k]));
        return keys.reduce((accum, key, index) => {
            accum[key] = promises[index];
            return accum;
        }, {});
    });
}
exports.resolveProperties = resolveProperties;
// Node 8 does not support recursive mkdir... Remove this in v6.
function mkdir(path) {
    let bail = 0;
    const dirs = [];
    while (path !== "/") {
        if (bail++ > 50) {
            throw new Error("something bad happened...");
        }
        if (fs_1.default.existsSync(path)) {
            break;
        }
        dirs.push(path);
        path = (0, path_1.dirname)(path);
    }
    while (dirs.length) {
        fs_1.default.mkdirSync(dirs.pop());
    }
}
exports.mkdir = mkdir;
function zpad(value, length) {
    if (length == null) {
        length = 2;
    }
    const str = String(value);
    return repeat("0", length - str.length) + str;
}
function getDate(date) {
    return [
        date.getFullYear(),
        zpad(date.getMonth() + 1),
        zpad(date.getDate())
    ].join("-");
}
function getDateTime(date) {
    return getDate(date) + " " + [
        zpad(date.getHours()),
        zpad(date.getMinutes() + 1)
    ].join(":");
}
exports.getDateTime = getDateTime;
