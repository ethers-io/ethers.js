"use strict";
let ethers = {};
const w = window;
if (w._ethers == null) {
    console.log("WARNING: @ethersproject/hardware-wallet requires ethers loaded first");
}
else {
    ethers = w._ethers;
}
export { ethers };
//# sourceMappingURL=browser-ethers.js.map