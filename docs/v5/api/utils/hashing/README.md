-----

Documentation: [html](https://docs.ethers.io/)

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
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

utils.keccak256("0x")
// '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

utils.keccak256("0x1234")
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

// The value MUST be data, such as:
//  - an Array of numbers
//  - a data hex string (e.g. "0x1234")
//  - a Uint8Array

// Do NOT use UTF-8 strings that are not a DataHexstring
utils.keccak256("hello world")
// Error: invalid arrayify value (argument="value", value="hello world", code=INVALID_ARGUMENT, version=bytes/5.0.1)

// If needed, convert strings to bytes first:
utils.keccak256(utils.toUtf8Bytes("hello world"))
// '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'

// Or equivalently use the identity function:
utils.id("hello world")
// '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'

// Keep in mind that the string "0x1234" represents TWO
// bytes (i.e. [ 0x12, 0x34 ]. If you wish to compute the
// hash of the 6 characters "0x1234", convert it to UTF-8
// bytes first using utils.toUtf8Bytes.

// Consider the following examples:

// Hash of TWO (2) bytes:
utils.keccak256("0x1234")
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

// Hash of TWO (2) bytes: (same result)
utils.keccak256([ 0x12, 0x34 ])
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

const bytes = utils.toUtf8Bytes("0x1234");
// Uint8Array [ 48, 120, 49, 50, 51, 52 ]

// Hash of SIX (6) characters (different than above)
utils.keccak256(bytes)
// '0x1ac7d1b81b7ba1025b36ccb86723da6ee5a87259f1c2fd5abe69d3200b512ec8'

// Hash of SIX (6) characters (same result)
utils.id("0x1234")
// '0x1ac7d1b81b7ba1025b36ccb86723da6ee5a87259f1c2fd5abe69d3200b512ec8'
```

```javascript
utils.ripemd160("0x")
// '0x9c1185a5c5e9fc54612808977ee8f548b2258d31'

utils.ripemd160("0x1234")
// '0xc39867e393cb061b837240862d9ad318c176a96d'
```

```javascript
utils.sha256("0x")
// '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

utils.sha256("0x1234")
// '0x3a103a4e5729ad68c02a678ae39accfbc0ae208096437401b7ceab63cca0622f'

utils.sha512("0x")
// '0xcf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'

utils.sha512("0x1234")
// '0x4c54886c9821195522d88ff4705c3e0c686b921054421e6ea598739c29c26e1ee75419aaceec94dd2e3c0dbb82ecf895c9f61215f375de6d800d9b99d3d4b816'
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
// '0x7553df81c628815cf569696cad13a37c606c5058df13d9dff4fee2cf5e9b5779'
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
// '0x0000000000000000000000000000000000000000000000000000000000000000'

utils.namehash("eth")
// '0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae'

utils.namehash("ricmoo.firefly.eth")
// '0x0bcad17ecf260d6506c6b97768bdc2acfb6694445d27ffd3f9c1cfbee4a9bd6d'

utils.namehash("ricmoo.xyz")
// '0x7d56aa46358ba2f8b77d8e05bcabdd2358370dcf34e87810f8cea77ecb3fc57d'
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
// '0xffff00000000000c'

utils.solidityPack([ "string", "uint8" ], [ "Hello", 3 ])
// '0x48656c6c6f03'

utils.solidityKeccak256([ "int16", "uint48" ], [ -1, 12 ])
// '0x81da7abb5c9c7515f57dab2fc946f01217ab52f3bd8958bc36bd55894451a93c'

utils.soliditySha256([ "int16", "uint48" ], [ -1, 12 ])
// '0xa5580fb602f6e2ba9c588011dc4e6c2335e0f5d970dc45869db8f217efc6911a'
```

