-----

Documentation: [html](https://docs.ethers.io/)

-----

Interface
=========

Creating Instances
------------------

#### **new ***ethers* . *utils* . **Interface**( abi )

Create a new **Interface** from a JSON string or object representing *abi*.

The *abi* may be a JSON string or the parsed Object (using JSON.parse) which is emitted by the [Solidity compiler](https://solidity.readthedocs.io/en/v0.6.0/using-the-compiler.html#output-description) (or compatible languages).

The *abi* may also be a [Human-Readable Abi](https://blog.ricmoo.com/human-readable-contract-abis-in-ethers-js-141902f4d917), which is a format the Ethers created to simplify manually typing the ABI into the source and so that a Contract ABI can also be referenced easily within the same source file.


```javascript
//_hide: const Interface = ethers.utils.Interface;

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

//_hide: _page.iface = iface;
```

Properties
----------

#### *interface* . **fragments** => *Array< [Fragment](/v5/api/utils/abi/fragments/#Fragment) >*

All the [Fragments](/v5/api/utils/abi/fragments/#Fragment) in the interface.


#### *interface* . **errors** => *Array< [ErrorFragment](/v5/api/utils/abi/fragments/#ErrorFragment) >*

All the [Error Fragments](/v5/api/utils/abi/fragments/#ErrorFragment) in the interface.


#### *interface* . **events** => *Array< [EventFragment](/v5/api/utils/abi/fragments/#EventFragment) >*

All the [Event Fragments](/v5/api/utils/abi/fragments/#EventFragment) in the interface.


#### *interface* . **functions** => *Array< [FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment) >*

All the [Function Fragments](/v5/api/utils/abi/fragments/#FunctionFragment) in the interface.


#### *interface* . **deploy** => *[ConstructorFragment](/v5/api/utils/abi/fragments/#ConstructorFragment)*

The [Constructor Fragments](/v5/api/utils/abi/fragments/#ConstructorFragment) for the interface.


Formatting
----------

#### *interface* . **format**( [ format ] ) => *string | Array< string >*

Return the formatted **Interface**. If the format type is `json` a single string is returned, otherwise an Array of the human-readable strings is returned.


```javascript
//_hide: const iface = _page.iface;

const FormatTypes = ethers.utils.FormatTypes;

//_result:
iface.format(FormatTypes.json)
//_log:

//_result:
iface.format(FormatTypes.full)
//_log:

//_result:
iface.format(FormatTypes.minimal)
//_log:
```

Fragment Access
---------------

#### *interface* . **getFunction**( fragment ) => *[FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment)*

Returns the [FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment) for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


```javascript
//_hide: const iface = _page.iface;

// By method signature, which is normalized so whitespace
// and superfluous attributes are ignored
iface.getFunction("transferFrom(address, address, uint256)");

// By name; this ONLY works if the method is non-ambiguous
iface.getFunction("transferFrom");

// By method selector
iface.getFunction("0x23b872dd");

// Throws if the method does not exist
//_throws:
iface.getFunction("doesNotExist()");
//_log:
```

#### *interface* . **getError**( fragment ) => *[ErrorFragment](/v5/api/utils/abi/fragments/#ErrorFragment)*

Returns the [ErrorFragment](/v5/api/utils/abi/fragments/#ErrorFragment) for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


```javascript
//_hide: const iface = _page.iface;

// By error signature, which is normalized so whitespace
// and superfluous attributes are ignored
iface.getError("AccountLocked(address, uint256)");

// By name; this ONLY works if the error is non-ambiguous
iface.getError("AccountLocked");

// By error selector
iface.getError("0xf7c3865a");

// Throws if the error does not exist
//_throws:
iface.getError("DoesNotExist()");
//_log:
```

#### *interface* . **getEvent**( fragment ) => *[EventFragment](/v5/api/utils/abi/fragments/#EventFragment)*

Returns the [EventFragment](/v5/api/utils/abi/fragments/#EventFragment) for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


```javascript
//_hide: const iface = _page.iface;

// By event signature, which is normalized so whitespace
// and superfluous attributes are ignored
iface.getEvent("Transfer(address, address, uint256)");

// By name; this ONLY works if the event is non-ambiguous
iface.getEvent("Transfer");

// By event topic hash
iface.getEvent("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");

// Throws if the event does not exist
//_throws:
iface.getEvent("DoesNotExist()");
//_log:
```

Signature and Topic Hashes
--------------------------

#### *interface* . **getSighash**( fragment ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 4 > >*

Return the sighash (or Function Selector) for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


```javascript
//_hide: const iface = _page.iface;

//_result:
iface.getSighash("balanceOf");
//_log:

//_result:
iface.getSighash("balanceOf(address)");
//_log:

const fragment = iface.getFunction("balanceOf")
//_result:
iface.getSighash(fragment);
//_log:
```

#### *interface* . **getEventTopic**( fragment ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Return the topic hash for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


```javascript
//_hide: const iface = _page.iface;

//_result:
iface.getEventTopic("Transfer");
//_log:

//_result:
iface.getEventTopic("Transfer(address, address, uint)");
//_log:

const fragment = iface.getEvent("Transfer")
//_result:
iface.getEventTopic(fragment);
//_log:
```

Encoding Data
-------------

#### *interface* . **encodeDeploy**( [ values ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Return the encoded deployment data, which can be concatenated to the deployment bytecode of a contract to pass *values* into the contract constructor.


```javascript
//_hide: const iface = _page.iface;
//_hide: const parseEther = ethers.utils.parseEther;

// The data that should be appended to the bytecode to pass
// parameters to the constructor during deployment
//_result:
iface.encodeDeploy([ "SYM", "Some Name" ])
//_log:
```

#### *interface* . **encodeFilterTopics**( fragment , values ) => *Array< topic | Array< topic > >*

Returns the encoded topic filter, which can be passed to getLogs for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *values*.

Each *topic* is a 32 byte (64 nibble) [DataHexString](/v5/api/utils/bytes/#DataHexString).


```javascript
//_hide: const iface = _page.iface;
//_hide: const parseEther = ethers.utils.parseEther;

// Filter that matches all Transfer events
//_result:
iface.encodeFilterTopics("Transfer", [])
//_log:

// Filter that matches the sender
//_result:
iface.encodeFilterTopics("Transfer", [
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
])
//_log:

// Filter that matches the receiver
//_result:
iface.encodeFilterTopics("Transfer", [
  null,
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
])
//_log:
```

#### *interface* . **encodeFunctionData**( fragment [ , values ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the encoded data, which can be used as the data for a transaction for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *values*.


```javascript
//_hide: const iface = _page.iface;
//_hide: const parseEther = ethers.utils.parseEther;

// Encoding data for the tx.data of a call or transaction
//_result:
iface.encodeFunctionData("transferFrom", [
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  "0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C",
  parseEther("1.0")
])
//_log:

// Encoding structured data (using positional Array)
user = [
   "Richard Moore",
   "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
];
//_result:
iface.encodeFunctionData("addUser", [ user ]);
//_log:

// Encoding structured data, using objects. Only available
// if paramters are named.
user = {
   name: "Richard Moore",
   addr: "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
};
//_result:
iface.encodeFunctionData("addUser", [ user ]);
//_log:
```

#### *interface* . **encodeFunctionResult**( fragment [ , values ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the encoded result, which would normally be the response from a call for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *values*.

Most developers will not need this method, but may be useful for authors of a mock blockchain.


```javascript
//_hide: const iface = _page.iface;
//_hide: const parseEther = ethers.utils.parseEther;

// Encoding result data (like is returned by eth_call)
//_result:
iface.encodeFunctionResult("balanceOf", [
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
])
//_log:
```

Decoding Data
-------------

#### *interface* . **decodeEventLog**( fragment , data [ , topics ] ) => *[Result](/v5/api/utils/abi/interface/#Result)*

Returns the decoded event values from an event log for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *data* with the optional *topics*.

If *topics* is not specified, placeholders will be inserted into the result.

Most develoeprs will find the [parsing methods](/v5/api/utils/abi/interface/#Interface--parsing) more convenient for decoding event data, as they will automatically detect the matching event.


```javascript
//_hide: const iface = _page.iface;

// Decoding log data and topics (the entries in a receipt)
const data = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
const topics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72",
  "0x000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c"
];

//_result:
iface.decodeEventLog("Transfer", data, topics);
//_log:
```

#### *interface* . **decodeFunctionData**( fragment , data ) => *[Result](/v5/api/utils/abi/interface/#Result)*

Returns the decoded values from transaction data for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *data*.

Most developers will not need this method, but may be useful for debugging or inspecting transactions.

Most develoeprs will also find the [parsing methods](/v5/api/utils/abi/interface/#Interface--parsing) more convenient for decoding transation data, as they will automatically detect the matching function.


```javascript
//_hide: const iface = _page.iface;

// Decoding function data (the value of tx.data)
const txData = "0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000";
//_result:
iface.decodeFunctionData("transferFrom", txData);
//_log:
```

#### *interface* . **decodeFunctionResult**( fragment , data ) => *[Result](/v5/api/utils/abi/interface/#Result)*

Returns the decoded values from the result of a call for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *data*.


```javascript
//_hide: const iface = _page.iface;

// Decoding result data (e.g. from an eth_call)
resultData = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
//_result:
iface.decodeFunctionResult("balanceOf", resultData)
//_log:

// Decoding result data which was caused by a revert
// Throws a CALL_EXCEPTION, with extra details
errorData = "0xf7c3865a0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000de0b6b3a7640000";
//_throws:
iface.decodeFunctionResult("balanceOf", errorData)
//_log:

// Decoding structured data returns a Result object, which
// will include all values positionally and if the ABI
// included names, values will additionally be available
// by their name.
resultData = "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000000000000000000000000000000000000000000d52696368617264204d6f6f726500000000000000000000000000000000000000";
//_result:
result = iface.decodeFunctionResult("getUser", resultData);
//_log:

// Access positionally:
// The 0th output parameter, the 0th proerty of the structure
//_result:
result[0][0];
//_log:

// Access by name: (only avilable because parameters were named)
//_result:
result.user.name
//_log:
```

Parsing
-------

#### *interface* . **parseLog**( log ) => *[LogDescription](/v5/api/utils/abi/interface/#LogDescription)*

Search the event that matches the *log* topic hash and parse the values the log represents.


```javascript
//_hide: const iface = _page.iface;

const data = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
const topics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72",
  "0x000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c"
];

//_result:
iface.parseLog({ data, topics });
//_hide: _.eventFragment = createClass("EventFragment");
//_log:
```

#### *interface* . **parseTransaction**( transaction ) => *[TransactionDescription](/v5/api/utils/abi/interface/#TransactionDescription)*

Search for the function that matches the *transaction* data sighash and parse the transaction properties.


```javascript
//_hide: const iface = _page.iface;
//_hide: const parseEther = ethers.utils.parseEther;

const data = "0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000";
const value = parseEther("1.0");

//_result:
iface.parseTransaction({ data, value });
//_hide: _.functionFragment = createClass("FunctionFragment");
//_log:
```

Types
-----

### Result

### LogDescription

#### *logDescription* . **args** => *[Result](/v5/api/utils/abi/interface/#Result)*

The values of the input parameters of the event.


#### *logDescription* . **eventFragment** => *[EventFragment](/v5/api/utils/abi/fragments/#EventFragment)*

The [EventFragment](/v5/api/utils/abi/fragments/#EventFragment) which matches the topic in the Log.


#### *logDescription* . **name** => *string*

The event name. (e.g. `Transfer`)


#### *logDescription* . **signature** => *string*

The event signature. (e.g. `Transfer(address,address,uint256)`)


#### *logDescription* . **topic** => *string*

The topic hash.


### TransactionDescription

#### *transactionDescription* . **args** => *[Result](/v5/api/utils/abi/interface/#Result)*

The decoded values from the transaction data which were passed as the input parameters.


#### *transactionDescription* . **functionFragment** => *[FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment)*

The [FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment) which matches the sighash in the transaction data.


#### *transactionDescription* . **name** => *string*

The name of the function. (e.g. `transfer`)


#### *transactionDescription* . **sighash** => *string*

The sighash (or function selector) that matched the transaction data.


#### *transactionDescription* . **signature** => *string*

The signature of the function. (e.g. `transfer(address,uint256)`)


#### *transactionDescription* . **value** => *[BigNumber](/v5/api/utils/bignumber/)*

The value from the transaction.


Specifying Fragments
--------------------

