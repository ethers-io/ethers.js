# Example: ERC-20 Contract

The concept of Meta-Classes is somewhat confusing, so we will go over a short example.

A meta-class is a class which is defined at run-time. A Contract is specified by an _Application Binary Interface_ (ABI), which describes the methods and events it has. This description is passed the the [Contract](contract.md) object at run-time, and it creates a new Class, adding all the methods defined in the ABI at run-time.

### Deploying a Contract

Most often, any contract you will need to interact with will already be deployed, but for this example will will first deploy the contract.

```typescript
const bytecode = "0x608060405234801561001057600080fd5b506040516103bc3803806103bc83398101604081905261002f9161007c565b60405181815233906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a333600090815260208190526040902055610094565b60006020828403121561008d578081fd5b5051919050565b610319806100a36000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063313ce5671461005157806370a082311461006557806395d89b411461009c578063a9059cbb146100c5575b600080fd5b604051601281526020015b60405180910390f35b61008e610073366004610201565b6001600160a01b031660009081526020819052604090205490565b60405190815260200161005c565b604080518082018252600781526626bcaa37b5b2b760c91b6020820152905161005c919061024b565b6100d86100d3366004610222565b6100e8565b604051901515815260200161005c565b3360009081526020819052604081205482111561014b5760405162461bcd60e51b815260206004820152601a60248201527f696e73756666696369656e7420746f6b656e2062616c616e6365000000000000604482015260640160405180910390fd5b336000908152602081905260408120805484929061016a9084906102b6565b90915550506001600160a01b0383166000908152602081905260408120805484929061019790849061029e565b90915550506040518281526001600160a01b0384169033907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a350600192915050565b80356001600160a01b03811681146101fc57600080fd5b919050565b600060208284031215610212578081fd5b61021b826101e5565b9392505050565b60008060408385031215610234578081fd5b61023d836101e5565b946020939093013593505050565b6000602080835283518082850152825b818110156102775785810183015185820160400152820161025b565b818111156102885783604083870101525b50601f01601f1916929092016040019392505050565b600082198211156102b1576102b16102cd565b500190565b6000828210156102c8576102c86102cd565b500390565b634e487b7160e01b600052601160045260246000fdfea2646970667358221220d80384ce584e101c5b92e4ee9b7871262285070dbcd2d71f99601f0f4fcecd2364736f6c63430008040033";

// A Human-Readable ABI; we only need to specify relevant fragments,
// in the case of deployment this means the constructor
const abi = [
    "constructor(uint totalSupply)"
];

const factory = new hethers.ContractFactory(abi, bytecode, signer);

// Deploy, setting total supply to 100 tokens (assigned to the deployer)
const contract = await factory.deploy(100, {gasLimit: 300000});

// The contract is not currentl live on the network yet, however
// its address is ready for us
contract.address
// '0x0000000000000000000000000000000001c50c95'

// Wait until the contract has been deployed before interacting
// with it; returns the receipt for the deployemnt transaction
await contract.deployTransaction.wait();
// {
//   to: null,
//   from: '0x0000000000000000000000000000000001c31552',
//   timestamp: '1645019704.914711762',
//   contractAddress: '0x0000000000000000000000000000000001c50c95',
//   gasUsed: 240000,
//   logsBloom: null,
//   transactionId: '0.0.29562194-1645019693-973691488',
//   transactionHash: '0xfa56c87dced6e18cdd1638d44a2dc121eca38fbac8d0bc35310ff741f1378078707077069447d7bee06dec1876be3e12',
//   logs: [
//     {
//       timestamp: '1645019704.914711762',
//       address: '0x0000000000000000000000000000000001c50c95',
//       data: '0x0000000000000000000000000000000000000000000000000000000000000064',
//       topics: [Array],
//       transactionHash: '0xfa56c87dced6e18cdd1638d44a2dc121eca38fbac8d0bc35310ff741f1378078707077069447d7bee06dec1876be3e12',
//       logIndex: 0,
//       transactionIndex: 0
//     },
//   ],
//   cumulativeGasUsed: 240000,
//   type: 0,
//   byzantium: true,
//   status: 1,
//   accountAddress: null,
//   events: [
//     {
//       timestamp: '1645019704.914711762',
//       address: '0x0000000000000000000000000000000001c50c95',
//       data: '0x0000000000000000000000000000000000000000000000000000000000000064',
//       topics: [Array],
//       transactionHash: '0xfa56c87dced6e18cdd1638d44a2dc121eca38fbac8d0bc35310ff741f1378078707077069447d7bee06dec1876be3e12',
//       logIndex: 0,
//       transactionIndex: 0,
//       removeListener: [Function (anonymous)],
//       getTransaction: [Function (anonymous)],
//       getTransactionReceipt: [Function (anonymous)]
//     },
//   ]
// }
```

