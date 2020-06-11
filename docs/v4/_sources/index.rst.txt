.. ethers.js documentation master file, created by
   sphinx-quickstart on Tue Nov 29 10:25:33 2016.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.


What is ethers.js
*****************

The ethers.js library aims to be a complete and compact library for interacting
with the Ethereum Blockchain and its ecosystem. It was originally designed for
use with `ethers.io`_ and has since expanded into a much more general-purpose
library.

-----

Features
========

    - Keep your private keys in your client, **safe** and sound
    - Import and export **JSON wallets** (Geth, Parity and crowdsale)
    - Import and export BIP 39 **mnemonic phrases** (12 word backup phrases) and HD Wallets (English, Italian, Japanese, Korean, Simplified Chinese, Traditional Chinese; more coming soon)
    - Meta-classes create JavaScript objects from any contract ABI, including **ABIv2** and **Human-Readable** ABI
    - Connect to Ethereum nodes over `JSON-RPC`_, `INFURA`_, `Etherscan`_, or `MetaMask`_.
    - **ENS names** are first-class citizens; they can be used anywhere an Ethereum addresses can be used
    - **Tiny** (~88kb compressed; 284kb uncompressed)
    - **Complete** functionality for all your Ethereum needs
    - Extensive `documentation`_
    - Large collection of **test cases** which are maintained and added to
    - Fully **TypeScript** ready, with definition files and full TypeScript source
    - **MIT License** (including ALL dependencies); completely open source to do with as you please

----

.. toctree::
   :maxdepth: 3
   :caption: Developer Documentation

   getting-started
   api
   api-advanced
   cookbook
   migration
   notes
   testing

-----

Legacy Documentation
====================

For documentation of older versions, we will keep a list here.

    - `version 3.0`_

-----

.. _ethers.io: https://ethers.io
.. _JSON-RPC: https://github.com/ethereum/wiki/wiki/JSON-RPC
.. _INFURA: https://infura.io/
.. _Etherscan: https://etherscan.io/
.. _MetaMask: https://metamask.io/
.. _version 3.0: https://docs.ethers.io/ethers.js/v3.0/html/
.. _documentation: https://docs.ethers.io

.. EOF
