-----

Documentation: [html](https://docs.ethers.io/)

-----

Provider
========

#### Coming from Web3.js?

If you are coming from Web3.js, this is one of the biggest differences you will encounter using ethers.

The ethers library creates a strong division between the operation a **Provider** can perform and those of a [Signer](/v5/api/signer/#Signer), which Web3.js lumps together.

This separation of concerns and a stricted subset of Provider operations allows for a larger variety of backends, a more consistent API and ensures other libraries to operate without being able to rely on any underlying assumption.


Accounts Methods
----------------

#### *provider* . **getBalance**( address [ , blockTag = latest ] ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns the balance of *address* as of the *blockTag* block height.


```javascript
//_result:
await provider.getBalance("ricmoo.eth");
//_log:
```

#### *provider* . **getCode**( address [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns the contract code of *address* as of the *blockTag* block height. If there is no contract currently deployed, the result is `0x`.


```javascript
//_result:
await provider.getCode("registrar.firefly.eth");
//_log:
```

#### *provider* . **getStorageAt**( addr , pos [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns the `Bytes32` value of the position *pos* at address *addr*, as of the *blockTag*.


```javascript
//_result:
await provider.getStorageAt("registrar.firefly.eth", 0)
//_log:
```

#### *provider* . **getTransactionCount**( address [ , blockTag = latest ] ) => *Promise< number >*

Returns the number of transactions *address* has ever **sent**, as of *blockTag*. This value is required to be the nonce for the next transaction from *address* sent to the network.


```javascript
//_result:
await provider.getTransactionCount("ricmoo.eth");
//_log:
```

Blocks Methods
--------------

#### *provider* . **getBlock**( block ) => *Promise< [Block](/v5/api/providers/types/#providers-Block) >*

Get the *block* from the network, where the `result.transactions` is a list of transaction hashes.


```javascript
//_result:
await provider.getBlock(100004)
//_log:
```

#### *provider* . **getBlockWithTransactions**( block ) => *Promise< [BlockWithTransactions](/v5/api/providers/types/#providers-BlockWithTransactions) >*

Get the *block* from the network, where the `result.transactions` is an Array of [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) objects.


```javascript
//_result:
await provider.getBlockWithTransactions(100004)
//_log:
```

Ethereum Naming Service (ENS) Methods
-------------------------------------

#### *provider* . **getResolver**( name ) => *Promise< [EnsResolver](/v5/api/providers/provider/#EnsResolver) >*

Returns an EnsResolver instance which can be used to further inquire about specific entries for an ENS name.


```javascript
//_hide: provider = ethers.getDefaultProvider();

// See below (Resolver) for examples of using this object
const resolver = await provider.getResolver("ricmoo.eth");

//_hide: _page.resolver = resolver;
```

#### *provider* . **lookupAddress**( address ) => *Promise< string >*

Performs a reverse lookup of the *address* in ENS using the *Reverse Registrar*. If the name does not exist, or the forward lookup does not match, `null` is returned.

An ENS name requries additional configuration to setup a reverse record, they are not automatically set up.


```javascript
//_result:
await provider.lookupAddress("0x5555763613a12D8F3e73be831DFf8598089d3dCa");
//_log:
```

#### *provider* . **resolveName**( name ) => *Promise< string< [Address](/v5/api/utils/address/#address) > >*

Looks up the address of *name*. If the name is not owned, or does not have a *Resolver* configured, or the *Resolver* does not have an address configured, `null` is returned.


```javascript
//_result:
await provider.resolveName("ricmoo.eth");
//_log:
```

EnsResolver
-----------

#### *resolver* . **name** => *string*

The name of this resolver.


#### *resolver* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

The address of the Resolver.


#### *resolver* . **getAddress**( [ cointType = 60 ] ) => *Promise< string >*

Returns a Promise which resolves to the [EIP-2304](https://eips.ethereum.org/EIPS/eip-2304) multicoin address stored for the *coinType*. By default an Ethereum [Address](/v5/api/utils/address/#address) (`coinType = 60`) will be returned.


```javascript
//_hide: const resolver = _page.resolver;

// By default, looks up the Ethereum address
// (this will match provider.resolveName)
//_result:
await resolver.getAddress();
//_log:

// Specify the coinType for other coin addresses (0 = Bitcoin)
//_result:
await resolver.getAddress(0);
//_log:
```

#### *resolver* . **getContentHash**( ) => *Promise< string >*

Returns a Promise which resolves to any stored [EIP-1577](https://eips.ethereum.org/EIPS/eip-1577) content hash.


```javascript
//_hide: const resolver = _page.resolver;

//_result:
await resolver.getContentHash();
//_log:
```

#### *resolver* . **getText**( key ) => *Promise< string >*

Returns a Promise which resolves to any stored [EIP-634](https://eips.ethereum.org/EIPS/eip-634) text entry for *key*.


```javascript
//_hide: const resolver = _page.resolver;

//_result:
await resolver.getText("email");
//_log:

//_result:
await resolver.getText("url");
//_log:

//_result:
await resolver.getText("com.twitter");
//_log:
```

Logs Methods
------------

#### *provider* . **getLogs**( filter ) => *Promise< Array< [Log](/v5/api/providers/types/#providers-Log) > >*

Returns the Array of [Log](/v5/api/providers/types/#providers-Log) matching the *filter*.

Keep in mind that many backends will discard old events, and that requests which are too broad may get dropped as they require too many resources to execute the query.


Network Status Methods
----------------------

#### *provider* . **getNetwork**( ) => *Promise< [Network](/v5/api/providers/types/#providers-Network) >*

Returns the [Network](/v5/api/providers/types/#providers-Network) this Provider is connected to.


```javascript
//_result:
await provider.getNetwork()
//_hide: _ = utils.shallowCopy(_);
//_hide: delete _._defaultProvider;
//_log:
```

#### *provider* . **getBlockNumber**( ) => *Promise< number >*

Returns the block number (or height) of the most recently mined block.


```javascript
//_result:
await provider.getBlockNumber()
//_log:
```

#### *provider* . **getGasPrice**( ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns a *best guess* of the [Gas Price](/v5/concepts/gas/#gas-price) to use in a transaction.


```javascript
// The gas price (in wei)...
gasPrice = await provider.getGasPrice()
//_log: gasPrice

// ...often this gas price is easier to understand or
// display to the user in gwei
//_result:
utils.formatUnits(gasPrice, "gwei")
//_log:
```

#### *provider* . **ready** => *Promise< [Network](/v5/api/providers/types/#providers-Network) >*

Returns a Promise which will stall until the network has heen established, ignoring errors due to the target node not being active yet.

This can be used for testing or attaching scripts to wait until the node is up and running smoothly.


Transactions Methods
--------------------

#### *provider* . **call**( transaction [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns the result of executing the *transaction*, using *call*. A call does not require any ether, but cannot change any state. This is useful for calling getters on Contracts.


```javascript
//_result:
await provider.call({
  // ENS public resovler address
  to: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",

  // `function addr(namehash("ricmoo.eth")) view returns (address)`
  data: "0x3b3b57debf074faa138b72c65adbdcfb329847e4f2c04bde7f7dd7fcad5a52d2f395a558"
});
//_log:
```

#### *provider* . **estimateGas**( transaction ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns an estimate of the amount of gas that would be required to submit *transaction* to the network.

An estimate may not be accurate since there could be another transaction on the network that was not accounted for, but after being mined affected relevant state.


```javascript
//_hide: const parseEther = ethers.utils.parseEther;

//_result:
await provider.estimateGas({
  // Wrapped ETH address
  to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",

  // `function deposit() payable`
  data: "0xd0e30db0",

  // 1 ether
  value: parseEther("1.0")
});
//_log:
```

#### *provider* . **getTransaction**( hash ) => *Promise< [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) >*

Returns the transaction with *hash* or null if the transaction is unknown.

If a transaction has not been mined, this method will search the transaction pool. Various backends may have more restrictive transaction pool access (e.g. if the gas price is too low or the transaction was only recently sent and not yet indexed) in which case this method may also return null.


```javascript
//_result:
await provider.getTransaction("0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0");
//_log:
```

#### *provider* . **getTransactionReceipt**( hash ) => *Promise< [TransactionReceipt](/v5/api/providers/types/#providers-TransactionReceipt) >*

Returns the transaction receipt for *hash* or null if the transaction has not been mined.

To stall until the transaction has been mined, consider the `waitForTransaction` method below.


```javascript
//_result:
await provider.getTransactionReceipt("0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0");
//_log:
```

#### *provider* . **sendTransaction**( transaction ) => *Promise< [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) >*

Submits *transaction* to the network to be mined. The *transaction* **must** be signed, and be valid (i.e. the nonce is correct and the account has sufficient balance to pay for the transaction).


```javascript
//_hide: const provider = localProvider;
//_hide: const wallet = new ethers.Wallet(ethers.utils.id("HelloWorld"), provider);
//_hide: const fundTx = await localSigner.sendTransaction({
//_hide:   to: wallet.address,
//_hide:   value: ethers.utils.parseEther("2.0")
//_hide: });
//_hide: await fundTx.wait();

//_result:
await provider.sendTransaction("0xf86e808502540be400825208948ba1f109551bd432803012645ac136ddd64dba72880de0b6b3a764000080820a96a0f0c5bcb11e5a16ab116c60a0e5837ae98ec36e7f217740076572e8183002edd2a01ed1b4411c2840b9793e8be5415a554507f1ea320069be6dcecabd7b9097dbd4");
//_log:
```

#### *provider* . **waitForTransaction**( hash [ , confirms = 1 [ , timeout ] ] ) => *Promise< [TxReceipt](/v5/api/providers/types/#providers-TransactionReceipt) >*

Returns a Promise which will not resolve until *transactionHash* is mined.

If *confirms* is 0, this method is non-blocking and if the transaction has not been mined returns null. Otherwise, this method will block until the transaction has *confirms* blocks mined on top of the block in which is was mined.


Event Emitter Methods
---------------------

#### *provider* . **on**( eventName , listener ) => *this*

Add a *listener* to be triggered for each *eventName* [event](/v5/api/providers/provider/#Provider--events).


#### *provider* . **once**( eventName , listener ) => *this*

Add a *listener* to be triggered for only the next *eventName* [event](/v5/api/providers/provider/#Provider--events), at which time it will be removed.


#### *provider* . **emit**( eventName , ...args ) => *boolean*

Notify all listeners of the *eventName* [event](/v5/api/providers/provider/#Provider--events), passing *args* to each listener. This is generally only used internally.


#### *provider* . **off**( eventName [ , listener ] ) => *this*

Remove a *listener* for the *eventName* [event](/v5/api/providers/provider/#Provider--events). If no *listener* is provided, all listeners for *eventName* are removed.


#### *provider* . **removeAllListeners**( [ eventName ] ) => *this*

Remove all the listeners for the *eventName* [events](/v5/api/providers/provider/#Provider--events). If no *eventName* is provided, **all** events are removed.


#### *provider* . **listenerCount**( [ eventName ] ) => *number*

Returns the number of listeners for the *eventName* [events](/v5/api/providers/provider/#Provider--events). If no *eventName* is provided, the total number of listeners is returned.


#### *provider* . **listeners**( eventName ) => *Array< Listener >*

Returns the list of Listeners for the *eventName* [events](/v5/api/providers/provider/#Provider--events).


### Events

#### **Log Filter**

A filter is an object, representing a contract log Filter, which has the optional properties `address` (the source contract) and `topics` (a topic-set to match).

If `address` is unspecified, the filter matches any contract address.

See [EventFilters](/v5/api/providers/types/#providers-EventFilter) for more information on filtering events.


#### **Topic-Set Filter**

The value of a **Topic-Set Filter** is a array of Topic-Sets.

This event is identical to a *Log Filter* with the address omitted (i.e. from any contract).

See [EventFilters](/v5/api/providers/types/#providers-EventFilter) for more information on filtering events.


#### **Transaction Filter**

The value of a **Transaction Filter** is any transaction hash.

This event is emitted on every block that is part of a chain that includes the given mined transaction. It is much more common that the [once](/v5/api/providers/provider/#Provider-once) method is used than the [on](/v5/api/providers/provider/#Provider-on) method.



In addition to transaction and filter events, there are several named events.


Named Provider Events



```javascript
//_hide: const txHash = utils.id("dummy-data");
//_hide: const myAddress = ethers.constants.HashZero;
//_hide: const myOtherAddress = ethers.constants.HashZero;

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
        utils.id("Transfer(address,address,uint256)")
    ]
}
provider.on(filter, (log, event) => {
    // Emitted whenever a DAI token transfer occurs
})


// Notice this is an array of topic-sets and is identical to
// using a filter with no address (i.e. match any address)
topicSets = [
    utils.id("Transfer(address,address,uint256)"),
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

//_hide: provider.removeAllListeners() /* Make sure the docs build without waiting forever */
```

Inspection Methods
------------------

#### *Provider* . **isProvider**( object ) => *boolean*

Returns true if and only if *object* is a Provider.


