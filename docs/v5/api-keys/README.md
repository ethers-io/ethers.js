-----

Documentation: [html](https://docs.ethers.io/)

-----

Provider API Keys
=================

Etherscan
---------

INFURA
------

Alchemy
-------

Pocket Gateway
--------------

Creating a Default Provider
---------------------------

```
// Use the mainnet
const network = "homestead";

// Specify your own API keys
// Each is optional, and if you omit it the default
// API key for that service will be used.
const provider = ethers.getDefaultProvider(network, {
    etherscan: YOUR_ETHERSCAN_API_KEY,
    infura: YOUR_INFURA_PROJECT_ID,
    // Or if using a project secret:
    // infura: {
    //   projectId: YOUR_INFURA_PROJECT_ID,
    //   projectSecret: YOUR_INFURA_PROJECT_SECRET,
    // },
    alchemy: YOUR_ALCHEMY_API_KEY,
    pocket: YOUR_POCKET_APPLICATION_KEY
    // Or if using an application secret key:
    // pocket: {
    //   applicationId: ,
    //   applicationSecretKey:
    // }
});
```

