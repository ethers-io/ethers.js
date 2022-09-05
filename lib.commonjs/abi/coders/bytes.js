"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BytesCoder = exports.DynamicBytesCoder = void 0;
const logger_js_1 = require("../../utils/logger.js");
const data_js_1 = require("../../utils/data.js");
const abstract_coder_js_1 = require("./abstract-coder.js");
class DynamicBytesCoder extends abstract_coder_js_1.Coder {
    constructor(type, localName) {
        super(type, type, localName, true);
    }
    defaultValue() {
        return "0x";
    }
    encode(writer, value) {
        value = logger_js_1.logger.getBytesCopy(value);
        let length = writer.writeValue(value.length);
        length += writer.writeBytes(value);
        return length;
    }
    decode(reader) {
        return reader.readBytes(reader.readIndex(), true);
    }
}
exports.DynamicBytesCoder = DynamicBytesCoder;
class BytesCoder extends DynamicBytesCoder {
    constructor(localName) {
        super("bytes", localName);
    }
    decode(reader) {
        return (0, data_js_1.hexlify)(super.decode(reader));
    }
}
exports.BytesCoder = BytesCoder;
//# sourceMappingURL=bytes.js.map