### Connecting to a Contract

#### ERC20Contract inherits [Contract](contract.md)

#### `new hethers.Contract( address , abi , providerOrSigner )`

&#x20;   Creating a new instance of a Contract connects to an existing contract by specifying its _address_, and its _abi_ (used to populate the class' methods) a _providerOrSigner_.

```typescript
// A Human-Readable ABI; for interacting with the contract, we
// must include any fragment we wish to use
const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

const address = "0x0000000000000000000000000000000001c50c95";

// Read-Only; By connecting to a Provider, allows:
// - Populating Unsigned Transactions for non-constant methods
// - Querying Filters
const erc20 = new hethers.Contract(address, abi, provider);

// Read-Write; By connecting to a Signer, allows:
// - Everything from Read-Only
// - Any constant function
// - Static Calling non-constant methods
// - Sending transactions for non-constant/static functions
const erc20_rw = new hethers.Contract(address, abi, signer);
```

### Properties (inheritted from [Contract](contract.md))

#### `erc20.address` ⇒ string< [Address](../utilities/addresses.md) >

&#x20;   This is the address, the contract was constructed with.

#### `erc20.deployTransaction` ⇒ [TransactionResponse](../providers/types.md#transactionresponse)

&#x20;   If the **Contract** object is the result of a ContractFactory deployment, this is the transaction which was used to deploy the contract.

#### `erc20.interface` ⇒ [Interface](../utilities/application-binary-interface/)

&#x20;   This is the ABI as an [Interface](../utilities/application-binary-interface/).

#### `erc20.provider` ⇒ [Provider](../providers/)

&#x20;   If a provider was provided to the constructor, this is that provider. If a signer was provided that had a [Provider](../providers/), this is that provider.

#### `erc20.signer` ⇒ [Signer](../signers.md)

&#x20;   If a signer was provided to the constructor, this is that signer.

### Methods(inherited from [Contract](contract.md))

#### `erc20.attach( addressOrName )` ⇒ [Contract](contract.md)

&#x20;   Returns a new instance of the **Contract** attached to a new address. This is useful if there are multiple similar or identical copies of a Contract on the network and you wish to interact with each of them.

#### `erc20.connect( providerOrSigner )` ⇒ [Contract](contract.md)

&#x20;   Returns a new instance of the Contract, but connected to _providerOrSigner_.

&#x20;   By passing in a [Provider](../providers/), this will return a downgraded **Contract** which only has read-only access (i.e. querying filters).

&#x20;   By passing in a [Signer](../signers.md). this will return a **Contract** which will act on behalf of that signer.

#### `erc20.deployed( )` ⇒ Promise< [Contract ](contract.md)>

&#x20;   Contract.isIndexed( value ) ⇒ boolean

### Events(inheritted from [Contract](contract.md))

See Meta-Class Filters for examples using events.

#### `erc20.queryFilter( event [ ,` fromTimestamp `[ , toTimestamp ] )` ⇒ Promise< Array< Event > >

&#x20;   Return Events that match the _event_.

#### `erc20.listenerCount( [ event ] )` ⇒ number

&#x20;   Return the number of listeners that are subscribed to _event_. If no event is provided, returns the total count of all events.

#### `erc20.listeners( event )` ⇒ Array< Listener >

&#x20;   Return a list of listeners that are subscribed to _event_.

#### `erc20.off( event , listener )` ⇒ this

&#x20;   Unsubscribe _listener_ to _event_.

#### `erc20.on( event , listener )` ⇒ this

&#x20;   Subscribe to _event_ calling _listener_ when the event occurs.

#### `erc20.once( event , listener )` ⇒ this

&#x20;   Subscribe once to _event_ calling _listener_ when the event occurs.

#### `erc20.removeAllListeners( [ event ] )` ⇒ this

&#x20;   Unsubscribe all listeners for _event_. If no event is provided, all events are unsubscribed.

### Meta-Class Methods(added at Runtime)

Since the Contract is a Meta-Class, the methods available here depend on the ABI which was passed into the **Contract**.

#### `erc20.decimals( [ overrides ] )` ⇒ Promise< number >

&#x20;   Returns the number of decimal places used by this ERC-20 token. This can be used with [parseUnits](../utilities/display-logic-and-input.md#hethers.utils.parseunits-value-unit-hbar-bignumber) when taking input from the user or [formatUnits](../utilities/display-logic-and-input.md#hethers.utils.formatunits-value-unit-hbar-string) when displaying the token amounts in the UI.

