"use strict";
import { arrayify } from "@ethersproject/bytes";
export function decode(textData) {
    return arrayify(new Uint8Array(Buffer.from(textData, "base64")));
}
;
export function encode(data) {
    return Buffer.from(arrayify(data)).toString("base64");
}
//# sourceMappingURL=index.js.map