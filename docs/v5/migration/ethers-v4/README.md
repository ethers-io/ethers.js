-----

Documentation: [html](https://docs.ethers.io/)

-----

Migration: From Ethers v4
=========================

BigNumber
---------

### Namespace

```
// v4
ethers.utils.BigNumber
ethers.utils.BigNumberish

// v5
ethers.BigNumber
ethers.BigNumberish
```

### Creating Instances

```
// v4
new ethers.utils.BigNumber(someValue)
ethers.utils.bigNumberify(someValue);

// v5
// - Constructor is private
// - Removed `bigNumberify`
ethers.BigNumber.from(someValue)
```

Contracts
---------

### ENS Name Resolution

```
// v4
contract.addressPromise

// v5
contract.resolvedAddress
```

### Gas Estimation

```
// v4
contract.estimate.transfer(toAddress, amount)

// v5
contract.estimateGas.transfer(toAddress, amount)
```

### Functions

```
const abi = [

  // Returns a single value
  "function single() view returns (uint8)",

  // Returns two values
  "function double() view returns (uint8, uint8)",
];

// v4
await contract.single()
// 123
await contract.functions.single()
// 123


// v5 (notice the change in the .function variant)
await contract.single()
// 123
await contract.functions.single()
// [ 123 ]


// v4
await contract.double()
// [ 123, 5 ]
await contract.functions.double()
// [ 123, 5 ]


// v5 (no difference from v4)
await contract.double()
// [ 123, 5 ]
await contract.functions.double()
// [ 123, 5 ]
```

Errors
------

### Namespace

```
// v4
ethers.errors.UNKNOWN_ERROR
ethers.errors.*

errors.setCensorship(censorship, permanent)
errors.setLogLevel(logLevel)

errors.checkArgumentCount(count, expectedCount, suffix)
errors.checkNew(self, kind)
errors.checkNormalize()
errors.throwError(message, code, params)
errors.warn(...)
errors.info(...)

// v5
ethers.utils.Logger.errors.UNKNOWN_ERROR
ethers.utils.Logger.errors.*

Logger.setCensorship(censorship, permanent)
Logger.setLogLevel(logLevel)

const logger = new ethers.utils.Logger(version);
logger.checkArgumentCount(count, expectedCount, suffix)
logger.checkNew(self, kind)
logger.checkNormalize()
logger.throwError(message, code, params)
logger.warn(...)
logger.info(...)
```

Interface
---------

### Functions

```
// v4 (example: "transfer(address to, uint amount)")
interface.functions.transfer.encode(to, amount)
interface.functions.transfer.decode(callData)

// v5
interface.encodeFunctionData("transfer", [ to, amount ])
interface.decodeFunctionResult("transfer", data)

// Or you can use any compatible signature or Fragment objects.
// Notice that signature normalization is performed for you,
// e.g. "uint" and "uint256" will be automatically converted
interface.encodeFunctionData("transfer(address,uint)", [ to, amount ])
interface.decodeFunctionResult("transfer(address to, uint256 amount)", data)
```

### Events

```
// v4 (example: Transfer(address indexed, address indexed, uint256)
interface.events.Transfer.encodeTopics(values)
interface.events.Transfer.decode(data, topics)

// v5
interface.encodeFilterTopics("Transfer", values)
interface.decodeEventLog("Transfer", data, topics)
```

### Inspection

```
// v4
interface.functions.transfer.name
interface.functions.transfer.inputs
interface.functions.transfer.outputs
interface.functions.transfer.payable
interface.functions.transfer.gas

// v5
const functionFragment = interface.getFunction("transfer")
functionFragment.name
functionFragment.inputs
functionFragment.outputs
functionFragment.payable
functionFragment.gas


// v4; type is "call" or "transaction"
interface.functions.transfer.type

// v5; constant is true (i.e. "call") or false (i.e. "transaction")
functionFragment.constant


// v4
interface.events.Transfer.anonymous
interface.events.Transfer.inputs
interface.events.Transfer.name

// v5
const eventFragment = interface.getEvent("Transfer");
eventFragment.anonymous
eventFragment.inputs
eventFragment.name


// v4
const functionSig = interface.functions.transfer.signature
const sighash = interface.functions.transfer.sighash

const eventSig = interface.events.Transfer.signature
const topic = interface.events.Transfer.topic

// v5
const functionSig = functionFragment.format()
const sighash = interface.getSighash(functionFragment)

const eventSig = eventFragment.format()
const topic = interface.getTopic(eventFragment)
```

Wallet
------

### Mnemonic Phrases

```
// v4
wallet.mnemonic
wallet.path

// v5
// - Mnemonic phrase and path are a Mnemonic object
// - Note: wallet.mnemonic is null if there is no mnemonic
wallet.mnemonic.phrase
wallet.mnemonic.path
```

