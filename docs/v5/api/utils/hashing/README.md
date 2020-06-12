-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Hashing Algorithms
==================

Cryptographic Hash Functions
----------------------------

#### *ethers* . *utils* . **id**( text ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The Ethereum Identity function computs the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) hash of the *text* bytes.


#### *ethers* . *utils* . **keccak256**( aBytesLike ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) digest *aBytesLike*.


#### *ethers* . *utils* . **ripemd160**( aBytesLike ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 20 > >*

Returns the [RIPEMD-160](https://en.m.wikipedia.org/wiki/RIPEMD) digest of *aBytesLike*.


#### *ethers* . *utils* . **sha256**( aBytesLike ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.


#### *ethers* . *utils* . **sha512**( aBytesLike ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 64 > >*

Returns the [SHA2-512](https://en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.


```javascript
utils.keccak256([ 0x12, 0x34 ])
//!

utils.keccak256("0x")
//!

utils.keccak256("0x1234")
//!

// The value MUST be data, such as:
//  - an Array of numbers
//  - a data hex string (e.g. "0x1234")
//  - a Uint8Array

// Do NOT use UTF-8 strings that are not a DataHexstring
utils.keccak256("hello world")
//! error

// If needed, convert strings to bytes first:
utils.keccak256(utils.toUtf8Bytes("hello world"))
//!

// Or equivalently use the identity function:
utils.id("hello world")
//!

// Keep in mind that the string "0x1234" represents TWO
// bytes (i.e. [ 0x12, 0x34 ]. If you wish to compute the
// hash of the 6 characters "0x1234", convert it to UTF-8
// bytes first using utils.toUtf8Bytes.

// Consider the following examples:

// Hash of TWO (2) bytes:
utils.keccak256("0x1234")
//!

// Hash of TWO (2) bytes: (same result)
utils.keccak256([ 0x12, 0x34 ])
//!

const bytes = utils.toUtf8Bytes("0x1234");
// <hide>
bytes
// </hide>
//!

// Hash of SIX (6) characters (different than above)
utils.keccak256(bytes)
//!

// Hash of SIX (6) characters (same result)
utils.id("0x1234")
//!
```

```javascript
utils.ripemd160("0x")
//!

utils.ripemd160("0x1234")
//!
```

```javascript
utils.sha256("0x")
//!

utils.sha256("0x1234")
//!

utils.sha512("0x")
//!

utils.sha512("0x1234")
//!
```

HMAC
----

#### *ethers* . *utils* . **computeHmac**( algorithm , key , data ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the [HMAC](https://en.wikipedia.org/wiki/HMAC) of *data* with *key* using the [Algorithm](/v5/api/utils/hashing/#utils--hmac-supported-algorithm) *algorithm*.


### HMAC Supported Algorithms

#### *ethers* . *utils* . *SupportedAlgorithm* . **sha256** => *string*

Use the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) hash algorithm.


#### *ethers* . *utils* . *SupportedAlgorithm* . **sha512** => *string*

Use the [SHA2-512](https://en.wikipedia.org/wiki/SHA-2) hash algorithm.


```javascript
const key = "0x0102";
const data = "0x1234";
utils.computeHmac("sha256", key, data)
//!
```

Hashing Helpers
---------------

#### *ethers* . *utils* . **hashMessage**( message ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Computes the [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal message digest of *message*. Personal messages are converted to UTF-8 bytes and prefixed with `\x19Ethereum Signed Message:` and the length of *message*.


#### *ethers* . *utils* . **namehash**( name ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the [ENS Namehash](https://docs.ens.domains/contract-api-reference/name-processing#hashing-names) of *name*.


```javascript
// @TODO: include examples of hashMessage; it can be complex. :)
```

```javascript
utils.namehash("")
//!

utils.namehash("eth")
//!

utils.namehash("ricmoo.firefly.eth")
//!

utils.namehash("ricmoo.xyz")
//!
```

Solidity Hashing Algorithms
---------------------------

#### *ethers* . *utils* . **solidityPack**( types , values ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the non-standard encoded *values* packed according to their respecive type in *types*.


#### *ethers* . *utils* . **solidityKeccak256**( types , values ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) of the non-standard encoded *values* packed according to their respective type in *types*.


#### *ethers* . *utils* . **soliditySha256**( types , values ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) of the non-standard encoded *values* packed according to their respective type in *types*.


```javascript
utils.solidityPack([ "int16", "uint48" ], [ -1, 12 ])
//!

utils.solidityPack([ "string", "uint8" ], [ "Hello", 3 ])
//!

utils.solidityKeccak256([ "int16", "uint48" ], [ -1, 12 ])
//!

utils.soliditySha256([ "int16", "uint48" ], [ -1, 12 ])
//!
```

