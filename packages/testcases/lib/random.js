"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomNumber = exports.randomHexString = exports.randomBytes = void 0;
var hethers_1 = require("@hashgraph/hethers");
function randomBytes(seed, lower, upper) {
    if (!upper) {
        upper = lower;
    }
    if (upper === 0 && upper === lower) {
        return new Uint8Array(0);
    }
    var result = hethers_1.hethers.utils.arrayify(hethers_1.hethers.utils.keccak256(hethers_1.hethers.utils.toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = hethers_1.hethers.utils.concat([result, hethers_1.hethers.utils.keccak256(result)]);
    }
    var top = hethers_1.hethers.utils.arrayify(hethers_1.hethers.utils.keccak256(result));
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}
exports.randomBytes = randomBytes;
function randomHexString(seed, lower, upper) {
    return hethers_1.hethers.utils.hexlify(randomBytes(seed, lower, upper));
}
exports.randomHexString = randomHexString;
function randomNumber(seed, lower, upper) {
    var top = randomBytes(seed, 3);
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}
exports.randomNumber = randomNumber;
//# sourceMappingURL=random.js.map