"use strict";

import { arrayify, BytesLike, hexlify } from "@ethersproject/bytes";

import { Coder, Reader, Writer } from "./abstract-coder";

// @TODO: Merge this with bytes
export class FixedBytesCoder extends Coder {
    readonly size: number;

    constructor(size: number, localName: string) {
        let name = "bytes" + String(size);
        super(name, name, localName, false);
        this.size = size;
    }

    encode(writer: Writer, value: BytesLike): number {
        let data = arrayify(value);
        if (data.length !== this.size) { this._throwError("incorrect data length", value); }
        return writer.writeBytes(data);
    }

    decode(reader: Reader): any {
        return reader.coerce(this.name, hexlify(reader.readBytes(this.size)));
    }
}
