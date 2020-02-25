-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Transactions
============



Types
-----



### UnsignedTransaction


An unsigned transaction represents a transaction that has not been
signed and its values are flexible as long as they are not ambiguous.


#### *unsignedTransaction* . **to** **=>** *string< [Address](../address) >*

The addres this transaction is to.




#### *unsignedTransaction* . **nonce** **=>** *number*

The nonce of this transaction.




#### *unsignedTransaction* . **gasLimit** **=>** *[BigNumberish](../bignumber)*

The gas limit for this transaction.




#### *unsignedTransaction* . **gasPrice** **=>** *[BigNumberish](../bignumber)*

The gas price for this transaction.




#### *unsignedTransaction* . **data** **=>** *[BytesLike](../bytes)*

The data for this transaction.




#### *unsignedTransaction* . **value** **=>** *[BigNumberish](../bignumber)*

The value (in wei) for this transaction.




#### *unsignedTransaction* . **chainId** **=>** *number*

The chain ID for this transaction. If the chain ID is 0 or null,
then [EIP-155](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-155) is disabled and legacy signing is
used, unless overridden in a signature.




### Transaction


A generic object to represent a transaction.


#### *transaction* . **hash** **=>** *string< [DataHexstring](../bytes)< 32 > >*

The transaction hash, which can be used as an identifier for
*transaction*. This is the keccak256 of the serialized RLP encoded
representation of *transaction*.




#### *unsignedTransaction* . **to** **=>** *string< [Address](../address) >*

The address *transaction* is to.




#### *transaction* . **from** **=>** *string< [Address](../address) >*

The address *transaction* is from.




#### *transaction* . **nonce** **=>** *number*

The nonce for *transaction*. Each transaction sent to the network
from an account includes this, which ensures the order and
non-replayability of a transaction. This must be equal to the current
number of transactions ever sent to the network by the **from** address.




#### *transaction* . **gasLimit** **=>** *[BigNumber](../bignumber)*

The gas limit for *transaction*. An account must have enough ether to
cover the gas (at the specified **gasPrice**). Any unused gas is
refunded at the end of the transaction, and if there is insufficient gas
to complete execution, the effects of the trasaction are reverted, but
the gas is **fully consumed** and an out-of-gas error occurs.




#### *transaction* . **gasPrice** **=>** *[BigNumber](../bignumber)*

The price (in wei) per unit of gas for *transaction*.




#### *transaction* . **data** **=>** *[BytesLike](../bytes)*

The data for *transaction*. In a contract this is the call data.




#### *transaction* . **value** **=>** *[BigNumber](../bignumber)*

The value (in wei) for *transaction*.




#### *transaction* . **chainId** **=>** *number*

The chain ID for *transaction*. This is used as part of
[EIP-155](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-155) to prevent replay attacks on different
networks.

For example, if a transaction was made on ropsten with an account
also used on homestead, it would be possible for a transaction
signed on ropsten to be executed on homestead, which is likely
unintended.

There are situations where replay may be desired, however these
are very rare and it is almost always recommended to specify the
chain ID.




#### *transaction* . **r** **=>** *string< [DataHexstring](../bytes)< 32 > >*

The r portion of the elliptic curve signatures for *transaction*.
This is more accurately, the x coordinate of the point r (from
which the y can be computed, along with v).




#### *transaction* . **s** **=>** *string< [DataHexstring](../bytes)< 32 > >*

The s portion of the elliptic curve signatures for *transaction*.




#### *transaction* . **v** **=>** *number*

The v portion of the elliptic curve signatures for *transaction*.
This is used to refine which of the two possible points a given
x-coordinate can have, and in [EIP-155](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-155) is additionally
used to encode the chain ID into the serialized transaction.




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

Computes the serialized *transaction*, optionally serialized with
the a *signature*. If *signature* is not present, the unsigned
serialized transaction is returned, which can be used to compute the
hash necessary to sign.

This function uses [EIP-155](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-155) if a chainId is provided,
otherwise legacy serialization is used. It is **highly** recommended
to always specify a *chainId*.

If *signature* includes a chain ID (explicitly or implicitly by using an
[EIP-155](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-155) `v` or `_vs`) it will be used to compute the
chain ID.

If there is a mismatch between the chain ID of *transaction* and *signature*
an error is thrown.





-----
**Content Hash:** cda81a14250e9640ccedf9111dbb11772c4f513b10adac75aedf70271273a2c3