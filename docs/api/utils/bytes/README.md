-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Byte Manipulation
=================


Tra la la...


Types
-----



### Bytes


A **Bytes** is any object which is an
[Array](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) or [TypedArray](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) with
each value in the valid byte range (i.e. between 0 and 255 inclusive),
or is an Object with a `length` property where each indexed property
is in the valid byte range.


### BytesLike


A **BytesLike** can be either a [Bytes](./) or a [DataHexstring](./).


### DataHexstring


A **DataHexstring** is identical to a [Hexstring](./) except that it has
an even number of nibbles, and therefore is a valid representation of
binary data as a string.


### Hexstring


A **Hexstring** is a string which has a `0x` prefix followed by any
number of nibbles (i.e. case-insensitive hexidecumal characters, `0-9` and `a-f`).


### Signature




* **r** and **s** --- The x co-ordinate of **r** and the **s** value of the signature
* **v** --- The parity of the y co-ordinate of **r**
* **_vs** --- The [compact representation](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-2098) of the **s** and **v**
* **recoveryParam** --- The normalized (i.e. 0 or 1) value of **v**


### Flat-Format Signature


A **Flat-Format Signature** is a common Signature format where
the r, s and v are concanenated into a 65 byte (130 nibble)
[DataHexstring](./).


### SignatureLike


A **SignatureLike** is similar to a [Signature](./), except redundant properties
may be omitted or it may be a [Flat-Format Signature](./).

For example, if **_vs** is specified, **s** and **v** may be omitted. Likewise,
if **recoveryParam** is provided, **v** may be omitted (as in these cases the
missing values can be computed).


Inspection
----------



#### *ethers* . *utils* . **isBytes** ( object )  **=>** *boolean*

Returns true if and only if *object* is a valid [Bytes](./).




#### *ethers* . *utils* . **isBytesLike** ( object )  **=>** *boolean*

Returns true if and only if *object* is a [Bytes](./) or [DataHexstring](./).




#### *ethers* . *utils* . **isHexString** ( object ,  [ length ]  )  **=>** *boolean*

Returns true if and only if *object* is a valid hex string.
If *length* is specified and *object* is not a valid [DataHexstring](./) of
*length* bytes, an InvalidArgument error is thrown.




Converting between Arrays and Hexstrings
----------------------------------------



#### *ethers* . *utils* . **arrayify** ( datahexstringOrArrayish [  , options ]  )  **=>** *Uint8Array*

Converts *datahexstringOrArrayish* to a Uint8Array.




#### *ethers* . *utils* . **hexlify** ( hexstringOrArrayish )  **=>** *string< [DataHexstring](./) >*

Converts *hexstringOrArrayish* to a [DataHexstring](./).




#### *ethers* . *utils* . **hexValue** ( aBigNumberish )  **=>** *string< [Hexstring](./) >*

Converts *aBigNumberish* to a [Hexstring](./), with no *unnecessary* leading
zeros.




### Examples



```javascript
Skipping JavaScript Evaluation.
```



Array Manipulation
------------------



#### *ethers* . *utils* . **concat** ( arrayOfBytesLike )  **=>** *Uint8Array*

Concatenates all the [BytesLike](./) in *arrayOfBytesLike* into a single Uint8Array.




#### *ethers* . *utils* . **stripZeros** ( aBytesLike )  **=>** *Uint8Array*

Returns a Uint8Array with all leading `0` bytes of *aBtyesLike* removed.




#### *ethers* . *utils* . **zeroPad** ( aBytesLike , length )  **=>** *Uint8Array*

Retutns a Uint8Array of the data in *aBytesLike* with `0` bytes prepended to
*length* bytes long.

If *aBytesLike* is already longer than *length* bytes long, an InvalidArgument
error will be thrown.




Hexstring Manipulation
----------------------



#### *ethers* . *utils* . **hexConcat** ( arrayOfBytesLike )  **=>** *string< [DataHexstring](./) >*

Concatenates all the [BytesLike](./) in *arrayOfBytesLike* into a single [DataHexstring](./)




#### *ethers* . *utils* . **hexDataLength** ( aBytesLike )  **=>** *string< [DataHexstring](./) >*

Returns the length (in bytes) of *aBytesLike*.




#### *ethers* . *utils* . **hexDataSlice** ( aBytesLike , offset [  , endOffset ]  )  **=>** *string< [DataHexstring](./) >*

Returns a [DataHexstring](./) representation of a slice of *aBytesLike*, from
*offset* (in bytes) to *endOffset* (in bytes). If *endOffset* is
omitted, the length of *aBytesLike* is used.




#### *ethers* . *utils* . **hexStripZeros** ( aBytesLike )  **=>** *string< [Hexstring](./) >*

Returns a [Hexstring](./) representation of *aBytesLike* with all
leading zeros removed.




#### *ethers* . *utils* . **hexZeroPad** ( aBytesLike , length )  **=>** *string< [DataHexstring](./) >*

Returns a [DataHexstring](./) representation of *aBytesLike* padded to *length* bytes.

If *aBytesLike* is already longer than *length* bytes long, an InvalidArgument
error will be thrown.




Signature Conversion
--------------------



#### *ethers* . *utils* . **joinSignature** ( aSignatureLike )  **=>** *string< [FlatSignature](./) >*

Return the flat-format of *aSignaturelike*, which is 65 bytes (130 nibbles)
long, concatenating the **r**, **s** and (normalized) **v** of a Signature.




#### *ethers* . *utils* . **splitSignature** ( aSignatureLikeOrBytesLike )  **=>** *[Signature](./)*

Return the full expanded-format of *aSignaturelike* or a flat-format [DataHexstring](./).
Any missing properties will be computed.




Random Bytes
------------



#### *ethers* . *utils* . **randomBytes** ( length )  **=>** *Uint8Array*

Return a new Uint8Array of *length* random bytes.




#### *ethers* . *utils* . **shuffled** ( array )  **=>** *Array< any >*

Return a copy of *array* shuffled using [Fisher-Yates Shuffle](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Fisher-Yates_shuffle).





-----
**Content Hash:** 8736c2f7c64aa2a0ba9f987036158ef0cecc8110bbc30f88c7365f24809af3fc