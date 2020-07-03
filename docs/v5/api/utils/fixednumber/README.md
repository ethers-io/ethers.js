-----

Documentation: [html](https://docs.ethers.io/)

-----

FixedNumber
===========

Creating Instances
------------------

#### *FixedNumber* . **from**( value [ , format = "fixed" ] ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns an instance of a **FixedNumber** for *value* as a *format*.


#### *FixedNumber* . **fromBytes**( aBytesLike [ , format = "fixed" ] ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns an instance of a **FixedNumber** for *value* as a *format*.


#### *FixedNumber* . **fromString**( value [ , format = "fixed" ] ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns an instance of a **FixedNumber** for *value* as a *format*. The *value* must not contain more decimals than the *format* permits.


#### *FixedNumber* . **fromValue**( value [ , decimals = 0 [ , format = "fixed" ] ] ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns an instance of a **FixedNumber** for *value* with *decimals* as a *format*.


Properties
----------

#### *fixednumber* . **format**

The [FixedFormat](/v5/api/utils/fixednumber/#FixedFormat) of *fixednumber*.


Methods
-------

### Math Operations

#### *fixednumber* . **addUnsafe**( otherValue ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns a new FixedNumber with the value of *fixedvalue* **+** *otherValue*.


#### *fixednumber* . **subUnsafe**( otherValue ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns a new FixedNumber with the value of *fixedvalue* **-** *otherValue*.


#### *fixednumber* . **mulUnsafe**( otherValue ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns a new FixedNumber with the value of *fixedvalue* **\*** *otherValue*.


#### *fixednumber* . **divUnsafe**( otherValue ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns a new FixedNumber with the value of *fixedvalue* **/** *otherValue*.


#### *fixednumber* . **round**( [ decimals = 0 ] ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns a new FixedNumber with the value of *fixedvalue* rounded to *decimals*.


### Comparison and Equivalence

#### *FixedNumber* . **isZero**( ) => *boolean*

Returns true if and only if the value of *FixedNumber* is zero.


### Conversion

#### *fixednumber* . **toFormat**( format ) => *[FixedNumber](/v5/api/utils/fixednumber/)*

Returns a new FixedNumber with the value of *fixedvalue* with *format*.


#### *fixednumber* . **toHexString**( ) => *string*

Returns a [HexString](/v5/api/utils/bytes/#HexString) representation of *fixednumber*.


#### *fixednumber* . **toString**( ) => *string*

Returns a string representation of *fixednumber*.


#### *fixednumber* . **toUnsafeFloat**( ) => *float*

Returns a floating-point JavaScript number value of *fixednumber*. Due to rounding in JavaScript numbers, the value is only approximate.


### Inspection

#### *FixedNumber* . **isFixedNumber**( value ) => *boolean*

Returns true if and only if *value* is a **FixedNumber**.


FixedFormat
-----------

### Format Strings

### Creating Instances

#### *FixedFormat* . **from**( value = "fixed128x18" ) => *[FixedFormat](/v5/api/utils/fixednumber/#FixedFormat)*

Returns a new instance of a **FixedFormat** defined by *value*. Any valid [Format Strings](/v5/api/utils/fixednumber/#FixedFormat--strings) may be passed in as well as any object which has any of `signed`, `width` and `decimals` defined, including a [FixedFormat](/v5/api/utils/fixednumber/#FixedFormat) object.


### Properties

#### *fixedFormat* . **signed** => *boolean*

The signed-ness of *fixedFormat*, true if negative values are supported.


#### *fixedFormat* . **width** => *number*

The width (in bits) of *fixedFormat*.


#### *fixedFormat* . **decimals** => *number*

The number of decimal points of *fixedFormat*.


#### *fixedFormat* . **name** => *string*

The name of the *fixedFormat*, which can be used to recreate the format and is the string that the Solidity language uses to represent this format.


#### ***"fixed"***

A shorthand for `fixed128x80`.


