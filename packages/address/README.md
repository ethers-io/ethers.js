Ethereum Address Utilities
==========================

This sub-module is part of the [hethers project](https://github.com/ethers-io/ethers.js).  It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It is responsible for encoding, verifying and computing checksums for
Ethereum addresses and computing special addresses, such as those
enerated by and for contracts under various situations.

For more information, see the [documentation](https://docs.hedera.com/hethers/application-programming-interface/utilities/addresses).

Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {

    getAddress,
    isAddress,

    getIcapAddress,
    
    getCreate2Address

} = require("@hethers/address");
```

License
-------

MIT License
