Signing Key
===========

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It is responsible for secp256-k1 signing, verifying and recovery operations.

For more information, see the [documentation](https://docs.hedera.com/hethers/).

Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {
    SigningKey,
    SigningKeyED,
    computePublicKey,
    recoverPublicKey
} = require("@hethers/signing-key");
```

License
-------

MIT License
