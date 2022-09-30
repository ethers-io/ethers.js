"use strict";
import { arrayify } from "@ethersproject/bytes";
import { Buffer } from "buffer";
export function decode(textData) {
    textData = Buffer.from(textData, 'base64').toString('binary');
    const data = [];
    for (let i = 0; i < textData.length; i++) {
        data.push(textData.charCodeAt(i));
    }
    return arrayify(data);
}
export function encode(data) {
    data = arrayify(data);
    let textData = "";
    for (let i = 0; i < data.length; i++) {
        textData += String.fromCharCode(data[i]);
    }
    let returnData = Buffer.from(textData, 'binary').toString('base64');
    return returnData;
}
//# sourceMappingURL=base64.js.map
