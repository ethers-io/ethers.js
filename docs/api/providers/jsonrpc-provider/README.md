-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

JsonRpcProvider
===============


The [JSON-RPC API](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/wiki/wiki/JSON-RPC) is a
very popular method for interacting with Ethereum and is available in all
major Ethereum node implementations (e.g. [Geth](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/geth.ethereum.org)
and [Parity](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.parity.io)) as well as many third-party web
services (e.g. [INFURA](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/infura.io))


#### **new** *ethers* . *providers* . **JsonRpcProvider** (  [ url [  , aNetworkish ]  ]  ) 

Connect to a JSON-RPC API located at *url* using the /aNetworkish// network.
If *url* is not specified, the default (i.e. `http://localhost:8545`) is used
and if no network is specified, it will be determined automatically by
querying the node.




#### Note: Connecting to a Local Node

Each node implementation is slightly different and may require specific command-line
flags or changes in their Settings UI to enable JSON-RPC, unlock accounrs
or expose specific APIs. Please consult theit documentation.




#### *jsonRpcProvider* . **getSigner** (  [ addressOrIndex ]  )  **=>** *[JsonRpcSigner](./)*

Returns a [JsonRpcSigner](./) which is managed by this Ethereum node, at
*addressOrIndex*. If no *addressOrIndex* is provided, the first
account (account #0) is used.




#### *jsonRpcProvider* . **getUncheckedSigner** (  [ addressOrIndex ]  )  **=>** *[JsonRpcUncheckedSigner](./)*






#### *jsonRpcProvider* . **listAccounts** (  )  **=>** *Array< string >*

Returns a list of all account addresses managed by this provider.




#### *jsonRpcProvider* . **send** ( method , params )  **=>** *Promise< any >*

Allows sending raw messages to the provider.

This can be used for backend-specific calls, such as for debugging or
specific account management.




JsonRpcSigner
-------------


A **JsonRpcSigner** is a simple Signer which is backed by a connected
[JsonRpcProvider](./).


#### *signer* . **provider** **=>** *[JsonRpcProvider](./)*

The provider this signer was established from.




#### *signer* . **connectUnchecked** (  )  **=>** *[JsonRpcUncheckedSigner](./)*

Returns a new Signer object which does not perform addtional checks when
sending a transaction. See [JsonRpcUncheckedSigner](./) for more details.




#### *signer* . **sendUncheckedTransaction** ( transaction )  **=>** *Promise< string< [DataHexstring](../../utils/bytes)< 32 > > >*

Sends the *transaction* and returns a Promise which resolves to the
opacque transaction hash.




#### *signer* . **unlock** ( password )  **=>** *Promise< boolean >*

Request the node unlock the account (if locked) using *password*.




JsonRpcUncheckedSigner
----------------------


The JSON-RPC API only provides a transaction hash as the response when a
transaction is sent, but the ethers Provider requires populating all details
of a transaction before returning it. For example, the gas price and gas limit
may be adjusted by the node or the nonce automatically included, in which case
the opaque transaction hash has discarded this.

To remedy this, the [JsonRpcSigner](./) immeidately queries the provider for
the details using the returned transaction hash to populate the [TransactionResponse](../types)
object.

Some backends do not respond immediately and instead defer releasing the
details of a transaction it was responsible for signing until it is mined.

The **UncheckedSigner** does not populate any additional information and will
immediately return the result as a mock [TransactionResponse](../types)-like
object, with most of the properties set to null, but allows access to the
transaction hash quickly, if that is all that is required.



-----
**Content Hash:** d60a1c5ef2f317ae59bc4b22a1e9d079f1762f60f6321b5da1efbe07d8284284