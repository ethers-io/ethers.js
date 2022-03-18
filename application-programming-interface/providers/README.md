# Providers

A **Provider** is an abstraction of a connection to the _Hedera Hashgraph_ network, providing a concise, consistent interface to standard _Hedera Hashgraph_ consensus node and mirror nodes functionality.

The hethers.js library provides several options which should cover the vast majority of use-cases but also includes the necessary functions and classes for sub-classing if a more custom configuration is necessary.

Most users should use the [Default Provider](./#default-provider).

### Default Provider

The default provider is the safest, easiest way to begin developing on _Hedera Hashgraph_, and it is also robust enough for use in production. It creates a `DefaultHederaProvider` connection to a Hedera backend service.

#### `hethers.getDefaultProvider( [ network , [ options ] ] )` ⇒ Provider

Returns a new Provider, backed by multiple services (Hedera Consensus Nodes and Mirror Nodes), connected to the _network_. If no _network_ is provided, **mainnet** is used.

The _network_ may also be a URL to connect to, such as `http://localhost:50211`

{% hint style="info" %}
It is highly recommended for production services to acquire unthrottled access to Mirror Node.
{% endhint %}

### Networks

There are several official common Hedera networks (as well as custom networks and other compatible projects).

Any API that accepts a [Networkish](types.md#networkish) can be passed a common name (such as `"mainnet"` or `"previewnet"`) or chain ID to use that network definition or may specify custom parameters.

#### `hethers.providers.getNetwork(aNetworkish)` ⇒ Network&#x20;

Returns the full [Network](types.md#network) for the given standard _aNetworkish_ [Networkish](types.md#networkish).

This is useful for functions and classes which wish to accept [Networkish](types.md#networkish) as an input parameter.

```typescript
// By Chain Name 
getNetwork("mainnet"); 
// { 
//     chainId: 290, 
//     ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', 
//     name: 'mainnet' 
// }

// By Chain ID 
getNetwork(290); 
// { 
//     chainId: 290, 
//     ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', 
//     name: 'mainnet' 
// }
```
