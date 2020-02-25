-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Strings
=======


Tra la la


Bytes32String
-------------


A string in Solidity is length prefixed with its 256-bit (32 byte)
length, which means that even short strings require 2 words (64 bytes)
of storage.

In many cases, we deal with short strings, so instead of prefixing
the string with its length, we can null-terminate it and fit it in a
single word (32 bytes). Since we need only a single byte for the
null termination, we can store strings up to 31 bytes long in a
word.


#### Note

Strings that are 31 **bytes** long may contain fewer than 31 **characters**,
since UTF-8 requires multiple bytes to encode international characters.




#### *ethers* . *utils* . **parseBytes32String** ( aBytesLike )  **=>** *string*

Returns the decoded string represented by the `Bytes32` encoded data.




#### *ethers* . *utils* . **formatBytes32String** ( text )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Returns a `bytes32` string representation of *text*. If the
length of *text* exceeds 31 bytes, it will throw an error.




UTF-8 Strings
-------------



#### *ethers* . *utils* . **toUtf8Bytes** ( text [  , form=current ]  )  **=>** *Uint8Array*

Returns the UTF-8 bytes of *text*, optionally normalizing it using the
[UnicodeNormalizationForm](./) *form*.




#### *ethers* . *utils* . **toUtf8CodePoints** ( text [  , form=current ]  )  **=>** *Array< number >*

Returns the Array of codepoints of *text*, optionally normalized using the
[UnicodeNormalizationForm](./) *form*.




#### Note

This function correctly splits each **user-perceived character** into
its codepoint, accounting for surrogate pairs. This should not be confused with
`string.split("")`, which destroys surrogate pairs, spliting between each UTF-16
codeunit instead.




#### *ethers* . *utils* . **toUtf8String** ( aBytesLike [  , onError=error ]  )  **=>** *string*

Returns the string represented by the UTF-8 bytes of *aBytesLike*.

The *onError* is a [Custom UTF-8 Error function](./) and if not specified
it defaults to the [error](./) function, which throws an error
on **any** UTF-8 error.




UnicodeNormalizationForm
------------------------


There are several [commonly used forms](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Unicode_equivalence)
when normalizing UTF-8 data, which allow strings to be compared or hashed in a stable
way.


#### *ethers* . *utils* . *UnicodeNormalizationForm* . **current**

Maintain the current normalization form.




#### *ethers* . *utils* . *UnicodeNormalizationForm* . **NFC**

The Composed Normalization Form. This form uses single codepoints
which represent the fully composed character.

For example, the **&eacute;** is a single codepoint, `0x00e9`.




#### *ethers* . *utils* . *UnicodeNormalizationForm* . **NFD**

The Decomposed Normalization Form. This form uses multiple codepoints
(when necessary) to compose a character.

For example, the **&eacute;**
is made up of two codepoints, `"0x0065"` (which is the letter `"e"`)
and `"0x0301"` which is a special diacritic UTF-8 codepoint which
indicates the previous character should have an acute accent.




#### *ethers* . *utils* . *UnicodeNormalizationForm* . **NFKC**

The Composed Normalization Form with Canonical Equivalence. The Canonical
representation folds characters which have the same syntactic representation
but different semantic meaning.

For example, the Roman Numeral **I**, which has a UTF-8
codepoint `"0x2160"`, is folded into the capital letter I, `"0x0049"`.




#### *ethers* . *utils* . *UnicodeNormalizationForm* . **NFKD**

The Decomposed Normalization Form with Canonical Equivalence.
See NFKC for more an example.




#### Note

Only certain specified characters are folded in Canonical Equivalence, and thus
it should **not** be considered a method to acheive *any* level of security from
[homoglyph attacks](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/IDN_homograph_attack).




Custom UTF-8 Error Handling
---------------------------


When converting a string to its codepoints, there is the possibility
of invalid byte sequences. Since certain situations may need specific
ways to handle UTF-8 errors, a custom error handling function can be used,
which has the signature:


#### **errorFunction** ( reason , offset , bytes , output [  , badCodepoint ]  )  **=>** *number*

The *reason* is one of the [UTF-8 Error Reasons](./), *offset* is the index
into *bytes* where the error was first encountered, output is the list
of codepoints already processed (and may be modified) and in certain Error
Reasons, the *badCodepoint* indicates the currently computed codepoint,
but which would be rejected because its value is invalid.

This function should return the number of bytes to skip past keeping in
mind the value at *offset* will already be consumed.




### UTF-8 Error Reasons



#### *ethers* . *utils* . *Utf8ErrorReason* . **BAD_PREFIX**

A byte was encountered which is invalid to begin a UTF-8 byte
sequence with.




#### *ethers* . *utils* . *Utf8ErrorReason* . **MISSING_CONTINUE**

A UTF-8 sequence was begun, but did not have enough continuation
bytes for the sequence. For this error the *ofset* is the index
at which a continuation byte was expected.




#### *ethers* . *utils* . *Utf8ErrorReason* . **OUT_OF_RANGE**

The computed codepoint is outside the range for valid UTF-8
codepoints (i.e. the codepoint is greater than 0x10ffff).
This reason will pass the computed *badCountpoint* into
the custom error function.




#### *ethers* . *utils* . *Utf8ErrorReason* . **OVERLONG**

Due to the way UTF-8 allows variable length byte sequences
to be used, it is possible to have multiple representations
of the same character, which means
[overlong sequences](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/UTF-8)
allow for a non-distinguished string to be formed, which can
impact security as multiple strings that are otherwise
equal can have different hashes.

Generally, overlong sequences are an attempt to circumvent
some part of security, but in rare cases may be produced by
lazy libraries or used to encode the null terminating
character in a way that is safe to include in a `char*`.

This reason will pass the computed *badCountpoint* into the
custom error function, which is actually a valid codepoint, just
one that was arrived at through unsafe methods.




#### *ethers* . *utils* . *Utf8ErrorReason* . **OVERRUN**

The string does not have enough characters remaining for the
length of this sequence.




#### *ethers* . *utils* . *Utf8ErrorReason* . **UNEXPECTED_CONTINUE**

This error is similar to BAD_PREFIX, since a continuation byte
cannot begin a valid sequence, but many may wish to process this
differently. However, most developers would want to trap this
and perform the same operation as a BAD_PREFIX.




#### *ethers* . *utils* . *Utf8ErrorReason* . **UTF16_SURROGATE**

The computed codepoint represents a value reserved for
UTF-16 surrogate pairs.
This reason will pass the computed surrogate half
*badCountpoint* into the custom error function.




### Provided UTF-8 Error Handling Functions


There are already several functions available for the  most common
situations.


#### *ethers* . *utils* . *Utf8ErrorFuncs* . **error**

The will throw an error on **any** error with a UTF-8 sequence, including
invalid prefix bytes, overlong sequences, UTF-16 surrogate pairs.




#### *ethers* . *utils* . *Utf8ErrorFuncs* . **ignore**

This will drop all invalid sequences (by consuming invalid prefix bytes and
any following continuation bytes) from the final string as well as permit
overlong sequences to be converted to their equivalent string.




#### *ethers* . *utils* . *Utf8ErrorFuncs* . **replace**

This will replace all invalid sequences (by consuming invalid prefix bytes and
any following continuation bytes) with the
[UTF-8 Replacement Character](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Specials_%28Unicode_block%29),
(i.e. U+FFFD).





-----
**Content Hash:** 07249bd69db30a03c4095abd99904dd50f0d1b924138023085e78a43e0b5e4c4