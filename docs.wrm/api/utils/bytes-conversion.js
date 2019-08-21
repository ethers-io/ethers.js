// <hide>

const { ethers } = require("./packages/ethers");
const { arrayify, hexlify, hexValue } = ethers.utils;

function _inspect(result) {
    if (result && typeof(result.length) === "number" && typeof(result) !== "string") {
        return "[ " + Array.prototype.map.call(result, (i) => _inspect(i)).join(", ") + " ]";
    }
    return result;
}

// </hide>

// Convert a hexstring to a Uint8Array
arrayify("0x1234")
//!

// Convert an Array to a hexstring
hexlify([1, 2, 3, 4])
//!

// Convert an Object to a hexstring
hexlify({ length: 2, "0": 1, "1": 2 })
//!

// Convert an Array to a hexstring
hexlify([ 1 ])
//!

// Convert a number to a stripped hex value
hexValue(1)
//!

// Convert an Array to a stripped hex value
hexValue([ 1, 2 ])
//!
