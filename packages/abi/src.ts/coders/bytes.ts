"use strict";

import { arrayify, hexlify } from "@ethersproject/bytes";

import { Coder, Reader, Writer } from "./abstract-coder";

export class DynamicBytesCoder extends Coder {
    constructor(type: string, localName: string) {
       super(type, type, localName, true);
    }

    encode(writer: Writer, value: any): number {
        value = arrayify(value);
        let length = writer.writeValue(value.length);
        length += writer.writeBytes(value);
        return length;
    }

    decode(reader: Reader): any {
        return reader.readBytes(reader.readValue().toNumber());
    }
}

export class BytesCoder extends DynamicBytesCoder {
    constructor(localName: string) {
        super("bytes", localName);
    }

    decode(reader: Reader): any {
        return reader.coerce(this.name, hexlify(super.decode(reader)));
    }
}


