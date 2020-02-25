-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Example: ERC-20 Contract
========================



Connecting to a Contract
------------------------



```
// A Human-Readable ABI; any supported ABI format could be used
const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (boolean)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

// This can be an address or an ENS name
const address = "demotoken.ethers.eth";

// An example Provider (connceted to testnet)
const provider = ethers.getDefaultProvider("ropsten");

// An example Signer
const signer = ethers.Wallet.createRandom(provider);

// Read-Only; By connecting to a Provider, allows:
// - Any constant function
// - Querying Filters
// - Populating Unsigned Transactions for non-constant methods
// - Estimating Gas for non-constant (as an anonymous sender)
// - Static Calling non-constant methods (as anonymous sender)
const erc20 = new ethers.Contract(address, abi, provider);

// Read-Write; By connecting to a Signer, allows:
// - Everything from Read-Only (except as Signer, not anonymous)
// - Sending transactions for non-constant functions
const erc20_rw = new ethers.Contract(address, abi, signer)
```



### ERC20Contract



#### **new** *ethers* . **Contract** ( address , abi , providerOrSigner ) 

See the above code example for creating an Instance which will
(in addition to the Contact methods and properties) automatically
add the additional properties defined in *abi* to a **Contract**
connected to *address* using the *providerOrSigner*.




Properties ^(*(inheritted from [Contract](../contract))*)
---------------------------------------------------------



#### *erc20* . **address** **=>** *string< [Address](../../utils/address) >*

This is the address (or ENS name) the contract was constructed with.




#### *erc20* . **addressPromise** **=>** *string< [Address](../../utils/address) >*

This is a promise that will resolve to the address the **Contract**
object is attached to. If an [Address](../../utils/address) was provided to the constructor,
it will be equal to this; if an ENS name was provided, this will be the
resolved address.




#### *erc20* . **deployTransaction** **=>** *[TransactionResponse](../../providers/types)*

If the **Contract** object is the result of a ContractFactory deployment,
this is the transaction which was used to deploy the contract.




#### *erc20* . **interface** **=>** *[Interface](../../utils/abi/interface)*

This is the ABI as an [Interface](../../utils/abi/interface).




#### *erc20* . **provider** **=>** *[Provider](../../providers/provider)*

If a provider was provided to the constructor, this is that provider. If
a signer was provided that had a [Provider](../../providers/provider), this is that provider.




#### *erc20* . **signer** **=>** *[Signer](../../signer)*

If a signer was provided to the constructor, this is that signer.




Methods ^(*(inheritted from [Contract](../contract))*)
------------------------------------------------------



#### *erc20* . **attach** ( addressOrName )  **=>** *[Contract](../contract)*

Returns a new instance of the **Contract** attached to a new
address. This is useful if there are multiple similar or identical
copies of a Contract on the network and you wish to interact with
each of them.




#### *erc20* . **connect** ( providerOrSigner )  **=>** *[Contract](../contract)*

Returns a new instance of the Contract, but connected to
*providerOrSigner*.

By passing in a [Provider](../../providers/provider), this will return a downgraded
**Contract** which only has read-only access (i.e. constant calls).

By passing in a [Signer](../../signer). the will return a **Contract** which
will act on behalf of that signer.




#### *erc20* . **deployed** (  )  **=>** *Promise< Contract >*






#### *Contract* . **isIndexed** ( value )  **=>** *boolean*






Events ^(*(inheritted from Contract)*)
--------------------------------------



#### *erc20* . **queryFilter** ( event [  , fromBlockOrBlockHash [  , toBlock ]  )  **=>** *Promise< Array< Event > >*

Return Events that match the *event*.




#### *erc20* . **listenerCount** (  [ event ]  )  **=>** *number*

Return the number of listeners that are subscribed to *event*. If
no event is provided, returns the total count of all events.




#### *erc20* . **listeners** ( event )  **=>** *Array< Listener >*

Return a list of listeners that are subscribed to *event*.




#### *erc20* . **off** ( event , listener )  **=>** *this*

Unsubscribe *listener* to *event*.




#### *erc20* . **on** ( event , listener )  **=>** *this*

Subscribe to *event* calling *listener* when the event occurs.




#### *erc20* . **once** ( event , listener )  **=>** *this*

Subscribe once to *event* calling *listener* when the event
occurs.




#### *erc20* . **removeAllListeners** (  [ event ]  )  **=>** *this*

Unsubscribe all listeners for *event*. If no event is provided,
all events are unsubscribed.




Meta-Class Methods ^(*(added at Runtime)*)
------------------------------------------


Since the Contract is a Meta-Class, the methods available here depend
on the ABI which was passed into the **Contract**.


#### *erc20* . **decimals** (  [ overrides ]  )  **=>** *Promise< number >*

Returns the number of decimal places used by this ERC-20 token. This can be
used with [parseUnits](../../utils/display-logic) when taking input from the user or
[formatUnits](utils-formatunits] when displaying the token amounts in the UI.




#### *erc20* . **getBalance** ( owner [  , overrides ]  )  **=>** *Promise< [BigNumber](../../utils/bignumber) >*

Returns the balance of *owner* for this ERC-20 token.




#### *erc20* . **symbol** (  [ overrides ]  )  **=>** *Promise< string >*

Returns the symbol of the token.




#### *erc20_rw* . **transfer** ( target , amount [  , overrides ]  )  **=>** *Promise< [TransactionResponse](../../providers/types) >*

Transfers *amount* tokens to *target* from the current signer.
The return value (a boolean) is inaccessible during a write operation
using a transaction. Other techniques (such as events) are required
if this value is required. On-chain contracts calling the `transfer`
function have access to this result, which is why it is possible.




#### *erc20* . *callStatic* . **transfer** ( target , amount [  , overrides ]  )  **=>** *Promise< boolean >*

Performs a dry-run of transferring *amount* tokens to *target* from
the current signer, without actually signing or sending a transaction.

This can be used to preflight check that a transaction will be successful.




#### *erc20* . *estimate* . **transfer** ( target , amount [  , overrides ]  )  **=>** *Promise< [BigNumber](../../utils/bignumber) >*

Returns an estimate for how many units of gas would be required
to transfer *amount* tokens to *target*.




#### *erc20* . *populateTransaction* . **transfer** ( target , amount [  , overrides ]  )  **=>** *Promise< [UnsignedTx](../../utils/transactions) >*

Returns an [UnsignedTransaction](../../utils/transactions) which could be signed and submitted
to the network to transaction *amount* tokens to *target*.




#### Note on Estimating and Static Calling

When you perform a static call, the current state is taken into account as
best as Ethereum can determine. There are many cases where this can provide
false positives and false negatives. The eventually consistent model of the
blockchain also means there are certain consistency modes that cannot be
known until an actual transaction is attempted.




Meta-Class Filters ^(*(added at Runtime)*)
------------------------------------------


Since the Contract is a Meta-Class, the methods available here depend
on the ABI which was passed into the **Contract**.


#### *erc20* . *filters* . **Transafer** (  [ fromAddress [  , toAddress ]  ]  )  **=>** *Filter*

Returns a new Filter which can be used to [query](./) or
to [subscribe/unsubscribe to events](./).

If *fromAddress* is null or not provided, then any from address matches.
If *toAddress* is null or not provided, then any to address matches.





-----
**Content Hash:** a3d2ad294a2b4b4500d3f80c7a1cdc76420fee234ad271d90f5c609b040e93fa