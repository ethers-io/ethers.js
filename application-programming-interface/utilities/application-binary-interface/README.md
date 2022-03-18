# Application Binary Interface

An **Application Binary Interface** (ABI) is a collection of [Fragments](fragments.md) which specify how to interact with various components of a Contract.

An [Interface](./) helps organize Fragments by type as well as provides the functionality required to encode, decode and work with each component.

Most developers will not require this low-level access to encoding and decoding the binary data on the network and will most likely use a [Contract](../../contract-interaction/) which provides a more convenient interface. Some framework, tool developers or developers using advanced techniques may find these classes and utilities useful.

{% hint style="info" %}
The **Application Binary Interface** (ABI) is directly imported from the [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/abi/).
{% endhint %}
