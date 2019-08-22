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


#### **Note:**

Strings that are 31 **bytes** long may contain fewer than 31 **characters**,
since UTF-8 requires multiple bytes to encode international characters.




#### *utils* . **parseBytes32String** ( aBytesLike )  **=>** *string*

Returns the decoded string represented by the `Bytes32` encoded data.




#### *utils* . **formatBytes32String** ( text )  **=>** *string*

Returns a `bytes32` string representation of *text*. If the
length of *text* exceeds 31 bytes, it will throw an error.




UTF-8 Strings
-------------



#### *utils* . **toUtf8Bytes** ( text [  , form=current ]  )  **=>** *Uint8Array*

Returns the UTF-8 bytes of *text*, optionally normalizing it using the
[UnicodeNormalizationForm](./) *form*.




#### *utils* . **toUtf8CodePoints** ( aBytesLike [  , form=current ]  )  **=>** *Array< number >*

Returns the Array of codepoints of *aBytesLike*, optionally normalizing it using the
[UnicodeNormalizationForm](./) *form*.

**Note:** This function correctly splits each user-perceived character into
its codepoint, accounting for surrogate pairs. This should not be confused with
`string.split("")`, which destroys surrogate pairs, spliting between each UTF-16
codeunit instead.




#### *utils* . **toUtf8String** ( aBytesLike [  , ignoreErrors=false ]  )  **=>** *string*

Returns the string represented by the UTF-8 bytes of *aBytesLike*. This will
throw an error for invalid surrogates, overlong sequences or other UTF-8 issues,
unless *ignoreErrors* is specified.




### UnicodeNormalizationForm


There are several [commonly used forms](https://en.wikipedia.org/wiki/Unicode_equivalence)
when normalizing UTF-8 data, which allow strings to be compared or hashed in a stable
way.


#### *utils* . *UnicodeNormalizationForm* . **current**

Maintain the current normalization form.




#### *utils* . *UnicodeNormalizationForm* . **NFC**

The Composed Normalization Form. This form uses single codepoints
which represent the fully composed character.

For example, the **&eacute;** is a single codepoint, `0x00e9`.




#### *utils* . *UnicodeNormalizationForm* . **NFD**

The Decomposed Normalization Form. This form uses multiple codepoints
(when necessary) to compose a character.

For example, the **&eacute;**
is made up of two codepoints, `"0x0065"` (which is the letter `"e"`)
and `"0x0301"` which is a special diacritic UTF-8 codepoint which
indicates the previous character should have an acute accent.




#### *utils* . *UnicodeNormalizationForm* . **NFKC**

The Composed Normalization Form with Canonical Equivalence. The Canonical
representation folds characters which have the same syntactic representation
but different semantic meaning.

For example, the Roman Numeral **I**, which has a UTF-8
codepoint `"0x2160"`, is folded into the capital letter I, `"0x0049"`.




#### *utils* . *UnicodeNormalizationForm* . **NFKD**

The Decomposed Normalization Form with Canonical Equivalence.
See NFKC for more an example.




#### **Note:**

Only certain specified characters are folded in Canonical Equivalence, and thus
it should not be considered a method to acheive *any* level of security from
[homoglyph attacks](https://en.wikipedia.org/wiki/IDN_homograph_attack).





-----
**Content Hash:** 74002cd3d9368872b5618f68967deac34a4d1aeafeeac6ddb5c1d06a450180c9