-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Other Providers
===============


Others...


FallbackProvider
----------------


The **FallbackProvider** is the most advanced [Provider](../provider) available in
ethers.

It uses a quorum and connects to multiple [Providers](../provider) as backends,
each configured with a *priority* and a *weight* .

When a request is made, the request is dispatched to multiple backends, randomly
choosen (higher prioirty backends are always selected first) and the results from
each are compared against the others. Only once the quorum has been reached will that
result be accepted and returned to the caller.

By default the quorum requires 50% (rounded up) of the backends to agree. The *weight*
can be used to give a backend Provider more influence.


#### **new** *ethers* . *providers* . **FallbackProvider** ( providers [  , quorum ]  ) 

Creates a new instance of a FallbackProvider connected to *providers*. If
quorum is not specified, half of the total sum of the provider weights is
used.

The *providers* can be either an array of [Provider](../provider) or [FallbackProviderConfig](./).
If a [Provider](../provider) is provided, the defaults are a priority of 1 and a weight of 1.




#### *provider* . **providerConfigs** **=>** *Array< [FallbackProviderConfig](./) >*

The list of Provider Configurations that describe the backends.




#### *provider* . **quorum** **=>** *number*

The quorum the backend responses must agree upon before a result will be
resolved. By default this is *half the sum of the weights*.




### FallbackProviderConfig



#### *fallbackProviderConfig* . **provider** **=>** *[Provider](../provider)*

The provider for this configuration.




#### *fallbackProviderConfig* . **priority** **=>** *number*

The priority used for the provider. Higher priorities are favoured over lower
priorities. If multiple providers share the same prioirty, they are choosen
at random.




#### *fallbackProviderConfig* . **stallTimeout** **=>** *number*

The timeout (in ms) after which another [Provider](../provider) will be attempted. This
does not affect the current Provider; if it returns a result it is counted
as part of the quorum.

Lower values will result in more network traffic, but may reduce the response
time of requests.




#### *fallbackProviderConfig* . **weight** **=>** *number*

The weight a response from this provider provides. This can be used if a given
[Provider](../provider) is more trusted, for example.




IpcProvider
-----------


The **IpcProvider** allows the JSON-RPC API to be used over a local
filename on the file system, exposed by Geth, Parity and other nodes.

This is only available in *node.js* (as it requires file system access,
and may have additional complications due to file permissions. See any
related notes on the documentation for the actual node implementation websites.


#### *ipcProvider* . **path** **=>** *string*

The path this [Provider](../provider) is connected to.




UrlJsonRpcProvider
------------------


This class is intended to be sub-classed and not used directly. It
simplifies creating a [Provider](../provider) where a normal [JsonRpcProvider](../jsonrpc-provider)
would suffice, with a little extra effort needed to generate the JSON-RPC
URL.


#### **new** *ethers* . *providers* . **UrlJsonRpcProvider** (  [ network [  , apiKey ]  ]  ) 

Sub-classes do not need to override this. Instead they should override the
static method `getUrl` and optionally `getApiKey`.




#### *urlJsonRpcProvider* . **apiKey** **=>** *any*

The value of the apiKey that was returned from `InheritedClass.getApiKey`.




#### *InheritingClass* . **getApiKey** ( apiKey )  **=>** *any*

This function should examine the *apiKey* to ensure it is valid and
return a (possible modified) value to use in `getUrl`.




#### *InheritingClass* . **getUrl** ( network , apiKey )  **=>** *string*

The URL to use for the JsonRpcProvider instance.




Web3Provider
------------


The Web3Provider is meant to ease moving from a [web3.js based](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/web3.js)
application to ethers by wraping an existing Web3-compatible (such as a
[Web3HttpProvider](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-http)[Web3IpcProvider](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-ipc) or
[Web3WsProvider](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-ws)) and exposing it as an ethers.js [Provider](../provider)
which can then be used with the rest of the library.


#### **new** *ethers* . *providers* . **Web3Provider** ( web3Provider [  , network ]  ) 

Create a new **Web3Provider**, which wraps an [EIP-1193 Provider]() or
Web3Provider-compatible Provider.




#### *web3Provider* . **provider** **=>** *Web3CompatibleProvider*

The provider used to create this instance.





-----
**Content Hash:** e85f8ef6e4b1924ef63365dd6f761aa0ef5db23ebdd124686763d5061551a8bf