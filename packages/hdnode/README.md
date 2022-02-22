Hierarchal Deterministic Utilities (BIP32)
==========================================

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It is responsible computing, deriving, encoding and decoding Hierarchal-Deterministic
private keys.

For more information, see the [documentation](https://docs.ethers.io/v5/api/utils/hdnode/). TODO Docs

Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {

    HDNode,

    defaultPath,

    mnemonicToSeed,
    mnemonicToEntropy,
    entropyToMnemonic,
    isValidMnemonic,

    // Types

    Mnemonic

} = require("@hethers/hdnode");
```


License
-------

MIT License
