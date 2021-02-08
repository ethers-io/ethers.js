-----

Documentation: [html](https://docs.ethers.io/)

-----

BigNumber
=========

Types
-----

### BigNumberish

#### ***string***

A [HexString](/v5/api/utils/bytes/#HexString) or a decimal string, either of which may be negative.


#### ***BytesLike***

A [BytesLike](/v5/api/utils/bytes/#BytesLike) Object, such as an Array or Uint8Array.


#### ***BigNumber***

An existing [BigNumber](/v5/api/utils/bignumber/) instance.


#### ***number***

A number that is within the [safe range](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER#Description) for JavaScript numbers.


#### ***BigInt***

A JavaScript [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) object, on environments that support BigInt.


Creating Instances
------------------

#### *ethers* . *BigNumber* . **from**( aBigNumberish ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns an instance of a **BigNumber** for *aBigNumberish*.


### Examples:

```javascript
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
// Error: overflow (fault="overflow", operation="BigNumber.from", value=9007199254740991, code=NUMERIC_FAULT, version=bignumber/5.0.14)
```

Methods
-------

### Math Operations

#### *BigNumber* . **add**( otherValue ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* **+** *otherValue*.


#### *BigNumber* . **sub**( otherValue ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* **-** *otherValue*.


#### *BigNumber* . **mul**( otherValue ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* **\*** *otherValue*.


#### *BigNumber* . **div**( divisor ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* **/** *divisor*.


#### *BigNumber* . **mod**( divisor ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of the **remainder** of *BigNumber* / *divisor*.


#### *BigNumber* . **pow**( exponent ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* to the power of *exponent*.


#### *BigNumber* . **abs**( ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the absolute value of *BigNumber*.


#### *BigNumber* . **mask**( bitcount ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* with bits beyond the *bitcount* least significant bits set to zero.


### Two's Complement

#### *BigNumber* . **fromTwos**( bitwidth ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* converted from twos-complement with *bitwidth*.


#### *BigNumber* . **toTwos**( bitwidth ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a BigNumber with the value of *BigNumber* converted to twos-complement with *bitwidth*.


### Comparison and Equivalence

#### *BigNumber* . **eq**( otherValue ) => *boolean*

Returns true if and only if the value of *BigNumber* is equal to *otherValue*.


#### *BigNumber* . **lt**( otherValue ) => *boolean*

Returns true if and only if the value of *BigNumber* **<** *otherValue*.


#### *BigNumber* . **lte**( otherValue ) => *boolean*

Returns true if and only if the value of *BigNumber* **<=** *otherValue*.


#### *BigNumber* . **gt**( otherValue ) => *boolean*

Returns true if and only if the value of *BigNumber* **>** *otherValue*.


#### *BigNumber* . **gte**( otherValue ) => *boolean*

Returns true if and only if the value of *BigNumber* **>=** *otherValue*.


#### *BigNumber* . **isZero**( ) => *boolean*

Returns true if and only if the value of *BigNumber* is zero.


### Conversion

#### *BigNumber* . **toNumber**( ) => *number*

Returns the value of *BigNumber* as a JavaScript value.

This will **throw an error** if the value is greater than or equal to *Number.MAX_SAFE_INTEGER* or less than or equal to *Number.MIN_SAFE_INTEGER*.


#### *BigNumber* . **toString**( ) => *string*

Returns the value of *BigNumber* as a base-10 string.


#### *BigNumber* . **toHexString**( ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the value of *BigNumber* as a base-16, `0x`-prefixed [DataHexString](/v5/api/utils/bytes/#DataHexString).


### Inspection

#### *ethers* . *BigNumber* . **isBigNumber**( object ) => *boolean*

Returns true if and only if the *object* is a BigNumber object.


### Examples

```javascript
let a = BigNumber.from(42);
let b = BigNumber.from("91");

a.mul(b);
// { BigNumber: "3822" }
```

Notes
-----

### Why can't I just use numbers?

```javascript
(Number.MAX_SAFE_INTEGER + 2 - 2) == (Number.MAX_SAFE_INTEGER)
// false
```


To remedy this, all numbers (which can be large) are stored and manipulated as [Big Numbers](/v5/api/utils/bignumber/).

The functions [parseEther( etherString )](/v5/api/utils/display-logic/#utils-parseEther) and [formatEther( wei )](/v5/api/utils/display-logic/#utils-formatEther) can be used to convert between string representations, which are displayed to or entered by the user and Big Number representations which can have mathematical operations handled safely.


### Why not BigNumber.js, BN.js, BigDecimal, etc?

### Why BN.js??

### Allow us to set a global Big Number library?

