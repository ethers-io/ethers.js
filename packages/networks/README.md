Ethereum (and ilk) Network Definitions
======================================

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It is responsible for tracking common networks along with important
parameters for each.

For more information, see the [documentation](https://docs.ethers.io/v5/api/providers/types/#providers-Network). TODO Docs

Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {

    getNetwork,

    // Types

    Network,
    Networkish

} = require("@hethers/networks");
```


License
-------

MIT License
