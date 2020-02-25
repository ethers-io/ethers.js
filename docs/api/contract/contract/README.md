-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Contract
========



Properties
----------



#### *contract* . **address** **=>** *string< [Address](../../utils/address) >*

This is the address (or ENS name) the contract was constructed with.




#### *contract* . **addressPromise** **=>** *string< [Address](../../utils/address) >*

This is a promise that will resolve to the address the **Contract**
object is attached to. If an [Address](../../utils/address) was provided to the constructor,
it will be equal to this; if an ENS name was provided, this will be the
resolved address.




#### *contract* . **deployTransaction** **=>** *[TransactionResponse](../../providers/types)*

If the **Contract** object is the result of a ContractFactory deployment,
this is the transaction which was used to deploy the contract.




#### *contract* . **interface** **=>** *[Interface](../../utils/abi/interface)*

This is the ABI as an [Interface](../../utils/abi/interface).




#### *contract* . **provider** **=>** *[Provider](../../providers/provider)*

If a provider was provided to the constructor, this is that provider. If
a signer was provided that had a [Provider](../../providers/provider), this is that provider.




#### *contract* . **signer** **=>** *[Signer](../../signer)*

If a signer was provided to the constructor, this is that signer.




Methods
-------



#### *contract* . **attach** ( addressOrName )  **=>** *[Contract](./)*

Returns a new instance of the **Contract** attached to a new
address. This is useful if there are multiple similar or identical
copies of a Contract on the network and you wish to interact with
each of them.




#### *contract* . **connect** ( providerOrSigner )  **=>** *[Contract](./)*

Returns a new instance of the Contract, but connected to
*providerOrSigner*.

By passing in a [Provider](../../providers/provider), this will return a downgraded
**Contract** which only has read-only access (i.e. constant calls).

By passing in a [Signer](../../signer). the will return a **Contract** which
will act on behalf of that signer.




#### *contract* . **deployed** (  )  **=>** *Promise< [Contract](./) >*






#### *Contract* . **isIndexed** ( value )  **=>** *boolean*






Events
------



#### *contract* . **queryFilter** ( event [  , fromBlockOrBlockHash [  , toBlock ]  )  **=>** *Promise< Array< Event > >*

Return Events that match the *event*.




#### *contract* . **listenerCount** (  [ event ]  )  **=>** *number*

Return the number of listeners that are subscribed to *event*. If
no event is provided, returns the total count of all events.




#### *contract* . **listeners** ( event )  **=>** *Array< Listener >*

Return a list of listeners that are subscribed to *event*.




#### *contract* . **off** ( event , listener )  **=>** *this*

Unsubscribe *listener* to *event*.




#### *contract* . **on** ( event , listener )  **=>** *this*

Subscribe to *event* calling *listener* when the event occurs.




#### *contract* . **once** ( event , listener )  **=>** *this*

Subscribe once to *event* calling *listener* when the event
occurs.




#### *contract* . **removeAllListeners** (  [ event ]  )  **=>** *this*

Unsubscribe all listeners for *event*. If no event is provided,
all events are unsubscribed.




Meta-Class
----------


A Meta-Class is a Class which has any of its properties determined
at run-time. The **Contract** object uses a Contract's ABI to
determine what methods are available, so the following sections
describe the generic ways to interact with the properties added
at run-time during the **Contract** constructor.


### Read-Only Methods (constant)


A constant method is read-only and evaluates a small amount of EVM
code against the current blockchain state and can be computed by
asking a single node, which can return a result. It is therefore
free and does not require any ether, but **cannot make changes** to
the blockchain state..


#### *contract* . **METHOD_NAME** ( ...args [ overrides ]  )  **=>** *Promise< any >*

The type of the result depends on the ABI.

For values that have a simple meaning in JavaScript, the types are fairly
straight forward; strings and booleans are returned as JavaScript strings
and booleans.

For numbers, if the **type** is in the JavaSsript safe range (i.e. less
than 53 bits, such as an `int24` or `uint48`) a normal JavaScript
number is used. Otherwise a [BigNumber](../../utils/bignumber) is returned.

For bytes (both fixed length and dynamic), a [DataHexstring](../../utils/bytes) is returned.




### Write Methods (non-constant)


A non-constant method requires a transaction to be signed and requires
payment in the form of a fee to be paid to a miner. This transaction
will be verified by every node on the entire network as well by the
miner who will compute the new state of the blockchain after executing
it against the current state.

It cannot return a result. If a result is required, it should be logged
using a Solidity event (or EVM log), which can then be queried from the
transaction receipt.


#### *contract* . **METHOD_NAME** ( ...args [  , overrides ]  )  **=>** *Promise< [TransactionResponse](../../providers/types) >*

Returns a [TransactionResponse](../../providers/types) for the transaction after
it is sent to the network. This requires the **Contract** has a
signer.




### Write Methods Analysis


There are secveral options to analyze properties and results of a
write method without actually executing it.


#### *contract* . *estimate* . **METHOD_NAME** ( ...args [  , overrides ]  )  **=>** *Promise< [BigNumber](../../utils/bignumber) >*

Returns the estimate units of gas that would be required to
execute the *METHOD_NAME* with *args* and *overrides*.




#### *contract* . *populateTransaction* . **METHOD_NAME** ( ...args [  , overrides ]  )  **=>** *Promise< [UnsignedTx](../../utils/transactions) >*

Returns an [UnsignedTransaction](../../utils/transactions) which represents the transaction
that would need to be signed and submitted to the network to execute
*METHOD_NAME* with *args/ and *overrides//.




#### *contract* . *staticCall* . **METHOD_NAME** ( ...args [  , overrides ]  )  **=>** *Promise< any >*

Rather than executing the state-change of a transaction, it is possible
to ask a node to *pretend* that a call is not state-changing and
return the result.

This does not actually chagne any state, but is free. This in some cases
can be used to determine if a transaction will fail or succeed.

This otherwise functions the same as a [Read-Only Method](./).




### Event Filters


An event filter is made up of topics, which are values logged in a
[Bloom Filter](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Bloom_filter), allowing efficient searching for entries
which match a filter.


#### *contract* . *filters* . **EVENT_NAME** ( ...args )  **=>** *Filter*

Return a filter for *EVENT_NAME*, optionally filtering by additional
constraints.

Only `indexed` event parameters may be filtered. If a parameter is
null (or not provided) then any value in that field matches.





-----
**Content Hash:** 8f1f64a28b2501d01dcf4b55c405c43096f3a9daca7169a96022000a315b2ef2