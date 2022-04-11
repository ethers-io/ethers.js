import { fromTwos, mask, toTwos } from "@ethersproject/math";
import { defineProperties } from "@ethersproject/properties";
import { logger } from "../logger.js";
import { Typed } from "../typed.js";
import { Coder, WordSize } from "./abstract-coder.js";
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
export class NumberCoder extends Coder {
    constructor(size, signed, localName) {
        const name = ((signed ? "int" : "uint") + (size * 8));
        super(name, name, localName, false);
        defineProperties(this, { size, signed }, { size: "number", signed: "boolean" });
    }
    defaultValue() {
        return 0;
    }
    encode(writer, _value) {
        let value = logger.getBigInt(Typed.dereference(_value, this.type));
        // Check bounds are safe for encoding
        let maxUintValue = mask(BN_MAX_UINT256, WordSize * 8);
        if (this.signed) {
            let bounds = mask(maxUintValue, (this.size * 8) - 1);
            if (value > bounds || value < -(bounds + BN_1)) {
                this._throwError("value out-of-bounds", _value);
            }
        }
        else if (value < BN_0 || value > mask(maxUintValue, this.size * 8)) {
            this._throwError("value out-of-bounds", _value);
        }
        value = mask(toTwos(value, this.size * 8), this.size * 8);
        if (this.signed) {
            value = toTwos(fromTwos(value, this.size * 8), 8 * WordSize);
        }
        return writer.writeValue(value);
    }
    decode(reader) {
        let value = mask(reader.readValue(), this.size * 8);
        if (this.signed) {
            value = fromTwos(value, this.size * 8);
        }
        return reader.coerce(this.name, value);
    }
}
//# sourceMappingURL=number.js.map