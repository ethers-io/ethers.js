Unit Conversion Utilities
==================================

This sub-module is part of the [hethers project](https://github.com/hashgraph/hethers.js). It is a fork of the original [ethers project](https://github.com/ethers-io/ethers.js) sub-module.

It contains functions to convert between string representations and numeric
representations of numbers, including those out of the range of JavaScript.

For more information, see the [documentation](https://docs.hedera.com/hethers/application-programming-interface/utilities/display-logic-and-input#named-units).


Importing
---------

Most users will prefer to use the [umbrella package](https://www.npmjs.com/package/@hashgraph/hethers),
but for those with more specific needs, individual components can be imported.

```javascript
const {
    commify,
    formatUnits,
    parseUnits,
    formatHbar,
    parseHbar
} = require("@hethers/units");
```


License
-------

MIT License
