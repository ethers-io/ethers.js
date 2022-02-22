Ethereum Transaction Utilities
==============================

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It contains various functions for encoding and decoding serialized transactios.

For more information, see the [documentation](https://docs.ethers.io/v5/api/utils/transactions/). TODO Docs


Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {

    computeAddress,
    recoverAddress,

    serialize,
    parse,

    // Types

    Transaction,
    UnsignedTransaction

} = require("@hethers/abi");
```


License
-------

MIT License
