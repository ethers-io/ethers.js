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
**Content Hash:** c6b6d4f14f0e973a30c3cff935960a15715712830e38cece0edfb864ba921a6c