-----

Documentation: [html](https://docs.ethers.io/)

-----

Other Providers
===============

FallbackProvider
----------------

#### **new ***ethers* . *providers* . **FallbackProvider**( providers [ , quorum ] )

Creates a new instance of a FallbackProvider connected to *providers*. If quorum is not specified, half of the total sum of the provider weights is used.

The *providers* can be either an array of [Provider](/v5/api/providers/provider/) or [FallbackProviderConfig](/v5/api/providers/other/#FallbackProviderConfig). If a [Provider](/v5/api/providers/provider/) is provided, the defaults are a priority of 1 and a weight of 1.


#### *provider* . **providerConfigs** => *Array< [FallbackProviderConfig](/v5/api/providers/other/#FallbackProviderConfig) >*

The list of Provider Configurations that describe the backends.


#### *provider* . **quorum** => *number*

The quorum the backend responses must agree upon before a result will be resolved. By default this is *half the sum of the weights*.


### FallbackProviderConfig

#### *fallbackProviderConfig* . **provider** => *[Provider](/v5/api/providers/provider/)*

The provider for this configuration.


#### *fallbackProviderConfig* . **priority** => *number*

The priority used for the provider. Lower-value priorities are favoured over higher-value priorities. If multiple providers share the same priority, they are chosen at random.


#### *fallbackProviderConfig* . **stallTimeout** => *number*

The timeout (in ms) after which another [Provider](/v5/api/providers/provider/) will be attempted. This does not affect the current Provider; if it returns a result it is counted as part of the quorum.

Lower values will result in more network traffic, but may reduce the response time of requests.


#### *fallbackProviderConfig* . **weight** => *number*

The weight a response from this provider provides. This can be used if a given [Provider](/v5/api/providers/provider/) is more trusted, for example.


IpcProvider
-----------

#### *ipcProvider* . **path** => *string*

The path this [Provider](/v5/api/providers/provider/) is connected to.


UrlJsonRpcProvider
------------------

#### **new ***ethers* . *providers* . **UrlJsonRpcProvider**( [ network [ , apiKey ] ] )

Sub-classes do not need to override this. Instead they should override the static method `getUrl` and optionally `getApiKey`.


#### *urlJsonRpcProvider* . **apiKey** => *any*

The value of the apiKey that was returned from `InheritedClass.getApiKey`.


#### *InheritingClass* . **getApiKey**( apiKey ) => *any*

This function should examine the *apiKey* to ensure it is valid and return a (possible modified) value to use in `getUrl`.


#### *InheritingClass* . **getUrl**( network , apiKey ) => *string*

The URL to use for the JsonRpcProvider instance.


Web3Provider
------------

#### **new ***ethers* . *providers* . **Web3Provider**( externalProvider [ , network ] )

Create a new **Web3Provider**, which wraps an [EIP-1193 Provider](https://eips.ethereum.org/EIPS/eip-1193) or Web3Provider-compatible Provider.


#### *web3Provider* . **provider** => *Web3CompatibleProvider*

The provider used to create this instance.


### ExternalProvider

#### *externalProvider* . **request**( request ) => *Promise< any >*

This follows the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) API signature.

The *request* should be a standard JSON-RPC payload, which should at a minimum specify the `method` and `params`.

The result should be the actual result, which differs from the Web3.js response, which is a wrapped JSON-RPC response.


#### *externalProvider* . **sendAsync**( request , callback ) => *void*

This follows the [Web3.js Provider Signature](https://github.com/ethereum/web3.js/blob/1.x/packages/web3-providers-http/types/index.d.ts#L57).

The *request* should be a standard JSON-RPC payload, which should at a minimum specify the `method` and `params`.

The *callback* should use the error-first calling semantics, so `(error, result)` where the result is a JSON-RPC wrapped result.


#### *externalProvider* . **send**( request , callback ) => *void*

This is identical to `sendAsync`. Historically, this used a synchronous web request, but no current browsers support this, so its use this way was deprecated quite a long time ago


WebSocketProvider
-----------------

#### **new ***ethers* . *providers* . **WebSocketProvider**( [ url [ , network ] ] )

Returns a new [WebSocketProvider](/v5/api/providers/other/#WebSocketProvider) connected to *url* as the *network*.

If *url* is unspecified, the default `"ws://localhost:8546"` will be used. If *network* is unspecified, it will be queried from the network.


