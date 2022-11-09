"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dnsEncode = exports.namehash = exports.isValidName = exports.ensNormalize = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../utils/index.js");
//import { ens_normalize } from "./ens-normalize/lib";
// @TOOD:
function ens_normalize(name) {
    return name;
}
const Zeros = new Uint8Array(32);
Zeros.fill(0);
function checkComponent(comp) {
    if (comp.length === 0) {
        throw new Error("invalid ENS name; empty component");
    }
    return comp;
}
function ensNameSplit(name) {
    const bytes = (0, index_js_2.toUtf8Bytes)(ens_normalize(name));
    const comps = [];
    if (name.length === 0) {
        return comps;
    }
    let last = 0;
    for (let i = 0; i < bytes.length; i++) {
        const d = bytes[i];
        // A separator (i.e. "."); copy this component
        if (d === 0x2e) {
            comps.push(checkComponent(bytes.slice(last, i)));
            last = i + 1;
        }
    }
    // There was a stray separator at the end of the name
    if (last >= bytes.length) {
        throw new Error("invalid ENS name; empty component");
    }
    comps.push(checkComponent(bytes.slice(last)));
    return comps;
}
function ensNormalize(name) {
    return ensNameSplit(name).map((comp) => (0, index_js_2.toUtf8String)(comp)).join(".");
}
exports.ensNormalize = ensNormalize;
function isValidName(name) {
    try {
        return (ensNameSplit(name).length !== 0);
    }
    catch (error) { }
    return false;
}
exports.isValidName = isValidName;
function namehash(name) {
    /* istanbul ignore if */
    (0, index_js_2.assertArgument)(typeof (name) === "string", "invalid ENS name; not a string", "name", name);
    let result = Zeros;
    const comps = ensNameSplit(name);
    while (comps.length) {
        result = (0, index_js_1.keccak256)((0, index_js_2.concat)([result, (0, index_js_1.keccak256)((comps.pop()))]));
    }
    return (0, index_js_2.hexlify)(result);
}
exports.namehash = namehash;
function dnsEncode(name) {
    return (0, index_js_2.hexlify)((0, index_js_2.concat)(ensNameSplit(name).map((comp) => {
        // DNS does not allow components over 63 bytes in length
        if (comp.length > 63) {
            throw new Error("invalid DNS encoded entry; length exceeds 63 bytes");
        }
        const bytes = new Uint8Array(comp.length + 1);
        bytes.set(comp, 1);
        bytes[0] = bytes.length - 1;
        return bytes;
    }))) + "00";
}
exports.dnsEncode = dnsEncode;
//# sourceMappingURL=namehash.js.map