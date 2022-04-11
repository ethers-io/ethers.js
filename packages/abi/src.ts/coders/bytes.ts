import { arrayify, hexlify } from "@ethersproject/bytes";

import { Coder } from "./abstract-coder.js";

import type { Reader, Writer } from "./abstract-coder.js";


export class DynamicBytesCoder extends Coder {
    constructor(type: string, localName: string) {
       super(type, type, localName, true);
    }

    defaultValue(): string {
        return "0x";
    }

    encode(writer: Writer, value: any): number {
        value = arrayify(value);
        let length = writer.writeValue(value.length);
        length += writer.writeBytes(value);
        return length;
    }

    decode(reader: Reader): any {
        return reader.readBytes(reader.readIndex(), true);
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
