"use strict";
import { Coder } from "./abstract-coder";
// Clones the functionality of an existing Coder, but without a localName
export class AnonymousCoder extends Coder {
    constructor(coder) {
        super(coder.name, coder.type, undefined, coder.dynamic);
        this.coder = coder;
    }
    encode(writer, value) {
        return this.coder.encode(writer, value);
    }
    decode(reader) {
        return this.coder.decode(reader);
    }
}
