-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Hashing Algorithms
==================


Explain what hash functions are?


Cryptographic Hashing
---------------------


The [Cryptographic Hash Functions](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Cryptographic_hash_function)
are a specific family of hash functions.


#### *ethers* . *utils* . **keccak256** ( aBytesLike )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Returns the [KECCAK256](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-3) digest *aBytesLike*.




#### *ethers* . *utils* . **ripemd160** ( aBytesLike )  **=>** *string< [DataHexstring](../bytes)< 20 > >*

Returns the [RIPEMD-160](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.m.wikipedia.org/wiki/RIPEMD) digest of *aBytesLike*.




#### *ethers* . *utils* . **sha256** ( aBytesLike )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Returns the [SHA2-256](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.




#### *ethers* . *utils* . **sha512** ( aBytesLike )  **=>** *string< [DataHexstring](../bytes)< 64 > >*

Returns the [SHA2-512](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.




#### *ethers* . *utils* . **computeHmac** ( algorithm , key , data )  **=>** *string< [DataHexstring](../bytes) >*

Returns the [HMAC](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/HMAC) of *data* with *key*
using the [Algorithm](./) *algorithm*.




### HMAC Supported Algorithms



#### *ethers* . *utils* . *SupportedAlgorithm* . **sha256** **=>** *string*

Use the [SHA2-256](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-2) hash algorithm.




#### *ethers* . *utils* . *SupportedAlgorithm* . **sha512** **=>** *string*

Use the [SHA2-512](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-2) hash algorithm.




Common Hashing Helpers
----------------------



#### *ethers* . *utils* . **hashMessage** ( message )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Computes the [EIP-191](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-191) personal message digest of *message*. Personal messages are
converted to UTF-8 bytes and prefixed with `\x19Ethereum Signed Message:`
and the length of *message*.




#### *ethers* . *utils* . **id** ( text )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

The Ethereum Identity function computs the [KECCAK256](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-3) hash of the *text* bytes.




#### *ethers* . *utils* . **namehash** ( name )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Returns the [ENS Namehash](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/docs.ens.domains/contract-api-reference/name-processing) of *name*.




Solidity Hashing Algorithms
---------------------------


When using the Solidity `abi.packEncoded(...)` function, a non-standard
*tightly packed* version of encoding is used. These functions implement
the tightly packing algorithm.


#### *ethers* . *utils* . **solidityPack** ( arrayOfTypes , arrayOfValues )  **=>** *string< [DataHexstring](../bytes) >*

Returns the non-standard encoded *arrayOfValues* packed according to
their respecive type in *arrayOfTypes*.




#### *ethers* . *utils* . **solidityKeccak256** ( arrayOfTypes , arrayOfValues )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Returns the [KECCAK256](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-3) of the non-standard encoded *arrayOfValues* packed
according to their respective type in *arrayOfTypes*.




#### *ethers* . *utils* . **soliditySha256** ( arrayOfTypes , arrayOfValues )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Returns the [SHA2-256](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/SHA-2) of the non-standard encoded *arrayOfValues* packed
according to their respective type in *arrayOfTypes*.





-----
**Content Hash:** 5c27393d66c46e7175edbe51257fb8cb69e8dc965d45ed7913b9599deec14e80