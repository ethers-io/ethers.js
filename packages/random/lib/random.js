"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var bytes_1 = require("@ethersproject/bytes");
function randomBytes(length) {
    return bytes_1.arrayify(crypto_1.randomBytes(length));
}
exports.randomBytes = randomBytes;
//# sourceMappingURL=random.js.map