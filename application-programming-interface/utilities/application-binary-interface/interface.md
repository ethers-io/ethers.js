# Interface

The **Interface** Class abstracts the encoding and decoding required to interact with contracts on the Hedera Hashgraph.

Many of the standards organically evolved along side the [Solidity](https://solidity.readthedocs.io) language, which other languages have adopted to remain compatible with existing deployed contracts.

The EVM itself does not understand what the ABI is. It is simply an agreed upon set of formats to encode various types of data which each contract can expect so they can interoperate with each other.

## Creating Instances

#### `new hethers.utils.Interface( abi )` <a href="#utils.interface" id="utils.interface"></a>

Create a new **Interface** from a JSON string or object representing _abi_.

The _abi_ may be a JSON string or the parsed Object (using JSON.parse) which is emitted by the [Solidity compiler](https://solidity.readthedocs.io/en/v0.6.0/using-the-compiler.html#output-description) (or compatible languages).

The _abi_ may also be a [Human-Readable Abi](https://blog.ricmoo.com/human-readable-contract-abis-in-ethers-js-141902f4d917).

```typescript
// This interface is used for the below examples

const iface = new Interface([
  // Constructor
  "constructor(string symbol, string name)",

  // State mutating method
  "function transferFrom(address from, address to, uint amount)",

  // State mutating method, which is payable
  "function mint(uint amount) payable",

  // Constant method (i.e. "view" or "pure")
  "function balanceOf(address owner) view returns (uint)",

  // An Event
  "event Transfer(address indexed from, address indexed to, uint256 amount)",

  // A Custom Solidity Error
  "error AccountLocked(address owner, uint256 balance)",

  // Examples with structured types
  "function addUser(tuple(string name, address addr) user) returns (uint id)",
  "function addUsers(tuple(string name, address addr)[] user) returns (uint[] id)",
  "function getUser(uint id) view returns (tuple(string name, address addr) user)"
]);
```

### Properties

#### `interface.fragments ⇒ Array<`[`Fragment`](fragments.md#fragment)`>`

All the Fragments in the interface.

#### `interface.errors ⇒ Array<`[`ErrorFragment`](fragments.md#errorfragment-inherits-fragment)`>`

All the Error Fragments in the interface.

#### `interface.events ⇒ Array<`[`EventFragment`](fragments.md#eventfragment-inherits-fragment)`>`

All the Event Fragments in the interface.

#### `interface.functions ⇒ Array<`[`FunctionFragment`](fragments.md#functionfragment-inherits-constructorfragment)`>`

All the Function Fragments in the interface

#### `interface.deploy ⇒` [`ConstructorFragment`](fragments.md#constructorfragment-inherits-fragment)``

The Constructor Fragments for the interface.

### Formatting

#### `interface.format( [ format ] ) ⇒ string | Array<string>`

Return the formatted **Interface**. If the format type is `json` a single string is returned, otherwise an Array of the human-readable strings is returned.

```typescript
const FormatTypes = hethers.utils.FormatTypes;

iface.format(FormatTypes.json)
// '[{"type":"constructor","payable":false,"inputs":[{"type":"string","name":"symbol"},{"type":"string","name":"name"}]},{"type":"function","name":"transferFrom","constant":false,"payable":false,"inputs":[{"type":"address","name":"from"},{"type":"address","name":"to"},{"type":"uint256","name":"amount"}],"outputs":[]},{"type":"function","name":"mint","constant":false,"stateMutability":"payable","payable":true,"inputs":[{"type":"uint256","name":"amount"}],"outputs":[]},{"type":"function","name":"balanceOf","constant":true,"stateMutability":"view","payable":false,"inputs":[{"type":"address","name":"owner"}],"outputs":[{"type":"uint256"}]},{"type":"event","anonymous":false,"name":"Transfer","inputs":[{"type":"address","name":"from","indexed":true},{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"amount"}]},{"type":"error","name":"AccountLocked","inputs":[{"type":"address","name":"owner"},{"type":"uint256","name":"balance"}]},{"type":"function","name":"addUser","constant":false,"payable":false,"inputs":[{"type":"tuple","name":"user","components":[{"type":"string","name":"name"},{"type":"address","name":"addr"}]}],"outputs":[{"type":"uint256","name":"id"}]},{"type":"function","name":"addUsers","constant":false,"payable":false,"inputs":[{"type":"tuple[]","name":"user","components":[{"type":"string","name":"name"},{"type":"address","name":"addr"}]}],"outputs":[{"type":"uint256[]","name":"id"}]},{"type":"function","name":"getUser","constant":true,"stateMutability":"view","payable":false,"inputs":[{"type":"uint256","name":"id"}],"outputs":[{"type":"tuple","name":"user","components":[{"type":"string","name":"name"},{"type":"address","name":"addr"}]}]}]'

iface.format(FormatTypes.full)
// [
//   'constructor(string symbol, string name)',
//   'function transferFrom(address from, address to, uint256 amount)',
//   'function mint(uint256 amount) payable',
//   'function balanceOf(address owner) view returns (uint256)',
//   'event Transfer(address indexed from, address indexed to, uint256 amount)',
//   'error AccountLocked(address owner, uint256 balance)',
//   'function addUser(tuple(string name, address addr) user) returns (uint256 id)',
//   'function addUsers(tuple(string name, address addr)[] user) returns (uint256[] id)',
//   'function getUser(uint256 id) view returns (tuple(string name, address addr) user)'
// ]

iface.format(FormatTypes.minimal)
// [
//   'constructor(string,string)',
//   'function transferFrom(address,address,uint256)',
//   'function mint(uint256) payable',
//   'function balanceOf(address) view returns (uint256)',
//   'event Transfer(address indexed,address indexed,uint256)',
//   'error AccountLocked(address,uint256)',
//   'function addUser(tuple(string,address)) returns (uint256)',
//   'function addUsers(tuple(string,address)[]) returns (uint256[])',
//   'function getUser(uint256) view returns (tuple(string,address))'
// ]
```

### Fragment Access

#### `interface.getFunction( fragment ) ⇒` [`FunctionFragment`](fragments.md#functionfragment-inherits-constructorfragment)``

Returns the [FunctionFragment](fragments.md#functionfragment-inherits-constructorfragment) for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)).

```typescript
// By method signature, which is normalized so whitespace
// and superfluous attributes are ignored
iface.getFunction("transferFrom(address, address, uint256)");

// By name; this ONLY works if the method is non-ambiguous
iface.getFunction("transferFrom");

// By method selector
iface.getFunction("0x23b872dd");

// Throws if the method does not exist
iface.getFunction("doesNotExist()");
// [Error: no matching function] {
//   argument: 'signature',
//   code: 'INVALID_ARGUMENT',
//   reason: 'no matching function',
//   value: 'doesNotExist()'
// }
```

#### `interface.getError( fragment ) ⇒` [`ErrorFragment`](fragments.md#errorfragment-inherits-fragment)``

Returns the [ErrorFragment](fragments.md#errorfragment-inherits-fragment) for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)).

```typescript
// By error signature, which is normalized so whitespace
// and superfluous attributes are ignored
iface.getError("AccountLocked(address, uint256)");

// By name; this ONLY works if the error is non-ambiguous
iface.getError("AccountLocked");

// By error selector
iface.getError("0xf7c3865a");

// Throws if the error does not exist
iface.getError("DoesNotExist()");
// [Error: no matching error] {
//   argument: 'signature',
//   code: 'INVALID_ARGUMENT',
//   reason: 'no matching error',
//   value: 'DoesNotExist()'
// }
```

#### `interface.getEvent( fragment ) ⇒` [`EventFragment`](fragments.md#eventfragment-inherits-fragment)``

Returns the [EventFragment](fragments.md#eventfragment-inherits-fragment) for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)).

```typescript
// By event signature, which is normalized so whitespace
// and superfluous attributes are ignored
iface.getEvent("Transfer(address, address, uint256)");

// By name; this ONLY works if the event is non-ambiguous
iface.getEvent("Transfer");

// By event topic hash
iface.getEvent("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");

// Throws if the event does not exist
iface.getEvent("DoesNotExist()");
// [Error: no matching event] {
//   argument: 'signature',
//   code: 'INVALID_ARGUMENT',
//   reason: 'no matching event',
//   value: 'DoesNotExist()'
// }
```

### Signature and Topic Hashes

#### `interface.getSighash( fragment ) ⇒ string<`[`DataHexString`](../byte-manipulation.md#datahexstring)`<4>>`

Return the sighash (or Function Selector) for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)).

{% code title="" %}
```typescript
iface.getSighash("balanceOf");
// '0x70a08231'

iface.getSighash("balanceOf(address)");
// '0x70a08231'

const fragment = iface.getFunction("balanceOf")
iface.getSighash(fragment);
// '0x70a08231'
```
{% endcode %}

#### `interface.getEventTopic( fragment ) ⇒ string<`[`DataHexString`](../byte-manipulation.md#datahexstring)`<32>>`

Return the topic hash for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)).

```typescript
iface.getEventTopic("Transfer");
// '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

iface.getEventTopic("Transfer(address, address, uint)");
// '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const fragment = iface.getEvent("Transfer")
iface.getEventTopic(fragment);
// '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
```

### Encoding Data

#### `interface.encodeDeploy( [ values ] ) ⇒ string<`[`DataHexString`](../byte-manipulation.md#datahexstring)`>`

Return the encoded deployment data, which can be concatenated to the deployment bytecode of a contract to pass _values_ into the contract constructor.

```typescript
// The data that should be appended to the bytecode to pass
// parameters to the constructor during deployment
iface.encodeDeploy([ "SYM", "Some Name" ])
// '0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000353594d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009536f6d65204e616d650000000000000000000000000000000000000000000000'
```

#### `interface.encodeErrorResult( fragment [, values ] ) ⇒ string<`[`DataHexString`](../byte-manipulation.md#datahexstring)`>`

Returns the encoded error result, which would normally be the response from a reverted call for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)) for the given _values_.

