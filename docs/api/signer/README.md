-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Signers
=======


Tra la la...


Signer
------



#### *signer* . **connect** ( provider )  **=>** *[Signer](./)*

TODO




### Blockchain Methods



#### *signer* . **getBalance** (  [ blockTag="latest" ]  )  **=>** *Promise< [BigNumber](../utils/bignumber) >*

TODO




#### *signer* . **getTransactionCount** (  [ blockTag="latest" ]  )  **=>** *Promise< number >*

TODO




Wallet inherits Signer
----------------------


The Wallet class inherits [Signer](./) and can sign transactions and messages
using a private key as a standard Externally Owned Account (EOA).


### Creating an Instance



#### **new** *ethers* . **Wallet** ( privateKey [  , provider ]  ) 

TODO




#### *Wallet* . **fromEncryptedJson** ( json , password ) 

TODO





-----
**Content Hash:** 62c0d9640e683e41970dc1c779bd3b59ed08c27d99e15f6b51e7bae31ac1975e