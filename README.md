The Ethers Project
==================

```
This branch (i.e. v6-beta-exports) can be install via npm using
"npm install ethers@beta-exports" and is highly experimental.
```

A complete, compact and simple library for Ethereum and ilk, written
in [TypeScript](https://www.typescriptlang.org).

**Features**

- Keep your private keys in your client, **safe** and sound
- Import and export **JSON wallets** (Geth, Parity and crowdsale)
- Import and export BIP 39 **mnemonic phrases** (12 word backup phrases) and **HD Wallets** (English as well as Czech, French, Italian, Japanese, Korean, Simplified Chinese, Spanish, Traditional Chinese)
- Meta-classes create JavaScript objects from any contract ABI, including **ABIv2** and **Human-Readable ABI**
- Connect to Ethereum nodes over [JSON-RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC), [INFURA](https://infura.io), [Etherscan](https://etherscan.io), [Alchemy](https://alchemyapi.io), [Ankr](https://ankr.com) or [MetaMask](https://metamask.io)
- **ENS names** are first-class citizens; they can be used anywhere an Ethereum addresses can be used
- **Tiny** (~120kb compressed; 400kb uncompressed)
- **Tree-shaking** focused; include only what you need during bundling
- **Complete** functionality for all your Ethereum desires
- Extensive [documentation](https://docs.ethers.io/v5/)
- Large collection of **test cases** which are maintained and added to
- Fully written in **TypeScript**, with strict types for security
- **MIT License** (including ALL dependencies); completely open source to do with as you please


Keep Updated
------------

For the latest news and advisories, please follow the
[@ethersproject](https://twitter.com/ethersproject) on Twitter (low-traffic,
non-marketing, important information only) as well as watch this GitHub project.

For the latest changes, see the
[CHANGELOG](https://github.com/ethers-io/ethers.js/blob/master/CHANGELOG.md).

**Summaries**

- [June 2022](https://blog.ricmoo.com/highlights-ethers-js-june-2022-f5328932e35d)
- [March 2022](https://blog.ricmoo.com/highlights-ethers-js-march-2022-f511fe1e88a1)
- [December 2021](https://blog.ricmoo.com/highlights-ethers-js-december-2021-dc1adb779d1a)
- [September 2021](https://blog.ricmoo.com/highlights-ethers-js-september-2021-1bf7cb47d348)
- [May 2021](https://blog.ricmoo.com/highlights-ethers-js-may-2021-2826e858277d)
- [March 2021](https://blog.ricmoo.com/highlights-ethers-js-march-2021-173d3a545b8d)
- [December 2020](https://blog.ricmoo.com/highlights-ethers-js-december-2020-2e2db8bc800a)



Installing
----------

**NodeJS**

```
/home/ricmoo/some_project> npm install ethers@beta-exports
```

**Browser (ESM)**

```
<script type="module">
    import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
</script>
```


Documentation
-------------

Browse the [documentation](https://docs.ethers.io) online:

- [Getting Started](https://docs.ethers.io/v5/getting-started/)
- [Full API Documentation](https://docs.ethers.io/v5/api/)
- [Various Ethereum Articles](https://blog.ricmoo.com/)



Providers
---------

Ethers works closely with an ever-growing list of third-party providers
to ensure getting started is quick and easy, by providing default keys
to each service.

These built-in keys mean you can use `ethers.getDefaultProvider()` and
start developing right away.

However, the API keys provided to ethers are also shared and are
intentionally throttled to encourage developers to eventually get
their own keys, which unlock many other features, such as faster
responses, more capacity, analytics and other features like archival
data.

When you are ready to sign up and start using for your own keys, please
check out the [Provider API Keys](https://docs.ethers.io/v5/api-keys/) in
the documentation.

A special thanks to these services for providing community resources:

- [Ankr](https://www.ankr.com/)
- [Etherscan](https://etherscan.io/)
- [INFURA](https://infura.io/)
- [Alchemy](https://dashboard.alchemyapi.io/signup?referral=55a35117-028e-4b7c-9e47-e275ad0acc6d)
- [Pocket](https://pokt.network/pocket-gateway-ethereum-mainnet/)


Extension Packages
------------------

The `ethers` package only includes the most common and most core
functionality to interact with Ethereum. There are many other
packages designed to further enhance the functionality and experience.

- Hardware Wallets (@TODO)


License
-------

MIT License (including **all** dependencies).

