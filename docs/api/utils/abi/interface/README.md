-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Interface
=========


The **Interface** Class abstracts the encoding and decoding required
to interact with contracts on the Ethereum network.

Many of the standards organically evolved along side the [Solidity](../../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/solidity.readthedocs.io/en/v0.6.2)
language, which other languages have adopted to remain compatibile with
existing deployed contracts.

The EVM itself does not understand what the ABI is. It is simply an agreed
upon set of formats to encode various types of data which each contract can
expect so they can interoperate with each other.


Creating Instances
------------------



#### **new** *ethers* . *utils* . **Interface** ( abi ) 

Create a new **Interface** from a JSON string or object representing
*abi*.

The *abi* may be a JSON string or the parsed Object (using JSON.parse)
which is emitted by the [Solidity compiler](../../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/solidity.readthedocs.io/en/v0.6.0/using-the-compiler.html) (or compatible languages).

The *abi* may also be a [Human-Readable Abi](../../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/blog.ricmoo.com/human-readable-contract-abis-in-ethers-js-141902f4d917),
which is a format the Ethers created to simplify manually typing the ABI
into the source and so that a Contract ABI can also be referenced easily
within the same source file.




Properties
----------



#### *interface* . **fragments** **=>** *Array< [Fragment](../fragments) >*

All the [Fragments](../fragments) in the interface.




#### *interface* . **events** **=>** *Array< [EventFragment](../fragments) >*

All the [Event Fragments](../fragments) in the interface.




#### *interface* . **functions** **=>** *Array< [FunctionFragment](../fragments) >*

All the [Function Fragments](../fragments) in the interface.




#### *interface* . **deploy** **=>** *[ConstructorFragment](../fragments)*

The [Constructor Fragments](../fragments) for the interface.




Formatting
----------



#### *interface* . **format** (  [ format ]  )  **=>** *string|Array< string >*

Return the formatted **Interface**. If the format type is `json` a
single string is returned, otherwise an Array of the human-readable
strings is returned.




Fragment Access
---------------



#### *interface* . **getFunction** ( fragment )  **=>** *[FunctionFragment](../fragments)*

Returns the [FunctionFragment](../fragments) for *fragment* (see [Specifying Fragments](./)).




#### *interface* . **getEvent** ( fragment )  **=>** *[EventFragment](../fragments)*

Returns the [EventFragment](../fragments) for *fragment* (see [Specifying Fragments](./)).




Signature and Topic Hashes
--------------------------



#### *interface* . **getSighash** ( fragment )  **=>** *string< [DataHexstring](../../bytes)< 4 > >*

Return the sighash (or Function Selector) for *fragment* (see [Specifying Fragments](./)).




#### *interface* . **getEventTopic** ( fragment )  **=>** *string< [DataHexstring](../../bytes)< 32 > >*

Return the topic hash for *fragment* (see [Specifying Fragments](./)).




Encoding Data
-------------



#### *interface* . **encodeDeploy** (  [ values ]  )  **=>** *string< [DataHexstring](../../bytes) >*

Return the encoded deployment data, which can be concatenated to the
deployment bytecode of a contract to pass *values* into the contract
constructor.




#### *interface* . **encodeFilterTopics** ( fragment [  , values ]  )  **=>** *Array< topic|Array< topic > >*

Returns the encoded topic filter, which can be passed to getLogs for *fragment*
(see [Specifying Fragments](./)) for the given *values*.

Each *topic* is a 32 byte (64 nibble) [DataHexstring](../../bytes).




#### *interface* . **encodeFunctionData** ( fragment [  , values ]  )  **=>** *string< [DataHexstring](../../bytes) >*

Returns the encoded data, which can be used as the data for a transaction for
*fragment* (see [Specifying Fragments](./)) for the given *values*.




#### *interface* . **encodeFunctionResult** ( fragment [  , values ]  )  **=>** *string< [DataHexstring](../../bytes) >*

Returns the encoded result, which would normally be the response from a call for
*fragment* (see [Specifying Fragments](./)) for the given *values*.

Most developers will not need this method, but may be useful for authors of a mock blockchain.




Decoding Data
-------------



#### *interface* . **decodeEventLog** ( fragment , data [  , topics ]  )  **=>** *[Result](./)*

Returns the decoded event values from an event log for
*fragment* (see [Specifying Fragments](./)) for the given *data*
with the optional *topics*.

If *topics* is not specified, placeholders will be inserted into the result.




#### *interface* . **decodeFunctionData** ( fragment , data )  **=>** *[Result](./)*

Returns the decoded values from transaction data for
*fragment* (see [Specifying Fragments](./)) for the given *data*.

Most developers will not need this method, but may be useful for debugging
or inspecting transactions.




#### *interface* . **decodeFunctionResult** ( fragment , data )  **=>** *[Result](./)*

Returns the decoded values from the result of a call for
*fragment* (see [Specifying Fragments](./)) for the given *data*.




Parsing
-------


The functions are generally the most useful for most developers. They will
automatically search the ABI for a matching Event or Function and decode
the components as a fully specified description.


#### *interface* . **parseLog** ( log )  **=>** *[LogDescription](./)*

Search the event that matches the *log* topic hash and parse the values
the log represents.




#### *interface* . **parseTransaction** ( transaction )  **=>** *[TransactionDescription](./)*

Search for the function that matches the *transaction* data sighash
and parse the transaction properties.




Types
-----



### Result


A **Result** is an array, so each value can be accessed as a positional
argument.

Additionally, if values are named, the identical object as its positional
value can be accessed by its name.

The name `length` is however reserved as it is part of the Array, so
any named value for this key is renamed to `_length`. If there is a
name collision, only the first is available by its key.


### LogDescription



#### *logDescription* . **args** **=>** *[Result](./)*

The values of the input parameters of the event.




#### *logDescription* . **eventFragment** **=>** *[EventFragment](../fragments)*

The [EventFragment](../fragments) which matches the topic in the Log.




#### *logDescription* . **name** **=>** *string*

The event name. (e.g. `Transfer`)




#### *logDescription* . **signature** **=>** *string*

The event signature. (e.g. `Transfer(address,address,uint256)`)




#### *logDescription* . **topic** **=>** *string*

The topic hash.




### TransactionDescription



#### *transactionDescription* . **args** **=>** *[Result](./)*

The decoded values from the transaction data which were passed
as the input parameters.




#### *transactionDescription* . **functionFragment** **=>** *[FunctionFragment](../fragments)*

The [FunctionFragment](../fragments) which matches the sighash in the transaction data.




#### *transactionDescription* . **name** **=>** *string*

The name of the function. (e.g. `transfer`)




#### *transactionDescription* . **sighash** **=>** *string*

The sighash (or function selector) that matched the transaction data.




#### *transactionDescription* . **signature** **=>** *string*

The signature of the function. (e.g. `transfer(address,uint256)`)




#### *transactionDescription* . **value** **=>** *[BigNumber](../../bignumber)*

The value from the transaction.




Specifying Fragments
--------------------


When specifying a fragment to any of the functions in an **Interface**,
any of the following may be used:



* The name of the event or function, if it is unique and non-ambiguous within the ABI (e.g. `transfer`)
* The signature of the event or function. The signature is normalized, so, for example, `uint` and `uint256` are equivalent (e.g. `transfer(address, uint)`)
* The sighash or topichash of the function. The sighash is often referred to the function selector in Solidity (e.g. `0xa9059cbb`)
* A [Fragment](../fragments)



-----
**Content Hash:** ed5159ed39b943e91bae3e17384c149e4b55f4d80650672a092c2781a3883934