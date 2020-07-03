-----

Documentation: [html](https://docs.ethers.io/)

-----

Providers
=========

Default Provider
----------------

#### *ethers* . **getDefaultProvider**( [ network , [ options ] ] ) => *[Provider](/v5/api/providers/provider/)*

Returns a new Provider, backed by multiple services, connected to *network*. Is no *network* is provided, **homestead** (i.e. mainnet) is used.

The *options* is an object, with the following properties:


Option Properties



#### Note: API Keys

It is highly recommended for production services that to acquire and specify an API Key for each sercice.

The default API Keys used by ethers are shared across all users, so services may throttle all services that are using the default API Keys during periods of load without realizing it.

Many services also have monitoring and usage metrics, which are only available if an API Key is specified. This allows tracking how many requests are being sent and which methods are being used the most.

Some services also provide additional paid features, which are only available when specifying an API Key.


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
  * [Node-Specific Methods](jsonrpc-provider)
* [API Providers](api-providers)
  * [EtherscanProvider](api-providers)
  * [InfuraProvider](api-providers)
  * [AlchemyProvider](api-providers)
  * [CloudflareProvider](api-providers)
* [Other Providers](other)
  * [FallbackProvider](other)
  * [IpcProvider](other)
  * [UrlJsonRpcProvider](other)
  * [Web3Provider](other)
  * [WebSocketProvider](other)
* [Types](types)
  * [BlockTag](types)
  * [Network](types)
  * [Block](types)
  * [Events and Logs](types)
  * [Transactions](types)

