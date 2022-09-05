import { logger } from "../../utils/logger.js";
import { hexlify } from "../../utils/data.js";
import { Coder } from "./abstract-coder.js";
export class DynamicBytesCoder extends Coder {
    constructor(type, localName) {
        super(type, type, localName, true);
    }
    defaultValue() {
        return "0x";
    }
    encode(writer, value) {
        value = logger.getBytesCopy(value);
        let length = writer.writeValue(value.length);
        length += writer.writeBytes(value);
        return length;
    }
    decode(reader) {
        return reader.readBytes(reader.readIndex(), true);
    }
}
export class BytesCoder extends DynamicBytesCoder {
    constructor(localName) {
        super("bytes", localName);
    }
    decode(reader) {
        return hexlify(super.decode(reader));
    }
}
//# sourceMappingURL=bytes.js.map