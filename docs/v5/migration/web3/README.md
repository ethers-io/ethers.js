-----

Documentation: [html](https://docs.ethers.io/)

-----

Migration: From Web3.js
=======================

Providers
---------

### Connecting to Ethereum

```
// web3
var Web3 = require('web3');
var web3 = new Web3('http://localhost:8545');

// ethers
var ethers = require('ethers');
const url = "http://127.0.0.1:8545";
const provider = new ethers.providers.JsonRpcProvider(url);
```

### Connecting to Ethereum: Metamask

```
// web3
const web3 = new Web3(Web3.givenProvider);

// ethers
const provider = new ethers.providers.Web3Provider(window.ethereum);
```

Signers
-------

### Creating signer

```
// web3
const account = web3.eth.accounts.create();

// ethers (create random new account)
const signer = ethers.Wallet.createRandom();

// ethers (connect to JSON-RPC accounts)
const signer = provider.getSigner();
```

### Signing a message

```
// web3 (using a private key)
signature = web3.eth.accounts.sign('Some data', privateKey)

// web3 (using a JSON-RPC account)
// @TODO

// ethers
signature = await signer.signMessage('Some data')
```

Contracts
---------

### Deploying a Contract

```
// web3
const contract = new web3.eth.Contract(abi);
contract.deploy({
   data: bytecode,
   arguments: ["my string"]
})
.send({
   from: "0x12598d2Fd88B420ED571beFDA8dD112624B5E730",
   gas: 150000,
   gasPrice: "30000000000000"
}), function(error, transactionHash){ ... })
.then(function(newContract){
    console.log('new contract', newContract.options.address) 
});

// ethers
const signer = provider.getSigner();
const factory = new ethers.ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy("hello world");
console.log('contract address', contract.address);

// wait for contract creation transaction to be mined
await contract.deployTransaction.wait();
```

### Interacting with a Contract

```
// web3
const contract = new web3.eth.Contract(abi, contractAddress);
// read only query
contract.methods.getValue().call();
// state changing operation
contract.methods.changeValue(42).send({from: ....})
.on('receipt', function(){
    ...
});

// ethers
// pass a provider when initiating a contract for read only queries
const contract = new ethers.Contract(contractAddress, abi, provider);
const value = await contract.getValue();


// pass a signer to create a contract instance for state changing operations
const contract = new ethers.Contract(contractAddress, abi, signer);
const tx = await contract.changeValue(33);

// wait for the transaction to be mined
const receipt = await tx.wait();
```

### Overloaded Functions

```
// web3
message = await contract.methods.getMessage('nice').call();


// ethers
const abi = [
  "function getMessage(string) public view returns (string)",
  "function getMessage() public view returns (string)"
]
const contract = new ethers.Contract(address, abi, signer);

// for ambiguous functions (two functions with the same
// name), the signature must also be specified
message = await contract['getMessage(string)']('nice');
```

Numbers
-------

### BigNumber

```
// web3
web3.utils.toBN('123456');

// ethers (from a number; must be within safe range)
ethers.BigNumber.from(123456)

// ethers (from base-10 string)
ethers.BigNumber.from("123456")

// ethers (from hex string)
ethers.BigNumber.from("0x1e240")
```

Utilities
---------

### Hash

```
// web3
web3.utils.sha3('hello world');
web3.utils.keccak256('hello world');

// ethers (hash of a string)
ethers.utils.id('hello world')

// ethers (hash of binary data)
ethers.utils.keccak256('0x4242')
```

