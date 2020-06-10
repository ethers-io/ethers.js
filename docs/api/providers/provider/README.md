-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Provider
========

Accounts Methods
----------------

#### *provider* . **getBalance**( address [ , blockTag = latest ] ) => *Promise< [BigNumber](/api/utils/bignumber/) >*

Returns the balance of *address* as of the *blockTag* block height.


#### *provider* . **getCode**( address [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/api/utils/bytes/#DataHexString) > >*

Returns the contract code of *address* as of the *blockTag* block height. If there is no contract currently deployed, the result is `0x`.


#### *provider* . **getStorageAt**( addr , pos [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/api/utils/bytes/#DataHexString) > >*

Returns the `Bytes32` value of the position *pos* at address *addr*, as of the *blockTag*.


#### *provider* . **getTransactionCount**( address [ , blockTag = latest ] ) => *Promise< number >*

Returns the number of transactions *address* has ever **sent**, as of *blockTag*. This value is required to be the nonce for the next transaction from *address* sent to the network.


```javascript
// Get the balance for an account...
provider.getBalance("ricmoo.firefly.eth");
//!

// Get the code for a contract...
provider.getCode("registrar.firefly.eth");
//!

// Get the storage value at position 0...
provider.getStorageAt("registrar.firefly.eth", 0)
//!

// Get transaction count of an account...
provider.getTransactionCount("ricmoo.firefly.eth");
//!
```

Blocks Methods
--------------

#### *provider* . **getBlock**( block ) => *Promise< [Block](/api/providers/types/#providers-Block) >*

Get the *block* from the network, where the `result.transactions` is a list of transaction hashes.


#### *provider* . **getBlockWithTransactions**( block ) => *Promise< [BlockWithTransactions](/api/providers/types/#providers-BlockWithTransactions) >*

