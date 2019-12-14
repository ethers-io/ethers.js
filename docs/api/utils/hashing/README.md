-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Hashing Algorithms
==================


Explain what hash functions are?


Cryptographic Hashing
---------------------


The [Cryptographic Hash Functions](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
are a specific family of hash functions.


#### *utils* . **keccak256** ( aBytesLike )  **=>** *[DataHexstring](../bytes)*

Returns the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) digest *aBytesLike*.




#### *utils* . **ripemd160** ( aBytesLike )  **=>** *[DataHexstring](../bytes)*

Returns the [RIPEMD-160](https://en.m.wikipedia.org/wiki/RIPEMD) digest of *aBytesLike*.




#### *utils* . **sha256** ( aBytesLike )  **=>** *[DataHexstring](../bytes)*

Returns the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.




#### *utils* . **sha512** ( aBytesLike )  **=>** *[DataHexstring](../bytes)*

Returns the [SHA2-512](https://en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.




#### *utils* . **computeHmac** ( algorithm , key , data )  **=>** *[DataHexstring](../bytes)*

Returns the [HMAC](https://en.wikipedia.org/wiki/HMAC) of *data* with *key*
using the [Algorithm](./) *algorithm*.




### HMAC Supported Algorithms



#### *utils* . *SupportedAlgorithms* . **sha256** **=>** *string*

Use the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) hash algorithm.




#### *utils* . *SupportedAlgorithms* . **sha512** **=>** *string*

Use the [SHA2-512](https://en.wikipedia.org/wiki/SHA-2) hash algorithm.




Common Hashing Helpers
----------------------



#### *utils* . **hashMessage** ( message )  **=>** *[DataHexstring](../bytes)*

Computes the Ethereum message digest of *message*. Ethereum messages are
converted to UTF-8 bytes and prefixed with `x19Ethereum Signed Message:`
and the length of *message*.




#### *utils* . **id** ( text )  **=>** *[DataHexstring](../bytes)*

The Ethereum Identity function computs the keccak256 hash of the *text* bytes.




#### *utils* . **namehash** ( name )  **=>** *[DataHexstring](../bytes)*

Returns the [ENS Namehash](https://docs.ens.domains/contract-api-reference/name-processing#hashing-names) of *name*.




Solidity Hashing Algorithms
---------------------------


When using the Solidity `abi.packEncoded(...)` function, a non-standard
*tightly packed* version of encoding is used. These functions implement
the tightly packing algorithm.


#### *utils* . **solidityPack** ( arrayOfTypes , arrayOfValues )  **=>** *[DataHexstring](../bytes)*

Returns the non-standard encoded *arrayOfValues* packed according to
their respecive type in *arrayOfTypes*.




#### *utils* . **solidityKeccak256** ( arrayOfTypes , arrayOfValues )  **=>** *[DataHexstring](../bytes)*

Returns the KECCAK256 of the non-standard encoded *arrayOfValues* packed
according to their respective type in *arrayOfTypes*.




#### *utils* . **soliditySha256** ( arrayOfTypes , arrayOfValues )  **=>** *[DataHexstring](../bytes)*

Returns the SHA2-256 of the non-standard encoded *arrayOfValues* packed
according to their respective type in *arrayOfTypes*.





-----
**Content Hash:** 53b7b2b1fe243aebd3d5ff29c578538d0d068b0ff60b3426f7208cbf9f13d312