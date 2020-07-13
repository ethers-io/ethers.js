"use strict";
import { Coder } from "./abstract-coder";
import { pack, unpack } from "./array";
export class TupleCoder extends Coder {
    constructor(coders, localName) {
        let dynamic = false;
        const types = [];
        coders.forEach((coder) => {
            if (coder.dynamic) {
                dynamic = true;
            }
            types.push(coder.type);
        });
        const type = ("tuple(" + types.join(",") + ")");
        super("tuple", type, localName, dynamic);
        this.coders = coders;
    }
    encode(writer, value) {
        return pack(writer, this.coders, value);
    }
    decode(reader) {
        return reader.coerce(this.name, unpack(reader, this.coders));
    }
}
//# sourceMappingURL=tuple.js.map