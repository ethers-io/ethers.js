-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


FixedNumber
===========



Types
-----



### FixedFormat


TODO


#### ***"fixed"***

A shorthand for `fixed128x80`.




Creating Instances
------------------


The FixedNumber constructor cannot be called directly. There are several
static methods for creating a FixedNumber.


#### *BigNumber* . **from** ( value [  , format="fixed" ]  )  **=>** *[FixedNumber](./)*

Returns an instance of a **FixedNumber** for *value* as a *format*.




#### *BigNumber* . **fromBytes** ( aBytesLike [  , format="fixed" ]  )  **=>** *[FixedNumber](./)*

Returns an instance of a **FixedNumber** for *value* as a *format*.




#### *BigNumber* . **fromString** ( value [  , format="fixed" ]  )  **=>** *[FixedNumber](./)*

Returns an instance of a **FixedNumber** for *value* as a *format*. The *value* must
not contain more decimals than the *format* permits.




#### *BigNumber* . **fromValue** ( value [  , decimals=0 [  , format="fixed" ]  ]  )  **=>** *[FixedNumber](./)*

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



#### *BigNumber* . **isFixedNumber** ( value )  **=>** *boolean*

Returns true if and only if *value* is a **FixedNumber**.





-----
**Content Hash:** e58731f51c5fe088aa89a78c7649ec914dce2d65dac9c1de3c4b3a89c911b46b