-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

BigNumber
=========


Many operations in Ethereum operation on numbers which are
[outside the range of safe values](./) to use
in JavaScript.

A **BigNumber** is an object which safely allows mathematic operations
on numbers of any magnitude.

Most operations which need to return a value will return a **BigNumber**
and parameters which accept values will generally accept them.


### Importing



```
/////
// CommonJS:

// From the Umbrella ethers package...
const { BigNumber } = require("ethers");

// From the bignumber pacakge...
const { BigNumber } = require("@ethersproject/bignumber");


/////
// ES6 and TypeScript:

// From the Umbrella ethers package...
import { BigNumber } from "ethers";

// From the bignumber pacakge...
import { BigNumber } from "@ethersproject/bignumber";
```



Types
-----



### BigNumberish


Many functions and methods in this library take in values which
can be non-ambiguously and safely converted to a BigNumber. These
values can be sepcified as:


#### ***string***

A [hexstring](../bytes) or a decimal string, either of which may
be negative.




#### ***BytesLike***

A [BytesLike](../bytes) Object, such as an Array or Uint8Array.




#### ***BigNumber***

An existing [BigNumber](./) instance.




#### ***number***

A number that is within the [safe range](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) for JavaScript numbers.




#### ***BigInt***

A JavaScript [BigInt](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
object, on environments that support BigInt.




Creating Instances
------------------


The constructor of BigNumber cannot be called directly. Instead, Use the static `BigNumber.from`.


#### *ethers* . *BigNumber* . **from** ( aBigNumberish )  **=>** *[BigNumber](./)*

Returns an instance of a **BigNumber** for *aBigNumberish*.




### Examples:



```javascript
Skipping JavaScript Evaluation.
```



Methods
-------


The BigNumber class is immutable, so no operations can change the value
it represents.


### Math Operations



#### *bignumber* . **add** ( otherValue )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* **+** *otherValue*.




#### *bignumber* . **sub** ( otherValue )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* **&ndash;** *otherValue*.




#### *bignumber* . **mul** ( otherValue )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* **&times;** *otherValue*.




#### *bignumber* . **div** ( divisor )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* **&#247;** *divisor*.




#### *bignumber* . **mod** ( divisor )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of the **remainder** of *bignumber* &#247; *divisor*.




#### *bignumber* . **pow** ( exponent )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* to the power of *exponent*.




#### *bignumber* . **abs** (  )  **=>** *[BigNumber](./)*

Returns a BigNumber with the absolute value of *bignumber*.




#### *bignumber* . **maskn** ( bitcount )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* with bits beyond
the *bitcount* least significant bits set to zero.




### Two's Compliment


[Two's Complicment](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Two%27s_complement)
is an elegant method used to encode and decode fixed-width signed values
while efficiently preserving mathematic operations.
Most users will not need to interact with these.


#### *bignumber* . **fromTwos** ( bitwidth )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* converted from twos-compliment with *bitwidth*.




#### *bignumber* . **toTwos** ( bitwidth )  **=>** *[BigNumber](./)*

Returns a BigNumber with the value of *bignumber* converted to twos-compliment with *bitwidth*.




### Comparison and Equivalence



#### *bignumber* . **eq** ( otherValue )  **=>** *boolean*

Returns true if and only if the value of *bignumber* is equal to *otherValue*.




#### *bignumber* . **lt** ( otherValue )  **=>** *boolean*

Returns true if and only if the value of *bignumber* **<** *otherValue*.




#### *bignumber* . **lte** ( otherValue )  **=>** *boolean*

Returns true if and only if the value of *bignumber* **&le;** *otherValue*.




#### *bignumber* . **gt** ( otherValue )  **=>** *boolean*

Returns true if and only if the value of *bignumber* **>** *otherValue*.




#### *bignumber* . **gte** ( otherValue )  **=>** *boolean*

Returns true if and only if the value of *bignumber* **&ge;** *otherValue*.




#### *bignumber* . **isZero** (  )  **=>** *boolean*

Returns true if and only if the value of *bignumber* is zero.




### Conversion



#### *bignumber* . **toNumber** (  )  **=>** *number*

Returns the value of *bignumber* as a JavaScript value.

This will **throw an error**
if the value is greater than or equal to *Number.MAX_SAFE_INTEGER* or less than or
equal to *Number.MIN_SAFE_INTEGER*.




#### *bignumber* . **toString** (  )  **=>** *string*

Returns the value of *bignumber* as a base-10 string.




#### *bignumber* . **toHexString** (  )  **=>** *string< [DataHexstring](../bytes) >*

Returns the value of *bignumber* as a base-16, `0x`-prefixed [DataHexstring](../bytes).




### Inspection



#### *ethers* . *BigNumnber* . **isBigNumber** ( object )  **=>** *boolean*

Returns true if and only if the *object* is a BigNumber object.




### Examples



```javascript
Skipping JavaScript Evaluation.
```



Notes
-----


This section is a for a couple of questions that come up frequently.


### Why can't I just use numbers?


The first problem many encounter when dealing with Ethereum is
the concept of numbers. Most common currencies are broken down
with very little granularity. For example, there are only 100
cents in a single dollar. However, there are 10^18 **wei** in a
single **ether**.

JavaScript uses [IEEE 754 double-precision binary floating point](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Double-precision_floating-point_format)
numbers to represent numeric values. As a result, there are *holes*
in the integer set after 9,007,199,254,740,991; which is
problematic for *Ethereum* because that is only around 0.009
ether (in wei), which means any value over that will begin to
experience rounding errors.

To demonstrate how this may be an issue in your code, consider:


```javascript
Skipping JavaScript Evaluation.
```


To remedy this, all numbers (which can be large) are stored
and manipulated as [Big Numbers](./).

The functions [parseEther( etherString )](http://linkto) and
[formatEther( wei )](http://linkto) can be used to convert
between string representations, which are displayed to or entered
by the user and Big Number representations which can have
mathematical operations handled safely.


### Why not BigNumber.js, BN.js, BigDecimal, etc?


Everyone has their own favourite Big Number library, and once someone
has choosen one, it becomes part of their identity, like their editor,
vi vs emacs. There are over 100 Big Number libraries on [npm](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.npmjs.com/search?q=bignumber).

One of the biggest differences between the Ethers [BigNumber](./) object and
other libraries is that it is immutable, which is very important when
dealing with the asynchronous nature of the blockchain.

Capturing the value is not safe in async functions, so immutability
protects us from easy to make mistakes, which is not possible on the
low-level library's objects which supports myriad in-place operations.

Second, the Ethers [BigNumber](./) provides all the functionality required
internally and should generally be sufficient for most developers while
not exposing some of the more advanced and rare functionality. So it will
be eaiser to swap out the underlying library without impacting consumers.

For example, if [BN.js](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.npmjs.com/package/bn.js) was exposed, someone may use the
greatest-common-denominator functions, which would then be functionality
the replacing library should also provide to ensure anyone depending on
that functionality is not broken.


### Why BN.js??


The reason why [BN.js](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.npmjs.com/package/bn.js) is used internally as the big
number is because that is the library used by [elliptic](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.npmjs.com/package/elliptic).

Therefore it **must** be included regardless, so we leverage that
library rather than adding another Big Number library, which would
mean two different libraries offering the same functionality.

This has saved about 85kb (80% of this library size) of library size
over other libraries which include separate Big Number libraries for
various purposes.


### Why not allow us to set a global Big Number library?


Another comment that comes up frequently is tha desire to specify a
global user-defined Big Number library, which all functions would
return.

This becomes problematic since your code may live along side other
libraries or code that use Ethers. In fact, even Ethers uses a lot
of the public functions internally.

If you, for example, used a library that used `a.plus(b)` instead
of `a.add(b)`, this would break Ethers when it tries to compute
fees internally, and other libraries likely have similar logic.

But, the [BigNumber](./) prototype is exposed, so you can always add a
`toMyCustomBigNumber()` method to all [BigNumber](./)'s globally
which is safe.



-----
**Content Hash:** 8f8f918b6d3350f7494845577cf2d350c6f0c556a963040cadbde6520395311d