-----

Documentation: [html](https://docs.ethers.io/)

-----

ContractFactory
===============

Creating Instances
------------------

#### **new ***ethers* . **ContractFactory**( interface , bydecode [ , signer ] )



#### *ContractFactory* . **fromSolidity**( compilerOutput [ , signer ] ) => *[ContractFactory](/v5/api/contract/contract-factory/)*



#### *contractFactory* . **connect**( signer ) => *[Contract](/v5/api/contract/contract/)*



Properties
----------

#### *contractFactory* . **interface** => *[Interface](/v5/api/utils/abi/interface/)*



#### *contractFactory* . **bytecode** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*



#### *contractFactory* . **signer** => *[Signer](/v5/api/signer/#Signer)*



Methods
-------

#### *contractFactory* . **attach**( address ) => *[Contract](/v5/api/contract/contract/)*

Return an instance of a [Contract](/v5/api/contract/contract/) attched to *address*. This is the same as using the [Contract constructor](/v5/api/contract/contract/#Contract--creating) with *address* and this the the *interface* and *signerOrProvider* passed in when creating the ContractFactory.


#### *contractFactory* . **getDeployTransaction**( ...args ) => *[UnsignedTransaction](/v5/api/utils/transactions/#UnsignedTransaction)*

Returns the unsigned transaction which would deploy this Contract with *args* passed to the Contract's constructor.


#### *contractFactory* . **deploy**( ...args ) => *Promise< [Contract](/v5/api/contract/contract/) >*

Uses the signer to deploy the Contract with *args* passed into the constructor and retruns a Contract which is attached to the address where this contract **will** be deployed once the transaction is mined.

The transaction can be found at `contract.deployTransaction`, and no interactions should be made until the transaction is mined.


```
// <hide>
const signer = ethers.LocalSigner();
const ContractFactory = ethers.ContractFactory;
// </hide>

// If your contract constructor requires parameters, the ABI
// must include the constructor
const abi = [
  "constructor(address owner, uint256 initialValue)"
];

const factory = new ContractFactory(abi, bytecode, signer)

const contract = await factory.deploy("ricmoo.eth", 42);

// The address is available immediately, but the contract
// is NOT deployed yet
contract.address
//!

// The transaction that the signer sent to deploy
contract.deployTransaction
//!

// Wait until the transaction is mined
contract.deployTransaction.wait()
//!

// Now the contract is safe to interact with
contract.value()
//!
```

