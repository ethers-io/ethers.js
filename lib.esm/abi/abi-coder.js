// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
import { assertArgumentCount, throwArgumentError } from "../utils/index.js";
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
import { getAddress } from "../address/index.js";
import { getBytes, hexlify, makeError } from "../utils/index.js";
const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
export class AbiCoder {
    #getCoder(param) {
        if (param.isArray()) {
            return new ArrayCoder(this.#getCoder(param.arrayChildren), param.arrayLength, param.name);
        }
        if (param.isTuple()) {
            return new TupleCoder(param.components.map((c) => this.#getCoder(c)), param.name);
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
                throwArgumentError("invalid " + match[1] + " bit length", "param", param);
            }
            return new NumberCoder(size / 8, (match[1] === "int"), param.name);
        }
        // bytes[0-9]+
        match = param.type.match(paramTypeBytes);
        if (match) {
            let size = parseInt(match[1]);
            if (size === 0 || size > 32) {
                throwArgumentError("invalid bytes length", "param", param);
            }
            return new FixedBytesCoder(size, param.name);
        }
        return throwArgumentError("invalid type", "type", param.type);
    }
    getDefaultValue(types) {
        const coders = types.map((type) => this.#getCoder(ParamType.from(type)));
        const coder = new TupleCoder(coders, "_");
        return coder.defaultValue();
    }
    encode(types, values) {
        assertArgumentCount(values.length, types.length, "types/values length mismatch");
        const coders = types.map((type) => this.#getCoder(ParamType.from(type)));
        const coder = (new TupleCoder(coders, "_"));
        const writer = new Writer();
        coder.encode(writer, values);
        return writer.data;
    }
    decode(types, data, loose) {
        const coders = types.map((type) => this.#getCoder(ParamType.from(type)));
        const coder = new TupleCoder(coders, "_");
        return coder.decode(new Reader(data, loose));
    }
}
// https://docs.soliditylang.org/en/v0.8.17/control-structures.html
const PanicReasons = new Map();
PanicReasons.set(0x00, "GENERIC_PANIC");
PanicReasons.set(0x01, "ASSERT_FALSE");
PanicReasons.set(0x11, "OVERFLOW");
PanicReasons.set(0x12, "DIVIDE_BY_ZERO");
PanicReasons.set(0x21, "ENUM_RANGE_ERROR");
PanicReasons.set(0x22, "BAD_STORAGE_DATA");
PanicReasons.set(0x31, "STACK_UNDERFLOW");
PanicReasons.set(0x32, "ARRAY_RANGE_ERROR");
PanicReasons.set(0x41, "OUT_OF_MEMORY");
PanicReasons.set(0x51, "UNINITIALIZED_FUNCTION_CALL");
export function getBuiltinCallException(action, tx, data) {
    let message = "missing revert data";
    let reason = null;
    const invocation = null;
    let revert = null;
    if (data) {
        message = "execution reverted";
        const bytes = getBytes(data);
        data = hexlify(data);
        if (bytes.length % 32 !== 4) {
            message += " (could not decode reason; invalid data length)";
        }
        else if (hexlify(bytes.slice(0, 4)) === "0x08c379a0") {
            // Error(string)
            try {
                reason = defaultAbiCoder.decode(["string"], bytes.slice(4))[0];
                revert = {
                    signature: "Error(string)",
                    name: "Error",
                    args: [reason]
                };
                message += `: ${JSON.stringify(reason)}`;
            }
            catch (error) {
                console.log(error);
                message += " (could not decode reason; invalid data)";
            }
        }
        else if (hexlify(bytes.slice(0, 4)) === "0x4e487b71") {
            // Panic(uint256)
            try {
                const code = Number(defaultAbiCoder.decode(["uint256"], bytes.slice(4))[0]);
                revert = {
                    signature: "Panic(uint256)",
                    name: "Panic",
                    args: [code]
                };
                reason = `Panic due to ${PanicReasons.get(code) || "UNKNOWN"}(${code})`;
                message += `: ${reason}`;
            }
            catch (error) {
                console.log(error);
                message += " (could not decode panic reason)";
            }
        }
        else {
            message += " (unknown custom error)";
        }
    }
    const transaction = {
        to: (tx.to ? getAddress(tx.to) : null),
        data: (tx.data || "0x")
    };
    if (tx.from) {
        transaction.from = getAddress(tx.from);
    }
    return makeError(message, "CALL_EXCEPTION", {
        action, data, reason, transaction, invocation, revert
    });
}
export const defaultAbiCoder = new AbiCoder();
//# sourceMappingURL=abi-coder.js.map