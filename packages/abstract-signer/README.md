Abstract Signer
===============

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a forked version of
the [abstract-signer](https://github.com/ethers-io/ethers.js/tree/master/packages/abstract-signer) sub-module
adapted for Hedera Hashgraph's Smart Contract Service.

It is an abstraction of an EVM account, which may be backed by a [Wallet](https://www.npmjs.com/package/@hethers/wallet) instance.

For more information, see the [documentation](https://docs.ethers.io/v5/api/signer/). TODO links to docs

Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {

    Signer,
    VoidSigner,

    // Types
	ExternallyOwnedAccount

} = require("@hethers/abstract-signer");
```

License
-------

MIT License
