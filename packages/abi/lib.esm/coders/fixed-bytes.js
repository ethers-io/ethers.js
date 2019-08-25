"use strict";
import { arrayify, hexlify } from "@ethersproject/bytes";
import { Coder } from "./abstract-coder";
// @TODO: Merge this with bytes
export class FixedBytesCoder extends Coder {
    constructor(size, localName) {
        let name = "bytes" + String(size);
        super(name, name, localName, false);
        this.size = size;
    }
    encode(writer, value) {
        let data = arrayify(value);
        if (data.length !== this.size) {
            this._throwError("incorrect data length", value);
        }
        return writer.writeBytes(data);
    }
    decode(reader) {
        return reader.coerce(this.name, hexlify(reader.readBytes(this.size)));
    }
}