Most developers will not need this method, but may be useful for authors of a mock hashgraph.

```typescript
// Encoding result data (like is returned by eth_call during a revert)
iface.encodeErrorResult("AccountLocked", [
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  parseHbar("1.0")
]);
// '0xf7c3865a0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000de0b6b3a7640000'

```

#### `interface.encodeFilterTopics( fragment, values ) ⇒ Array<topic | Array<topic>>`

Returns the encoded topic filter, which can be passed to getLogs for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)) for the given _values_.

Each _topic_ is a 32 byte (64 nibble) [DataHexString](../byte-manipulation.md#datahexstring).

```typescript
// Filter that matches all Transfer events
iface.encodeFilterTopics("Transfer", [])
// [
//   '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
// ]

// Filter that matches the sender
iface.encodeFilterTopics("Transfer", [
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
])
// [
//   '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//   '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72'
// ]

// Filter that matches the receiver
iface.encodeFilterTopics("Transfer", [
  null,
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
])
// [
//   '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//   null,
//   '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72'
// ]
```

#### `interface.encodeFunctionData( fragment [, values ] ) ⇒ string<`[`DataHexString`](../byte-manipulation.md#datahexstring)`>`

Returns the encoded data, which can be used as the data for a transaction for _fragment_ (see Specifying Fragments) for the given _values_.

```typescript
// Encoding data for the tx.data of a call or transaction
iface.encodeFunctionData("transferFrom", [
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  "0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C",
  parseHbar("1.0")
])
// '0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000'

// Encoding structured data (using positional Array)
user = [
   "Richard Moore",
   "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
];
iface.encodeFunctionData("addUser", [ user ]);
// '0x43967833000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000000000000000000000000000000000000000000d52696368617264204d6f6f726500000000000000000000000000000000000000'

// Encoding structured data, using objects. Only available
// if paramters are named.
user = {
   name: "Richard Moore",
   addr: "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
};
iface.encodeFunctionData("addUser", [ user ]);
// '0x43967833000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000000000000000000000000000000000000000000d52696368617264204d6f6f726500000000000000000000000000000000000000'
```

#### `interface.encodeFunctionResult( fragment [, values ] ) ⇒ string<`[`DataHexString`](../byte-manipulation.md#datahexstring)`>`

Returns the encoded result, which would normally be the response from a call for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)) for the given _values_.

