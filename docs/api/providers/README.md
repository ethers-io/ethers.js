-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Providers
=========


A **Provider** is an abstraction of a connection to the
Ethereum network, providing a concise, consistent interface
to standard Ethereum node functionality.

The ethers.js library provides several options which should
cover the vast majority of use-cases, but also includes the
necessary functions and classes for sub-classing if a more
custom configuration is necessary.

Most users should be able to simply use the [Default Provider](./).


Default Provider
----------------


The default provider is the safest, easiest way to begin
developing on *Ethereum*, and it is also robust enough
for use in production.

It creates a [FallbackProvider](other) connected to as many backend
services as possible. When a request is made, it is sent to
multiple backends simulatenously. As responses from each backend
are returned, they are checked that they agree. Once a quorum
has been reached (i.e. enough of the backends agree), the response
is provided to your application.

This ensures that if a backend has become out-of-sync, or if it
has been compromised that its responses are dropped in favor of
responses that match the majority.


#### *ethers* . **getDefaultProvider** (  [ network ]  )  **=>** *[Provider](provider)*

Returns a new Provider, backed by multiple services, connected
to *network*. Is no *network* is provided, **homestead**
(i.e. mainnet) is used.




Provider Documentation
----------------------



* [Provider](provider)
  * [Accounts Methods](provider)
  * [Blocks Methods](provider)
  * [Ethereum Naming Service (ENS) Methods](provider)
  * [Logs Methods](provider)
  * [Network Status Methods](provider)
  * [Transactions Methods](provider)
  * [Event Emitter Methods](provider)
  * [Inspection Methods](provider)
* [JsonRpcProvider](jsonrpc-provider)
  * [JsonRpcSigner](jsonrpc-provider)
  * [JsonRpcUncheckedSigner](jsonrpc-provider)
* [API Providers](api-providers)
  * [EtherscanProvider](api-providers)
  * [InfuraProvider](api-providers)
  * [AlchemyProvider](api-providers)
  * [CloudfrontProvider](api-providers)
* [Other Providers](other)
  * [FallbackProvider](other)
  * [IpcProvider](other)
  * [UrlJsonRpcProvider](other)
  * [Web3Provider](other)
* [Types](types)
  * [BlockTag](types)
  * [Network](types)
  * [Block](types)
  * [Events and Logs](types)
  * [Transactions](types)



-----
**Content Hash:** 29575fb7fa8a7a126446a463e402b3d444aaf8a36c9226d0644466e3ff899b07