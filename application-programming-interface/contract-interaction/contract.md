# Contract

A **Contract** is an abstraction of code that has been deployed.

A Contract may be sent transactions, which will trigger its code to be run with the input of the transaction data.

### Creating Instances

#### `new hethers.Contract( address , abi , signerOrProvider )`

#### `contract.attach( address )` ⇒ [Contract](contract.md)

&#x20;   Returns a new instance of the **Contract** attached to a new address. This is useful if there are multiple similar or identical copies of a Contract on the network and you wish to interact with each of them.

#### `contract.connect( providerOrSigner )` ⇒ [Contract](contract.md)

&#x20;   Returns a new instance of the Contract, but connected to _providerOrSigner_.

&#x20;   By passing in a [Provider](../providers/), this will return a downgraded **Contract** which only has read-only access (i.e. constant calls).

&#x20;   By passing in a [Signer](../signers.md). this will return a **Contract** which will act on behalf of that signer.

### Properties

#### `contract.address` ⇒ string< [Address](../utilities/addresses.md) >

&#x20;   This is the address the contract was constructed with.

#### `contract.deployTransaction` ⇒ [TransactionResponse](../utilities/transactions.md)

&#x20;   If the **Contract** object is the result of a ContractFactory deployment, this is the transaction which was used to deploy the contract.

#### `contract.interface` ⇒ [Interface](../utilities/application-binary-interface/)

&#x20;   This is the ABI as an [Interface](../utilities/application-binary-interface/).

#### `contract.provider` ⇒ [Provider](../providers/)

&#x20;   If a provider was provided to the constructor, this is that provider. If a signer was provided that had a [Provider](../providers/), this is that provider.

#### `contract.signer` ⇒ [Signer](../signers.md)

&#x20;   If a signer was provided to the constructor, this is that signer.

### Methods

#### `contract.deployed( )` ⇒ Promise< [Contract](contract.md) > 

#### `Contract.isIndexed( value )` ⇒ boolean

### Events

#### `contract.queryFilter( event [ , fromTimestamp [ , toTimestamp ] )` ⇒ Promise< Array< [Event ](../providers/provider/event-emitter-methods.md#events)> >

&#x20;   Return Events that match the _event_.

#### `contract.listenerCount( [ event ] )` ⇒ number

&#x20;   Return the number of listeners that are subscribed to _event_. If no event is provided, returns the total count of all events.

#### `contract.listeners( event )` ⇒ Array< Listener >

&#x20;   Return a list of listeners that are subscribed to _event_.

#### `contract.off( event , listener )` ⇒ this

&#x20;   Unsubscribe _listener_ to _event_.

#### `contract.on( event , listener )` ⇒ this

&#x20;   Subscribe to _event_ calling _listener_ when the event occurs.

#### `contract.once( event , listener )` ⇒ this

&#x20;   Subscribe once to _event_ calling _listener_ when the event occurs.

#### `contract.removeAllListeners( [ event ] )` ⇒ this

&#x20;   Unsubscribe all listeners for _event_. If no event is provided, all events are unsubscribed.

### Meta-Class

A Meta-Class is a Class which has any of its properties determined at run-time. The **Contract** object uses a Contract's ABI to determine what methods are available, so the following sections describe the generic ways to interact with the properties added at run-time during the **Contract** constructor.

#### Read-Only Methods (constant)

A constant method (denoted by `pure` or `view` in Solidity) is read-only and evaluates a small amount of EVM code against the current state and can be computed by asking a single node, which can return a result. It requires the execution of ContractLocalCall transactions which require a signer to be connected. They **cannot make changes** to the state.

#### `contract.METHOD_NAME( ...args [ , overrides ] )` ⇒ Promise< any >

&#x20;   The type of the result depends on the ABI. If the method returns a single value, it will be returned directly, otherwise, an < Result > object will be returned with each parameter available positionally and if the parameter is named, it will also be available by its name.

&#x20;   For values that have a simple meaning in JavaScript, the types are fairly straightforward; strings and booleans are returned as JavaScript strings and booleans.

&#x20;   For numbers, if the **type** is in the JavaScript safe range (i.e. less than 53 bits, such as an `int24` or `uint48`) a normal JavaScript number is used. Otherwise, a [BigNumber](../utilities/bignumber.md) is returned.

&#x20;   For bytes (both fixed length and dynamic), a DataHexString is returned.

