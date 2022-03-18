# FixedNumber

A **FixedNumber** is a fixed-width (in bits) number with an internal base-10 divisor, which allows it to represent a decimal fractional component.

{% hint style="info" %}
The **FixedNumber** class is directly imported from [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/fixednumber/).
{% endhint %}

## Creating Instances

The FixedNumber constructor cannot be called directly. There are several static methods for creating a FixedNumber.

#### `FixedNumber.from( value [ , format = "fixed" ] ) ⇒ FixedNumber`

Returns an instance of a **FixedNumber** for _value_ as a _format_.

#### `FixedNumber.fromBytes( aBytesLike [ , format = "fixed" ] ) ⇒ FixedNumber`

Returns an instance of a **FixedNumber** for _value_ as a _format_.

#### `FixedNumber.fromString( value [ , format = "fixed" ] ) ⇒ FixedNumber`

Returns an instance of a **FixedNumber** for _value_ as a _format_. The _value_ must not contain more decimals than the _format_ permits.

#### `FixedNumber.fromValue( value [ , decimals = 0 [ , format = "fixed" ] ] ) ⇒ FixedNumber`

Returns an instance of a **FixedNumber** for _value_ with _decimals_ as a _format_.

## Properties

#### `fixednumber.format`

The [FixedFormat](fixednumber.md#fixedformat) of _fixednumber_.

## Methods

### Math Operations

#### `fixednumber.addUnsafe( otherValue ) ⇒ FixedNumber`

Returns a new FixedNumber with the value of _fixedvalue_ **+** _otherValue_.

#### `fixednumber.subUnsafe( otherValue ) ⇒ FixedNumber`

Returns a new FixedNumber with the value of _fixedvalue_ **-** _otherValue_.

#### `fixednumber.mulUnsafe( otherValue ) ⇒ FixedNumber`

Returns a new FixedNumber with the value of _fixedvalue_ **×** _otherValue_.

#### `fixednumber.divUnsafe( otherValue ) ⇒ FixedNumber`

Returns a new FixedNumber with the value of _fixedvalue_ **÷** _otherValue_.

#### `fixednumber.round( [ decimals = 0 ] ) ⇒ FixedNumber`

Returns a new FixedNumber with the value of _fixedvalue_ rounded to _decimals_.

### Comparison and Equivalence

#### `FixedNumber.isZero() ⇒ boolean`

Returns true if and only if the value of _FixedNumber_ is zero.

### Conversion

#### `fixednumber.toFormat( format ) ⇒ FixedNumber`

Returns a new FixedNumber with the value of _fixedvalue_ with _format_.

#### `fixednumber.toHexString() ⇒ string`

Returns a [HexString](byte-manipulation.md#hexstring) representation of _fixednumber_.

#### `fixednumber.toString() ⇒ string`

Returns a string representation of _fixednumber_.

#### `fixednumber.toUnsafeFloat() ⇒ float`

Returns a floating-point JavaScript number value of _fixednumber_. Due to rounding in JavaScript numbers, the value is only approximate.

### Inspection

#### `FixedNumber.isFixedNumber( value ) ⇒ boolean`

Returns true if and only if _value_ is a **FixedNumber**.

## FixedFormat

A **FixedFormat** is a simple object which represents a decimal (base-10) Fixed-Point data representation. Usually using this class directly is unnecessary, as passing in a [Format Strings](fixednumber.md#format-strings) directly into the FixedNumber will automatically create this.

#### Format Strings

A format string is composed of three components, including signed-ness, bit-width and number of decimals.

A signed format string begins with `fixed`, which an unsigned format string begins with `ufixed`, followed by the width (in bits) and the number of decimals.

The width must be congruent to 0 mod 8 (i.e. `(width % 8) == 0`) and no larger than 256 bits and the number of decimals must be no larger than 80.

For example:

* **fixed128x18** is signed, 128 bits wide and has 18 decimals; this is useful for most purposes
* **fixed32x0** is signed, 32 bits wide and has 0 decimals; this would be the same as a `int32_t` in C
* **ufixed32x0** is unsigned, 32 bits wide and has 0 decimals; this would be the same as a `uint32_t` in C
* **fixed** is shorthand for `fixed128x18`
* **ufixed** is shorthand for `ufixed128x18`

### Creating Instances

#### `FixedFormat.from( value = "fixed128x18" ) ⇒` [`FixedFormat`](fixednumber.md#fixedformat)``

Returns a new instance of a **FixedFormat** defined by _value_. Any valid [Format Strings](fixednumber.md#format-strings) may be passed in as well as any object which has any of `signed`, `width` and `decimals` defined, including a [FixedFormat](fixednumber.md#fixedformat) object.

### Properties

#### `fixedFormat.signed ⇒ boolean`

The signed-ness of _fixedFormat_, true if negative values are supported.

#### `fixedFormat.width ⇒ number`

The width (in bits) of _fixedFormat_.

#### `fixedFormat.decimals ⇒ number`

The number of decimal points of _fixedFormat_.

#### `fixedFormat.name ⇒ string`

The name of the _fixedFormat_, which can be used to recreate the format and is the string that the Solidity language uses to represent this format.

_**"fixed"**_

A shorthand for `fixed128x80`.
