-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

API Providers
=============

EtherscanProvider
-----------------

#### **new ***ethers* . *providers* . **EtherscanProvider**( [ network = "homestead" , [ apiKey ] ] )

Create a new **EtherscanProvider** connected to *network* with the optional *apiKey*.

The *network* may be specified as **string** for a common network name, a **number** for a common chain ID or a [Network Object]provider-(network).

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
// <hide>
const EtherscanProvider = ethers.providers.EtherscanProvider;
const apiKey = "...";
// </hide>

// Connect to mainnet (homestead)
provider = new EtherscanProvider();

// Connect to rinkeby testnet (these are equivalent)
provider = new EtherscanProvider("rinkeby");
provider = new EtherscanProvider(4);

const network = ethers.providers.getNetwork("rinkeby");
// <hide>
delete network._defaultProvider;
network
// </hide>
//!

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

The *network* may be specified as **string** for a common network name, a **number** for a common chain ID or a [Network Object]provider-(network).

The *apiKey* can be a **string** Project ID or an **object** with the properties `projectId` and `projectSecret` to specify a [Project Secret](https://infura.io/docs/gettingStarted/authentication) which can be used on non-public sources (like on a server) to further secure your API access and quotas.


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
// <hide>
const InfuraProvider = ethers.providers.InfuraProvider;
const projectId = "...";
const projectSecret = "...";
// </hide>

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
```

AlchemyProvider
---------------

#### **new ***ethers* . *providers* . **AlchemyProvider**( [ network = "homestead" , [ apiKey ] ] )

Create a new **AlchemyProvider** connected to *network* with the optional *apiKey*.

The *network* may be specified as **string** for a common network name, a **number** for a common chain ID or a [Network Object](/api/providers/types/#providers-Network).


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
// <hide>
const AlchemyProvider = ethers.providers.AlchemyProvider;
const apiKey = "...";
// </hide>

// Connect to mainnet (homestead)
provider = new AlchemyProvider();

// Connect to the ropsten testnet
// (see EtherscanProvider above for other network examples)
provider = new AlchemyProvider("ropsten");

// Connect to mainnet with an API key (these are equivalent)
provider = new AlchemyProvider(null, apiKey);
provider = new AlchemyProvider("homestead", apiKey);
```

CloudflareProvider
------------------

#### **new ***ethers* . *providers* . **CloudflareProvider**( )

Create a new **CloudflareProvider** connected to mainnet (i.e. "homestead").


#### **Supported Networks**

- Homestead (Mainnet) 




```javascript
// <hide>
const CloudflareProvider = ethers.providers.CloudflareProvider;
// </hide>

// Connect to mainnet (homestead)
provider = new CloudflareProvider();
```

