import { logger } from "./logger.js";
export function decodeBase64(textData) {
    return logger.getBytesCopy(Buffer.from(textData, "base64"));
}
;
export function encodeBase64(data) {
    return Buffer.from(logger.getBytes(data)).toString("base64");
}
//# sourceMappingURL=base64.js.map