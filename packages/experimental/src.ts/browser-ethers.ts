"use strict";

let ethers: any = { };

const w = (window as any);
if (w._ethers == null) {
    console.log("WARNING: @ethersproject/hardware-wallet requires ethers loaded first");
} else {
    ethers = w._ethers;
}

export { ethers }
