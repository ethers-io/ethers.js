-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Transactions
============



Types
-----



### UnsignedTransaction


An unsigned transaction represents a transaction that has not been signed.


#### *unsignedTransaction* . **to** **=>** *string< [Address](../address) >*






#### *unsignedTransaction* . **nonce** **=>** *number*






#### *unsignedTransaction* . **gasLimit** **=>** *[BigNumber](../bignumber)*






#### *unsignedTransaction* . **gasPrice** **=>** *[BigNumber](../bignumber)*






#### *unsignedTransaction* . **data** **=>** *[BytesLike](../bytes)*






#### *unsignedTransaction* . **value** **=>** *[BigNumber](../bignumber)*






#### *unsignedTransaction* . **chainId** **=>** *number*






### Transaction


A generic object to represent a transaction.


#### *unsignedTransaction* . **hash** **=>** *string< [DataHexstring](../bytes)< 32 > >*






#### *unsignedTransaction* . **to** **=>** *string< [Address](../address) >*






#### *unsignedTransaction* . **from** **=>** *string< [Address](../address) >*






#### *unsignedTransaction* . **nonce** **=>** *number*






#### *unsignedTransaction* . **gasLimit** **=>** *[BigNumber](../bignumber)*






#### *unsignedTransaction* . **gasPrice** **=>** *[BigNumber](../bignumber)*






#### *unsignedTransaction* . **data** **=>** *[BytesLike](../bytes)*






#### *unsignedTransaction* . **value** **=>** *[BigNumber](../bignumber)*






#### *unsignedTransaction* . **chainId** **=>** *number*






#### *unsignedTransaction* . **r** **=>** *[BytesLike](../bytes)*






#### *unsignedTransaction* . **s** **=>** *[BytesLike](../bytes)*






#### *unsignedTransaction* . **v** **=>** *number*






Functions
---------



#### *ethers* . *utils* . **computeAddress** ( publicOrPrivateKey )  **=>** *string< [Address](../address) >*

Compute the address of *publicOrPrivateKey*. If a public key is
provided, it may be either compressed or uncompressed.




#### *ethers* . *utils* . **parse** ( aBytesLike )  **=>** *[Transaction](./)*

Parses the transaction properties from a serialized transactions.




#### *ethers* . *utils* . **recoverAddress** ( digest , aSignatureLike )  **=>** *string< [Address](../address) >*

Computes the address that signed *digest* to get *aSignatureLike* using the
ecrecover algorithm.




#### *ethers* . *utils* . **serialize** ( transaction [  , signature ]  )  **=>** *string< [DataHexstring](../bytes) >*

Computes the serialized *transaction/, optionally signed with *signature//. If
signature is not presented, the unsigned serialized transaction is returned, which can
be used to compute the hash necessary to sign.

This function uses EIP-155 if a chainId is provided, otherwise legacy serialization is
used. It is **highly** recommended to always specify a *chainId*.





-----
**Content Hash:** 51f4a8594ba122a2c43d7b2cffdb2bf461f3212cea828e715a76c76ef8dd1ae1