-----

Documentation: [html](https://docs.ethers.io/)

-----

ContractFactory
===============

Creating Instances
------------------

#### **new ***ethers* . **ContractFactory**( interface , bytecode [ , signer ] )

Creates a new instance of a **ContractFactory** for the contract described by the *interface* and *bytecode* initcode.


#### *ContractFactory* . **fromSolidity**( compilerOutput [ , signer ] ) => *[ContractFactory](/v5/api/contract/contract-factory/)*

Consumes the output of the Solidity compiler, extracting the ABI and bytecode from it, allowing for the various formats the solc compiler has emitted over its life.


#### *contractFactory* . **connect**( signer ) => *[Contract](/v5/api/contract/contract/)*

Returns a **new instance** of the ContractFactory with the same *interface* and *bytecode*, but with a different *signer*.


Properties
----------

#### *contractFactory* . **interface** => *[Interface](/v5/api/utils/abi/interface/)*

The [Contract](/v5/api/contract/contract/) interface.


#### *contractFactory* . **bytecode** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

The bytecode (i.e. initcode) that this **ContractFactory** will use to deploy the Contract.


#### *contractFactory* . **signer** => *[Signer](/v5/api/signer/#Signer)*

The [Signer](/v5/api/signer/#Signer) (if any) this ContractFactory will use to deploy instances of the Contract to the Blockchain.


Methods
-------

#### *contractFactory* . **attach**( address ) => *[Contract](/v5/api/contract/contract/)*

Return an instance of a [Contract](/v5/api/contract/contract/) attached to *address*. This is the same as using the [Contract constructor](/v5/api/contract/contract/#Contract--creating) with *address* and this the *interface* and *signerOrProvider* passed in when creating the ContractFactory.


#### *contractFactory* . **getDeployTransaction**( ...args [ , overrides ] ) => *[UnsignedTransaction](/v5/api/utils/transactions/#UnsignedTransaction)*

Returns the unsigned transaction which would deploy this Contract with *args* passed to the Contract's constructor.

If the optional *overrides* is specified, they can be used to override the endowment `value`, transaction `nonce`, `gasLimit` or `gasPrice`.


#### *contractFactory* . **deploy**( ...args [ , overrides ] ) => *Promise< [Contract](/v5/api/contract/contract/) >*

Uses the signer to deploy the Contract with *args* passed into the constructor and returns a Contract which is attached to the address where this contract **will** be deployed once the transaction is mined.

The transaction can be found at `contract.deployTransaction`, and no interactions should be made until the transaction is mined.

If the optional *overrides* is specified, they can be used to override the endowment `value`, transaction `nonce`, `gasLimit` or `gasPrice`.


```javascript
// If your contract constructor requires parameters, the ABI
// must include the constructor
const abi = [
  "constructor(address owner, uint256 initialValue)",
  "function value() view returns (uint)"
];

// The factory we use for deploying contracts
factory = new ContractFactory(abi, bytecode, signer)

// Deploy an instance of the contract
contract = await factory.deploy("ricmoo.eth", 42);

// The address is available immediately, but the contract
// is NOT deployed yet
contract.address
// '0x26E9685C018Bf3A401DFA632827e7e6C7D96b1C0'

// The transaction that the signer sent to deploy
contract.deployTransaction
// {
//   blockHash: null,
//   blockNumber: null,
//   chainId: 1337,
//   confirmations: 0,
//   creates: '0x26E9685C018Bf3A401DFA632827e7e6C7D96b1C0',
//   data: '0x608060405234801561001057600080fd5b5060405161012e38038061012e8339818101604052604081101561003357600080fd5b81019080805190602001909291908051906020019092919050505081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508060008190555050506088806100a66000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80633fa4f24514602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b6000805490509056fea2646970667358221220926465385af0e8706644e1ff3db7161af699dc063beaadd55405f2ccd6478d7564736f6c63430007040033000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c000000000000000000000000000000000000000000000000000000000000002a',
//   from: '0xf3e6942b256A60B596B24F633caE8aDB4983fCA6',
//   gasLimit: { BigNumber: "126462" },
//   gasPrice: { BigNumber: "1" },
//   hash: '0x4037630fdadbbe0aac0bf90eba61118e35ee5fc28329e2134bb2bad0bfc12684',
//   nonce: 1,
//   r: '0xc3bb79ea4600864cd110fe74d31d38bb3702c327fd5aef9feddf66903cc87a4f',
//   s: '0x35cc2ffe352c02b5fcfbbcd2e348001af670f64438d7a9b2c34756ec293a0784',
//   to: null,
//   transactionIndex: null,
//   v: 2709,
//   value: { BigNumber: "0" },
//   wait: [Function]
// }

// Wait until the transaction is mined (i.e. contract is deployed)
//  - returns the receipt
//  - throws on failure (the reciept is on the error)
contract.deployTransaction.wait()
// { Promise: {
//   blockHash: '0x1715de2bdfec15a7f64fb79a8254699274be6776df244d24a04945a3218543e6',
//   blockNumber: 2,
//   byzantium: true,
//   confirmations: 1,
//   contractAddress: '0x26E9685C018Bf3A401DFA632827e7e6C7D96b1C0',
//   cumulativeGasUsed: { BigNumber: "126462" },
//   from: '0xf3e6942b256A60B596B24F633caE8aDB4983fCA6',
//   gasUsed: { BigNumber: "126462" },
//   logs: [],
//   logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
//   status: 1,
//   to: null,
//   transactionHash: '0x4037630fdadbbe0aac0bf90eba61118e35ee5fc28329e2134bb2bad0bfc12684',
//   transactionIndex: 0
// } }

// Now the contract is safe to interact with
contract.value()
// { Promise: { BigNumber: "42" } }
```

