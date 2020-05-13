"use strict";

import { Coder, Reader, Writer } from "./abstract-coder";
import { pack, unpack } from "./array";

export class TupleCoder extends Coder {
    readonly coders: Array<Coder>;

    constructor(coders: Array<Coder>, localName: string) {
        let dynamic = false;
        const types: Array<string> = [];
        coders.forEach((coder) => {
            if (coder.dynamic) { dynamic = true; }
            types.push(coder.type);
        });
        const type = ("tuple(" + types.join(",") + ")");

        super("tuple", type, localName, dynamic);
        this.coders = coders;
    }

    encode(writer: Writer, value: Array<any> | { [ name: string ]: any }): number {
        return pack(writer, this.coders, value);
    }

    decode(reader: Reader): any {
        return reader.coerce(this.name, unpack(reader, this.coders));
    }
}

