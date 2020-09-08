-----

Documentation: [html](https://docs.ethers.io/)

-----

Example: ERC-20 Contract
========================

Connecting to a Contract
------------------------

```javascript
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
const address = "dai.tokens.ethers.eth";

// An example Provider
const provider = ethers.getDefaultProvider();

// An example Signer
const signer = ethers.Wallet.createRandom().connect(provider);

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

#### **new ***ethers* . **Contract**( address , abi , providerOrSigner )

See the above code example for creating an Instance which will (in addition to the Contact methods and properties) automatically add the additional properties defined in *abi* to a **Contract** connected to *address* using the *providerOrSigner*.


Properties
----------

#### *erc20* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

This is the address (or ENS name) the contract was constructed with.


#### *erc20* . **resolvedAddress** => *string< [Address](/v5/api/utils/address/#address) >*

This is a promise that will resolve to the address the **Contract** object is attached to. If an [Address](/v5/api/utils/address/#address) was provided to the constructor, it will be equal to this; if an ENS name was provided, this will be the resolved address.


#### *erc20* . **deployTransaction** => *[TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse)*

If the **Contract** object is the result of a ContractFactory deployment, this is the transaction which was used to deploy the contract.


#### *erc20* . **interface** => *[Interface](/v5/api/utils/abi/interface/)*

This is the ABI as an [Interface](/v5/api/utils/abi/interface/).


#### *erc20* . **provider** => *[Provider](/v5/api/providers/provider/)*

If a provider was provided to the constructor, this is that provider. If a signer was provided that had a [Provider](/v5/api/providers/provider/), this is that provider.


#### *erc20* . **signer** => *[Signer](/v5/api/signer/#Signer)*

If a signer was provided to the constructor, this is that signer.


Methods
-------

#### *erc20* . **attach**( addressOrName ) => *[Contract](/v5/api/contract/contract/)*

Returns a new instance of the **Contract** attached to a new address. This is useful if there are multiple similar or identical copies of a Contract on the network and you wish to interact with each of them.


#### *erc20* . **connect**( providerOrSigner ) => *[Contract](/v5/api/contract/contract/)*

Returns a new instance of the Contract, but connected to *providerOrSigner*.

By passing in a [Provider](/v5/api/providers/provider/), this will return a downgraded **Contract** which only has read-only access (i.e. constant calls).

By passing in a [Signer](/v5/api/signer/#Signer). this will return a **Contract** which will act on behalf of that signer.


#### *erc20* . **deployed**( ) => *Promise< Contract >*



#### *Contract* . **isIndexed**( value ) => *boolean*



Events
------

#### *erc20* . **queryFilter**( event [ , fromBlockOrBlockHash [ , toBlock ] ) => *Promise< Array< Event > >*

Return Events that match the *event*.


#### *erc20* . **listenerCount**( [ event ] ) => *number*

Return the number of listeners that are subscribed to *event*. If no event is provided, returns the total count of all events.


#### *erc20* . **listeners**( event ) => *Array< Listener >*

Return a list of listeners that are subscribed to *event*.


#### *erc20* . **off**( event , listener ) => *this*

Unsubscribe *listener* to *event*.


#### *erc20* . **on**( event , listener ) => *this*

Subscribe to *event* calling *listener* when the event occurs.


#### *erc20* . **once**( event , listener ) => *this*

Subscribe once to *event* calling *listener* when the event occurs.


#### *erc20* . **removeAllListeners**( [ event ] ) => *this*

Unsubscribe all listeners for *event*. If no event is provided, all events are unsubscribed.


Meta-Class Methods
------------------

#### *erc20* . **decimals**( [ overrides ] ) => *Promise< number >*

Returns the number of decimal places used by this ERC-20 token. This can be used with [parseUnits](/v5/api/utils/display-logic/#utils-parseUnits) when taking input from the user or [formatUnits](utils-formatunits] when displaying the token amounts in the UI.


#### *erc20* . **getBalance**( owner [ , overrides ] ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns the balance of *owner* for this ERC-20 token.


#### *erc20* . **symbol**( [ overrides ] ) => *Promise< string >*

Returns the symbol of the token.


#### *erc20_rw* . **transfer**( target , amount [ , overrides ] ) => *Promise< [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) >*

Transfers *amount* tokens to *target* from the current signer. The return value (a boolean) is inaccessible during a write operation using a transaction. Other techniques (such as events) are required if this value is required. On-chain contracts calling the `transfer` function have access to this result, which is why it is possible.


#### *erc20* . *callStatic* . **transfer**( target , amount [ , overrides ] ) => *Promise< boolean >*

Performs a dry-run of transferring *amount* tokens to *target* from the current signer, without actually signing or sending a transaction.

This can be used to preflight check that a transaction will be successful.


#### *erc20* . *estimateGas* . **transfer**( target , amount [ , overrides ] ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns an estimate for how many units of gas would be required to transfer *amount* tokens to *target*.


#### *erc20* . *populateTransaction* . **transfer**( target , amount [ , overrides ] ) => *Promise< [UnsignedTx](/v5/api/utils/transactions/#UnsignedTransaction) >*

Returns an [UnsignedTransaction](/v5/api/utils/transactions/#UnsignedTransaction) which could be signed and submitted to the network to transaction *amount* tokens to *target*.


#### Note on Estimating and Static Calling

When you perform a static call, the current state is taken into account as best as Ethereum can determine. There are many cases where this can provide false positives and false negatives. The eventually consistent model of the blockchain also means there are certain consistency modes that cannot be known until an actual transaction is attempted.


Meta-Class Filters
------------------

#### *erc20* . *filters* . **Transfer**( [ fromAddress [ , toAddress ] ] ) => *Filter*

Returns a new Filter which can be used to [query](/v5/api/contract/example/#erc20-queryfilter) or to [subscribe/unsubscribe to events](/v5/api/contract/example/#erc20-events).

If *fromAddress* is null or not provided, then any from address matches. If *toAddress* is null or not provided, then any to address matches.


