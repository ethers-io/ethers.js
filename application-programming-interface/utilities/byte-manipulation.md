# Byte Manipulation

While there are many high-level APIs for interacting with **Hedera**, such as [Contracts](../contract-interaction/) and [Providers](../providers/), a lot of the low level access requires byte manipulation operations.

Many of these operations are used internally, but can also be used to help normalize binary data representations from the output of various functions and methods.

{% hint style="info" %}
The **Bytes** package is directly imported from the [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/bytes/).
{% endhint %}

## Types

#### Bytes <a href="#bytes" id="bytes"></a>

A **Bytes** is any object which is an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Array) or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/TypedArray) with each value in the valid byte range (i.e. between 0 and 255 inclusive), or is an Object with a `length` property where each indexed property is in the valid byte range.

#### BytesLike <a href="#byteslike" id="byteslike"></a>

A **BytesLike** can be either a [Bytes](byte-manipulation.md#bytes) or a [DataHexString](byte-manipulation.md#datahexstring).

#### DataHexString

A **DataHexstring** is identical to a [HexString](byte-manipulation.md#hexstring) except that it has an even number of nibbles, and therefore is a valid representation of binary data as a string.

#### HexString <a href="#hexstring" id="hexstring"></a>

A **Hexstring** is a string which has a `0x` prefix followed by any number of nibbles (i.e. case-insensitive hexadecimal characters, `0-9` and `a-f`).

#### Signature <a href="#signature" id="signature"></a>

* **r** and **s** --- The x co-ordinate of **r** and the **s** value of the signature
* **v** --- The parity of the y co-ordinate of **r**
* **\_vs** --- The [compact representation](https://eips.ethereum.org/EIPS/eip-2098) of the **s** and **v**
* **recoveryParam** --- The normalized (i.e. 0 or 1) value of **v**

#### Raw Signature (**inherits** [**DataHexString**](byte-manipulation.md#datahexstring)**)**

A **Raw Signature** is a common Signature format where the r, s and v are concatenated into a 65 byte (130 nibble) [DataHexString](byte-manipulation.md#datahexstring).

#### SignatureLike <a href="#signaturelike" id="signaturelike"></a>

A **SignatureLike** is similar to a [Signature](byte-manipulation.md#signature), except redundant properties may be omitted or it may be a [Raw Signature](byte-manipulation.md#raw-signature-inherits-datahexstring).

For example, if **\_vs** is specified, **s** and **v** may be omitted. Likewise, if **recoveryParam** is provided, **v** may be omitted (as in these cases the missing values can be computed).

### Inspection

#### `hethers.utils.isBytes( object ) ⇒ boolean`

Returns true if and only if _object_ is a valid [Bytes](byte-manipulation.md#bytes).

#### `hethers.utils.isBytesLike( object ) ⇒ boolean`

Returns true if and only if _object_ is a Bytes or [DataHexString](byte-manipulation.md#datahexstring).

#### `hethers.utils.isHexString( object , [ length ] ) ⇒ boolean`

Returns true if and only if _object_ is a valid hex string. If _length_ is specified and _object_ is not a valid [DataHexString](byte-manipulation.md#datahexstring) of _length_ bytes, an InvalidArgument error is thrown.

### Converting between Arrays and Hexstrings

#### `hethers.utils.arrayify( DataHexStringOrArrayish [ , options ] ) ⇒ Uint8Array`

Converts _DataHexStringOrArrayish_ to a Uint8Array.

#### `hethers.utils.hexlify( hexstringOrArrayish ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Converts _hexstringOrArrayish_ to a [DataHexString](byte-manipulation.md#datahexstring).

#### `hethers.utils.hexValue( aBigNumberish ) ⇒ string<`[`HexString`](byte-manipulation.md#hexstring)`>`

Converts _aBigNumberish_ to a [HexString](byte-manipulation.md#hexstring), with no unnecessary leading zeros.

```typescript
// Convert a hexstring to a Uint8Array
arrayify("0x1234")
// Uint8Array [ 18, 52 ]

// Convert an Array to a hexstring
hexlify([1, 2, 3, 4])
// '0x01020304'

// Convert an Object to a hexstring
hexlify({ length: 2, "0": 1, "1": 2 })
// '0x0102'

// Convert an Array to a hexstring
hexlify([ 1 ])
// '0x01'

// Convert a number to a stripped hex value
hexValue(1)
// '0x1'

// Convert an Array to a stripped hex value
hexValue([ 1, 2 ])
// '0x102'
```

### Array Manipulation

#### `hethers.utils.concat( arrayOfBytesLike ) ⇒ Uint8Array`

Concatenates all the [BytesLike](byte-manipulation.md#byteslike) in _arrayOfBytesLike_ into a single Uint8Array.

#### `hethers.utils.stripZeros( aBytesLike ) ⇒ Uint8Array`

Returns a Uint8Array with all leading `0` bytes of _aBtyesLike_ removed.

#### `hethers.utils.zeroPad( aBytesLike, length ) ⇒ Uint8Array`

Returns a Uint8Array of the data in _aBytesLike_ with `0` bytes prepended to _length_ bytes long.

If _aBytesLike_ is already longer than _length_ bytes long, an InvalidArgument error will be thrown.

### Hexstring Manipulation

#### `hethers.utils.hexConcat( arrayOfBytesLike ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Concatenates all the [BytesLike](byte-manipulation.md#byteslike) in _arrayOfBytesLike_ into a single [DataHexString](byte-manipulation.md#datahexstring)

#### `hethers.utils.hexDataLength( aBytesLike ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Returns the length (in bytes) of _aBytesLike_.

#### `hethers.utils.hexDataSlice( aBytesLike, offset [ , endOffset ] ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Returns a [DataHexString](byte-manipulation.md#datahexstring) representation of a slice of _aBytesLike_, from _offset_ (in bytes) to _endOffset_ (in bytes). If _endOffset_ is omitted, the length of _aBytesLike_ is used.

#### `hethers.utils.hexStripZeros( aBytesLike ) ⇒ string<`[`HexString`](byte-manipulation.md#hexstring)`>`

Returns a [HexString](byte-manipulation.md#hexstring) representation of _aBytesLike_ with all leading zeros removed.

#### `hethers.utils.hexZeroPad( aBytesLike, length ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Returns a [DataHexString](byte-manipulation.md#datahexstring) representation of _aBytesLike_ padded to _length_ bytes.

If _aBytesLike_ is already longer than _length_ bytes long, an InvalidArgument error will be thrown.

### Signature Conversion

#### `hethers.utils.joinSignature( aSignatureLike ) ⇒ string<`[`RawSignature`](byte-manipulation.md#raw-signature-inherits-datahexstring)`>`

Return the raw-format of _aSignaturelike_, which is 65 bytes (130 nibbles) long, concatenating the **r**, **s** and (normalized) **v** of a Signature.

#### `hethers.utils.splitSignature( aSignatureLikeOrBytesLike ) ⇒` [`Signature`](byte-manipulation.md#signature)``

Return the full expanded-format of _aSignaturelike_ or a raw-format [DataHexString](byte-manipulation.md#datahexstring). Any missing properties will be computed.

### Random Bytes

#### `hethers.utils.randomBytes( length ) ⇒ Uint8Array`

Return a new Uint8Array of _length_ random bytes.

#### `hethers.utils.shuffled( array ) ⇒ Array<any>`

Return a copy of _array_ shuffled using [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher-Yates\_shuffle).

```typescript
utils.randomBytes(8)
// Uint8Array [ 238, 239, 73, 38, 25, 219, 132, 179 ]

const data = [ 1, 2, 3, 4, 5, 6, 7 ];

// Returns a new Array
utils.shuffled(data);
// [
//   4,
//   6,
//   5,
//   2,
//   1,
//   7,
//   3
// ]

// The Original is unscathed...
data
// [
//   1,
//   2,
//   3,
//   4,
//   5,
//   6,
//   7
// ]
```
