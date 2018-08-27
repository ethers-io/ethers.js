ethers.js
=========

[![npm version](https://badge.fury.io/js/ethers.svg)](https://badge.fury.io/js/ethers)

Complete Ethereum wallet implementation and utilities in JavaScript (and TypeScript).

**Features:**

- Keep your private keys in your client, **safe** and sound
- Import and export **JSON wallets** (Geth, Parity and crowdsale) and brain wallets
- Import and export BIP 39 **mnemonic phrases** (12 word backup phrases) and **HD Wallets** (English, Italian, Japanese, Korean, Simplified Chinese, Traditional Chinese; more coming soon)
- Meta-classes create JavaScript objects from any contract ABI
- Connect to Ethereum nodes over [JSON-RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC), [INFURA](https://infura.io), [Etherscan](https://etherscan.io), or [MetaMask](https://metamask.io)
- ENS names are first-class citizens; they can be used anywhere an Ethereum addresses can be
- **Tiny** (~84kb compressed; 270kb uncompressed)
- **Complete** functionality for all your Ethereum needs
- Extensive [documentation](https://docs.ethers.io/ethers.js/html/)
- Large collection of test cases which are maintained and added to
- Fully TypeScript ready, with definition files and full TypeScript source
- **MIT License** (including ALL dependencies); completely open source to do with as you please


Keep Updated
------------

For the latest news and advisories, please follow (@ethersproject)[https://twitter.com/ethersproject] on Twitter.


Installing
----------

To use in a browser:

```html
<script charset="utf-8"
        src="https://cdn.ethers.io/scripts/ethers-v4-beta.min.js"
        type="text/javascript">
</script>
```

To use in [node.js](https://nodejs.org/):

```
/Users/ethers/my-app> npm install --save ethers
```


Documentation
-------------

Browse the [API Documentation](https://docs.ethers.io/ethers.js/html/) online.

To fork and submit pull requests to the documentation, please see the
[documentation repository](https://github.com/ethers-io/documentation).


Related Libraries
---------------

- [Command Line Interface](https://github.com/ethers-io/ethers-cli) - Command Line Tools for ethers
- [CryptoKitties](https://github.com/ricmoo/ethers-meow) - CryptoKitties utility libraries
- [ENS](https://github.com/ethers-io/ethers-ens) - ENS utility libraries for managing names
- [LedgerSigner](https://github.com/ethers-io/ethers-ledger) - Use a Ledger Hardware Wallet as an ethers Signer (supports HID (node.js) and U2F (browser); or specify your own transport)
- [Web3 Bridge](https://github.com/ethers-io/ethers-web3-bridge) - Use ethers as the backend for a Web3 front-end


Hacking and Contributing
------------------------

The JavaScript code is now generated from TypeScript, so make sure you modify the
TypeScript and compile it, rather than modifying the JavaScript directly. To start
auto-compiling the TypeScript code, you may use:

```
/home/ethers> npm run auto-build
```

A very important part of ethers is its exhaustive test cases, so before making any
bug fix, please add a test case that fails prior to the fix, and succeeds after the
fix. All regression tests must pass.

Pull requests are always welcome, but please keep a few points in mind:

- Compatibility-breaking changes will not be accepted; they may be considered for the next major version
- Security is important; adding dependencies require fairly convincing arguments
- The library aims to be lean, so keep an eye on the `dist/ethers.min.js` filesize before and after your changes
- Add test cases for both expected and unexpected input
- Any new features need to be supported by us (issues, documentation, testing), so anything that is overly complicated or specific may not be accepted

In general, please start an issue before beginning a pull request, so we can have a public discussion. :)


Donations
---------

I do this because I love it, but if you want to buy me a coffee, I won't say no. **:o)**

Ethereum: `0xEA517D5a070e6705Cc5467858681Ed953d285Eb9`


License
-------

Completely MIT Licensed. Including ALL dependencies.