Most developers will not need this method, but may be useful for authors of a mock hashgraph.

```typescript
// Encoding result data (like is returned by eth_call)
iface.encodeFunctionResult("balanceOf", [
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
])
// '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72'
```

### Decoding Data

#### `interface.decodeErrorResult( fragment, data ) ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)``

Returns the decoded values from the result of a call during a revert for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)) for the given _data_.

Most developers won't need this, as the `decodeFunctionResult` will automatically decode errors if the _data_ represents a revert.

```typescript
// Decoding result data (e.g. from an eth_call)
errorData = "0xf7c3865a0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000de0b6b3a7640000";

iface.decodeErrorResult("AccountLocked", errorData)
// [
//   '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//   { BigNumber: "1000000000000000000" },
//   balance: { BigNumber: "1000000000000000000" },
//   owner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
// ]
```

#### `interface.decodeEventLog( fragment, data [, topics ] ) ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)``

Returns the decoded event values from an event log for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)) for the given _data_ with the optional _topics_.

If _topics_ is not specified, placeholders will be inserted into the result.

Most developers will find the [parsing methods](interface.md#parsing) more convenient for decoding event data, as they will automatically detect the matching event.

```typescript
// Decoding log data and topics (the entries in a receipt)
const data = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
const topics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72",
  "0x000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c"
];

iface.decodeEventLog("Transfer", data, topics);
// [
//   '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//   '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
//   { BigNumber: "1000000000000000000" },
//   amount: { BigNumber: "1000000000000000000" },
//   from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//   to: '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C'
// ]
```

#### `interface.decodeFunctionData( fragment, data ) ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)``

Returns the decoded values from transaction data for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)) for the given _data_.

