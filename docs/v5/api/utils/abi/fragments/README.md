-----

Documentation: [html](https://docs.ethers.io/)

-----

Fragments
=========

Formats
-------

### JSON String ABI (Solidity Output JSON)

### Humanb-Readable ABI

```
const ABI = [
  // Constructor
  "constructor(address ens)",

  // Constant functions (pure or view)
  "function balanceOf(address owner) view returns (uint)",

  // State-mutating functions (payable or non-payable)
  "function mint(uint amount) payable",
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",

  // Errors
  "error InsufficientFunds(address from, uint balance)",
]
```

### Output Formats

#### *ethers* . *utils* . *FormatTypes* . **full** => *string*

This is a full human-readable string, including all parameter names, any optional modifiers (e.g. `indexed`, `public`, etc) and white-space to aid in human readability.


#### *ethers* . *utils* . *FormatTypes* . **minimal** => *string*

This is similar to `full`, except with no unnecessary whitespace or parameter names. This is useful for storing a minimal string which can still fully reconstruct the original Fragment using [Fragment&thinsp;.&thinsp;from](/v5/api/utils/abi/fragments/#Fragment-from).


#### *ethers* . *utils* . *FormatTypes* . **json** => *string*

This returns a JavaScript Object which is safe to call `JSON.stringify` on to create a JSON string.


#### *ethers* . *utils* . *FormatTypes* . **sighash** => *string*

This is a minimal output format, which is used by Solidity when computing a signature hash or an event topic hash.


#### Note

The `sighash` format is **insufficient** to re-create the original [Fragment](/v5/api/utils/abi/fragments/#Fragment), since it discards modifiers such as indexed, anonymous, stateMutability, etc.

It is only useful for computing the selector for a Fragment, and cannot be used to format an Interface.


Fragment
--------

### Properties

#### *fragment* . **name** => *string*

This is the name of the Event or Function. This will be null for a [ConstructorFragment](/v5/api/utils/abi/fragments/#ConstructorFragment).


#### *fragment* . **type** => *string*

This is a string which indicates the type of the [Fragment](/v5/api/utils/abi/fragments/#Fragment). This will be one of:

- `constructor` 
- `event` 
- `function` 




#### *fragment* . **inputs** => *Array< [ParamType](/v5/api/utils/abi/fragments/#ParamType) >*

This is an array of each [ParamType](/v5/api/utils/abi/fragments/#ParamType) for the input parameters to the Constructor, Event of Function.


### Methods

#### *fragment* . **format**( [ format = sighash ] ) => *string*

Creates a string representation of the Fragment using the available [output formats](/v5/api/utils/abi/fragments/#fragments--output-formats).


#### *ethers* . *utils* . *Fragment* . **from**( objectOrString ) => *[Fragment](/v5/api/utils/abi/fragments/#Fragment)*

Creates a new **Fragment** sub-class from any compatible *objectOrString*.


#### *ethers* . *utils* . *Fragment* . **isFragment**( object ) => *boolean*

Returns true if *object* is a **Fragment**.


ConstructorFragment
-------------------

### Properties

#### *fragment* . **gas** => *[BigNumber](/v5/api/utils/bignumber/)*

This is the gas limit that should be used during deployment. It may be null.


#### *fragment* . **payable** => *boolean*

This is whether the constructor may receive ether during deployment as an endowment (i.e. msg.value != 0).


#### *fragment* . **stateMutability** => *string*

This is the state mutability of the constructor. It can be any of:

- `nonpayable` 
- `payable` 




### Methods

#### *ethers* . *utils* . *ConstructorFragment* . **from**( objectOrString ) => *[ConstructorFragment](/v5/api/utils/abi/fragments/#ConstructorFragment)*

Creates a new **ConstructorFragment** from any compatible *objectOrString*.


#### *ethers* . *utils* . *ConstructorFragment* . **isConstructorFragment**( object ) => *boolean*

Returns true if *object* is a **ConstructorFragment**.


ErrorFragment
-------------

### Methods

#### *ethers* . *utils* . *ErrorFragment* . **from**( objectOrString ) => *[ErrorFragment](/v5/api/utils/abi/fragments/#ErrorFragment)*

Creates a new **ErrorFragment** from any compatible *objectOrString*.


#### *ethers* . *utils* . *ErrorFragment* . **isErrorFragment**( object ) => *boolean*

Returns true if *object* is an **ErrorFragment**.


EventFragment
-------------

### Properties

#### *fragment* . **anonymous** => *boolean*

This is whether the event is anonymous. An anonymous Event does not inject its topic hash as topic0 when creating a log.


### Methods

#### *ethers* . *utils* . *EventFragment* . **from**( objectOrString ) => *[EventFragment](/v5/api/utils/abi/fragments/#EventFragment)*

Creates a new **EventFragment** from any compatible *objectOrString*.


#### *ethers* . *utils* . *EventFragment* . **isEventFragment**( object ) => *boolean*

Returns true if *object* is an **EventFragment**.


FunctionFragment
----------------

### Properties

#### *fragment* . **constant** => *boolean*

This is whether the function is constant (i.e. does not change state). This is true if the state mutability is `pure` or `view`.


#### *fragment* . **stateMutability** => *string*

This is the state mutability of the constructor. It can be any of:

- `nonpayable` 
- `payable` 
- `pure` 
- `view` 




#### *fragment* . **outputs** => *Array< [ParamType](/v5/api/utils/abi/fragments/#ParamType) >*

A list of the Function output parameters.


### Methods

#### *ethers* . *utils* . *FunctionFragment* . **from**( objectOrString ) => *[FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment)*

Creates a new **FunctionFragment** from any compatible *objectOrString*.


#### *ethers* . *utils* . *FunctionFragment* . **isFunctionFragment**( object ) => *boolean*

Returns true if *object* is a **FunctionFragment**.


ParamType
---------

### Properties

#### *paramType* . **name** => *string*

The local parameter name. This may be null for unnamed parameters. For example, the parameter definition `string foobar` would be `foobar`.


#### *paramType* . **type** => *string*

The full type of the parameter, including tuple and array symbols. This may be null for unnamed parameters. For the above example, this would be `foobar`.


#### *paramType* . **baseType** => *string*

The base type of the parameter. For primitive types (e.g. `address`, `uint256`, etc) this is equal to [type](/v5/api/utils/abi/fragments/#ParamType-type). For arrays, it will be the string `array` and for a tuple, it will be the string `tuple`.


#### *paramType* . **indexed** => *boolean*

Whether the parameter has been marked as indexed. This **only** applies to parameters which are part of an [EventFragment](/v5/api/utils/abi/fragments/#EventFragment).


#### *paramType* . **arrayChildren** => *[ParamType](/v5/api/utils/abi/fragments/#ParamType)*

The type of children of the array. This is null for any parameter which is not an array.


#### *paramType* . **arrayLength** => *number*

The length of the array, or `-1` for dynamic-length arrays. This is null for parameters which are not arrays.


#### *paramType* . **components** => *Array< [ParamType](/v5/api/utils/abi/fragments/#ParamType) >*

The components of a tuple. This is null for non-tuple parameters.


### Methods

#### *paramType* . **format**( [ outputType = sighash ] )

Creates a string representation of the Fragment using the available [output formats](/v5/api/utils/abi/fragments/#fragments--output-formats).


#### *ethers* . *utils* . *ParamType* . **from**( objectOrString ) => *[ParamType](/v5/api/utils/abi/fragments/#ParamType)*

Creates a new **ParamType** from any compatible *objectOrString*.


#### *ethers* . *utils* . *ParamType* . **isParamType**( object ) => *boolean*

Returns true if *object* is a **ParamType**.


