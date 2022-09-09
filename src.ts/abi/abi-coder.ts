// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

import { assertArgumentCount, throwArgumentError } from "../utils/index.js";

import { Coder, Reader, Result, Writer } from "./coders/abstract-coder.js";
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

import type { BytesLike } from "../utils/index.js";


const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);

export class AbiCoder {

    #getCoder(param: ParamType): Coder {
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

    getDefaultValue(types: ReadonlyArray<string | ParamType>): Result {
        const coders: Array<Coder> = types.map((type) => this.#getCoder(ParamType.from(type)));
        const coder = new TupleCoder(coders, "_");
        return coder.defaultValue();
    }

    encode(types: ReadonlyArray<string | ParamType>, values: ReadonlyArray<any>): string {
        assertArgumentCount(values.length, types.length, "types/values length mismatch");

        const coders = types.map((type) => this.#getCoder(ParamType.from(type)));
        const coder = (new TupleCoder(coders, "_"));

        const writer = new Writer();
        coder.encode(writer, values);
        return writer.data;
    }

    decode(types: ReadonlyArray<string | ParamType>, data: BytesLike, loose?: boolean): Result {
        const coders: Array<Coder> = types.map((type) => this.#getCoder(ParamType.from(type)));
        const coder = new TupleCoder(coders, "_");
        return coder.decode(new Reader(data, loose));
    }
}


export const defaultAbiCoder: AbiCoder = new AbiCoder();