Most developers will not need this method, but may be useful for debugging or inspecting transactions.

Most developers will also find the [parsing methods](interface.md#parsing) more convenient for decoding transaction data, as they will automatically detect the matching function.

```typescript
// Decoding function data (the value of tx.data)
const txData = "0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000";
iface.decodeFunctionData("transferFrom", txData);
// [
//   '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//   '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
//   { BigNumber: "1000000000000000000" },
//   amount: { BigNumber: "1000000000000000000" },
//   from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//   to: '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C'
// ]
```

#### `interface.decodeFunctionResult( fragment, data ) ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)``

Returns the decoded values from the result of a call for _fragment_ (see [Specifying Fragments](interface.md#specifying-fragments)) for the given _data_.

```typescript
// Decoding result data (e.g. from an eth_call)
resultData = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
iface.decodeFunctionResult("balanceOf", resultData)
// [
//   { BigNumber: "1000000000000000000" }
// ]

// Decoding result data which was caused by a revert
// Throws a CALL_EXCEPTION, with extra details
errorData = "0xf7c3865a0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000de0b6b3a7640000";
iface.decodeFunctionResult("balanceOf", errorData)
// [Error: call revert exception] {
//   code: 'CALL_EXCEPTION',
//   errorArgs: [
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     { BigNumber: "1000000000000000000" },
//     balance: { BigNumber: "1000000000000000000" },
//     owner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
//   ],
//   errorName: 'AccountLocked',
//   errorSignature: 'AccountLocked(address,uint256)',
//   method: 'balanceOf(address)',
//   reason: null
// }

// Decoding structured data returns a Result object, which
// will include all values positionally and if the ABI
// included names, values will additionally be available
// by their name.
resultData = "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000000000000000000000000000000000000000000d52696368617264204d6f6f726500000000000000000000000000000000000000";
result = iface.decodeFunctionResult("getUser", resultData);
// [
//   [
//     'Richard Moore',
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     addr: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     name: 'Richard Moore'
//   ],
//   user: [
//     'Richard Moore',
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     addr: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     name: 'Richard Moore'
//   ]
// ]

// Access positionally:
// The 0th output parameter, the 0th proerty of the structure
result[0][0];
// 'Richard Moore'

// Access by name: (only avilable because parameters were named)
result.user.name
// 'Richard Moore'
```

### Parsing

The functions are generally the most useful for most developers. They will automatically search the ABI for a matching Event or Function and decode the components as a fully specified descriptio

#### `interface.parseError( data ) ⇒` [`ErrorDescription`](interface.md#error-description)``

Search for the error that matches the error selector in _data_ and parse out the details.

```typescript
const data = "0xf7c3865a0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000de0b6b3a7640000";

iface.parseError(data);
// ErrorDescription {
//   args: [
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     { BigNumber: "1000000000000000000" },
//     balance: { BigNumber: "1000000000000000000" },
//     owner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
//   ],
//   errorFragment: [class ErrorFragment],
//   name: 'AccountLocked',
//   sighash: '0xf7c3865a',
//   signature: 'AccountLocked(address,uint256)'
// }
```

#### `interface.parseLog( log ) ⇒` [`LogDescription`](interface.md#logdescription)``

Search the event that matches the _log_ topic hash and parse the values the log represents.

```typescript
const data = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
const topics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72",
  "0x000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c"
];

iface.parseLog({ data, topics });
// LogDescription {
//   args: [
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
//     { BigNumber: "1000000000000000000" },
//     amount: { BigNumber: "1000000000000000000" },
//     from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     to: '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C'
//   ],
//   eventFragment: [class EventFragment],
//   name: 'Transfer',
//   signature: 'Transfer(address,address,uint256)',
//   topic: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
// }
```

#### `interface.parseTransaction( transaction ) ⇒` [`TransactionDescription`](interface.md#transactiondescription)``

Search for the function that matches the _transaction_ data sighash and parse the transaction properties.

```typescript
const data = "0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000";
const value = parseHbar("1.0");

iface.parseTransaction({ data, value });
// TransactionDescription {
//   args: [
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
//     { BigNumber: "1000000000000000000" },
//     amount: { BigNumber: "1000000000000000000" },
//     from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     to: '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C'
//   ],
//   functionFragment: [class FunctionFragment],
//   name: 'transferFrom',
//   sighash: '0x23b872dd',
//   signature: 'transferFrom(address,address,uint256)',
//   value: { BigNumber: "1000000000000000000" }
// }
```

## Types

### Result (inherits Array\<any>)

A **Result** is an array, so each value can be accessed as a positional argument.

Additionally, if values are named, the identical object as its positional value can be accessed by its name.

The name `length` is however reserved as it is part of the Array, so any named value for this key is renamed to `_length`. If there is a name collision, only the first is available by its key.

### Error Description

#### `errorDescription.args ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)``

The values of the input parameters of the error.

#### `errorDescription.errorFragment ⇒` [`ErrorFragment`](fragments.md#errorfragment-inherits-fragment)``

The [ErrorFragment](fragments.md#errorfragment-inherits-fragment) which matches the selector in the data.

#### `errorDescription.name ⇒ string`

The error name. (e.g. `AccountLocked`)

#### `errorDescription.signature ⇒ string`

The error signature. (e.g. `AccountLocked(address,uint256)`)

#### `errorDescription.sighash ⇒ string`

The selector of the error.

### LogDescription

#### `logDescription.args ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)``

The values of the input parameters of the event.

#### `logDescription.eventFragment ⇒` [`EventFragment`](fragments.md#eventfragment-inherits-fragment)``

The [EventFragment](fragments.md#eventfragment-inherits-fragment) which matches the topic in the Log.

#### `logDescription.name ⇒ string`

The event name. (e.g. `Transfer`)

#### `logDescription.signature ⇒ string`

The event signature. (e.g. `Transfer(address,address,uint256)`)

#### `logDescription.topic ⇒ string`

The topic hash.

### TransactionDescription

#### `transactionDescription.args ⇒` [`Result`](interface.md#result-inherits-array-less-than-any-greater-than)``

The decoded values from the transaction data which were passed as the input parameters.

#### `transactionDescription.functionFragment ⇒` [`FunctionFragment`](fragments.md#functionfragment-inherits-constructorfragment)``

The [FunctionFragment](fragments.md#functionfragment-inherits-constructorfragment) which matches the sighash in the transaction data.

#### `transactionDescription.name ⇒ string`

The name of the function. (e.g. `transfer`)

#### `transactionDescription.sighash ⇒ string`

The sighash (or function selector) that matched the transaction data.

#### `transactionDescription.signature ⇒ string`

The signature of the function. (e.g. `transfer(address,uint256)`)

#### `transactionDescription.value ⇒` [`BigNumber`](../bignumber.md)``

The value from the transaction.

## Specifying Fragments

When specifying a fragment to any of the functions in an **Interface**, any of the following may be used:

* The **name** of the event or function, if it is unique and non-ambiguous within the ABI (e.g. `transfer`)
* The **signature** of the event or function. The signature is normalized, so, for example, `uint` and `uint256` are equivalent (e.g. `transfer(address, uint)`)
* The **sighash** or **topichash** of the function. The sighash is often referred to the function selector in Solidity (e.g. `0xa9059cbb`)
* A [Fragment](fragments.md)
