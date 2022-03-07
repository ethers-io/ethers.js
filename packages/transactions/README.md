Hedera Transaction Utilities
==============================

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It contains various functions for encoding and decoding serialized transactios.

For more information, see the [documentation](https://docs.hedera.com/hethers/application-programming-interface/utilities/transactions).


Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {
    AccessList,
    AccessListish,
    TransactionTypes,
    UnsignedTransaction,
    Transaction,
    computeAlias,
    computeAliasFromPubKey,
    accessListify,
    serializeHederaTransaction,
    parse
} = require("@hethers/abi");
```


License
-------

MIT License
