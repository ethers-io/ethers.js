Secret Storage JSON Wallet Utilities
====================================

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It is responsible for encoding, decoding, encrypting and decrypting JSON wallet
formats.

For more information, see the [documentation](https://docs.hedera.com/hethers/application-programming-interface/signers).


Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {
    decryptKeystore,
    decryptKeystoreSync,
    encryptKeystore,
    isKeystoreWallet,
    getJsonWalletAddress,
    decryptJsonWallet,
    decryptJsonWalletSync,
    ProgressCallback,
    EncryptOptions
} = require("@hethers/json-wallets");
```


License
-------

MIT License
