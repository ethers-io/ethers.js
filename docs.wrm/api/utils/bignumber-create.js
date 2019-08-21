// <hide>
const { BigNumber } = require("./packages/ethers");
const { constants } = require("./packages/ethers");

function _inspect(result) {
    if (BigNumber.isBigNumber(result)) {
        return `{ BigNumber: ${ JSON.stringify(result.toString()) } }`;
    }
    return result;
}
// </hide>

// From a decimal string...
BigNumber.from("42")
//!

// From a hexstring...
BigNumber.from("0x2a")
//!

// From a negative hexstring...
BigNumber.from("-0x2a")
//!

// From an Array (or Uint8Array)...
BigNumber.from([ 42 ])
//!

// From an existing BigNumber...
let one1 = constants.One;
let one2 = BigNumber.from(one1)

one2
//!

// ...which returns the same instance
one1 === one2
//!

// From a (safe) number...
BigNumber.from(42)
//!

// From a ES2015 BigInt... (only on platforms with BigInt support)
BigNumber.from(42n)
//!

// Numbers outside the safe range fail:
BigNumber.from(Number.MAX_SAFE_INTEGER);
//! error
