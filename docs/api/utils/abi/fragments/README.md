-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Fragments
=========


Explain an ABI.


Formats
-------



### JSON String ABI (Solidity Output JSON)


The **JSON ABI Format** is the format that is
[output from the Solidity compiler](../../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/solidity.readthedocs.io/en/v0.6.0/using-the-compiler.html).

A JSON serialized object is always a string, which represents an Array
of Objects, where each Object has various properties describing the [Fragment](./) of the ABI.

The deserialied JSON string (which is a normal JavaScript Object) may
also be passed into any function which accepts a JSON String ABI.


### Humanb-Readable ABI


The Human-Readable ABI was

[article](../../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/blog.ricmoo.com/human-readable-contract-abis-in-ethers-js-141902f4d917)


### Output Formats


Each [Fragment](./) and [ParamType](./) may be output using its `format`
method.


#### *ethers* . *utils* . *FragmentTypes* . **full** **=>** *string*

This is a full human-readable string, including all parameter names, any
optional modifiers (e.g. `indexed`, `public`, etc) and white-space
to aid in human readabiliy.




#### *ethers* . *utils* . *FragmentTypes* . **minimal** **=>** *string*

This is similar to `full`, except with no unnecessary whitespace or parameter
names. This is useful for storing a minimal string which can still fully
reconstruct the original Fragment using [Fragment&thinsp;.&thinsp;from](./).




#### *ethers* . *utils* . *FragmentTypes* . **json** **=>** *string*

This returns a JavaScript Object which is safe to call `JSON.stringify`
on to create a JSON string.




#### *ethers* . *utils* . *FragmentTypes* . **sighash** **=>** *string*

This is a minimal output format, which is used by Solidity when computing a
signature hash or an event topic hash.




#### Note

The `sighash` format is **insufficient** to re-create the original [Fragment](./),
since it discards modifiers such as indexed, anonymous, stateMutability, etc.




Fragment
--------


An ABI is a collection of **Fragments**, where each fragment specifies:



* An [Event](./)
* A [Function](./)
* A [Constructor](./)


### Properties



#### *fragment* . **name** **=>** *string*

This is the name of the Event or Function. This will be null for
a [ConstructorFragment](./).




#### *fragment* . **type** **=>** *string*

This is a string which indicates the type of the [Fragment](./). This
will be one of:



* `constructor`
* `event`
* `function`




#### *fragment* . **inputs** **=>** *Array< [ParamType](./) >*

This is an array of of each [ParamType](./) for the input parameters to
the Constructor, Event of Function.




### Methods



#### *ethers* . *utils* . *Fragment* . **from** ( objectOrString )  **=>** *[Fragment](./)*

Returns a




#### *ethers* . *utils* . *Fragment* . **isFragment** ( object )  **=>** *boolean*

Tra lal al




ConstructorFragment
-------------------



### Properties



#### *fragment* . **gas** **=>** *[BigNumber](../../bignumber)*

This is the gas limit that should be used during deployment. It may be
null.




#### *fragment* . **payable** **=>** *boolean*

This is whether the constructor may receive ether during deployment as
an endowment (i.e. msg.value != 0).




#### *fragment* . **stateMutability** **=>** *string*

This is the state mutability of the constructor. It can be any of:



* `nonpayable`
* `payable`




### Methods



#### *ethers* . *utils* . *ConstructorFragment* . **from** ( objectOrString )  **=>** *[ConstructorFragment](./)*

Tra la la...




#### *ethers* . *utils* . *ConstructorFragment* . **isConstructorFragment** ( object )  **=>** *boolean*

Tra lal al




EventFragment
-------------



### Properties



#### *fragment* . **anonymous** **=>** *boolean*

This is whether the event is anonymous. An anonymous Event does not inject its
topic hash as topic0 when creating a log.




### Methods



#### *ethers* . *utils* . *EventFragment* . **from** ( objectOrString )  **=>** *[EventFragment](./)*

Tra la la...




#### *ethers* . *utils* . *EventFragment* . **isEventFragment** ( object )  **=>** *boolean*

Tra lal al




FunctionFragment
----------------



### Properties



#### *fragment* . **constant** **=>** *boolean*

This is whether the function is constant (i.e. does not change state). This
is true if the state mutability is `pure` or `view`.




#### *fragment* . **stateMutability** **=>** *string*

This is the state mutability of the constructor. It can be any of:



* `nonpayable`
* `payable`
* `pure`
* `view`




#### *fragment* . **outputs** **=>** *Array< [ParamType](./) >*

A list of the Function output parameters.




### Method



#### *ethers* . *utils* . *FunctionFragment* . **from** ( objectOrString )  **=>** *[FunctionFragment](./)*

Tra la la...




#### *ethers* . *utils* . *FunctionFragment* . **isFunctionFragment** ( object )  **=>** *boolean*

Tra lal al




ParamType
---------


The following examples will represent the Solidity parameter:

`string foobar`


### Properties



#### *paramType* . **name** **=>** *string*

The local parameter name. This may be null for unnamed parameters. For example,
the parameter definition `string foobar` would be `foobar`.




#### *paramType* . **type** **=>** *string*

The full type of the parameter, including tuple and array symbols. This may be null
for unnamed parameters. For the above example, this would be `foobar`.




#### *paramType* . **basetype** **=>** *string*

The base type of the parameter. For primitive types (e.g. `address`, `uint256`, etc)
this is equal to [type](./). For arrays, it will be the string `array` and for
a tuple, it will be the string `tuple`.




#### *paramType* . **indexed** **=>** *boolean*

Whether the parameter has been marked as indexed. This **only** applies
to parameters which are part of an [EventFragment](./).




#### *paramType* . **arrayChildren** **=>** *[ParamType](./)*

The type of children of the array. This is null for for any parameter
wjhich is not an array.




#### *paramType* . **arrayLength** **=>** *number*

The length of the array, or `-1` for dynamic-length arrays. This is
null for parameters which is not arrays.




#### *paramType* . **components** **=>** *Array< [ParamType](./) >*

The components of a tuple. This is null for non-tuple parameters.




### Methods


Tra la la...


#### *paramType* . **format** (  [ outputType=sighash ]  ) 

Tra la la...




#### *ethers* . *utils* . *ParamType* . **from** ( objectOrString )  **=>** *[ParamType](./)*

Tra la la...




#### *ethers* . *utils* . *ParamType* . **isParamType** ( object )  **=>** *boolean*

Tra la la...





-----
**Content Hash:** b3b5bca0e0fe90226032a0727af0e449044a395b8bceb808b47a022024ee560b