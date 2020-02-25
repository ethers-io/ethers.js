-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Documentation
=============



What is Ethers?
---------------


The ethers.js library aims to be a complete and compact library for
interacting with the Ethereum Blockchain and its ecosystem. It was
originally designed for use with [ethers.io](Users/ricmoo/Development/ethers/ethers.js-v5/https:/ethers.io) and
has since expanded into a much more general-purpose library.


Features
--------




* Keep your private keys in your client, **safe** and sound
* Import and export **JSON wallets** (Geth, Parity and crowdsale)
* Import and export BIP 39 **mnemonic phrases** (12 word backup phrases) and HD Wallets (English, Italian, Japanese, Korean, Simplified Chinese, Traditional Chinese; more coming soon)
* Meta-classes create JavaScript objects from any contract ABI, including **ABIv2** and **Human-Readable ABI**
* Connect to Ethereum nodes over [JSON-RPC](Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/wiki/wiki/JSON-RPC), [INFURA](Users/ricmoo/Development/ethers/ethers.js-v5/https:/infura.io), [Etherscan](Users/ricmoo/Development/ethers/ethers.js-v5/https:/etherscan.io), [Alchemy](Users/ricmoo/Development/ethers/ethers.js-v5/https:/alchemyapi.io), [Cloudflare](Users/ricmoo/Development/ethers/ethers.js-v5/https:/developers.cloudflare.com/distributed-web/ethereum-gateway) or [MetaMask](Users/ricmoo/Development/ethers/ethers.js-v5/https:/metamask.io).
* **ENS names** are first-class citizens; they can be used anywhere an Ethereum addresses can be used
* **Tiny** (~88kb compressed; 284kb uncompressed)
* **Complete** functionality for all your Ethereum needs
* Extensive [documentation](Users/ricmoo/Development/ethers/ethers.js-v5/https:/docs.ethers.io)
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
    * [Solidity Topics](concepts/events)
  * [Gas](concepts/gas)
    * [Gas Price](concepts/gas)
    * [Gas Limit](concepts/gas)
