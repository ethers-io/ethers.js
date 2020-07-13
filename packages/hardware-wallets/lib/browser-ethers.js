"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethers = {};
exports.ethers = ethers;
var w = window;
if (w._ethers == null) {
    console.log("WARNING: @ethersproject/hardware-wallet requires ethers loaded first");
}
else {
    exports.ethers = ethers = w._ethers;
}
//# sourceMappingURL=browser-ethers.js.map