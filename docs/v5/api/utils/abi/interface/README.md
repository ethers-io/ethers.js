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


Properties
----------

#### *interface* . **fragments** => *Array< [Fragment](/v5/api/utils/abi/fragments/#Fragment) >*

All the [Fragments](/v5/api/utils/abi/fragments/#Fragment) in the interface.


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


Fragment Access
---------------

#### *interface* . **getFunction**( fragment ) => *[FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment)*

Returns the [FunctionFragment](/v5/api/utils/abi/fragments/#FunctionFragment) for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


#### *interface* . **getEvent**( fragment ) => *[EventFragment](/v5/api/utils/abi/fragments/#EventFragment)*

Returns the [EventFragment](/v5/api/utils/abi/fragments/#EventFragment) for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


Signature and Topic Hashes
--------------------------

#### *interface* . **getSighash**( fragment ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 4 > >*

Return the sighash (or Function Selector) for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


#### *interface* . **getEventTopic**( fragment ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Return the topic hash for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)).


Encoding Data
-------------

#### *interface* . **encodeDeploy**( [ values ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Return the encoded deployment data, which can be concatenated to the deployment bytecode of a contract to pass *values* into the contract constructor.


#### *interface* . **encodeFilterTopics**( fragment [ , values ] ) => *Array< topic | Array< topic > >*

Returns the encoded topic filter, which can be passed to getLogs for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *values*.

Each *topic* is a 32 byte (64 nibble) [DataHexString](/v5/api/utils/bytes/#DataHexString).


#### *interface* . **encodeFunctionData**( fragment [ , values ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the encoded data, which can be used as the data for a transaction for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *values*.


#### *interface* . **encodeFunctionResult**( fragment [ , values ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Returns the encoded result, which would normally be the response from a call for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *values*.

Most developers will not need this method, but may be useful for authors of a mock blockchain.


Decoding Data
-------------

#### *interface* . **decodeEventLog**( fragment , data [ , topics ] ) => *[Result](/v5/api/utils/abi/interface/#Result)*

Returns the decoded event values from an event log for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *data* with the optional *topics*.

If *topics* is not specified, placeholders will be inserted into the result.


#### *interface* . **decodeFunctionData**( fragment , data ) => *[Result](/v5/api/utils/abi/interface/#Result)*

Returns the decoded values from transaction data for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *data*.

Most developers will not need this method, but may be useful for debugging or inspecting transactions.


#### *interface* . **decodeFunctionResult**( fragment , data ) => *[Result](/v5/api/utils/abi/interface/#Result)*

Returns the decoded values from the result of a call for *fragment* (see [Specifying Fragments](/v5/api/utils/abi/interface/#Interface--specifying-fragments)) for the given *data*.


Parsing
-------

#### *interface* . **parseLog**( log ) => *[LogDescription](/v5/api/utils/abi/interface/#LogDescription)*

Search the event that matches the *log* topic hash and parse the values the log represents.


#### *interface* . **parseTransaction**( transaction ) => *[TransactionDescription](/v5/api/utils/abi/interface/#TransactionDescription)*

Search for the function that matches the *transaction* data sighash and parse the transaction properties.


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

