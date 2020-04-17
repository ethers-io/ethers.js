// <hide>
const { BigNumber } = require("./packages/ethers");

function _inspect(result) {
    if (BigNumber.isBigNumber(result)) {
        return `{ BigNumber: ${ JSON.stringify(result.toString()) } }`;
    }
    return result;
}
// </hide>

let a = BigNumber.from(42);
let b = BigNumber.from("91");

a.mul(b);
//!
