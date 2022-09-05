"use strict";
// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAbiCoder = exports.AbiCoder = void 0;
const logger_js_1 = require("../utils/logger.js");
const abstract_coder_js_1 = require("./coders/abstract-coder.js");
const address_js_1 = require("./coders/address.js");
const array_js_1 = require("./coders/array.js");
const boolean_js_1 = require("./coders/boolean.js");
const bytes_js_1 = require("./coders/bytes.js");
const fixed_bytes_js_1 = require("./coders/fixed-bytes.js");
const null_js_1 = require("./coders/null.js");
const number_js_1 = require("./coders/number.js");
const string_js_1 = require("./coders/string.js");
const tuple_js_1 = require("./coders/tuple.js");
const fragments_js_1 = require("./fragments.js");
const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
class AbiCoder {
    #getCoder(param) {
        if (param.isArray()) {
            return new array_js_1.ArrayCoder(this.#getCoder(param.arrayChildren), param.arrayLength, param.name);
        }
        if (param.isTuple()) {
            return new tuple_js_1.TupleCoder(param.components.map((c) => this.#getCoder(c)), param.name);
        }
        switch (param.baseType) {
            case "address":
                return new address_js_1.AddressCoder(param.name);
            case "bool":
                return new boolean_js_1.BooleanCoder(param.name);
            case "string":
                return new string_js_1.StringCoder(param.name);
            case "bytes":
                return new bytes_js_1.BytesCoder(param.name);
            case "":
                return new null_js_1.NullCoder(param.name);
        }
        // u?int[0-9]*
        let match = param.type.match(paramTypeNumber);
        if (match) {
            let size = parseInt(match[2] || "256");
            if (size === 0 || size > 256 || (size % 8) !== 0) {
                logger_js_1.logger.throwArgumentError("invalid " + match[1] + " bit length", "param", param);
            }
            return new number_js_1.NumberCoder(size / 8, (match[1] === "int"), param.name);
        }
        // bytes[0-9]+
        match = param.type.match(paramTypeBytes);
        if (match) {
            let size = parseInt(match[1]);
            if (size === 0 || size > 32) {
                logger_js_1.logger.throwArgumentError("invalid bytes length", "param", param);
            }
            return new fixed_bytes_js_1.FixedBytesCoder(size, param.name);
        }
        return logger_js_1.logger.throwArgumentError("invalid type", "type", param.type);
    }
    getDefaultValue(types) {
        const coders = types.map((type) => this.#getCoder(fragments_js_1.ParamType.from(type)));
        const coder = new tuple_js_1.TupleCoder(coders, "_");
        return coder.defaultValue();
    }
    encode(types, values) {
        logger_js_1.logger.assertArgumentCount(values.length, types.length, "types/values length mismatch");
        const coders = types.map((type) => this.#getCoder(fragments_js_1.ParamType.from(type)));
        const coder = (new tuple_js_1.TupleCoder(coders, "_"));
        const writer = new abstract_coder_js_1.Writer();
        coder.encode(writer, values);
        return writer.data;
    }
    decode(types, data, loose) {
        const coders = types.map((type) => this.#getCoder(fragments_js_1.ParamType.from(type)));
        const coder = new tuple_js_1.TupleCoder(coders, "_");
        return coder.decode(new abstract_coder_js_1.Reader(data, loose));
    }
}
exports.AbiCoder = AbiCoder;
exports.defaultAbiCoder = new AbiCoder();
//# sourceMappingURL=abi-coder.js.map