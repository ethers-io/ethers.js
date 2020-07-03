-----

Documentation: [html](https://docs.ethers.io/)

-----

JsonRpcProvider
===============

#### **new ***ethers* . *providers* . **JsonRpcProvider**( [ url [ , aNetworkish ] ] )

Connect to a JSON-RPC API located at *url* using the *aNetworkish* network. If *url* is not specified, the default (i.e. `http://localhost:8545`) is used and if no network is specified, it will be determined automatically by querying the node.


#### Note: Connecting to a Local Node

Each node implementation is slightly different and may require specific command-line flags, configuration or settings in their UI to enable JSON-RPC, unlock accounts or expose specific APIs. Please consult their documentation.


#### *jsonRpcProvider* . **getSigner**( [ addressOrIndex ] ) => *[JsonRpcSigner](/v5/api/providers/jsonrpc-provider/#JsonRpcSigner)*

Returns a [JsonRpcSigner](/v5/api/providers/jsonrpc-provider/#JsonRpcSigner) which is managed by this Ethereum node, at *addressOrIndex*. If no *addressOrIndex* is provided, the first account (account #0) is used.


#### *jsonRpcProvider* . **getUncheckedSigner**( [ addressOrIndex ] ) => *[JsonRpcUncheckedSigner](/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner)*



#### *jsonRpcProvider* . **listAccounts**( ) => *Array< string >*

Returns a list of all account addresses managed by this provider.


#### *jsonRpcProvider* . **send**( method , params ) => *Promise< any >*

Allows sending raw messages to the provider.

This can be used for backend-specific calls, such as for debugging or specific account management.


JsonRpcSigner
-------------

#### *signer* . **provider** => *[JsonRpcProvider](/v5/api/providers/jsonrpc-provider/)*

The provider this signer was established from.


#### *signer* . **connectUnchecked**( ) => *[JsonRpcUncheckedSigner](/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner)*

Returns a new Signer object which does not perform additional checks when sending a transaction. See [getUncheckedSigner](/v5/api/providers/jsonrpc-provider/#JsonRpcProvider-getUncheckedSigner) for more details.


#### *signer* . **sendUncheckedTransaction**( transaction ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > > >*

Sends the *transaction* and returns a Promise which resolves to the opaque transaction hash.


#### *signer* . **unlock**( password ) => *Promise< boolean >*

Request the node unlock the account (if locked) using *password*.


JsonRpcUncheckedSigner
----------------------

Node-Specific Methods
---------------------

