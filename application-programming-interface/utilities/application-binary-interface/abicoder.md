# AbiCoder

The **AbiCoder** is a collection of Coders which can be used to encode and decode the binary data formats used to interoperate between the EVM and higher level libraries.

Most developers will never need to use this class directly, since the [Interface](interface.md) class greatly simplifies these operations.

## Creating Instance

For the most part, there should never be a need to manually create an instance of an **AbiCoder**, since one is created with the default coercion function when the library is loaded which can be used universally.

This is likely only needed by those with specific needs to override how values are coerced after they are decoded from their binary format.

#### `new hethers.utils.AbiCoder( [ coerceFunc ] )`

Create a new AbiCoder instance, which will call the _coerceFunc_ on every decode, where the result of the call will be used in the Result.

The function signature is \`(type, value)\`, where the _type_ is the string describing the type and the _value_ is the processed value from the underlying Coder.

If the callback throws, the Result will contain a property that when accessed will throw, allowing for higher level libraries to recover from data errors.



#### `hethers.utils.defaultAbiCoder ⇒ AbiCoder`

An AbiCoder created when the library is imported which is used by the [Interface](interface.md).

## Coding Methods

#### `abiCoder.encode( types , values ) ⇒ string<`[`DataHexString`](../byte-manipulation.md#datahexstring)`>` <a href="#abicoder.encode" id="abicoder.encode"></a>

Encode the array _values_ according to the array of _types_, each of which may be a string or a [ParamType](fragments.md#paramtype).

```typescript
// Encoding simple types
abiCoder.encode([ "uint", "string" ], [ 1234, "Hello World" ]);
// '0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'

// Encoding with arrays types
abiCoder.encode([ "uint[]", "string" ], [ [ 1234, 5678 ] , "Hello World" ]);
// '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004d2000000000000000000000000000000000000000000000000000000000000162e000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'

// Encoding complex structs (using positional properties)
abiCoder.encode(
  [ "uint", "tuple(uint256, string)" ],
  [
    1234,
    [ 5678, "Hello World" ]
  ]
);
// '0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000162e0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'

// Encoding complex structs (using keyword properties)
abiCoder.encode(
  [ "uint a", "tuple(uint256 b, string c) d" ],
  [
    1234,
    { b: 5678, c: "Hello World" }
  ]
);
// '0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000162e0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'
```



#### `abiCoder.decode( types , data ) ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)`` <a href="#abicoder.decode" id="abicoder.decode"></a>

Decode the _data_ according to the array of _types_, each of which may be a string or [ParamType](fragments.md#paramtype).

```typescript
// Decoding simple types
data = "0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000";
abiCoder.decode([ "uint", "string" ], data);
// [
//   { BigNumber: "1234" },
//   'Hello World'
// ]

// Decoding with arrays types
data = "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004d2000000000000000000000000000000000000000000000000000000000000162e000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000";
abiCoder.decode([ "uint[]", "string" ], data);
// [
//   [
//     { BigNumber: "1234" },
//     { BigNumber: "5678" }
//   ],
//   'Hello World'
// ]

// Decoding complex structs; unnamed parameters allows ONLY
// positional access to values
data = "0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000162e0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000";
abiCoder.decode([ "uint", "tuple(uint256, string)" ], data);
// [
//   { BigNumber: "1234" },
//   [
//     { BigNumber: "5678" },
//     'Hello World'
//   ]
// ]

// Decoding complex structs; named parameters allows positional
// or keyword access to values
abiCoder.decode([ "uint a", "tuple(uint256 b, string c) d" ], data);
// [
//   { BigNumber: "1234" },
//   [
//     { BigNumber: "5678" },
//     'Hello World',
//     b: { BigNumber: "5678" },
//     c: 'Hello World'
//   ],
//   a: { BigNumber: "1234" },
//   d: [
//     { BigNumber: "5678" },
//     'Hello World',
//     b: { BigNumber: "5678" },
//     c: 'Hello World'
//   ]
// ]
```
