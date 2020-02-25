-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Migration: From Ethers v4
=========================



BigNumber
---------



### Namespace


Since [BigNumber](../../api/utils/bignumber) is used quite frequently, it has been moved to
the top level of the umbrella package.


```
// v4
ethers.utils.BigNumber
ethers.utils.BigNumberish

// v5
ethers.BigNumber
ethers.BigNumberish
```



### Creating Instances


The `bigNumberify` method was always preferred over the constructor
since it could short-circuit an object instantiation for [[bignumber]
objects (since they are immutable). This has been moved to a static
`from` class method.


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


```
TODO
```



Errors
------



### Namespace


All errors now belong to the [Logger](../../api/utils/logger) class and the related functions
have been moved to [Logger](../../api/utils/logger) instances, which can include a per-package
version string.

Global error fucntions have been moved [Logger](../../api/utils/logger) class methods.


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


The [Interface](../../api/utils/abi/interface) object has undergone the most dramatic changes.

It is no longer a meta-class and now has methods that simplify handling
contract interface operations without the need for object inspection and
special edge cases.


### Functions


```
// v4 (example: "transfer(address to, uint amount)")
interface.functions.transfer.encode(to, amount)
interface.functions.transfer.decode(callData)

// v5
interface.encodeData("transfer", [ to, amount ])
interface.decodeResult("transfer", data)

// Or you can use any compatible signature or Fragment objects.
// Notice that signature normalization is performed for you,
// e.g. "uint" and "uint256" will be automatically converted
interface.encodeData("transfer(address,uint)", [ to, amount ])
interface.decodeResult("transfer(address to, uint256 amount)", data)
```



### Events


```
// v4 (example: Transfer(address indexed, address indexed, uint256)
interface.events.Transfer.encodeTopics(values)
interface.events.Transfer.decode(data, topics)

// v5
interface.encodeFilterTopics("Transfer", values)
interface.encodeEventLog("Transfer", data, topics)
```



### Inspection


Interrogating properties about a function or event can now (mostly) be
done directly on the [Fragment](../../api/utils/abi/fragments) object.


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



Utilities
---------



### Renaming


```
TODO
```



Wallet
------



### Mnemonic Phrases


The **mnemonic** phrase and related properties have been merged into
a single `mnemonic` object, which also now includes the `locale`.


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




-----
**Content Hash:** 27061bfb6d646d514915e15779b869747049a93a7f75eda79a9f92fdb81b41ae