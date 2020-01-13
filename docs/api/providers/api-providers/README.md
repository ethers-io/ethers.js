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






InfuraProvider
--------------


The **InfuraProvider** is backed by the popular [INFURA](https://infura.io)
Ethereum service.

It supports Mainnet (homestead) and all common testnets (Ropsten, Rinkeby,
G&ouml;rli and Kovan).


NodesmithProvider
-----------------


The **NodesmithProvider** is backed by [Nodesmith](https://nodesmith.io).

It supports Mainnet (homestead) and all common testnets (Ropsten, Rinkeby,
G&ouml;rli and Kovan), as well as the Ethereum-like network [Aion](https://aion.network).


AlchemyProvider
---------------


The **AlchemtProvider** is backed by [Alchemy](https://alchemyapi.io).

It supports Mainnet (homestead) and all common testnets (Ropsten, Rinkeby,
G&ouml;rli and Kovan).


CloudfrontProvider
------------------


The CloudfrontProvider is backed by the
[Cloudflare Ethereum Gateway](https://developers.cloudflare.com/distributed-web/ethereum-gateway/).

It only supports Mainnet (homestead).



-----
**Content Hash:** 2e1dfa80bd4ab1ba02610654b00ee4250a89758a496670822e7950d5db449b1c