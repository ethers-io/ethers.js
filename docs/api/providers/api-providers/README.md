-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

API Providers
=============


There are many services which offer a web API for accessing
the Ethereum Blockchain. These Providers allow connecting
to them, which simplifies development, since you do not need
to run your own instance or cluster of Ethereum nodes.

However, this reliance on third-party services can reduce
resiliance, security and increase the amount of required trust.
To mitigate these issues, it is recommended you use a
[Default Provider](..).


EtherscanProvider
-----------------


The **EtherscanProvider** is backed by a combination of the various
[Etherscan APIs](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/etherscan.io/apis).


#### *provider* . **getHistory** ( address )  **=>** *Array< History >*

@TODO... Explain




#### **Supported Networks**



* Homestead (Mainnet)
* Ropsten (proof-of-work testnet)
* Rinkeby (proof-of-authority testnet)
* G&ouml;rli (clique testnet)
* Kovan (proof-of-authority testnet)




InfuraProvider
--------------


The **InfuraProvider** is backed by the popular [INFURA](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/infura.io)
Ethereum service.


#### **Supported Networks**



* Homestead (Mainnet)
* Ropsten (proof-of-work testnet)
* Rinkeby (proof-of-authority testnet)
* G&ouml;rli (clique testnet)
* Kovan (proof-of-authority testnet)




AlchemyProvider
---------------


The **AlchemtProvider** is backed by [Alchemy](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/alchemyapi.io).


#### **Supported Networks**



* Homestead (Mainnet)
* Ropsten (proof-of-work testnet)
* Rinkeby (proof-of-authority testnet)
* G&ouml;rli (clique testnet)
* Kovan (proof-of-authority testnet)




CloudfrontProvider
------------------


The CloudfrontProvider is backed by the [Cloudflare Ethereum Gateway](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/developers.cloudflare.com/distributed-web/ethereum-gateway).


#### **Supported Networks**



* Homestead (Mainnet)





-----
**Content Hash:** 79ad5dae92f00fc2ef2aceff6620ed9ae5f12d92d9e29ebc6be1c5752e65322f