import { fromTwos, mask, toTwos } from "../../utils/maths.js";
import { defineProperties } from "../../utils/properties.js";

import { logger } from "../../utils/logger.js";
import { Typed } from "../typed.js";
import { Coder, WordSize } from "./abstract-coder.js";

import type { BigNumberish } from "../../utils/index.js";

import type { Reader, Writer } from "./abstract-coder.js";


const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export class NumberCoder extends Coder {
    readonly size!: number;
    readonly signed!: boolean;

    constructor(size: number, signed: boolean, localName: string) {
        const name = ((signed ? "int": "uint") + (size * 8));
        super(name, name, localName, false);

        defineProperties<NumberCoder>(this, { size, signed }, { size: "number", signed: "boolean" });
    }

    defaultValue(): number {
        return 0;
    }

    encode(writer: Writer, _value: BigNumberish | Typed): number {
        let value = logger.getBigInt(Typed.dereference(_value, this.type));

        // Check bounds are safe for encoding
        let maxUintValue = mask(BN_MAX_UINT256, WordSize * 8);
        if (this.signed) {
            let bounds = mask(maxUintValue, (this.size * 8) - 1);
            if (value > bounds || value < -(bounds + BN_1)) {
                this._throwError("value out-of-bounds", _value);
            }
        } else if (value < BN_0 || value > mask(maxUintValue, this.size * 8)) {
            this._throwError("value out-of-bounds", _value);
        }

        value = mask(toTwos(value, this.size * 8), this.size * 8);

        if (this.signed) {
            value = toTwos(fromTwos(value, this.size * 8), 8 * WordSize);
        }

        return writer.writeValue(value);
    }

    decode(reader: Reader): any {
        let value = mask(reader.readValue(), this.size * 8);

        if (this.signed) {
            value = fromTwos(value, this.size * 8);
        }

        return value;
    }
}

