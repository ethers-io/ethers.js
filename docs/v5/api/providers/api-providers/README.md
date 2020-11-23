-----

Documentation: [html](https://docs.ethers.io/)

-----

API Providers
=============

EtherscanProvider
-----------------

#### **new ***ethers* . *providers* . **EtherscanProvider**( [ network = "homestead" , [ apiKey ] ] )

Create a new **EtherscanProvider** connected to *network* with the optional *apiKey*.

The *network* may be specified as a **string** for a common network name, a **number** for a common chain ID or a [Network Object]provider-(network).

If no *apiKey* is provided, a shared API key will be used, which may result in reduced performance and throttled requests. It is highly recommended for production, you register with [Etherscan](https://etherscan.io) for your own API key.


#### Note: Default API keys

If no *apiKey* is provided, a shared API key will be used, which may result in reduced performance and throttled requests.

It is highly recommended for production, you register with [Etherscan](https://etherscan.io) for your own API key.


#### **Supported Networks**

- Homestead (Mainnet) 
- Ropsten (proof-of-work testnet) 
- Rinkeby (proof-of-authority testnet) 
- Gorli (clique testnet) 
- Kovan (proof-of-authority testnet) 




```javascript
// Connect to mainnet (homestead)
provider = new EtherscanProvider();

// Connect to rinkeby testnet (these are equivalent)
provider = new EtherscanProvider("rinkeby");
provider = new EtherscanProvider(4);

const network = ethers.providers.getNetwork("rinkeby");
// {
//   chainId: 4,
//   ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
//   name: 'rinkeby'
// }

provider = new EtherscanProvider(network);

// Connect to mainnet (homestead) with an API key
provider = new EtherscanProvider(null, apiKey);
provider = new EtherscanProvider("homestead", apiKey);
```

#### *provider* . **getHistory**( address ) => *Array< History >*

@TODO... Explain


InfuraProvider
--------------

#### **new ***ethers* . *providers* . **InfuraProvider**( [ network = "homestead" , [ apiKey ] ] )

Create a new **InfuraProvider** connected to *network* with the optional *apiKey*.

The *network* may be specified as a **string** for a common network name, a **number** for a common chain ID or a [Network Object]provider-(network).

The *apiKey* can be a **string** Project ID or an **object** with the properties `projectId` and `projectSecret` to specify a [Project Secret](https://infura.io/docs/gettingStarted/authentication) which can be used on non-public sources (like on a server) to further secure your API access and quotas.


#### *InfuraProvider* . **getWebSocketProvider**( [ network [ , apiKey ] ] ) => *[WebSocketProvider](/v5/api/providers/other/#WebSocketProvider)*

Create a new [WebSocketProvider](/v5/api/providers/other/#WebSocketProvider) using the INFURA web-socket endpoint to connect to *network* with the optional *apiKey*.

The *network* and *apiKey* are specified the same as [the constructor](/v5/api/providers/api-providers/#InfuraProvider).


#### Note: Default API keys

If no *apiKey* is provided, a shared API key will be used, which may result in reduced performance and throttled requests.

It is highly recommended for production, you register with [INFURA](https://infura.io) for your own API key.


#### **Supported Networks**

- Homestead (Mainnet) 
- Ropsten (proof-of-work testnet) 
- Rinkeby (proof-of-authority testnet) 
- Gorli (clique testnet) 
- Kovan (proof-of-authority testnet) 




```javascript
// Connect to mainnet (homestead)
provider = new InfuraProvider();

// Connect to the ropsten testnet
// (see EtherscanProvider above for other network examples)
provider = new InfuraProvider("ropsten");

// Connect to mainnet with a Project ID (these are equivalent)
provider = new InfuraProvider(null, projectId);
provider = new InfuraProvider("homestead", projectId);

// Connect to mainnet with a Project ID and Project Secret
provider = new InfuraProvider("homestead", {
    projectId: projectId,
    projectSecret: projectSecret
});

// Connect to the INFURA WebSocket endpoints with a WebSocketProvider
provider = InfuraProvider.getWebSocketProvider()
```

AlchemyProvider
---------------

#### **new ***ethers* . *providers* . **AlchemyProvider**( [ network = "homestead" , [ apiKey ] ] )

Create a new **AlchemyProvider** connected to *network* with the optional *apiKey*.

The *network* may be specified as a **string** for a common network name, a **number** for a common chain ID or a [Network Object](/v5/api/providers/types/#providers-Network).


#### Note: Default API keys

If no *apiKey* is provided, a shared API key will be used, which may result in reduced performance and throttled requests.

It is highly recommended for production, you register with [Alchemy](https://alchemyapi.io) for your own API key.


#### **Supported Networks**

- Homestead (Mainnet) 
- Ropsten (proof-of-work testnet) 
- Rinkeby (proof-of-authority testnet) 
- Gorli (clique testnet) 
- Kovan (proof-of-authority testnet) 




```javascript
// Connect to mainnet (homestead)
provider = new AlchemyProvider();

// Connect to the ropsten testnet
// (see EtherscanProvider above for other network examples)
provider = new AlchemyProvider("ropsten");

// Connect to mainnet with an API key (these are equivalent)
provider = new AlchemyProvider(null, apiKey);
provider = new AlchemyProvider("homestead", apiKey);

// Connect to the Alchemy WebSocket endpoints with a WebSocketProvider
provider = AlchemyProvider.getWebSocketProvider()
```

CloudflareProvider
------------------

#### **new ***ethers* . *providers* . **CloudflareProvider**( )

Create a new **CloudflareProvider** connected to mainnet (i.e. "homestead").


#### **Supported Networks**

- Homestead (Mainnet) 




```javascript
// Connect to mainnet (homestead)
provider = new CloudflareProvider();
```

