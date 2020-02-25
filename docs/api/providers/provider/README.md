-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Provider
========


Explain what a provider is...


Accounts Methods
----------------



#### *provider* . **getBalance** ( address [  , blockTag="latest" ]  )  **=>** *Promise< [BigNumber](../../utils/bignumber) >*

Returns the balance of *address* as of the *blockTag* block height.




#### *provider* . **getCode** ( address [  , blockTag="latest" ]  )  **=>** *Promise< string< [DataHexstring](../../utils/bytes) > >*

Returns the contract code of *address* as of the *blockTag* block height. If there is
no contract currently deployed, the result is `0x`.




#### *provider* . **getStorageAt** ( addr , pos [  , blockTag="latest" ]  )  **=>** *Promise< string< [DataHexstring](../../utils/bytes) > >*

Returns the `Bytes32` value of the position *pos* at address *addr*, as of the *blockTag*.




#### *provider* . **getTransactionCount** ( address [  , blockTag="latest" ]  )  **=>** *Promise< number >*

Returns the number of transactions *address* has ever **sent**, as of *blockTag*.
This value is required to be the nonce for the next transaction from *address*
sent to the network.




### Examples



```javascript
Skipping JavaScript Evaluation.
```



Blocks Methods
--------------



#### *provider* . **getBlock** ( block )  **=>** *Promise< [Block](../types) >*

Get the *block* from the network, where the `result.transactions` is a list
of transaction hashes.




#### *provider* . **getBlockWithTransactions** ( block )  **=>** *Promise< [BlockWithTransactions](../types) >*

Get the *block* from the network, where the `result.transactions` is
an Array of [TransactionResponse](../types) objects.




Ethereum Naming Service (ENS) Methods
-------------------------------------


TODO: Explain ENS here...


#### *provider* . **lookupAddress** ( address )  **=>** *Promise< string >*

Performs a reverse lookup of the *address* in ENS using the
*Reverse Registrar*.  If the name does not exist, or the
forward lookup does not match, `null` is returned.




#### *provider* . **resolveName** ( name )  **=>** *Promise< string< [Address](../../utils/address) > >*

Looks up the address of *name*. If the name is not owned, or
does not have a *Resolver* configured, or the *Resolver* does
not have an address configured, `null` is returned.




### Examples



```javascript
Skipping JavaScript Evaluation.
```



Logs Methods
------------



#### *provider* . **getLogs** ( filter )  **=>** *Promise< Array< [Log](../types) > >*

Returns the Array of [Log](../types) matching the *filter*.

Keep in mind that many backends will discard old events, and that requests
which are too broad may get dropped as they require too many resources to
execute the query.




Network Status Methods
----------------------



#### *provider* . **getNetwork** (  )  **=>** *Promise< [Network](../types) >*

Returns the [Network](../types) this Provider is connected to.




#### *provider* . **getBlockNumber** (  )  **=>** *Promise< number >*

Returns the block number (or height) of the most recently mined block.




#### *provider* . **getGasPrice** (  )  **=>** *Promise< [BigNumber](../../utils/bignumber) >*

Returns a *best guess* of the [Gas Price](../../../concepts/gas) to use in a transaction.




Transactions Methods
--------------------



#### *provider* . **call** ( transaction [  , blockTag="latest" ]  )  **=>** *Promise< string< [Hexstring](../../utils/bytes) > >*

Returns the result of executing the *transaction*, using *call*. A call
does not require any ether, but cannot change any state. This is useful
for calling gettings on Contracts.




#### *provider* . **estimateGas** ( transaction )  **=>** *Promise< [BigNumber](../../utils/bignumber) >*

Returns an estimate of the amount of gas that would be required to submit *transaction*
to the network.

An estimate may not be accurate since there could be another transaction
on the network that was not accounted for, but after being mined affected
relevant state.




#### *provider* . **sendTransaction** ( transaction )  **=>** *Promise< [TransactionResponse](../types) >*

Submits *transaction* to the network to be mined. The *transaction* **must** be signed,
and be valid (i.e. the nonce is correct and the account has sufficient balance to pay
for the transaction).




#### *provider* . **waitForTransaction** ( transactionHash )  **=>** *Promise< [TransactionReceipt](../types) >*

Returns a Promise which will not resolve until *transactionHash* is mined.




Event Emitter Methods
---------------------


Explain events here...


#### *provider* . **on** ( eventName , listener )  **=>** *this*

Add a *listener* to be triggered for each *eventName*.




#### *provider* . **once** ( eventName , listener )  **=>** *this*

Add a *listener* to be triggered for only the next *eventName*,
at which time it be removed.




#### *provider* . **emit** ( eventName , ...args )  **=>** *boolean*

Notify all listeners of *eventName*, passing *args* to each listener. This
is generally only used internally.




#### *provider* . **off** ( eventName [  , listener ]  )  **=>** *this*

Remove a *listener* for *eventName*. If no *listener* is provided,
all listeners for *eventName* are removed.




#### *provider* . **removeAllListeners** (  [ eventName ]  )  **=>** *this*

Remove all the listeners for *eventName*. If no *eventName* is provided,
**all** events are removed.




#### *provider* . **listenerCount** (  [ eventName ]  )  **=>** *number*

Returns the number of listeners for *eventName*. If no *eventName* is
provided, the total number of listeners is returned.




#### *provider* . **listeners** ( eventName )  **=>** *Array< Listener >*

Returns the list of Listeners for *eventName*.




Inspection Methods
------------------



#### *Provider* . **isProvider** ( object )  **=>** *boolean*

Returns true if and only if *object* is a Provider.





-----
**Content Hash:** 22872aec1236c5cf8fb457e93f36ca9bcd260acddc08c1ededc642931fd1625f