Keep in mind that a signer must be connected in order to do Static calls

```typescript
await erc20.decimals({gasLimit: 30000});
// 18
```

#### `erc20.balanceOf( owner [ , overrides ] )` ⇒ Promise< [BigNumber](../utilities/bignumber.md) >

&#x20;   Returns the balance of _owner_ for this ERC-20 token.

Keep in mind that a signer must be connected in order to do Static calls

```typescript
const signerAddress = await signer.getAddress();
await contract.balanceOf(signerAddress, {gasLimit: 30000});
// { BigNumber: "100000" }
```

#### `erc20.symbol( [ overrides ] )` ⇒ Promise< string >

&#x20;   Returns the symbol of the token.

Keep in mind that a signer must be connected in order to do Static calls

```typescript
await erc20.symbol({gasLimit: 300000});
// 'MyToken'
```

#### `erc20_rw.transfer( target , amount [ , overrides ] )` ⇒ Promise< [TransactionResponse ](../providers/types.md#transactionresponse)>

&#x20;   Transfers _amount_ tokens to _target_ from the current signer. The return value (a boolean) is inaccessible during a write operation using a transaction. Other techniques (such as events) are required if this value is required. On-chain contracts calling the `transfer` function have access to this result, which is why it is possible.

```typescript
await erc20_rw.transfer(receiver.address, 10, {gasLimit: 3000000});
// {
//   transactionId: '0.0.29562194-1645092028-813415047',
//   hash: '0x79671d4ccaf2ec2d9391b62b9660223be2843c5a39c746c4e5812c3066ac1100208d4ef916ddb2e0d0de06104b20ca71',
//   from: '0x0000000000000000000000000000000001c31552',
//   to: '0x0000000000000000000000000000000001c4fff6',
//   gasLimit: BigNumber { _hex: '0x0f4240', _isBigNumber: true },
//   value: BigNumber { _hex: '0x00', _isBigNumber: true },
//   data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000001c31552000000000000000000000000000000000000000000000000000000000000000a',
//   chainId: 0,
//   r: '',
//   s: '',
//   v: 0,
//   customData: {},
//   wait: [Function (anonymous)]
// }

await erc20_rw.wait();
// {
//   to: null,
//   from: '0x0000000000000000000000000000000001c31552',
//   timestamp: '1645092039.479609639',
//   contractAddress: '0x0000000000000000000000000000000001c4fff6',
//   gasUsed: 800000,
//   logsBloom: null,
//   transactionId: '0.0.29562194-1645092028-813415047',
//   transactionHash: '0x79671d4ccaf2ec2d9391b62b9660223be2843c5a39c746c4e5812c3066ac1100208d4ef916ddb2e0d0de06104b20ca71',
//   logs: [
//     {
//       timestamp: '1645092039.479609639',
//       address: '0x0000000000000000000000000000000001c4fff6',
//       data: '0x000000000000000000000000000000000000000000000000000000000000000a',
//       topics: [Array],
//       transactionHash: '0x79671d4ccaf2ec2d9391b62b9660223be2843c5a39c746c4e5812c3066ac1100208d4ef916ddb2e0d0de06104b20ca71',
//       logIndex: 0,
//       transactionIndex: 0
//     }
//   ],
//   cumulativeGasUsed: 800000,
//   type: 0,
//   byzantium: true,
//   status: 1,
//   accountAddress: null,
//   events: [
//     {
//       timestamp: '1645092039.479609639',
//       address: '0x0000000000000000000000000000000001c4fff6',
//       data: '0x000000000000000000000000000000000000000000000000000000000000000a',
//       topics: [Array],
//       transactionHash: '0x79671d4ccaf2ec2d9391b62b9660223be2843c5a39c746c4e5812c3066ac1100208d4ef916ddb2e0d0de06104b20ca71',
//       logIndex: 0,
//       transactionIndex: 0,
//       args: [Array],
//       decode: [Function (anonymous)],
//       event: 'Transfer',
//       eventSignature: 'Transfer(address,address,uint256)',
//       removeListener: [Function (anonymous)],
//       getTransaction: [Function (anonymous)],
//       getTransactionReceipt: [Function (anonymous)]
//     }
//   ]
// }
```

#### `erc20.callStatic.transfer( target , amount [ , overrides ] )` ⇒ Promise< boolean >

&#x20;   Performs a dry-run of transferring _amount_ tokens to _target_ from the current signer, without actually signing or sending a transaction.

&#x20;   This can be used to preflight check that a transaction will be successful.

