-----

Documentation: [html](https://docs.ethers.io/)

-----

Contract
========

Creating Instances
------------------

#### **new ***ethers* . **Contract**( address , abi , signerOrProvider )



#### *contract* . **attach**( addressOrName ) => *[Contract](/v5/api/contract/contract/)*

Returns a new instance of the **Contract** attached to a new address. This is useful if there are multiple similar or identical copies of a Contract on the network and you wish to interact with each of them.


#### *contract* . **connect**( providerOrSigner ) => *[Contract](/v5/api/contract/contract/)*

Returns a new instance of the Contract, but connected to *providerOrSigner*.

By passing in a [Provider](/v5/api/providers/provider/), this will return a downgraded **Contract** which only has read-only access (i.e. constant calls).

By passing in a [Signer](/v5/api/signer/#Signer). this will return a **Contract** which will act on behalf of that signer.


Properties
----------

#### *contract* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

This is the address (or ENS name) the contract was constructed with.


#### *contract* . **resolvedAddress** => *string< [Address](/v5/api/utils/address/#address) >*

This is a promise that will resolve to the address the **Contract** object is attached to. If an [Address](/v5/api/utils/address/#address) was provided to the constructor, it will be equal to this; if an ENS name was provided, this will be the resolved address.


#### *contract* . **deployTransaction** => *[TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse)*

If the **Contract** object is the result of a ContractFactory deployment, this is the transaction which was used to deploy the contract.


#### *contract* . **interface** => *[Interface](/v5/api/utils/abi/interface/)*

This is the ABI as an [Interface](/v5/api/utils/abi/interface/).


#### *contract* . **provider** => *[Provider](/v5/api/providers/provider/)*

If a provider was provided to the constructor, this is that provider. If a signer was provided that had a [Provider](/v5/api/providers/provider/), this is that provider.


#### *contract* . **signer** => *[Signer](/v5/api/signer/#Signer)*

If a signer was provided to the constructor, this is that signer.


Methods
-------

#### *contract* . **deployed**( ) => *Promise< [Contract](/v5/api/contract/contract/) >*



#### *Contract* . **isIndexed**( value ) => *boolean*



Events
------

#### *contract* . **queryFilter**( event [ , fromBlockOrBlockHash [ , toBlock ] ) => *Promise< Array< Event > >*

Return Events that match the *event*.


#### *contract* . **listenerCount**( [ event ] ) => *number*

Return the number of listeners that are subscribed to *event*. If no event is provided, returns the total count of all events.


#### *contract* . **listeners**( event ) => *Array< Listener >*

Return a list of listeners that are subscribed to *event*.


#### *contract* . **off**( event , listener ) => *this*

Unsubscribe *listener* to *event*.


#### *contract* . **on**( event , listener ) => *this*

Subscribe to *event* calling *listener* when the event occurs.


#### *contract* . **once**( event , listener ) => *this*

Subscribe once to *event* calling *listener* when the event occurs.


#### *contract* . **removeAllListeners**( [ event ] ) => *this*

Unsubscribe all listeners for *event*. If no event is provided, all events are unsubscribed.


Meta-Class
----------

### Read-Only Methods (constant)

#### *contract* . **METHOD_NAME**( ...args [ , overrides ] ) => *Promise< any >*

The type of the result depends on the ABI. If the method returns a single value, it will be returned directly, otherwise a [Result](/v5/api/utils/abi/interface/#Result) object will be returned with each parameter available positionally and if the parameter is named, it will also be available by its name.

For values that have a simple meaning in JavaScript, the types are fairly straightforward; strings and booleans are returned as JavaScript strings and booleans.

For numbers, if the **type** is in the JavaScript safe range (i.e. less than 53 bits, such as an `int24` or `uint48`) a normal JavaScript number is used. Otherwise a [BigNumber](/v5/api/utils/bignumber/) is returned.

For bytes (both fixed length and dynamic), a [DataHexString](/v5/api/utils/bytes/#DataHexString) is returned.

The *overrides* object for a read-only method may include any of:

- `overrides.from` - the `msg.sender` (or `CALLER`) to use during the execution of the code 
- `overrides.value` - the `msg.value` (or `CALLVALUE`) to use during the exectuiont of the code 
- `overrides.gasPrice` - the price to pay per gas (theoretically); since there is no transaction, there is not going to be any fee charged, but the EVM still requires a value to report to `tx.gasprice` (or `GASPRICE`); *most developers will not require this* 
- `overrides.gasLimit` - the amount of gas (theoretically) to allow a node to use during the execution of the code; since there is no transaction, there is not going to be any fee charged, but the EVM still processes gas metering so calls like `gasleft` (or `GAS`) report meaningful values 
- `overrides.blockTag` - a block tag to simulate the execution at, which can be used for hypothetical historic analysis; note that many backends do not support this, or may require paid plans to access as the node database storage and processing requirements are much higher 




#### *contract* . *functions* . **METHOD_NAME**( ...args [ , overrides ] ) => *Promise< [Result](/v5/api/utils/abi/interface/#Result) >*

The result will always be a [Result](/v5/api/utils/abi/interface/#Result), even if there is only a single return value type.

This simplifies frameworks which wish to use the [Contract](/v5/api/contract/contract/) object, since they do not need to inspect the return types to unwrap simplified functions.

Another use for this method is for error recovery. For example, if a function result is an invalid UTF-8 string, the normal call using the above meta-class function will throw an exception. This allows using the Result access error to access the low-level bytes and reason for the error allowing an alternate UTF-8 error strategy to be used.

Most developers should not require this.

The *overrides* are identical to the read-only operations above.


### Write Methods (non-constant)

#### *contract* . **METHOD_NAME**( ...args [ , overrides ] ) => *Promise< [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) >*

Returns a [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) for the transaction after it is sent to the network. This requires the **Contract** has a signer.

The *overrides* object for write methods may include any of:

- `overrides.gasPrice` - the price to pay per gas 
- `overrides.gasLimit` - the limit on the amount of gas to allow the transaction to consume; any unused gas is returned at the gasPrice 
- `overrides.value` - the amount of ether (in wei) to forward with the call 
- `overrides.nonce` - the nonce to use for the [Signer](/v5/api/signer/#Signer) 



If the `wait()` method on the returned [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) is called, there will be additional properties on the receipt:

- `receipt.events` - an array of the logs, with additional properties (if the ABI included a description for the events) 
- `receipt.events[n].args` - the parsed arguments 
- `receipt.events[n].decode` - a method that can be used to parse the log topics and data (this was used to compute `args`) 
- `receipt.events[n].event` - the name of the event 
- `receipt.events[n].eventSignature` - the full signature of the event 
- `receipt.removeListener()` - a method to remove the listener that trigger this event 
- `receipt.getBlock()` - a method to return the [Block](/v5/api/providers/types/#providers-Block) this event occurred in 
- `receipt.getTransaction()` - a method to return the [Transaction](/v5/api/providers/types/#providers-TransactionResponse) this event occurred in 
- `receipt.getTransactionReceipt()` - a method to return the [Transaction Receipt](/v5/api/providers/types/#providers-TransactionReceipt) this event occurred in 




### Write Methods Analysis

#### *contract* . *estimateGas* . **METHOD_NAME**( ...args [ , overrides ] ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns the estimate units of gas that would be required to execute the *METHOD_NAME* with *args* and *overrides*.

The *overrides* are identical to the overrides above for read-only or write methods, depending on the type of call of *METHOD_NAME*.


#### *contract* . *populateTransaction* . **METHOD_NAME**( ...args [ , overrides ] ) => *Promise< [UnsignedTx](/v5/api/utils/transactions/#UnsignedTransaction) >*

Returns an [UnsignedTransaction](/v5/api/utils/transactions/#UnsignedTransaction) which represents the transaction that would need to be signed and submitted to the network to execute *METHOD_NAME* with *args* and *overrides*.

The *overrides* are identical to the overrides above for read-only or write methods, depending on the type of call of *METHOD_NAME*.


#### *contract* . *callStatic* . **METHOD_NAME**( ...args [ , overrides ] ) => *Promise< any >*

Rather than executing the state-change of a transaction, it is possible to ask a node to *pretend* that a call is not state-changing and return the result.

This does not actually change any state, but is free. This in some cases can be used to determine if a transaction will fail or succeed.

This otherwise functions the same as a [Read-Only Method](/v5/api/contract/contract/#Contract--readonly).

The *overrides* are identical to the read-only operations above.


### Event Filters

#### *contract* . *filters* . **EVENT_NAME**( ...args ) => *Filter*

Return a filter for *EVENT_NAME*, optionally filtering by additional constraints.

Only `indexed` event parameters may be filtered. If a parameter is null (or not provided) then any value in that field matches.


