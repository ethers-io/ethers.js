# ContractFactory

To deploy a [Contract](contract.md), additional information is needed that is not available on a Contract object itself.

Mainly, the bytecode (more specifically the initcode) of a contract is required.

The **Contract Factory** sends special transactions to completly contract deployment. Before the main contract creation transaction, there are several transactions that have to be executed:

* `FileCreateTransaction` - including a _customData_ field with _fileChunk_ and _fileKey_ properties. Returns _fileId_ as property in _customData_ of transaction's response.
* **`n`**` ``x FileAppendTransaction` - in Hedera ecosystem, each transaction has maximum size of `6KB`, so if there is a contract with a bigger size, it has to be separated into chunks. Each chunk must be uploaded via `FileAppendTransaction` with _customData_ containing _fileId_ and _fileChunk_.
* `ContractCreateTransaction` - actually deploying the contract, the transaction includes _gasLimit_ and _customData_ with _bytecodeFileId_

The Contract Factory executes the defined transactions under the hood and the complexity is hidden from the `hethers` users.

### Creating Instances

#### `new hethers.ContractFactory( interface , bytecode [ , signer ] )`

&#x20;   Creates a new instance of a **ContractFactory** for the contract described by the _interface_ and _bytecode_ initcode.

#### `ContractFactory.fromSolidity( compilerOutput [ , signer ] )` ⇒ [ContractFactory](contractfactory.md)

&#x20;   Consumes the output of the Solidity compiler, extracting the ABI and bytecode from it, allowing for the various formats the solc compiler has emitted over its life.

#### `contractFactory.connect( signer )` ⇒ [ContractFactory](contractfactory.md)

&#x20;   Returns a **new instance** of the ContractFactory with the same _interface_ and _bytecode_, but with a different _signer_.

### Properties

#### `contractFactory.interface` ⇒ [Interface](../utilities/application-binary-interface/)

&#x20;   The [Contract](contract.md) interface.

#### contractFactory.bytecode ⇒ string< [DataHexString ](../utilities/byte-manipulation.md#datahexstring)>

&#x20;   The bytecode (i.e. initcode) that this **ContractFactory** will use to deploy the Contract.

#### contractFactory.signer ⇒ [Signer](../signers.md)

&#x20;   The [Signer](../signers.md) (if any) this ContractFactory will use to deploy instances of the Contract.

### Methods

#### `contractFactory.attach( address )` ⇒ [Contract](contract.md)

&#x20;   Return an instance of a [Contract](contract.md) attached to _address_. This is the same as using the Contract constructor with _address_ and this the _interface_ and _signerOrProvider_ passed in when creating the ContractFactory.

#### `contractFactory.getDeployTransaction( ...args [ , overrides ] )` ⇒ [UnsignedTransaction](../utilities/transactions.md#unsignedtransaction)

&#x20;   Returns the unsigned transaction which would deploy this Contract with _args_ passed to the Contract's constructor.

&#x20;   If the optional _overrides_ is specified, they can be used to override the endowment `value` and transaction`gasLimit.`

#### `contractFactory.deploy( ...args [ , overrides ] )` ⇒ Promise< [Contract](contract.md) >

&#x20;   Uses the signer to deploy the Contract with _args_ passed into the constructor and returns a Contract which is attached to the address where this contract **will** be deployed once the transaction is mined.

&#x20;   The transaction can be found at `contract.deployTransaction`, and no interactions should be made until the transaction is mined.

&#x20;   If the optional _overrides_ is specified, they can be used to override the endowment `value`and transaction `gasLimit`.

### Deploying a Contract

```typescript
// If your contract constructor requires parameters, the ABI
// must include the constructor
const abi = [
  "constructor(address owner, uint256 initialValue)",
  "function value() view returns (uint)"
];

// The factory we use for deploying contracts
factory = new hethers.ContractFactory(abi, bytecode, signer);

// Deploy an instance of the contract
contract = await factory.deploy(signer.getAddress(), 29, {gasLimit: 300000});

// The transaction that the signer sent to deploy
contract.deployTransaction;
// {
//   transactionId: '0.0.29562194-1644936332-851920765',
//   hash: '0x043ed85880572a8ae17a1195265683519b9c0ce2cc20e7f8194c1a50f9aa6b3cf42e0b9d47c121d2afac7e4f5b772ff5',
//   from: '0x0000000000000000000000000000000001c31552',
//   gasLimit: BigNumber { _hex: '0x2dc6c0', _isBigNumber: true },
//   value: BigNumber { _hex: '0x00', _isBigNumber: true },
//   data: '0x',
//   chainId: 0,
//   r: '',
//   s: '',
//   v: 0,
//   customData: { contractId: '0000000000000000000000000000000001c4eb6c' },
//   wait: [Function (anonymous)]
// }


// Wait until the transaction is mined (i.e. contract is deployed)
//  - returns the receipt
//  - throws on failure (the reciept is on the error)
await contract.deployTransaction.wait();
// {
//   to: null,
//   from: '0x0000000000000000000000000000000001c31552',
//   timestamp: '1644936613.508756326',
//   contractAddress: '0x0000000000000000000000000000000001c4ebce',
//   gasUsed: 2400000,
//   logsBloom: null,
//   transactionId: '0.0.29562194-1644936604-215143507',
//   transactionHash: '0xecf46d447cc196d08c92c05f44463a4ed016ca8b9adf691074f168d7633a0dfe795a5e823d1a0ec282864a706b1ae671',
//   logs: [
//     {
//       timestamp: '1644936613.508756326',
//       address: '0x0000000000000000000000000000000001c4ebce',
//       data: '0x0000000000000000000000000000000000000000000000000000000001c315520000000000000000000000000000000000000000000000000000000000002710',
//       topics: [Array],
//       transactionHash: '0xecf46d447cc196d08c92c05f44463a4ed016ca8b9adf691074f168d7633a0dfe795a5e823d1a0ec282864a706b1ae671',
//       logIndex: 0,
//       transactionIndex: 0
//     },
//     ...
//     ...
//     ...
//   ],
//   cumulativeGasUsed: 2400000,
//   type: 0,
//   byzantium: true,
//   status: 1,
//   accountAddress: null,
//   events: [
//     {
//       timestamp: '1644936613.508756326',
//       address: '0x0000000000000000000000000000000001c4ebce',
//       data: '0x0000000000000000000000000000000000000000000000000000000001c315520000000000000000000000000000000000000000000000000000000000002710',
//       topics: [Array],
//       transactionHash: '0xecf46d447cc196d08c92c05f44463a4ed016ca8b9adf691074f168d7633a0dfe795a5e823d1a0ec282864a706b1ae671',
//       logIndex: 0,
//       transactionIndex: 0,
//       args: [Array],
//       decode: [Function (anonymous)],
//       event: 'Mint',
//       eventSignature: 'Mint(address,uint256)',
//       removeListener: [Function (anonymous)],
//       getTransaction: [Function (anonymous)],
//       getTransactionReceipt: [Function (anonymous)]
//     },
//     ...
//     ...
//     ...
//   ]
// }

// The address is available immediately after 
// the contract has been deployed
contract.address;
// '0x0000000000000000000000000000000001c4eb6c'

// Now the contract is safe to interact with
await contract.value({gasLimit: 300000});
// { BigNumber: "29" }
```
