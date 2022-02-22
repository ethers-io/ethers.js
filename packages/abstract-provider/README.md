Abstract Provider
=================

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a forked version of 
the [abstract-provider](https://github.com/ethers-io/ethers.js/tree/master/packages/abstract-provider) sub-module 
adapted for Hedera Hashgraph's Smart Contract Service.

It is responsible for defining the common interface for a Provider.

A Provider is an abstraction of non-account-based operations on a DLT and
is generally not directly involved in signing transaction or data.

For signing, see the [Abstract Signer](https://github.com/hashgraph/hethers.js/tree/develop/packages/abstract-signer)
or [Wallet](https://github.com/hashgraph/hethers.js/tree/develop/packages/wallet) sub-modules. TODO update `develop` 
link

For more information, see the [documentation](https://docs.ethers.io/v5/api/providers/). TODO add docs link

Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {

    Provider,
    
    TransactionRequest,
    TransactionResponse,
    TransactionReceipt,

    Log,
    EventFilter,

    Filter,

    EventType,
    Listener

} = require("@hethers/abstract-provider");
```

License
-------

MIT License
