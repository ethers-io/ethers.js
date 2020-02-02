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
[Etherscan APIs](https://etherscan.io/apis).


#### *provider* . **getHistory** ( address )  **=>** *Array< History >*

@TODO... Explain




#### **Supported Networks**



* Homestead (Mainnet)
* Ropsten (proof-of-work testnet)
* Rinkeby (proof-of-Authority testnet)
* G&ouml;rli (clique testnet)
* Kovan (proof-of-authority testnet)




InfuraProvider
--------------


The **InfuraProvider** is backed by the popular [INFURA](https://infura.io)
Ethereum service.


#### **Supported Networks**



* Homestead (Mainnet)
* Ropsten (proof-of-work testnet)
* Rinkeby (proof-of-Authority testnet)
* G&ouml;rli (clique testnet)
* Kovan (proof-of-authority testnet)




AlchemyProvider
---------------


The **AlchemtProvider** is backed by [Alchemy](https://alchemyapi.io).


#### **Supported Networks**



* Homestead (Mainnet)
* Ropsten (proof-of-work testnet)
* Rinkeby (proof-of-Authority testnet)
* G&ouml;rli (clique testnet)
* Kovan (proof-of-authority testnet)




CloudfrontProvider
------------------


The CloudfrontProvider is backed by the
[Cloudflare Ethereum Gateway](https://developers.cloudflare.com/distributed-web/ethereum-gateway/).


#### **Supported Networks**



* Homestead (Mainnet)





-----
**Content Hash:** 516111e087ee3f12588ba555c0719f7170ea532e269590586c95ddc1d7eb7e7b