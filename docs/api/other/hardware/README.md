-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Hardware Wallets
================



LedgerSigner
------------


The [Ledger Hardware Wallets](https://www.ledger.com) are a fairly
popular brand.

TODO: importing


### API



#### **new** **LedgerSigner** (  [ provider [  , type [  , path ]  ]  ]  )  **=>** *[LedgerSigner](./)*

Connects to a Ledger Hardware Wallet. The *type* if left unspecified is
determined by the environment; in node the default is "hid" and in the browser
"u2f" is the default. The default Ethereum path is used if *path* is left unspecified.





-----
**Content Hash:** 240366cd9757f396d08ed65ebfceafa51f82bfc44c04695ab68e3560e7a0016b