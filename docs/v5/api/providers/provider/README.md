-----

Documentation: [html](https://docs.ethers.io/)

-----

Provider
========

Accounts Methods
----------------

#### *provider* . **getBalance**( address [ , blockTag = latest ] ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns the balance of *address* as of the *blockTag* block height.


#### *provider* . **getCode**( address [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns the contract code of *address* as of the *blockTag* block height. If there is no contract currently deployed, the result is `0x`.


#### *provider* . **getStorageAt**( addr , pos [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns the `Bytes32` value of the position *pos* at address *addr*, as of the *blockTag*.


#### *provider* . **getTransactionCount**( address [ , blockTag = latest ] ) => *Promise< number >*

Returns the number of transactions *address* has ever **sent**, as of *blockTag*. This value is required to be the nonce for the next transaction from *address* sent to the network.


```javascript
// Get the balance for an account...
provider.getBalance("ricmoo.firefly.eth");
// { Promise: { BigNumber: "1578527309436018765" } }

// Get the code for a contract...
provider.getCode("registrar.firefly.eth");
// { Promise: '0x606060405236156100885763ffffffff60e060020a60003504166369fe0e2d81146100fa578063704b6c021461010f57806379502c551461012d578063bed866f614610179578063c37067fa1461019e578063c66485b2146101ab578063d80528ae146101c9578063ddca3f43146101f7578063f2c298be14610219578063f3fef3a314610269575b6100f85b6000808052600760209081527f6d5257204ebe7d88fd91ae87941cb2dd9d8062b64ae5a2bd2d28ec40b9fbf6df80543490810190915560408051918252517fdb7750418f9fa390aaf85d881770065aa4adbe46343bcff4ae573754c829d9af929181900390910190a25b565b005b341561010257fe5b6100f860043561028a565b005b341561011757fe5b6100f8600160a060020a03600435166102ec565b005b341561013557fe5b61013d610558565b60408051600160a060020a0396871681526020810195909552928516848401526060840191909152909216608082015290519081900360a00190f35b341561018157fe5b61018c600435610580565b60408051918252519081900360200190f35b6100f8600435610595565b005b34156101b357fe5b6100f8600160a060020a03600435166105e6565b005b34156101d157fe5b6101d9610676565b60408051938452602084019290925282820152519081900360600190f35b34156101ff57fe5b61018c61068d565b60408051918252519081900360200190f35b6100f8600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965061069495505050505050565b005b341561027157fe5b6100f8600160a060020a0360043516602435610ab2565b005b60025433600160a060020a039081169116146102a65760006000fd5b600454604080519182526020820183905280517f854231545a00e13c316c82155f2b8610d638e9ff6ebc4930676f84a5af08a49a9281900390910190a160048190555b50565b60025433600160a060020a039081169116146103085760006000fd5b60025460408051600160a060020a039283168152918316602083015280517fbadc9a52979e89f78b7c58309537410c5e51d0f63a0a455efe8d61d2b474e6989281900390910190a16002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a038381169190911790915560008054604080516020908101849052815160e060020a6302571be30281527f91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e26004820152915192909416936302571be39360248084019492938390030190829087803b15156103e957fe5b60325a03f115156103f657fe5b50505060405180519050600160a060020a0316631e83409a826000604051602001526040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b151561045f57fe5b60325a03f1151561046c57fe5b50506040805160008054600354602093840183905284517f0178b8bf00000000000000000000000000000000000000000000000000000000815260048101919091529351600160a060020a039091169450630178b8bf9360248082019493918390030190829087803b15156104dd57fe5b60325a03f115156104ea57fe5b505060408051805160035460025460e860020a62d5fa2b0284526004840191909152600160a060020a03908116602484015292519216925063d5fa2b0091604480830192600092919082900301818387803b151561054457fe5b60325a03f1151561055157fe5b5050505b50565b600054600354600254600454600154600160a060020a039485169492831692165b9091929394565b6000818152600760205260409020545b919050565b6000818152600760209081526040918290208054349081019091558251908152915183927fdb7750418f9fa390aaf85d881770065aa4adbe46343bcff4ae573754c829d9af92908290030190a25b50565b60025433600160a060020a039081169116146106025760006000fd5b60015460408051600160a060020a039283168152918316602083015280517f279875333405c968e401e3bc4e71d5f8e48728c90f4e8180ce28f74efb5669209281900390910190a16001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0383161790555b50565b600654600554600160a060020a033016315b909192565b6004545b90565b80516001820190600080808060048510806106af5750601485115b156106ba5760006000fd5b600093505b8484101561072a57855160ff16925060618310806106e05750607a8360ff16115b80156106fc575060308360ff1610806106fc575060398360ff16115b5b801561070d57508260ff16602d14155b156107185760006000fd5b6001909501945b6001909301926106bf565b60045434101561073a5760006000fd5b866040518082805190602001908083835b6020831061076a5780518252601f19909201916020918201910161074b565b51815160209384036101000a60001901801990921691161790526040805192909401829003822060035483528282018190528451928390038501832060008054948401819052865160e060020a6302571be3028152600481018390529651929a509098509650600160a060020a0390921694506302571be393602480820194509192919082900301818787803b15156107ff57fe5b60325a03f1151561080c57fe5b505060405151600160a060020a031691909114905061082b5760006000fd5b60008054600354604080517f06ab5923000000000000000000000000000000000000000000000000000000008152600481019290925260248201869052600160a060020a03308116604484015290519216926306ab59239260648084019382900301818387803b151561089a57fe5b60325a03f115156108a757fe5b505060008054600154604080517f1896f70a00000000000000000000000000000000000000000000000000000000815260048101879052600160a060020a0392831660248201529051919092169350631896f70a9260448084019391929182900301818387803b151561091657fe5b60325a03f1151561092357fe5b50506001546040805160e860020a62d5fa2b02815260048101859052600160a060020a033381166024830152915191909216925063d5fa2b009160448082019260009290919082900301818387803b151561097a57fe5b60325a03f1151561098757fe5b505060008054604080517f5b0fc9c300000000000000000000000000000000000000000000000000000000815260048101869052600160a060020a0333811660248301529151919092169350635b0fc9c39260448084019391929182900301818387803b15156109f357fe5b60325a03f11515610a0057fe5b505060058054349081019091556006805460010190556000838152600760209081526040918290208054840190558151600160a060020a03331681529081019290925280518493507f179ef3319e6587f6efd3157b34c8b357141528074bcb03f9903589876168fa149281900390910190a260408051348152905182917fdb7750418f9fa390aaf85d881770065aa4adbe46343bcff4ae573754c829d9af919081900360200190a25b50505050505050565b60025433600160a060020a03908116911614610ace5760006000fd5b604051600160a060020a0383169082156108fc029083906000818181858888f193505050501515610aff5760006000fd5b60408051600160a060020a03841681526020810183905281517fac375770417e1cb46c89436efcf586a74d0298fee9838f66a38d40c65959ffda929181900390910190a15b50505600a165627a7a723058205c3628c01dc80233f51979d91a76cec2a25d84e86c9838d34672734ca2232b640029' }

// Get the storage value at position 0...
provider.getStorageAt("registrar.firefly.eth", 0)
// { Promise: '0x000000000000000000000000314159265dd8dbb310642f98f50c066173c1259b' }

// Get transaction count of an account...
provider.getTransactionCount("ricmoo.firefly.eth");
// { Promise: 673 }
```

Blocks Methods
--------------

#### *provider* . **getBlock**( block ) => *Promise< [Block](/v5/api/providers/types/#providers-Block) >*

Get the *block* from the network, where the `result.transactions` is a list of transaction hashes.


#### *provider* . **getBlockWithTransactions**( block ) => *Promise< [BlockWithTransactions](/v5/api/providers/types/#providers-BlockWithTransactions) >*

Get the *block* from the network, where the `result.transactions` is an Array of [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) objects.


```javascript
provider.getBlock(100004)
// { Promise: {
//   difficulty: 3849295379889,
//   extraData: '0x476574682f76312e302e312d39383130306634372f6c696e75782f676f312e34',
//   gasLimit: { BigNumber: "3141592" },
//   gasUsed: { BigNumber: "21000" },
//   hash: '0xf93283571ae16dcecbe1816adc126954a739350cd1523a1559eabeae155fbb63',
//   miner: '0x909755D480A27911cB7EeeB5edB918fae50883c0',
//   nonce: '0x1a455280001cc3f8',
//   number: 100004,
//   parentHash: '0x73d88d376f6b4d232d70dc950d9515fad3b5aa241937e362fdbfd74d1c901781',
//   timestamp: 1439799168,
//   transactions: [
//     '0x6f12399cc2cb42bed5b267899b08a847552e8c42a64f5eb128c1bcbd1974fb0c'
//   ]
// } }

provider.getBlockWithTransactions(100004)
// { Promise: {
//   difficulty: 3849295379889,
//   extraData: '0x476574682f76312e302e312d39383130306634372f6c696e75782f676f312e34',
//   gasLimit: { BigNumber: "3141592" },
//   gasUsed: { BigNumber: "21000" },
//   hash: '0xf93283571ae16dcecbe1816adc126954a739350cd1523a1559eabeae155fbb63',
//   miner: '0x909755D480A27911cB7EeeB5edB918fae50883c0',
//   nonce: '0x1a455280001cc3f8',
//   number: 100004,
//   parentHash: '0x73d88d376f6b4d232d70dc950d9515fad3b5aa241937e362fdbfd74d1c901781',
//   timestamp: 1439799168,
//   transactions: [
//     {
//       blockHash: '0xf93283571ae16dcecbe1816adc126954a739350cd1523a1559eabeae155fbb63',
//       blockNumber: 100004,
//       chainId: 0,
//       confirmations: 10297123,
//       creates: null,
//       data: '0x',
//       from: '0xcf00A85f3826941e7A25BFcF9Aac575d40410852',
//       gasLimit: { BigNumber: "90000" },
//       gasPrice: { BigNumber: "54588778004" },
//       hash: '0x6f12399cc2cb42bed5b267899b08a847552e8c42a64f5eb128c1bcbd1974fb0c',
//       nonce: 25,
//       r: '0xb23adc880d3735e4389698dddc953fb02f1fa9b57e84d3510a2a4b3597ac2486',
//       s: '0x4e856f95c4e2828933246fb4765a5bfd2ca5959840643bef0e80b4e3a243d064',
//       to: '0xD9666150A9dA92d9108198a4072970805a8B3428',
//       transactionIndex: 0,
//       v: 27,
//       value: { BigNumber: "5000000000000000000" }
//     }
//   ]
// } }
```

Ethereum Naming Service (ENS) Methods
-------------------------------------

#### *provider* . **lookupAddress**( address ) => *Promise< string >*

Performs a reverse lookup of the *address* in ENS using the *Reverse Registrar*. If the name does not exist, or the forward lookup does not match, `null` is returned.


#### *provider* . **resolveName**( name ) => *Promise< string< [Address](/v5/api/utils/address/#address) > >*

Looks up the address of *name*. If the name is not owned, or does not have a *Resolver* configured, or the *Resolver* does not have an address configured, `null` is returned.


```javascript
// Reverse lookup of an ENS by address...
provider.lookupAddress("0x6fC21092DA55B392b045eD78F4732bff3C580e2c");
// { Promise: 'registrar.firefly.eth' }

// Lookup an address of an ENS name...
provider.resolveName("ricmoo.firefly.eth");
// { Promise: '0x8ba1f109551bD432803012645Ac136ddd64DBA72' }
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


#### *provider* . **getBlockNumber**( ) => *Promise< number >*

Returns the block number (or height) of the most recently mined block.


#### *provider* . **getGasPrice**( ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns a *best guess* of the [Gas Price](/v5/concepts/gas/#gas-price) to use in a transaction.


```javascript
// The network information
provider.getNetwork()
// {
//   chainId: 1,
//   ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
//   name: 'homestead'
// }

// The current block number
provider.getBlockNumber()
// { Promise: 10397126 }

// Get the current suggested gas price (in wei)...
gasPrice = await provider.getGasPrice()
// { BigNumber: "19000001123" }

// ...often this gas price is easier to understand or
// display to the user in gwei (giga-wei, or 1e9 wei)
utils.formatUnits(gasPrice, "gwei")
// '19.000001123'
```

Transactions Methods
--------------------

#### *provider* . **call**( transaction [ , blockTag = latest ] ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns the result of executing the *transaction*, using *call*. A call does not require any ether, but cannot change any state. This is useful for calling gettings on Contracts.


#### *provider* . **estimateGas**( transaction ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns an estimate of the amount of gas that would be required to submit *transaction* to the network.

An estimate may not be accurate since there could be another transaction on the network that was not accounted for, but after being mined affected relevant state.


#### *provider* . **sendTransaction**( transaction ) => *Promise< [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) >*

Submits *transaction* to the network to be mined. The *transaction* **must** be signed, and be valid (i.e. the nonce is correct and the account has sufficient balance to pay for the transaction).


#### *provider* . **waitForTransaction**( hash [ , confirms = 1 [ , timeout ] ] ) => *Promise< [TxReceipt](/v5/api/providers/types/#providers-TransactionReceipt) >*

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

This event is emitted on every block that is part of a chain that includes the given mined transaction. It is much more common that the [once](/v5/api/providers/provider/#Provider-once) method is used than the [on](/v5/api/providers/provider/#Provider-on) method.



In addition to transaction and filter events, there are several named events.


Named Provider Events



```javascript
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
```

Inspection Methods
------------------

#### *Provider* . **isProvider**( object ) => *boolean*

Returns true if and only if *object* is a Provider.


