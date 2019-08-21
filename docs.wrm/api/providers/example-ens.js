// <hide>

const { ethers } = require("./packages/ethers");
const provider = ethers.getDefaultProvider()

// </hide>

// Reverse lookup of an ENS by address...
provider.lookupAddress("0x6fC21092DA55B392b045eD78F4732bff3C580e2c");
//!

// Lookup an address of an ENS name...
provider.resolveName("ricmoo.firefly.eth");
//!

