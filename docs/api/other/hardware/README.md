-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Hardware Wallets
================



LedgerSigner
------------


The [Ledger Hardware Wallets](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.ledger.com) are a fairly
popular brand.

TODO: importing


### API



#### **new** **LedgerSigner** (  [ provider [  , type [  , path ]  ]  ]  )  **=>** *[LedgerSigner](./)*

Connects to a Ledger Hardware Wallet. The *type* if left unspecified is
determined by the environment; in node the default is "hid" and in the browser
"u2f" is the default. The default Ethereum path is used if *path* is left unspecified.





-----
**Content Hash:** 04412211499f34796f91e7112977e6f84607638be72dc600e488df07c4465805