Get the *block* from the network, where the `result.transactions` is an Array of [TransactionResponse](/api/providers/types/#providers-TransactionResponse) objects.


```javascript
provider.getBlock(100004)
//!

provider.getBlockWithTransactions(100004)
//!
```

Ethereum Naming Service (ENS) Methods
-------------------------------------

#### *provider* . **lookupAddress**( address ) => *Promise< string >*

Performs a reverse lookup of the *address* in ENS using the *Reverse Registrar*. If the name does not exist, or the forward lookup does not match, `null` is returned.


#### *provider* . **resolveName**( name ) => *Promise< string< [Address](/api/utils/address/#address) > >*

Looks up the address of *name*. If the name is not owned, or does not have a *Resolver* configured, or the *Resolver* does not have an address configured, `null` is returned.


```javascript
// Reverse lookup of an ENS by address...
provider.lookupAddress("0x6fC21092DA55B392b045eD78F4732bff3C580e2c");
//!

// Lookup an address of an ENS name...
provider.resolveName("ricmoo.firefly.eth");
//!
```

Logs Methods
------------

#### *provider* . **getLogs**( filter ) => *Promise< Array< [Log](/api/providers/types/#providers-Log) > >*

Returns the Array of [Log](/api/providers/types/#providers-Log) matching the *filter*.

Keep in mind that many backends will discard old events, and that requests which are too broad may get dropped as they require too many resources to execute the query.


Network Status Methods
----------------------

#### *provider* . **getNetwork**( ) => *Promise< [Network](/api/providers/types/#providers-Network) >*

Returns the [Network](/api/providers/types/#providers-Network) this Provider is connected to.


#### *provider* . **getBlockNumber**( ) => *Promise< number >*

Returns the block number (or height) of the most recently mined block.


#### *provider* . **getGasPrice**( ) => *Promise< [BigNumber](/api/utils/bignumber/) >*

Returns a *best guess* of the [Gas Price](/concepts/gas/#gas-price) to use in a transaction.


```javascript
// The network information
provider.getNetwork()
// <hide>
//!
network = utils.shallowCopy(_)
delete network._defaultProvider
network
// </hide>
//!

// The current block number
provider.getBlockNumber()
//!

// Get the current suggested gas price (in wei)...
gasPrice = await provider.getGasPrice()
//! async gasPrice

// ...often this gas price is easier to understand or
// display to the user in gwei (giga-wei, or 1e9 wei)
utils.formatUnits(gasPrice, "gwei")
//!
```

Transactions Methods
--------------------

#### *provider* . **call**( transaction [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/api/utils/bytes/#DataHexString) > >*

Returns the result of executing the *transaction*, using *call*. A call does not require any ether, but cannot change any state. This is useful for calling gettings on Contracts.


#### *provider* . **estimateGas**( transaction ) => *Promise< [BigNumber](/api/utils/bignumber/) >*

Returns an estimate of the amount of gas that would be required to submit *transaction* to the network.

An estimate may not be accurate since there could be another transaction on the network that was not accounted for, but after being mined affected relevant state.


#### *provider* . **sendTransaction**( transaction ) => *Promise< [TransactionResponse](/api/providers/types/#providers-TransactionResponse) >*

Submits *transaction* to the network to be mined. The *transaction* **must** be signed, and be valid (i.e. the nonce is correct and the account has sufficient balance to pay for the transaction).


#### *provider* . **waitForTransaction**( hash [ , confirms = 1 [ , timeout ] ] ) => *Promise< [TxReceipt](/api/providers/types/#providers-TransactionReceipt) >*

Returns a Promise which will not resolve until *transactionHash* is mined.


Event Emitter Methods
---------------------

#### *provider* . **on**( eventName , listener ) => *this*

Add a *listener* to be triggered for each *eventName*.


#### *provider* . **once**( eventName , listener ) => *this*

Add a *listener* to be triggered for only the next *eventName*, at which time it be removed.


#### *provider* . **emit**( eventName , ...args ) => *boolean*

Notify all listeners of *eventName*, passing *args* to each listener. This is generally only used internally.


#### *provider* . **off**( eventName [ , listener ] ) => *this*

Remove a *listener* for *eventName*. If no *listener* is provided, all listeners for *eventName* are removed.


#### *provider* . **removeAllListeners**( [ eventName ] ) => *this*

Remove all the listeners for *eventName*. If no *eventName* is provided, **all** events are removed.


#### *provider* . **listenerCount**( [ eventName ] ) => *number*

Returns the number of listeners for *eventName*. If no *eventName* is provided, the total number of listeners is returned.


#### *provider* . **listeners**( eventName ) => *Array< Listener >*

Returns the list of Listeners for *eventName*.


### Events

#### **Log Filter**

A filter is an object, representing a contract log Filter, which has the optional properties `address` (the source contract) and `topics` (a topic-set to match).

If `address` is unspecified, the filter matches any contract address.

See events for more information on how to specify topic-sets.


#### **Topic-Set Filter**

The value of a **Topic-Set Filter** is a array of Topic-Sets.

This event is identical to a *Log Filter* with the address omitted (i.e. from any contract).


#### **Transaction Filter**

The value of a **Transaction Filter** is any transaction hash.

This event is emitted on every block that is part of a chain that includes the given mined transaction. It is much more common that the [once](/api/providers/provider/#Provider-once) method is used than the [on](/api/providers/provider/#Provider-on) method.



In addition to transaction and filter events, there are several named events.


Named Provider Events



```javascript
// <hide>
const txHash = utils.id("dummy-data");
const myAddress = ethers.constants.HashZero;
const myOtherAddress = ethers.constants.HashZero;
// </hide>

provider.on("block", (blockNumber) => {
    // Emitted on every block change
})


provider.once(txHash, (transaction) => {
    // Emitted when the transaction has been mined
})


// This filter could also be generated with the Contract or
// Interface API. If address is not specified, any address
// matches and if topics is not specified, any log matches
filter = {
    address: "dai.tokens.ethers.eth",
    topics: [
        utils.id("Transfer(address,address,uint256")
    ]
}
provider.on(filter, (log, event) => {
    // Emitted whenever a DAI token transfer occurs
})


// Notice this is an array of topic-sets and is identical to
// using a filter with no address (i.e. match any address)
topicSets = [
    utils.id("Transfer(address,address,uint256"),
    null,
    [
        myAddress,
        myOtherAddress
    ]
]
provider.on(topicSets, (log, event) => {
    // Emitted any token is sent TO either address
})


provider.on("pending", (tx) => {
    // Emitted when any new pending transaction is noticed
});


provider.on("error", (tx) => {
    // Emitted when any error occurs
});

// <hide>
// Make sure our documentation builds without waiting forever
provider.removeAllListeners()
// </hide>
```

Inspection Methods
------------------

#### *Provider* . **isProvider**( object ) => *boolean*

Returns true if and only if *object* is a Provider.


