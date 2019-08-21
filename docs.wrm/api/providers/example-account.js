// <hide>

const { ethers } = require("./packages/ethers");
const provider = ethers.getDefaultProvider()

function _inspect(result) {
    if (ethers.BigNumber.isBigNumber(result)) {
        return `{ BigNumber: ${ JSON.stringify(result.toString()) } }`;
    }
    return JSON.stringify(result);
}

// </hide>

// Get the balance for an account...
provider.getBalance("ricmoo.firefly.eth");
//!

// Get the code for a contract...
provider.getCode("registrar.firefly.eth");
//!

// Get the storage value at position 0...
provider.getStorageAt("registrar.firefly.eth", 0)
//!

// Get transaction count of an account...
provider.getTransactionCount("ricmoo.firefly.eth");
//!
