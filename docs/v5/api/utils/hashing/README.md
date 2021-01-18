-----

Documentation: [html](https://docs.ethers.io/)

-----

Hashing Algorithms
==================

Cryptographic Hash Functions
----------------------------

#### *ethers* . *utils* . **id**( text ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The Ethereum Identity function computes the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) hash of the *text* bytes.


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

const bytes = utils.toUtf8Bytes("0x1234")
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
const key = "0x0102"
const data = "0x1234"
utils.computeHmac("sha256", key, data)
//!
```

Hashing Helpers
---------------

#### *ethers* . *utils* . **hashMessage**( message ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Computes the [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal message digest of *message*. Personal messages are converted to UTF-8 bytes and prefixed with `\x19Ethereum Signed Message:` and the length of *message*.


```javascript
// Hashing a string message
utils.hashMessage("Hello World")
//!

// Hashing binary data (also "Hello World", but as bytes)
utils.hashMessage( [ 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100 ])
//!

// NOTE: It is important to understand how strings and binary
//       data is handled differently. A string is ALWAYS processed
//       as the bytes of the string, so a hexstring MUST be
//       converted to an ArrayLike object first.

// Hashing a hex string is the same as hashing a STRING
// Note: this is the hash of the 4 characters [ '0', 'x', '4', '2' ]
utils.hashMessage("0x42")
//!

// Hashing the binary data
// Note: this is the hash of the 1 byte [ 0x42 ]
utils.hashMessage([ 0x42 ])
//!

// Hashing the binary data
// Note: similarly, this is the hash of the 1 byte [ 0x42 ]
utils.hashMessage(utils.arrayify("0x42"))
//!
```

#### *ethers* . *utils* . **namehash**( name ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the [ENS Namehash](https://docs.ens.domains/contract-api-reference/name-processing#hashing-names) of *name*.


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

### Typed Data Encoder

#### Experimental Feature (this exported class name will change)

This is still an experimental feature. If using it, please specify the **exact** version of ethers you are using (e.g. spcify `"5.0.18"`, **not** `"^5.0.18"`) as the exported class name will be renamed from `_TypedDataEncoder` to `TypedDataEncoder` once it has been used in the field a bit.


#### *ethers* . *utils* . *_TypedDataEncoder* . **from**( types ) => *[TypedDataEncoder]*

Creates a new **TypedDataEncoder** for *types*. This object is a fairly low-level object that most developers should not require using instances directly.

Most developers will find the static class methods below the most useful.


#### *TypedDataEncoder* . **encode**( domain , types , values ) => *string*

Encodes the Returns the hashed [EIP-712](https://eips.ethereum.org/EIPS/eip-712) domain.


#### *TypedDataEncoder* . **getPayload**( domain , types , value ) => *any*

Returns the standard payload used by various JSON-RPC `eth_signTypedData*` calls.

All domain values and entries in value are normalized and the types are verified.


#### *TypedDataEncoder* . **getPrimaryType**( types ) => *string*

Constructs a directed acyclic graph of the types and returns the root type, which can be used as the **primaryType** for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) payloads.


#### *TypedDataEncoder* . **hash**( domain , types , values ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the computed [EIP-712](https://eips.ethereum.org/EIPS/eip-712) hash.


#### *TypedDataEncoder* . **hashDomain**( domain ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Returns the hashed [EIP-712](https://eips.ethereum.org/EIPS/eip-712) domain.


#### *TypedDataEncoder* . **resolveNames**( domain , types , value , resolveName ) => *Promise< any >*

Returns a copy of value, where any leaf value with a type of `address` will have been recursively replacedwith the value of calling *resolveName* with that value.


```javascript
// <hide>
TypedDataEncoder = ethers.utils._TypedDataEncoder
// </hide>

const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
}

// The named list of all type definitions
const types = {
    Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
    ],
    Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
    ]
}

// The data to sign
const value = {
    from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    },
    to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    },
    contents: 'Hello, Bob!'
}


TypedDataEncoder.encode(domain, types, value)
//!

TypedDataEncoder.getPayload(domain, types, value)
//!

TypedDataEncoder.getPrimaryType(types)
//!

TypedDataEncoder.hash(domain, types, value)
//!

TypedDataEncoder.hashDomain(domain)
//!
```

Solidity Hashing Algorithms
---------------------------

#### *ethers* . *utils* . **solidityPack**( types , values ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the non-standard encoded *values* packed according to their respective type in *types*.


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

// As a short example of the non-distinguished nature of
// Solidity tight-packing (which is why it is inappropriate
// for many things from a security point of view), consider
// the following examples are all equal, despite representing
// very different values and layouts.

utils.solidityPack([ "string", "string" ], [ "hello", "world01" ])
//!

utils.solidityPack([ "string", "string" ], [ "helloworld", "01" ])
//!

utils.solidityPack([ "string", "string", "uint16" ], [ "hell", "oworld", 0x3031 ])
//!

utils.solidityPack([ "uint96" ], [ "32309054545061485574011236401" ])
//!
```

