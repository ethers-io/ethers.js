'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var errors_1 = require("../errors");
var bytes_1 = require("./bytes");
///////////////////////////////
var UnicodeNormalizationForm;
(function (UnicodeNormalizationForm) {
    UnicodeNormalizationForm["current"] = "";
    UnicodeNormalizationForm["NFC"] = "NFC";
    UnicodeNormalizationForm["NFD"] = "NFD";
    UnicodeNormalizationForm["NFKC"] = "NFKC";
    UnicodeNormalizationForm["NFKD"] = "NFKD";
})(UnicodeNormalizationForm = exports.UnicodeNormalizationForm || (exports.UnicodeNormalizationForm = {}));
;
// http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
function toUtf8Bytes(str, form) {
    if (form === void 0) { form = UnicodeNormalizationForm.current; }
    if (form != UnicodeNormalizationForm.current) {
        errors_1.checkNormalize();
        str = str.normalize(form);
    }
    var result = [];
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 0x80) {
            result.push(c);
        }
        else if (c < 0x800) {
            result.push((c >> 6) | 0xc0);
            result.push((c & 0x3f) | 0x80);
        }
        else if ((c & 0xfc00) == 0xd800) {
            i++;
            var c2 = str.charCodeAt(i);
            if (i >= str.length || (c2 & 0xfc00) !== 0xdc00) {
                throw new Error('invalid utf-8 string');
            }
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
            result.push((c >> 18) | 0xf0);
            result.push(((c >> 12) & 0x3f) | 0x80);
            result.push(((c >> 6) & 0x3f) | 0x80);
            result.push((c & 0x3f) | 0x80);
        }
        else {
            result.push((c >> 12) | 0xe0);
            result.push(((c >> 6) & 0x3f) | 0x80);
            result.push((c & 0x3f) | 0x80);
        }
    }
    return bytes_1.arrayify(result);
}
exports.toUtf8Bytes = toUtf8Bytes;
;
// http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499
function toUtf8String(bytes, ignoreErrors) {
    bytes = bytes_1.arrayify(bytes);
    var result = '';
    var i = 0;
    // Invalid bytes are ignored
    while (i < bytes.length) {
        var c = bytes[i++];
        // 0xxx xxxx
        if (c >> 7 === 0) {
            result += String.fromCharCode(c);
            continue;
        }
        // Multibyte; how many bytes left for this character?
        var extraLength = null;
        var overlongMask = null;
        // 110x xxxx 10xx xxxx
        if ((c & 0xe0) === 0xc0) {
            extraLength = 1;
            overlongMask = 0x7f;
            // 1110 xxxx 10xx xxxx 10xx xxxx
        }
        else if ((c & 0xf0) === 0xe0) {
            extraLength = 2;
            overlongMask = 0x7ff;
            // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
        }
        else if ((c & 0xf8) === 0xf0) {
            extraLength = 3;
            overlongMask = 0xffff;
        }
        else {
            if (!ignoreErrors) {
                if ((c & 0xc0) === 0x80) {
                    throw new Error('invalid utf8 byte sequence; unexpected continuation byte');
                }
                throw new Error('invalid utf8 byte sequence; invalid prefix');
            }
            continue;
        }
        // Do we have enough bytes in our data?
        if (i + extraLength > bytes.length) {
            if (!ignoreErrors) {
                throw new Error('invalid utf8 byte sequence; too short');
            }
            // If there is an invalid unprocessed byte, skip continuation bytes
            for (; i < bytes.length; i++) {
                if (bytes[i] >> 6 !== 0x02) {
                    break;
                }
            }
            continue;
        }
        // Remove the length prefix from the char
        var res = c & ((1 << (8 - extraLength - 1)) - 1);
        for (var j = 0; j < extraLength; j++) {
            var nextChar = bytes[i];
            // Invalid continuation byte
            if ((nextChar & 0xc0) != 0x80) {
                res = null;
                break;
            }
            ;
            res = (res << 6) | (nextChar & 0x3f);
            i++;
        }
        if (res === null) {
            if (!ignoreErrors) {
                throw new Error('invalid utf8 byte sequence; invalid continuation byte');
            }
            continue;
        }
        // Check for overlong seuences (more bytes than needed)
        if (res <= overlongMask) {
            if (!ignoreErrors) {
                throw new Error('invalid utf8 byte sequence; overlong');
            }
            continue;
        }
        // Maximum code point
        if (res > 0x10ffff) {
            if (!ignoreErrors) {
                throw new Error('invalid utf8 byte sequence; out-of-range');
            }
            continue;
        }
        // Reserved for UTF-16 surrogate halves
        if (res >= 0xd800 && res <= 0xdfff) {
            if (!ignoreErrors) {
                throw new Error('invalid utf8 byte sequence; utf-16 surrogate');
            }
            continue;
        }
        if (res <= 0xffff) {
            result += String.fromCharCode(res);
            continue;
        }
        res -= 0x10000;
        result += String.fromCharCode(((res >> 10) & 0x3ff) + 0xd800, (res & 0x3ff) + 0xdc00);
    }
    return result;
}
exports.toUtf8String = toUtf8String;
function formatBytes32String(text) {
    // Get the bytes
    var bytes = toUtf8Bytes(text);
    // Check we have room for null-termination
    if (bytes.length > 31) {
        throw new Error('bytes32 string must be less than 32 bytes');
    }
    // Zero-pad (implicitly null-terminates)
    return bytes_1.hexlify(bytes_1.concat([bytes, constants_1.HashZero]).slice(0, 32));
}
exports.formatBytes32String = formatBytes32String;
function parseBytes32String(bytes) {
    var data = bytes_1.arrayify(bytes);
    // Must be 32 bytes with a null-termination
    if (data.length !== 32) {
        throw new Error('invalid bytes32 - not 32 bytes long');
    }
    if (data[31] !== 0) {
        throw new Error('invalid bytes32 sdtring - no null terminator');
    }
    // Find the null termination
    var length = 31;
    while (data[length - 1] === 0) {
        length--;
    }
    // Determine the string value
    return toUtf8String(data.slice(0, length));
}
exports.parseBytes32String = parseBytes32String;