* [Application Programming Interface](api)
  * [Contract Interaction](api/contract)
    * [Contract](api/contract/contract)
      * [Properties](api/contract/contract)
      * [Methods](api/contract/contract)
      * [Events](api/contract/contract)
      * [Meta-Class](api/contract/contract)
    * [Example: ERC-20 Contract](api/contract/example)
      * [Connecting to a Contract](api/contract/example)
      * [Properties ^^//(inheritted from [[contract]])//^^](api/contract/example)
      * [Methods ^^//(inheritted from [[contract]])//^^](api/contract/example)
      * [Events ^^//(inheritted from Contract)//^^](api/contract/example)
      * [Meta-Class Methods ^^//(added at Runtime)//^^](api/contract/example)
      * [Meta-Class Filters ^^//(added at Runtime)//^^](api/contract/example)
  * [Signers](api/signer)
    * [Signer](api/signer)
    * [Wallet](api/signer)
    * [VoidSigner](api/signer)
    * [ExternallyOwnedAccount](api/signer)
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
    * [JsonRpcProvider](api/providers/jsonrpc-provider)
      * [JsonRpcSigner](api/providers/jsonrpc-provider)
      * [JsonRpcUncheckedSigner](api/providers/jsonrpc-provider)
    * [API Providers](api/providers/api-providers)
      * [EtherscanProvider](api/providers/api-providers)
      * [InfuraProvider](api/providers/api-providers)
      * [AlchemyProvider](api/providers/api-providers)
      * [CloudfrontProvider](api/providers/api-providers)
    * [Other Providers](api/providers/other)
      * [FallbackProvider](api/providers/other)
      * [IpcProvider](api/providers/other)
      * [UrlJsonRpcProvider](api/providers/other)
      * [Web3Provider](api/providers/other)
    * [Types](api/providers/types)
      * [BlockTag](api/providers/types)
      * [Network](api/providers/types)
      * [Block](api/providers/types)
      * [Events and Logs](api/providers/types)
      * [Transactions](api/providers/types)
  * [Utilities](api/utils)
    * [Application Binary Interface](api/utils/abi)
      * [Interface](api/utils/abi/interface)
        * [Creating Instances](api/utils/abi/interface)
        * [Properties](api/utils/abi/interface)
        * [Formatting](api/utils/abi/interface)
        * [Fragment Access](api/utils/abi/interface)
        * [Signature and Topic Hashes](api/utils/abi/interface)
        * [Encoding Data](api/utils/abi/interface)
        * [Decoding Data](api/utils/abi/interface)
        * [Parsing](api/utils/abi/interface)
        * [Types](api/utils/abi/interface)
        * [Specifying Fragments](api/utils/abi/interface)
      * [Fragments](api/utils/abi/fragments)
        * [Formats](api/utils/abi/fragments)
        * [Fragment](api/utils/abi/fragments)
        * [ConstructorFragment](api/utils/abi/fragments)
        * [EventFragment](api/utils/abi/fragments)
        * [FunctionFragment](api/utils/abi/fragments)
        * [ParamType](api/utils/abi/fragments)
    * [Addresses](api/utils/address)
      * [Address Formats](api/utils/address)
      * [Functions](api/utils/address)
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
      * [Random Bytes](api/utils/bytes)
    * [Constants](api/utils/constants)
      * [Bytes](api/utils/constants)
      * [Strings](api/utils/constants)
      * [BigNumber](api/utils/constants)
    * [Display Logic and Input](api/utils/display-logic)
      * [Units](api/utils/display-logic)
      * [Functions](api/utils/display-logic)
    * [Encoding Utilities](api/utils/encoding)
      * [Base58](api/utils/encoding)
      * [Base64](api/utils/encoding)
      * [Recursive-Length Prefix](api/utils/encoding)
    * [FixedNumber](api/utils/fixednumber)
      * [Creating Instances](api/utils/fixednumber)
      * [Properties](api/utils/fixednumber)
      * [Methods](api/utils/fixednumber)
      * [FixedFormat](api/utils/fixednumber)
    * [Hashing Algorithms](api/utils/hashing)
      * [Cryptographic Hashing](api/utils/hashing)
      * [Common Hashing Helpers](api/utils/hashing)
      * [Solidity Hashing Algorithms](api/utils/hashing)
    * [HD Wallet](api/utils/hdnode)
      * [Types](api/utils/hdnode)
      * [HDNode](api/utils/hdnode)
      * [Other Functions](api/utils/hdnode)
    * [Logging](api/utils/logger)
      * [Logger](api/utils/logger)
      * [Errors](api/utils/logger)
      * [Log Levels](api/utils/logger)
    * [Property Utilities](api/utils/properties)
    * [Signing Key](api/utils/signing-key)
      * [Other Functions](api/utils/signing-key)
    * [Strings](api/utils/strings)
      * [Bytes32String](api/utils/strings)
      * [UTF-8 Strings](api/utils/strings)
      * [UnicodeNormalizationForm](api/utils/strings)
      * [Custom UTF-8 Error Handling](api/utils/strings)
    * [Transactions](api/utils/transactions)
      * [Types](api/utils/transactions)
      * [Functions](api/utils/transactions)
    * [Web Utilities](api/utils/web)
    * [Wordlists](api/utils/wordlists)
      * [Wordlist](api/utils/wordlists)
      * [Languages](api/utils/wordlists)
  * [Other Libraries](api/other)
    * [Assembly](api/other/assembly)
      * [Ethers ASM Dialect](api/other/assembly/dialect)
        * [Opcodes](api/other/assembly/dialect)
        * [Labels](api/other/assembly/dialect)
        * [Literals](api/other/assembly/dialect)
        * [Comments](api/other/assembly/dialect)
        * [Scopes](api/other/assembly/dialect)
        * [Data Segment](api/other/assembly/dialect)
        * [Links](api/other/assembly/dialect)
        * [Stack Placeholders](api/other/assembly/dialect)
        * [Evaluation and Excution](api/other/assembly/dialect)
      * [Utilities](api/other/assembly/api)
        * [Assembler](api/other/assembly/api)
        * [Disassembler](api/other/assembly/api)
        * [Opcode](api/other/assembly/api)
      * [Abstract Syntax Tree](api/other/assembly/ast)
        * [Types](api/other/assembly/ast)
        * [Nodes](api/other/assembly/ast)
    * [Hardware Wallets](api/other/hardware)
      * [LedgerSigner](api/other/hardware)
* [Command Line Interfaces](cli)
  * [Sandbox Utility](cli/ethers)
    * [Help](cli/ethers)
    * [Examples](cli/ethers)
  * [Assembler](cli/asm)
    * [Help](cli/asm)
    * [Example Input Files](cli/asm)
    * [Assembler Examples](cli/asm)
    * [Disassembler Examples](cli/asm)
  * [Ethereum Naming Service](cli/ens)
    * [Help](cli/ens)
    * [Examples](cli/ens)
  * [TypeScript](cli/typescript)
    * [Help](cli/typescript)
    * [Examples](cli/typescript)
  * [Making Your Own](cli/plugin)
    * [CLI](cli/plugin)
    * [Plugin](cli/plugin)
    * [ArgParser](cli/plugin)
* [Cookbook](cookbook)
* [Migration Guide](migration)
  * [Migration: From Web3.js](migration/web3)
    * [Contracts](migration/web3)
    * [Providers](migration/web3)
    * [Numbers](migration/web3)
    * [Utilities](migration/web3)
  * [Migration: From Ethers v4](migration/ethers-v4)
    * [BigNumber](migration/ethers-v4)
    * [Contracts](migration/ethers-v4)
    * [Errors](migration/ethers-v4)
    * [Interface](migration/ethers-v4)
    * [Utilities](migration/ethers-v4)
    * [Wallet](migration/ethers-v4)
* [Testing](testing)
* [Contributing and Hacking](contributing)
  * [Building](contributing)
* [Flatworm Docs](documentation)
  * [Fragments](documentation)
  * [Markdown](documentation)
  * [Configuration](documentation)
  * [Extended Directive Functions](documentation)
* [License and Copyright](license)


Legacy Documentation
--------------------


This section will be kept up to date, linking to documentation of
older versions of the library.



* [version 4.0](Users/ricmoo/Development/ethers/ethers.js-v5/https:/docs.ethers.io/ethers.js)
* [version 3.0](Users/ricmoo/Development/ethers/ethers.js-v5/https:/docs.ethers.io/ethers.js/v3.0/html)



-----
**Content Hash:** 1ccc27c4ba6e59efa2be69cc0fb345ea9c397f1f4444d08ec13780d0d1a46b60