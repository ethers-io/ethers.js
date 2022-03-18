# Hashing Algorithms

There are many hashing algorithms used throughout the hashgraph and blockchain space as well as some more complex usages which require utilities to facilitate these common operations.

{% hint style="info" %}
The **Hashing Utilities** are directly imported from [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/hashing/).
{% endhint %}

## Cryptographic Hash Functions

The [Cryptographic Hash Functions](https://en.wikipedia.org/wiki/Cryptographic\_hash\_function) are a specific family of hash functions.

#### `hethers.utils.id( text ) ⇒ string<DataHexString<32>>`

The Ethereum Identity function computes the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) hash of the _text_ bytes.

#### `hethers.utils.keccak256( aBytesLike ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Returns the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) digest _aBytesLike_.

#### `hethers.utils.ripemd160( aBytesLike ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<20>>`

Returns the [RIPEMD-160](https://en.m.wikipedia.org/wiki/RIPEMD) digest of _aBytesLike_.

#### `hethers.utils.sha256( aBytesLike ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Returns the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) digest of _aBytesLike_.

#### `hethers.utils.sha512( aBytesLike ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<64>>`

Returns the [SHA2-512](https://en.wikipedia.org/wiki/SHA-2) digest of _aBytesLike_.

```typescript
hethers.utils.keccak256([ 0x12, 0x34 ])
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

hethers.utils.keccak256("0x")
// '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

hethers.utils.keccak256("0x1234")
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

// The value MUST be data, such as:
//  - an Array of numbers
//  - a data hex string (e.g. "0x1234")
//  - a Uint8Array

// Do NOT use UTF-8 strings that are not a DataHexstring
hethers.utils.keccak256("hello world")
// [Error: invalid arrayify value] {
//   argument: 'value',
//   code: 'INVALID_ARGUMENT',
//   reason: 'invalid arrayify value',
//   value: 'hello world'
// }

// If needed, convert strings to bytes first:
hethers.utils.keccak256(utils.toUtf8Bytes("hello world"))
// '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'

// Or equivalently use the identity function:
hethers.utils.id("hello world")
// '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'

// Keep in mind that the string "0x1234" represents TWO
// bytes (i.e. [ 0x12, 0x34 ]. If you wish to compute the
// hash of the 6 characters "0x1234", convert it to UTF-8
// bytes first using utils.toUtf8Bytes.

// Consider the following examples:

// Hash of TWO (2) bytes:
hethers.utils.keccak256("0x1234")
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

// Hash of TWO (2) bytes: (same result)
hethers.utils.keccak256([ 0x12, 0x34 ])
// '0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432'

bytes = hethers.utils.toUtf8Bytes("0x1234")
// Uint8Array [ 48, 120, 49, 50, 51, 52 ]

// Hash of SIX (6) characters (different than above)
hethers.utils.keccak256(bytes)
// '0x1ac7d1b81b7ba1025b36ccb86723da6ee5a87259f1c2fd5abe69d3200b512ec8'

// Hash of SIX (6) characters (same result)
hethers.utils.id("0x1234")
// '0x1ac7d1b81b7ba1025b36ccb86723da6ee5a87259f1c2fd5abe69d3200b512ec8'
```

```typescript
hethers.utils.ripemd160("0x")
// '0x9c1185a5c5e9fc54612808977ee8f548b2258d31'

hethers.utils.ripemd160("0x1234")
// '0xc39867e393cb061b837240862d9ad318c176a96d'
```

```typescript
hethers.utils.sha256("0x")
// '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

hethers.utils.sha256("0x1234")
// '0x3a103a4e5729ad68c02a678ae39accfbc0ae208096437401b7ceab63cca0622f'

hethers.utils.sha512("0x")
// '0xcf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'

hethers.utils.sha512("0x1234")
// '0x4c54886c9821195522d88ff4705c3e0c686b921054421e6ea598739c29c26e1ee75419aaceec94dd2e3c0dbb82ecf895c9f61215f375de6d800d9b99d3d4b816'
```

## HMAC

#### `hethers.utils.computeHmac( algorithm , key , data ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Returns the [HMAC](https://en.wikipedia.org/wiki/HMAC) of _data_ with _key_ using one of the the [Supported Algorithms](hashing-algorithms.md#hmac-supported-algorithms).

### **HMAC Supported Algorithms**

#### `hethers.utils.SupportedAlgorithm.sha256 ⇒ string`

Use the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) hash algorithm.

#### `hethers.utils.SupportedAlgorithm.sha512 ⇒ string`

Use the [SHA2-512](https://en.wikipedia.org/wiki/SHA-2) hash algorithm.

```typescript
const key = "0x0102"
const data = "0x1234"
hethers.utils.computeHmac("sha256", key, data)
// '0x7553df81c628815cf569696cad13a37c606c5058df13d9dff4fee2cf5e9b5779'
```

## Hashing Helpers

#### `hethers.utils.hashMessage( message ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Computes the [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal message digest of _message_. Personal messages are converted to UTF-8 bytes and prefixed with `\x19Ethereum Signed Message:` and the length of _message_.

```typescript
// Hashing a string message
hethers.utils.hashMessage("Hello World")
// '0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2'

// Hashing binary data (also "Hello World", but as bytes)
hethers.utils.hashMessage( [ 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100 ])
// '0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2'

// NOTE: It is important to understand how strings and binary
//       data is handled differently. A string is ALWAYS processed
//       as the bytes of the string, so a hexstring MUST be
//       converted to an ArrayLike object first.

// Hashing a hex string is the same as hashing a STRING
// Note: this is the hash of the 4 characters [ '0', 'x', '4', '2' ]
hethers.utils.hashMessage("0x42")
// '0xf0d544d6e4a96e1c08adc3efabe2fcb9ec5e28db1ad6c33ace880ba354ab0fce'

// Hashing the binary data
// Note: this is the hash of the 1 byte [ 0x42 ]
hethers.utils.hashMessage([ 0x42 ])
// '0xd18c12b87124f9ceb7e1d3a5d06a5ac92ecab15931417e8d1558d9a263f99d63'

// Hashing the binary data
// Note: similarly, this is the hash of the 1 byte [ 0x42 ]
hethers.utils.hashMessage(utils.arrayify("0x42"))
// '0xd18c12b87124f9ceb7e1d3a5d06a5ac92ecab15931417e8d1558d9a263f99d63'
```

{% hint style="info" %}
**`namehash`** and **`isValidName`**` ``` are removed from **`hethers.utils`**
{% endhint %}

## Typed Data Encoder

The **TypedDataEncoder** is used to compute the various encoded data required for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signed data.

Signed data requires a domain, list of structures and their members and the data itself.

The **domain** is an object with values for any of the standard domain properties.

The **types** is an object with each property being the name of a structure, mapping to an array of field descriptions. It should **not** include the `EIP712Domain` property unless it is required as a child structure of another

#### `hethers.utils._TypedDataEncoder.from( types ) ⇒ [TypedDataEncoder]`

Creates a new **TypedDataEncoder** for _types_. This object is a fairly low-level object that most developers should not require using instances directly.

Most developers will find the static class methods below the most useful.

#### `TypedDataEncoder.encode( domain , types , values ) ⇒ string`

Encodes the Returns the hashed [EIP-712](https://eips.ethereum.org/EIPS/eip-712) domain.

#### `TypedDataEncoder.getPayload( domain , types , value ) ⇒ any`

Returns the standard payload used by various JSON-RPC `eth_signTypedData*` calls.

All domain values and entries in value are normalized and the types are verified.

#### `TypedDataEncoder.getPrimaryType( types ) ⇒ string`

Constructs a directed acyclic graph of the types and returns the root type, which can be used as the **primaryType** for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) payloads.

#### `TypedDataEncoder.hash( domain , types , values ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Returns the computed [EIP-712](https://eips.ethereum.org/EIPS/eip-712) hash.

#### `TypedDataEncoder.hashDomain( domain ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Returns the hashed [EIP-712](https://eips.ethereum.org/EIPS/eip-712) domain.

#### `TypedDataEncoder.resolveNames( domain , types , value , resolveName ) ⇒ Promise<any>`

Returns a copy of value, where any leaf value with a type of `address` will have been recursively replaced with the value of calling _resolveName_ with that value.

```typescript
domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

// The named list of all type definitions
types = {
    Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
    ],
    Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
    ]
};

// The data to sign
value = {
    from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    },
    to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    },
    contents: 'Hello, Bob!'
};

TypedDataEncoder.encode(domain, types, value)
// '0x1901f2cee375fa42b42143804025fc449deafd50cc031ca257e0b194a650a912090fc52c0ee5d84264471806290a3f2c4cecfc5490626bf912d01f240d7a274b371e'

TypedDataEncoder.getPayload(domain, types, value)
// {
//   domain: {
//     chainId: '1',
//     name: 'Ether Mail',
//     verifyingContract: '0xcccccccccccccccccccccccccccccccccccccccc',
//     version: '1'
//   },
//   message: {
//     contents: 'Hello, Bob!',
//     from: {
//       name: 'Cow',
//       wallet: '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'
//     },
//     to: {
//       name: 'Bob',
//       wallet: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
//     }
//   },
//   primaryType: 'Mail',
//   types: {
//     EIP712Domain: [
//       {
//         name: 'name',
//         type: 'string'
//       },
//       {
//         name: 'version',
//         type: 'string'
//       },
//       {
//         name: 'chainId',
//         type: 'uint256'
//       },
//       {
//         name: 'verifyingContract',
//         type: 'address'
//       }
//     ],
//     Mail: [
//       {
//         name: 'from',
//         type: 'Person'
//       },
//       {
//         name: 'to',
//         type: 'Person'
//       },
//       {
//         name: 'contents',
//         type: 'string'
//       }
//     ],
//     Person: [
//       {
//         name: 'name',
//         type: 'string'
//       },
//       {
//         name: 'wallet',
//         type: 'address'
//       }
//     ]
//   }
// }

TypedDataEncoder.getPrimaryType(types)
// 'Mail'

TypedDataEncoder.hash(domain, types, value)
// '0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2'

TypedDataEncoder.hashDomain(domain)
// '0xf2cee375fa42b42143804025fc449deafd50cc031ca257e0b194a650a912090f'
```

## Solidity Hashing Algorithms

When using the Solidity `abi.packEncoded(...)` function, a non-standard _tightly packed_ version of encoding is used. These functions implement the tightly packing algorithm.

#### `hethers.utils.solidityPack( types , values ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Returns the non-standard encoded _values_ packed according to their respective type in _types_.

#### `hethers.utils.solidityKeccak256( types , values ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Returns the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) of the non-standard encoded _values_ packed according to their respective type in _types_.

#### `hethers.utils.soliditySha256( types , values ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Returns the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) of the non-standard encoded _values_ packed according to their respective type in _types_.

```typescript
hethers.utils.solidityPack([ "int16", "uint48" ], [ -1, 12 ])
// '0xffff00000000000c'

hethers.utils.solidityPack([ "string", "uint8" ], [ "Hello", 3 ])
// '0x48656c6c6f03'

hethers.utils.solidityKeccak256([ "int16", "uint48" ], [ -1, 12 ])
// '0x81da7abb5c9c7515f57dab2fc946f01217ab52f3bd8958bc36bd55894451a93c'

hethers.utils.soliditySha256([ "int16", "uint48" ], [ -1, 12 ])
// '0xa5580fb602f6e2ba9c588011dc4e6c2335e0f5d970dc45869db8f217efc6911a'

// As a short example of the non-distinguished nature of
// Solidity tight-packing (which is why it is inappropriate
// for many things from a security point of view), consider
// the following examples are all equal, despite representing
// very different values and layouts.

hethers.utils.solidityPack([ "string", "string" ], [ "hello", "world01" ])
// '0x68656c6c6f776f726c643031'

hethers.utils.solidityPack([ "string", "string" ], [ "helloworld", "01" ])
// '0x68656c6c6f776f726c643031'

hethers.utils.solidityPack([ "string", "string", "uint16" ], [ "hell", "oworld", 0x3031 ])
// '0x68656c6c6f776f726c643031'

hethers.utils.solidityPack([ "uint96" ], [ "32309054545061485574011236401" ])
// '0x68656c6c6f776f726c643031'
```
