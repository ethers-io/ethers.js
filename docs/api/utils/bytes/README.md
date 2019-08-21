
Byte Manipulation
=================


Tra la la...


Types
-----



### Bytes


A Bytes object is any object which is an
[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) or
[TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) with
each value in the valid byte range (i.e. between 0 and 255 inclusive),
or is an Object with a `length` property where each indexed property
is in the valid byte range.


### BytesLike


A **BytesLike** can be either a [Bytes](./) or a [Hexstring](./).


### Hexstring


A **hexstring** is a string which has a `0x` prefix followed by


### Signature




* **r** and **s** --- The x co-ordinate of **r** and the **s** value of the signature
* **v** --- The parity of the y co-ordinate of **r**
* **_vs** --- The [compact representation](https://link_here) of the **(r, s)** and **v**
* **recoveryParam** --- The normalized (i.e. 0 or 1) value of **v**


### SignatureLike


A **SignatureLike** is similar to a [Signature](./), except redundant properties
may be omitted.

For example, if *_vs* is specified, **(r, s)** and **v** can be omitted. Likewise,
if **recoverParam** is provided, **v** can be omitted (as it can be computed).


Inspection
----------



#### *utils* . **isBytes** ( object )  **=>** *boolean*

Returns true if and only if *object* is a valid [Bytes](./).




#### *utils* . **isBytesLike** ( object )  **=>** *boolean*

Returns true if and only if *object* is a [Bytes](./) or an Array or TypedArray
where each value is a valid byte (i.e. between 0 and 255 inclusive).




#### *utils* . **isHexString** ( object ,  [ length ]  )  **=>** *boolean*

Returns true if and only if *object* is a valid hex string;
if *length* is specified the length (in bytes) is also verified.




Converting between Arrays and Hexstrings
----------------------------------------



#### *utils* . **arrayify** ( hexstringOrArrayish [  , options ]  )  **=>** *Uint8Array*

Converts *hexstringOrArrayish* to a Uint8Array. If a [Hexstring](./)
is passed in, the length must be even.




#### *utils* . **hexlify** ( hexstringOrArrayish )  **=>** *string*

Converts *hexstringOrArrayish* to a [Hexstring](./). The result
will always be zero-padded to even length.




#### *utils* . **hexValue** ( aBigNumberish )  **=>** *string*

Converts *aBigNumberish* to a [Hexstring](./), with no unecessary leading
zeros. The result of this function can be of odd-length.




### Examples



```javascript
// Convert a hexstring to a Uint8Array
arrayify("0x1234")
// [ 18, 52 ]</span>

// Convert an Array to a hexstring
hexlify([1, 2, 3, 4])
// 0x01020304</span>

// Convert an Object to a hexstring
hexlify({ length: 2, "0": 1, "1": 2 })
// 0x0102</span>

// Convert an Array to a hexstring
hexlify([ 1 ])
// 0x01</span>

// Convert a number to a stripped hex value
hexValue(1)
// 0x1</span>

// Convert an Array to a stripped hex value
hexValue([ 1, 2 ])
// 0x102</span>
```



Array Manipulation
------------------



#### *utils* . **concat** ( arrayOfBytesLike )  **=>** *Uint8Array*

Concatenates all the [BytesLike](./) in *arrayOfBytesLike*
into a single Uint8Array.




#### *utils* . **stripZeros** ( aBytesLike )  **=>** *Uint8Array*

Concatenates all the [BytesLike](./) in *arrayOfBytesLike*




#### *utils* . **zeroPad** ( aBytesLike , length )  **=>** *Uint8Array*

Concatenates all the [BytesLike](./) in *arrayOfBytesLike*




Hexstring Manipulation
----------------------



#### *utils* . **hexConcat** ( arrayOfBytesLike )  **=>** *string*

Concatenates all the [BytesLike](./) in *arrayOfBytesLike*
into a single [Hexstring](./)




#### *utils* . **hexDataLength** ( aBytesLike )  **=>** *number*

Returns the length (in bytes) of *aBytesLike*.

This will **throw and error** if *aBytesLike* is a [Hexstring](./)
but is of odd-length.




#### *utils* . **hexDataSlice** ( aBytesLike , offset [  , endOffset ]  )  **=>** *string*

Returns the length (in bytes) of *aBytesLike*.




#### *utils* . **hexStripZeros** ( aBytesLike )  **=>** *string*

@TODO




#### *utils* . **hexZeroPad** ( aBytesLike , length )  **=>** *string*

@TODO




Signature Conversion
--------------------



#### *utils* . **joinSignature** ( aSignatureLike )  **=>** *string*

Return the flat-format of a [SignatureLike](./), which is
65 bytes (130 nibbles) long, concatenating the **r**, **s** and **v**
of a Signature.




#### *utils* . **splitSignature** ( aSignatureLikeOrBytesLike )  **=>** *Signature*

Return the full expanded-format of a [SignatureLike](./) or
a flat-format [Hexstring](./). Any missing properties will be
computed.





-----
**Content Hash:** 6c6608cb249ff3e352417e8c99e1965500c19a3ae9b33d0397d7f8b84e78e20b