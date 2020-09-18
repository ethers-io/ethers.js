-----

Documentation: [html](https://docs.ethers.io/)

-----

Provider API Keys
=================

Etherscan
---------

Pocket Gateway
--------------

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
<<<<<<< HEAD
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
=======
    alchemy: YOUR_ALCHEMY_API_KEY,
    pocket_gateway: YOUR_POCKET_GATEWAY_APPLICATION_ID
>>>>>>> Added PocketGatewayProvider, updated tests and docs
});
```

