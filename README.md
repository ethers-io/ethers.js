# Documentation

### What is hethers?

[Hethers](https://github.com/hashgraph/hethers.js/) is a complete and compact library for interacting with the _Hedera Hashgraph_ and more specifically the Smart Contract Service. It is a fork of [The Ethers Project](https://github.com/ethers-io/ethers.js/) and implements the same program interface as _ethers.js_ with some minor changes.

### Features

* Keep your private keys in your client, **safe** and sound
* Import and export **JSON wallets**
* Import and export BIP 39 **mnemonic phrases** (12-word backup phrases) and **HD Wallets** (English as well as Czech, French, Italian, Japanese, Korean, Simplified Chinese, Spanish, Traditional Chinese)
* Meta-classes create JavaScript objects from any contract ABI, including **ABIv2** and **Human-Readable ABI**
* Connect to the Hedera Network over both Consensus and Mirror nodes.
* **Modular** packages; include only what you need
* Extensive [documentation](./)
* Large collection of **test cases** which are maintained and added to
* Fully **TypeScript** ready, with definition files and full TypeScript source
* **MIT License** (including ALL dependencies); completely open-source to do with as you please

### Migration from other EVM based chains&#x20;

This document covers the features present in the `ethers` library, which has changed in some important way in the `hethers` library.

**General / Conceptual changes**

* Two endpoints (APIs) are utilised by the `provider` instance -> [Hedera Consensus Nodes](https://docs.hedera.com/guides/docs/hedera-api) & [Hedera Mirror Nodes](https://docs.hedera.com/guides/docs/mirror-node-api).
* Gas estimates are not supported as of now. You must provide the gas limit manually. More information on gas limits can be found [here](https://docs.hedera.com/guides/core-concepts/smart-contracts/gas-and-fees).
* Gas Price is not specified by clients. The Hedera network computes the necessary `gasPrice` during transaction execution. More info [here](https://docs.hedera.com/guides/core-concepts/smart-contracts/gas-and-fees).
* Static calls are executed against Hedera Consensus Nodes and are **paid,** thus must be signed by an already existing Account. **** `static` calls create [ContractLocalCall](https://docs.hedera.com/guides/docs/hedera-api/smart-contracts/contractcalllocal) transactions.
* Account creation happens on-chain. You cannot create a random hedera account by generating a pub key. Accounts must be explicitly created or implicitly using [HIP-32](https://hips.hedera.com/hip/hip-32).&#x20;
* All `address` properties are replaced with `accountLike` properties to support both Hedera like accounts (`shard.realm.num`) and native EVM addresses.
* The transaction identifier is not `transactionHash` but `transactionId`, thus every function using `transactionHash` is replaced with `transactionId`
* There is no concept of blocks, thus `block` related queries for filters/events or provider polling is replaced with `timestamp` based.

### Developer Documentation

[Documentation](./#what-is-hethers)\
[Getting Started](getting-started.md)\
[Application Programming Interface](application-programming-interface/)\
&#x20;   [Providers](application-programming-interface/providers/)\
[    ](application-programming-interface/providers/)    [Provider](application-programming-interface/providers/provider/)\
&#x20;       [    ](application-programming-interface/providers/)[Accounts Methods](application-programming-interface/providers/provider/accounts-methods.md)\
[    ](application-programming-interface/providers/)        [Logs Methods](application-programming-interface/providers/provider/logs-methods.md)\
[    ](application-programming-interface/providers/)        [Network Status Methods](application-programming-interface/providers/provider/network-status-methods.md)\
[    ](application-programming-interface/providers/)        [Transactions Methods](application-programming-interface/providers/provider/transactions-methods.md)\
[    ](application-programming-interface/providers/)        [Event Emitter Methods](application-programming-interface/providers/provider/event-emitter-methods.md)\
[    ](application-programming-interface/providers/)        [Base Provider](application-programming-interface/providers/provider/base-provider.md)\
[    ](application-programming-interface/providers/)    [Types](application-programming-interface/providers/types.md)\
[    ](application-programming-interface/providers/)    [Signers](application-programming-interface/signers.md)\
[    ](application-programming-interface/providers/)    [Contract Interaction](application-programming-interface/contract-interaction/)\
[    ](application-programming-interface/providers/)        [Contract](application-programming-interface/contract-interaction/contract.md)\
[    ](application-programming-interface/providers/)        [ContractFactory](application-programming-interface/contract-interaction/contractfactory.md)\
[    ](application-programming-interface/providers/)        [Example: ERC-20 Contract](application-programming-interface/contract-interaction/example-erc-20-contract.md)\
[    ](application-programming-interface/providers/)    [Utilities](application-programming-interface/utilities/)\
[    ](application-programming-interface/providers/)        [Accounts](application-programming-interface/utilities/accounts.md)\
[    ](application-programming-interface/providers/)        [Addresses](application-programming-interface/utilities/addresses.md#icap-address)\
[    ](application-programming-interface/providers/)        [Application Binary Interface](application-programming-interface/utilities/application-binary-interface/)\
[    ](application-programming-interface/providers/)            [AbiCoder](application-programming-interface/utilities/application-binary-interface/abicoder.md)\
[    ](application-programming-interface/providers/)            [ABI Formats](application-programming-interface/utilities/application-binary-interface/abi-formats.md)\
[    ](application-programming-interface/providers/)            [Fragmets](application-programming-interface/utilities/application-binary-interface/fragments.md)\
[    ](application-programming-interface/providers/)            [Interface](application-programming-interface/utilities/application-binary-interface/interface.md)\
[    ](application-programming-interface/providers/)        [BigNumber](application-programming-interface/utilities/bignumber.md)\
[    ](application-programming-interface/providers/)        [Byte Manipulation](application-programming-interface/utilities/byte-manipulation.md)\
[    ](application-programming-interface/providers/)        [Constants](application-programming-interface/utilities/constants.md)\
[    ](application-programming-interface/providers/)        [Display Logic and Input](application-programming-interface/utilities/display-logic-and-input.md)\
[    ](application-programming-interface/providers/)        [Encoding Utilities](application-programming-interface/utilities/encoding-utilities.md)\
[    ](application-programming-interface/providers/)        [FixedNumber](application-programming-interface/utilities/fixednumber.md)\
[    ](application-programming-interface/providers/)        [Hashing Algorithms](application-programming-interface/utilities/hashing-algorithms.md)\
[    ](application-programming-interface/providers/)        [HD Wallet](application-programming-interface/utilities/hd-wallet.md)\
[    ](application-programming-interface/providers/)        [Logging](application-programming-interface/utilities/logging.md)\
[    ](application-programming-interface/providers/)        [Property Utilities](application-programming-interface/utilities/property-utilities.md)\
[    ](application-programming-interface/providers/)        [Signing Key](application-programming-interface/utilities/signing-key.md)\
[    ](application-programming-interface/providers/)        [Strings](application-programming-interface/utilities/strings.md)\
[    ](application-programming-interface/providers/)        [Transactions](application-programming-interface/utilities/transactions.md)\
[    ](application-programming-interface/providers/)        [Web Utilities](application-programming-interface/utilities/web-utilities.md)\
[    ](application-programming-interface/providers/)        [Wordlists](application-programming-interface/utilities/wordlists.md)\
[Contributing](contributing.md)\
[Other Resources](other-resources.md)