&#x20;   If the call reverts (or runs out of gas), a CALL\_EXCEPTION will be thrown which will include:\
&#x20;       \- `error.address` - the contract address\
&#x20;       \- `error.args` - the arguments passed into the method\
&#x20;       \- `error.transaction` - the transaction

&#x20;   The _overrides_ object for a read-only method may include any of:\
&#x20;       \- `overrides.from` - the msg.sender (or CALLER) to use during the execution of the code\
&#x20;       \- `overrides.value` - msg.value (or CALLVALUE) to use during the execution of the code\
&#x20;       \- `overrides.gasLimit` - the amount of gas (theoretically) to allow a node to use during the execution of the code\
&#x20;       \- `overrides.nodeId` - pass a specific node that will be called

#### `contract.functions.METHOD_NAME( ...args [ , overrides ] )` ⇒ Promise< Result >

&#x20;   The result will always be a Result, even if there is only a single return value type.

&#x20;   This simplifies frameworks that wish to use the [Contract](contract.md) object since they do not need to inspect the return types to unwrap simplified functions.

&#x20;   Another use for this method is for error recovery. For example, if a function result is an invalid UTF-8 string, the normal call using the above meta-class function will throw an exception. This allows using the Result access error to access the low-level bytes and reason for the error allowing an alternate UTF-8 error strategy to be used.

&#x20;   Most developers should not require this.

&#x20;   The _overrides_ are identical to the read-only operations above.

#### Write Methods (non-constant)

A non-constant method requires a transaction to be signed and requires payment in the form of a fee to be paid to a node.

It cannot return a result. If a result is required, it should be logged using a Solidity event (or EVM log).

#### `contract.METHOD_NAME( ...args [ , overrides ] )` ⇒ Promise< [TransactionResponse ](../providers/types.md#transactionresponse)>

&#x20;   Returns a TransactionResponse for the transaction after it is sent to the network. This requires the **Contract** has a signer.

&#x20;   The _overrides_ object for write methods must:\
&#x20;       \- `overrides.gasLimit` - the limit on the amount of gas to allow the transaction to consume; any unused gas is returned

Other values that may be provided are:

&#x20;        \- `overrides.value` - the amount of hbar (in tinybar) to forward with the call

&#x20;   If the `wait()` method on the returned TransactionResponse is called, there will be additional properties on the receipt:\
&#x20;       \- `timestamp`\
``        - `contractAddress`\
&#x20;       \- `gasUsed`\
&#x20;       \- `logsBloom`\
&#x20;       \- `transactionHash`\
&#x20;       \- `logs`\
&#x20;       \- `cumulativeGasUsed`\
&#x20;       \- `type`\
&#x20;       \- `byzantium`\
&#x20;       \- `status`\
&#x20;       \- `accountAddress`\
&#x20;       \- `events`

#### Write Methods Analysis

There are several options to analyze the properties and results of a write method without actually executing it.

#### `contract.populateTransaction.METHOD_NAME( ...args [ , overrides ] )` ⇒ Promise< [UnsignedTransaction ](../utilities/transactions.md#unsignedtransaction)>

&#x20;   Returns an UnsignedTransaction which represents the transaction that would need to be signed and submitted to the network to execute _METHOD\_NAME_ with _args_ and _overrides_.

&#x20;   The _overrides_ are identical to the overrides above for read-only or write methods, depending on the type of call of _METHOD\_NAME_.

#### `contract.callStatic.METHOD_NAME( ...args [ , overrides ] )` ⇒ Promise< any >

&#x20;   Rather than executing the state-change of a transaction, it is possible to ask a node to _pretend_ that a call is not state-changing and return the result.

&#x20;   This does not actually change any state, but is not free. This in some cases can be used to determine if a transaction will fail or succeed.

&#x20;   This otherwise functions the same as a Read-Only Method.

&#x20;   The _overrides_ are identical to the read-only operations above.

#### Event Filters

An event filter is made up of topics, which are values logged in a Bloom Filter, allowing efficient searching for entries which match a filter.

#### `contract.filters.EVENT_NAME( ...args )` ⇒ Filter

&#x20;   Return a filter for _EVENT\_NAME_, optionally filtering by additional constraints.

&#x20;   Only `indexed` event parameters may be filtered. If a parameter is null (or not provided) then any value in that field matches.
