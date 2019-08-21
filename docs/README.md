-----

test

-----

What is ethers?
===============


The ethers.js library aims to be a complete and compact library for
interacting with the Ethereum Blockchain and its ecosystem. It was
originally designed for use with [ethers.io](https://ethers.io/) and
has since expanded into a much more general-purpose library.


Features
--------




* Keep your private keys in your client, **safe** and sound
* Import and export **JSON wallets** (Geth, Parity and crowdsale)
* Import and export BIP 39 **mnemonic phrases** (12 word backup phrases) and HD Wallets (English, Italian, Japanese, Korean, Simplified Chinese, Traditional Chinese; more coming soon)
* Meta-classes create JavaScript objects from any contract ABI, including **ABIv2** and **Human-Readable ABI**
* Connect to Ethereum nodes over [JSON-RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC), [INFURA](https://infura.io/), [Etherscan](https://etherscan.io/), [Nodesmith](https://nodesmith.io), [Alchemy](https://alchemyapi.io), or [MetaMask](https://metamask.io/).
* **ENS names** are first-class citizens; they can be used anywhere an Ethereum addresses can be used
* **Tiny** (~88kb compressed; 284kb uncompressed)
* **Complete** functionality for all your Ethereum needs
* Extensive [documentation](https://docs.ethers.io/)
* Large collection of **test cases** which are maintained and added to
* Fully **TypeScript** ready, with definition files and full TypeScript source
* **MIT License** (including *ALL* dependencies); completely open source to do with as you please


Developer Documentation
-----------------------



* [Getting Started](getting-started)
  * [Installing](getting-started)
  * [Importing](getting-started)
* [Concepts](concepts)
  * [Events](concepts/events)
  * [Gas](concepts/gas)
    * [Gas Price](concepts/gas)
    * [Gas Limit](concepts/gas)
* [Application Programming Interface](api)
  * [Contracts](api/contract)
    * [Buckets](api/contract)
  * [Signers](api/signer)
    * [Signer](api/signer)
    * [Wallet inherits Signer](api/signer)
  * [Providers](api/providers)
    * [Provider](api/providers/provider)
      * [Accounts Methods](api/providers/provider)
      * [Blocks Methods](api/providers/provider)
      * [Ethereum Naming Service (ENS) Methods](api/providers/provider)
      * [Logs Methods](api/providers/provider)
      * [Network Status Methods](api/providers/provider)
      * [Transactions Methods](api/providers/provider)
      * [Event Emitter Methods](api/providers/provider)
      * [Inspection Methods](api/providers/provider)
    * [JSON-RPC Provider](api/providers/jsonrpc-provider)
      * [JsonRpcProvider](api/providers/jsonrpc-provider)
      * [JsonRpcSigner](api/providers/jsonrpc-provider)
      * [JsonRpcUncheckedSigner](api/providers/jsonrpc-provider)
    * [API Providers](api/providers/api-providers)
      * [EtherscanProvider](api/providers/api-providers)
      * [InfuraProvider](api/providers/api-providers)
      * [NodesmithProvider](api/providers/api-providers)
      * [AlchemyProvider](api/providers/api-providers)
    * [Other Providers](api/providers/other)
      * [FallbackProvider](api/providers/other)
      * [IpcProvider](api/providers/other)
    * [Types](api/providers/types)
      * [Blocks](api/providers/types)
      * [Events and Logs](api/providers/types)
      * [Transactions](api/providers/types)
  * [Utilities](api/utils)
    * [Addresses](api/utils/address)
    * [BigNumber](api/utils/bignumber)
      * [Types](api/utils/bignumber)
      * [Creating Instances](api/utils/bignumber)
      * [Methods](api/utils/bignumber)
      * [Notes](api/utils/bignumber)
    * [Byte Manipulation](api/utils/bytes)
      * [Types](api/utils/bytes)
      * [Inspection](api/utils/bytes)
      * [Converting between Arrays and Hexstrings](api/utils/bytes)
      * [Array Manipulation](api/utils/bytes)
      * [Hexstring Manipulation](api/utils/bytes)
      * [Signature Conversion](api/utils/bytes)
    * [Constants](api/utils/constants)
      * [Bytes](api/utils/constants)
      * [Strings](api/utils/constants)
      * [BigNumber](api/utils/constants)
    * [Display Logic and Input](api/utils/display-logic)
      * [Units](api/utils/display-logic)
      * [Functions](api/utils/display-logic)
    * [FixedNumber](api/utils/fixednumber)
      * [Types](api/utils/fixednumber)
      * [Creating Instances](api/utils/fixednumber)
      * [Properties](api/utils/fixednumber)
      * [Methods](api/utils/fixednumber)
    * [Hashing Algorithms](api/utils/hashing)
      * [Cryptographic Hashing](api/utils/hashing)
      * [Common Hashing Helpers](api/utils/hashing)
      * [Solidity Hashing Algorithms](api/utils/hashing)
    * [Strings](api/utils/strings)
      * [Bytes32String](api/utils/strings)
      * [UTF-8 Strings](api/utils/strings)
* [Cookbook](cookbook)
* [Migration Guide](migration)
  * [From Web3](migration)
  * [From ethers v4](migration)
* [Testing](testing)
* [Contributing and Hacking](contributing)
  * [Building](contributing)
* [Flatworm Docs](documentation)
  * [Fragments](documentation)
  * [Markdown](documentation)
* [License and Copyright](license)


Legacy Documentation
--------------------


This section will be kept up to date, linking to documentation of
older versions of the library.



* [version 4.0](https://docs.ethers.io/ethers.js)
* [version 3.0](https://docs.ethers.io/ethers.js/v3.0/html/)



-----
**Content Hash:** 488687b8320fc7da1517bdf2b1ac582250593622aca6b0b3244f61fc14973e42
