// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbiCoder_instances, _AbiCoder_getCoder;
import { logger } from "./logger.js";
import { Reader, Writer } from "./coders/abstract-coder.js";
import { AddressCoder } from "./coders/address.js";
import { ArrayCoder } from "./coders/array.js";
import { BooleanCoder } from "./coders/boolean.js";
import { BytesCoder } from "./coders/bytes.js";
import { FixedBytesCoder } from "./coders/fixed-bytes.js";
import { NullCoder } from "./coders/null.js";
import { NumberCoder } from "./coders/number.js";
import { StringCoder } from "./coders/string.js";
import { TupleCoder } from "./coders/tuple.js";
import { ParamType } from "./fragments.js";
const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
export class AbiCoder {
    constructor() {
        _AbiCoder_instances.add(this);
    }
    getDefaultValue(types) {
        const coders = types.map((type) => __classPrivateFieldGet(this, _AbiCoder_instances, "m", _AbiCoder_getCoder).call(this, ParamType.from(type)));
        const coder = new TupleCoder(coders, "_");
        return coder.defaultValue();
    }
    encode(types, values) {
        logger.assertArgumentCount(values.length, types.length, "types/values length mismatch");
        const coders = types.map((type) => __classPrivateFieldGet(this, _AbiCoder_instances, "m", _AbiCoder_getCoder).call(this, ParamType.from(type)));
        const coder = (new TupleCoder(coders, "_"));
        const writer = new Writer();
        coder.encode(writer, values);
        return writer.data;
    }
    decode(types, data, loose) {
        const coders = types.map((type) => __classPrivateFieldGet(this, _AbiCoder_instances, "m", _AbiCoder_getCoder).call(this, ParamType.from(type)));
        const coder = new TupleCoder(coders, "_");
        return coder.decode(new Reader(data, loose));
    }
}
_AbiCoder_instances = new WeakSet(), _AbiCoder_getCoder = function _AbiCoder_getCoder(param) {
    if (param.isArray()) {
        return new ArrayCoder(__classPrivateFieldGet(this, _AbiCoder_instances, "m", _AbiCoder_getCoder).call(this, param.arrayChildren), param.arrayLength, param.name);
    }
    if (param.isTuple()) {
        return new TupleCoder(param.components.map((c) => __classPrivateFieldGet(this, _AbiCoder_instances, "m", _AbiCoder_getCoder).call(this, c)), param.name);
    }
    switch (param.baseType) {
        case "address":
            return new AddressCoder(param.name);
        case "bool":
            return new BooleanCoder(param.name);
        case "string":
            return new StringCoder(param.name);
        case "bytes":
            return new BytesCoder(param.name);
        case "":
            return new NullCoder(param.name);
    }
    // u?int[0-9]*
    let match = param.type.match(paramTypeNumber);
    if (match) {
        let size = parseInt(match[2] || "256");
        if (size === 0 || size > 256 || (size % 8) !== 0) {
            logger.throwArgumentError("invalid " + match[1] + " bit length", "param", param);
        }
        return new NumberCoder(size / 8, (match[1] === "int"), param.name);
    }
    // bytes[0-9]+
    match = param.type.match(paramTypeBytes);
    if (match) {
        let size = parseInt(match[1]);
        if (size === 0 || size > 32) {
            logger.throwArgumentError("invalid bytes length", "param", param);
        }
        return new FixedBytesCoder(size, param.name);
    }
    return logger.throwArgumentError("invalid type", "type", param.type);
};
export const defaultAbiCoder = new AbiCoder();
//# sourceMappingURL=abi-coder.js.map