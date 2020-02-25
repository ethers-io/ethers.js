-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

FixedNumber
===========


A **FixedNumber** is a fixed-width (in bits) number with an internal
base-10 divisor, which allows it to represent a decimal fractional
component.


Creating Instances
------------------


The FixedNumber constructor cannot be called directly. There are several
static methods for creating a FixedNumber.


#### *FixedNumber* . **from** ( value [  , format="fixed" ]  )  **=>** *[FixedNumber](./)*

Returns an instance of a **FixedNumber** for *value* as a *format*.




#### *FixedNumber* . **fromBytes** ( aBytesLike [  , format="fixed" ]  )  **=>** *[FixedNumber](./)*

Returns an instance of a **FixedNumber** for *value* as a *format*.




#### *FixedNumber* . **fromString** ( value [  , format="fixed" ]  )  **=>** *[FixedNumber](./)*

Returns an instance of a **FixedNumber** for *value* as a *format*. The *value* must
not contain more decimals than the *format* permits.




#### *FixedNumber* . **fromValue** ( value [  , decimals=0 [  , format="fixed" ]  ]  )  **=>** *[FixedNumber](./)*

Returns an instance of a **FixedNumber** for *value* with *decimals* as a *format*.




Properties
----------



#### *fixednumber* . **format**

The [FixedFormat](./) of *fixednumber*.




Methods
-------



### Math Operations



#### *fixednumber* . **addUnsafe** ( otherValue )  **=>** *[FixedNumber](./)*

Returns a new FixedNumber with the value of *fixedvalue* **+** *otherValue*.




#### *fixednumber* . **subUnsafe** ( otherValue )  **=>** *[FixedNumber](./)*

Returns a new FixedNumber with the value of *fixedvalue* **&ndash;** *otherValue*.




#### *fixednumber* . **mulUnsafe** ( otherValue )  **=>** *[FixedNumber](./)*

Returns a new FixedNumber with the value of *fixedvalue* **&times;** *otherValue*.




#### *fixednumber* . **divUnsafe** ( otherValue )  **=>** *[FixedNumber](./)*

Returns a new FixedNumber with the value of *fixedvalue* **&#247;** *otherValue*.




#### *fixednumber* . **round** (  [ decimals=0 ]  )  **=>** *[FixedNumber](./)*

Returns a new FixedNumber with the value of *fixedvalue* rounded to *decimals*.




### Conversion



#### *fixednumber* . **toFormat** ( format )  **=>** *[FixedNumber](./)*

Returns a new FixedNumber with the value of *fixedvalue* with *format*.




#### *fixednumber* . **toHexString** (  )  **=>** *string*

Returns a [Hexstring](../bytes) representation of *fixednumber*.




#### *fixednumber* . **toString** (  )  **=>** *string*

Returns a string representation of *fixednumber*.




#### *fixednumber* . **toUnsafeFloat** (  )  **=>** *float*

Returns a floating-point JavaScript number value of *fixednumber*.
Due to rounding in JavaScript numbers, the value is only approximate.




### Inspection



#### *FixedNumber* . **isFixedNumber** ( value )  **=>** *boolean*

Returns true if and only if *value* is a **FixedNumber**.




FixedFormat
-----------


A **FixedFormat** is a simple object which represents a decimal
(base-10) Fixed-Point data representation. Usually using this
class directly is uneccessary, as passing in a [Format Strings](./)
directly into the [FixedNumber](./) will automatically create this.


### Format Strings


A format string is composed of three components, including signed-ness,
bit-width and number of decimals.

A signed format string begins with `fixed`, which an unsigned format
string begins with `ufixed`, followed by the width (in bits) and the
number of decimals.

The width must be conguent to 0 mod 8 (i.e. `(width % 8) == 0`) and no
larger than 256 bits and the number of decimals must be no larger than 80.

For example:



* **fixed128x18** is signed, 128 bits wide and has 18 decimals; this is useful for most purposes
* **fixed32x0** is signed, 32 bits wide and has 0 decimals; this would be the same as a ``int32_t` in C
* **ufixed32x0** is unsigned, 32 bits wide and has 0 decimals; this would be the same as a ``uint32_t` in C
* **fixed** is shorthand for ``fixed128x18`
* **ufixed** is shorthand for ``ufixed128x18`


### Creating Instances



#### *FixedFormat* . **from** ( value="fixed128x18" )  **=>** *[FixedFormat](./)*

Returns a new instance of a **FixedFormat** defined by *value*. Any valid [Format Strings](./)
may be passed in as well as any object which has any of `signed`, `width` and `decimals`
defined, including a [FixedFormat](./) object.




### Properties



#### *fixedFormat* . **signed** **=>** *boolean*

The signed-ness of *fixedFormat*, true if negative values are supported.




#### *fixedFormat* . **width** **=>** *number*

The width (in bits) of *fixedFormat*.




#### *fixedFormat* . **decimals** **=>** *number*

The number of decimal points of *fixedFormat*.




#### *fixedFormat* . **name** **=>** *string*

The name of the *fixedFormat*, which can be used to recreate the format
and is the string that the Solidity language uses to represent this format.




#### ***"fixed"***

A shorthand for `fixed128x80`.





-----
**Content Hash:** 60fa7fc0a5e28ce6608684d52fe57c2758aa6c9482cd19f71cb5b91fd7d392b8