```typescript
await erc20_rw.callStatic.transfer(receiver.address, 10, {gasLimit: 1000000});
// {
//   status: Status { _code: 33 },
//   transactionId: TransactionId {
//     accountId: AccountId {
//       shard: [Long],
//       realm: [Long],
//       num: [Long],
//       aliasKey: null,
//       _checksum: undefined
//     },
//     validStart: Timestamp { seconds: [Long], nanos: [Long] },
//     scheduled: false,
//     nonce: null
//   }
// }
```

#### `erc20.populateTransaction.transfer( target , amount [ , overr`ides ] ) ⇒ Promise< [UnsignedTransaction](../utilities/transactions.md#unsignedtransaction) >

&#x20;   Returns an UnsignedTransaction which could be signed and submitted to the network to transaction _amount_ tokens to _target_.

```
await erc20_rw.populateTransaction.transfer(receiver.address, 10, {gasLimit: 1000000});
// {
//   data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000001c315520000000000000000000000000000000000000000000000000000000000989680',
//   to: '0x0000000000000000000000000000000001c4fff6',
//   gasLimit: BigNumber { _hex: '0x0f4240', _isBigNumber: true },
//   from: '0x0000000000000000000000000000000001c31552'
// }

```

### Meta-Class Filters(added at Runtime)

Since the Contract is a Meta-Class, the methods available here depend on the ABI which was passed into the **Contract**.

#### `erc20.filters.Transfer( [ fromAddress [ , toAddress ] ] )` ⇒ [Filter](../providers/types.md#filter)

&#x20;   Returns a new Filter that can be used to query or to subscribe/unsubscribe to events.

&#x20;   If _fromAddress_ is null or not provided, then any from address matches. If _toAddress_ is null or not provided, then any to address matches.

```typescript
// filter from
const filter = erc20_rw.filters.Transfer(signer.address);
// {
//   address: '0x0000000000000000000000000000000001c4fff6',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     '0x0000000000000000000000000000000000000000000000000000000001c31552'
//   ]
// }

const fromTimestamp = '1645092000.000000000';
const toTimestamp = '1645095000.000000000';
await erc20_rw.queryFilter(filter, fromTimestamp, toTimestamp);
// [
//   {
//     timestamp: '1645092039.479609639',
//     address: '0x0000000000000000000000000000000001C4ffF6',
//     data: '0x000000000000000000000000000000000000000000000000000000000000000a',
//     topics: [
//       '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//       '0x0000000000000000000000000000000000000000000000000000000001c31552',
//       '0x0000000000000000000000000000000000000000000000000000000001c31552'
//     ],
//     logIndex: 0,
//     transactionIndex: 0,
//     removeListener: [Function (anonymous)],
//     getTransaction: [Function (anonymous)],
//     getTransactionReceipt: [Function (anonymous)],
//     event: 'Transfer',
//     eventSignature: 'Transfer(address,address,uint256)',
//     decode: [Function (anonymous)],
//     args: [
//       '0x0000000000000000000000000000000001C31552',
//       '0x0000000000000000000000000000000001C31552',
//       [BigNumber],
//       from: '0x0000000000000000000000000000000001C31552',
//       to: '0x0000000000000000000000000000000001C31552',
//       value: [BigNumber]
//     ]
//   }
// ]
```

```typescript
// filter to
const filter = erc20_rw.filters.Transfer(null, signer.address);
// {
//   address: '0x0000000000000000000000000000000001c4fff6',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     null,
//     '0x0000000000000000000000000000000000000000000000000000000001c42506'
//   ]
// }


const fromTimestamp = '1645110013.000000000';
const toTimestamp = '1645110014.000000000';
await erc20_rw.queryFilter(filter, fromTimestamp, toTimestamp);
// [
//   {
//     timestamp: '1645110013.250941000',
//     address: '0x0000000000000000000000000000000001C4ffF6',
//     data: '0x0000000000000000000000000000000000000000000000000000000000000064',
//     topics: [
//       '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//       '0x0000000000000000000000000000000000000000000000000000000001c31552',
//       '0x0000000000000000000000000000000000000000000000000000000001c42506'
//     ],
//     logIndex: 0,
//     transactionIndex: 0,
//     removeListener: [Function (anonymous)],
//     getTransaction: [Function (anonymous)],
//     getTransactionReceipt: [Function (anonymous)],
//     event: 'Transfer',
//     eventSignature: 'Transfer(address,address,uint256)',
//     decode: [Function (anonymous)],
//     args: [
//       '0x0000000000000000000000000000000001C31552',
//       '0x0000000000000000000000000000000001C42506',
//       [BigNumber],
//       from: '0x0000000000000000000000000000000001C31552',
//       to: '0x0000000000000000000000000000000001C42506',
//       value: [BigNumber]
//     ]
//   }
// ]
```
