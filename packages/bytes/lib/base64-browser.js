import { logger } from "./logger.js";
export function decodeBase64(textData) {
    textData = atob(textData);
    const data = [];
    for (let i = 0; i < textData.length; i++) {
        data.push(textData.charCodeAt(i));
    }
    return new Uint8Array(data);
}
export function encodeBase64(_data) {
    const data = logger.getBytes(_data, "data");
    let textData = "";
    for (let i = 0; i < data.length; i++) {
        textData += String.fromCharCode(data[i]);
    }
    return btoa(textData);
}
//# sourceMappingURL=base64-browser.js.map