import { Typed } from "../typed.js";
import { Coder } from "./abstract-coder.js";
import { assert } from "../../utils/index.js";

import type { Reader, Writer } from "./abstract-coder.js";

/**
 *  @_ignore
 */
export class BooleanCoder extends Coder {

    constructor(localName: string) {
        super("bool", "bool", localName, false);
    }

    defaultValue(): boolean {
        return false;
    }

    encode(writer: Writer, _value: boolean | Typed): number {
        const value = Typed.dereference(_value, "bool");
        return writer.writeValue(value ? 1: 0);
    }

    decode(reader: Reader): any {
        const bytes = reader.readBytes(32, false);

        for (let i = 0; i < 31; i++) {
            assert(
                bytes[i] === 0,
                `Boolean padding error: byte[${i}]=0x${bytes[i].toString(16)}`,
                "INVALID_ARGUMENT"
            );
        }

        const v = bytes[31];
        assert(
            v === 0 || v === 1,
            `Boolean value error: expected 0 or 1 but got 0x${v.toString(16)}`,
            "INVALID_ARGUMENT"
        );
        return v === 1;
    }
}
