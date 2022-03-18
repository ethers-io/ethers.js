# BigNumber

Many operations in **Hedera** operate on numbers which are [outside the range of safe values](https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber--notes-safenumbers) to use in JavaScript.

A **BigNumber** is an object which safely allows mathematical operations on numbers of any magnitude.

Most operations which need to return a value will return a **BigNumber** and parameters which accept values will generally accept them.

{% hint style="info" %}
The **BigNumber** class is directly imported from the [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/bignumber/).
{% endhint %}

## Types

#### BigNumberish

Many functions and methods in this library take in values which can be non-ambiguously and safely converted to a _BigNumber_. These values can be specified as:

_**string -**_ A [HexString](byte-manipulation.md#hexstring) or a decimal string, either of which may be negative.

_**BytesLike -**_ A [BytesLike](byte-manipulation.md#byteslike) Object, such as an Array or Uint8Array.

_**BigNumber -**_ An existing BigNumber instance.

_**number -**_ A number that is within the [safe range](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Number/MAX\_SAFE\_INTEGER#description) for JavaScript numbers.

_**BigInt -**_ A JavaScript [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/BigInt) object, on environments that support BigInt.

## Creating Instances

The constructor of BigNumber cannot be called directly. Instead, Use the static `BigNumber.from`.

`hethers.BigNumber.from( aBigNumberish ) ⇒ BigNumber`

Returns an instance of a **BigNumber** for _aBigNumberish_.

#### Examples:

```typescript
// From a decimal string...
BigNumber.from("42")
// { BigNumber: "42" }

// From a HexString...
BigNumber.from("0x2a")
// { BigNumber: "42" }

// From a negative HexString...
BigNumber.from("-0x2a")
// { BigNumber: "-42" }

// From an Array (or Uint8Array)...
BigNumber.from([ 42 ])
// { BigNumber: "42" }

// From an existing BigNumber...
let one1 = constants.One;
let one2 = BigNumber.from(one1)

one2
// { BigNumber: "1" }

// ...which returns the same instance
one1 === one2
// true

// From a (safe) number...
BigNumber.from(42)
// { BigNumber: "42" }

// From a ES2015 BigInt... (only on platforms with BigInt support)
BigNumber.from(42n)
// { BigNumber: "42" }

// Numbers outside the safe range fail:
BigNumber.from(Number.MAX_SAFE_INTEGER);
// [Error: overflow] {
//   code: 'NUMERIC_FAULT',
//   fault: 'overflow',
//   operation: 'BigNumber.from',
//   reason: 'overflow',
//   value: 9007199254740991
// }
```

### Methods

The BigNumber class is immutable, so no operations can change the value it represents.

#### Math Operations

#### `BigNumber.add( otherValue ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ **+** _otherValue_.

#### `BigNumber.sub( otherValue ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ **-** _otherValue_.

#### `BigNumber.mul( otherValue ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ **×** _otherValue_.

#### `BigNumber.div( divisor ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ **÷** _divisor_.

#### `BigNumber.mod( divisor ) ⇒ BigNumber`

Returns a BigNumber with the value of the **remainder** of _BigNumber_ ÷ _divisor_.

#### `BigNumber.pow( exponent ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ to the power of _exponent_.

#### `BigNumber.abs( ) ⇒ BigNumber`

Returns a BigNumber with the absolute value of _BigNumber_.

#### `BigNumber.mask( bitcount ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ with bits beyond the _bitcount_ least significant bits set to zero.

#### Two's Complement

[Two's Complement](https://en.wikipedia.org/wiki/Two's\_complement) is an elegant method used to encode and decode fixed-width signed values while efficiently preserving mathematical operations. Most users will not need to interact with these.

#### `BigNumber.fromTwos( bitwidth ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ converted from twos-complement with _bitwidth_.

#### `BigNumber.toTwos( bitwidth ) ⇒ BigNumber`

Returns a BigNumber with the value of _BigNumber_ converted to twos-complement with _bitwidth_.

#### Comparison and Equivalence

#### `BigNumber.eq( otherValue ) ⇒ boolean`

Returns true if and only if the value of _BigNumber_ is equal to _otherValue_.

#### `BigNumber.lt( otherValue ) ⇒ boolean`

Returns true if and only if the value of _BigNumber_ **<** _otherValue_.

#### `BigNumber.lte( otherValue ) ⇒ boolean`

Returns true if and only if the value of _BigNumber_ **≤** _otherValue_.

#### `BigNumber.gt( otherValue ) ⇒ boolean`

Returns true if and only if the value of _BigNumber_ **>** _otherValue_.

#### `BigNumber.gte( otherValue ) ⇒ boolean`

Returns true if and only if the value of _BigNumber_ **≥** _otherValue_.

#### `BigNumber.isZero( ) ⇒ boolean`

Returns true if and only if the value of _BigNumber_ is zero.

#### Conversion

#### `BigNumber.toBigInt( ) ⇒ bigint`

Returns the value of _BigNumber_ as a [JavaScript BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/BigInt) value, on platforms which support them.

#### `BigNumber.toNumber( ) ⇒ number`

Returns the value of _BigNumber_ as a JavaScript value.

This will **throw an error** if the value is greater than or equal to _Number.MAX\_SAFE\_INTEGER_ or less than or equal to _Number.MIN\_SAFE\_INTEGER_.

#### `BigNumber.toString( ) ⇒ string`

Returns the value of _BigNumber_ as a base-10 string.

#### `BigNumber.toHexString( ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Returns the value of _BigNumber_ as a base-16, `0x`-prefixed [DataHexString](byte-manipulation.md#datahexstring).

#### Inspection

#### `hethers.BigNumber.isBigNumber( object ) ⇒ boolean`

Returns true if and only if the _object_ is a BigNumber object.

#### Examples

```typescript
let a = BigNumber.from(42);
let b = BigNumber.from("91");

a.mul(b);
// { BigNumber: "3822" }
```
