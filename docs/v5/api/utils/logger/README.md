-----

Documentation: [html](https://docs.ethers.io/)

-----

Logging
=======

Logger
------

#### **new ***ethers* . *utils* . **Logger**( version )

Create a new logger which will include *version* in all errors thrown.


#### *Logger* . **globalLogger**( ) => *[Logger](/v5/api/utils/logger/#Logger)*

Returns the singleton global logger.


### Logging Output

#### *logger* . **debug**( ...args ) => *void*

Log debugging information.


#### *logger* . **info**( ...args ) => *void*

Log generic information.


#### *logger* . **warn**( ...args ) => *void*

Log warnings.


### Errors

#### *logger* . **makeError**( message [ , code = UNKNOWN_ERROR [ , params ] ] ) => *Error*

Create an Error object with *message* and an optional *code* and additional *params* set. This is useful when an error is needed to be rejected instead of thrown.


#### *logger* . **throwError**( message [ , code = UNKNOWN_ERROR [ , params ] ] ) => *never*

Throw an Error with *message* and an optional *code* and additional *params* set.


#### *logger* . **throwArgumentError**( message , name , value ) => *never*

Throw an [INVALID_ARGUMENT](/v5/api/utils/logger/#errors--invalid-argument) Error with *name* and *value*.


### Usage Validation

#### *logger* . **checkAbstract**( target , kind ) => *void*

If *target* is *kind*, throws a [UNSUPPORTED_OPERATION](/v5/api/utils/logger/#errors--unsupported-operation) error otherwise performs the same operations as [checkNew](/v5/api/utils/logger/#Logger-checkNew).

This is useful for ensuring abstract classes are not being instantiated.


#### *logger* . **checkArgumentCount**( count , expectedCount [ , message ) => *void*

If *count* is not equal to *expectedCount*, throws a [MISSING_ARGUMENT](/v5/api/utils/logger/#errors--missing-argument) or [UNEXPECTED_ARGUMENT](/v5/api/utils/logger/#errors--unexpected-argument) error.


#### *logger* . **checkNew**( target , kind ) => *void*

If *target* is not a valid `this` or `target` value, throw a [MISSING_NEW](/v5/api/utils/logger/#errors--missing-new) error. This is useful to ensure callers of a Class are using `new`.


#### *logger* . **checkNormalize**( message ) => *void*

Check that the environment has a correctly functioning [String.normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize). If not, a [UNSUPPORTED_OPERATION](/v5/api/utils/logger/#errors--unsupported-operation) error is thrown.


#### *logger* . **checkSafeUint53**( value [ , message ] ) => *void*

If *value* is not safe as a [JavaScript number](https://en.wikipedia.org/wiki/Double-precision_floating-point_format), throws a [NUMERIC_FAULT](/v5/api/utils/logger/#errors--numeric-fault) error.


### Censorship

#### *Logger* . **setCensorship**( censor [ , permanent = false ] ) => *void*

Set error censorship, optionally preventing errors from being uncensored.

In production applications, this prevents any error from leaking information by masking the message and values of errors.

This can impact debugging, making it substantially more difficult.


#### *Logger* . **setLogLevel**( logLevel ) => *void*

Set the log level, to suppress logging output below a [particular log level](/v5/api/utils/logger/#Logger-levels).


Errors
------

### Generic Error Codes

#### *Logger* . *errors* . **NOT_IMPLEMENTED**

The operation is not implemented. This may occur when calling a method on a sub-class that has not fully implemented its abstract superclass.


#### *Logger* . *errors* . **SERVER_ERROR**

There was an error communicating with a server.

This may occur for a number of reasons, for example:

- a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) issue; this is quite often the problem and also the hardest to diagnose and fix, so it is very beneficial to familiarize yourself with CORS; some backends allow you configure your CORS, such as the geth command-line or conifguration files or the INFURA and Alchemy dashboards by specifing allowed Origins, methods, etc. 
- an SSL issue; for example, if you are trying to connect to a local node via HTTP but are serving the content from a secure HTTPS website 
- a link issue; a firewall is preventing the traffic from reaching the server 
- a server issue; the server is down, or is returning 500 error codes 
- a backend DDoS mitigation proxy; for example, Etherscan operates behind a Cloudflare proxy, which will block traffic if the request is sent via specific User Agents or the client fingerprint is detected as a bot in some cases 




#### *Logger* . *errors* . **TIMEOUT**

A timeout occurred.


#### *Logger* . *errors* . **UNKNOWN_ERROR**

A generic unknown error.


#### *Logger* . *errors* . **UNSUPPORTED_OPERATION**

The operation is not supported.

This can happen for a variety reasons, for example:

- Some backends do not support certain operations; such as passing a blockTag to an [EtherscanProvider](/v5/api/providers/api-providers/#EtherscanProvider) for [call](/v5/api/providers/provider/#Provider-call) 
- A [Contract](/v5/api/contract/contract/) object connected to [Provider](/v5/api/providers/provider/) (instead of a [Signer](/v5/api/signer/#Signer)) cannot [sign](/v5/api/signer/#Signer-signTransaction) or [send](/v5/api/signer/#Signer-sendTransaction) transactions 
- a [Contract](/v5/api/contract/contract/) connected to a [Signer](/v5/api/signer/#Signer) without a [Provider](/v5/api/providers/provider/) is write-only and cannot estimate gas or execute static calls 




### Safety Error Codes

#### *Logger* . *errors* . **BUFFER_OVERRUN**

The amount of data needed is more than the amount of data required, which would cause the data buffer to read past its end.

This can occur if a contract erroneously returns invalid ABI-encoded data or RLP data is malformed.


#### *Logger* . *errors* . **NUMERIC_FAULT**

There was an invalid operation done on numeric values.

Common cases of this occur when there is [overflow](https://en.wikipedia.org/wiki/Integer_overflow), [arithmetic underflow](https://en.wikipedia.org/wiki/Arithmetic_underflow) in fixed numeric types or division by zero.


### Usage Error Codes

#### *Logger* . *errors* . **INVALID_ARGUMENT**

The type or value of an argument is invalid. This will generally also include the `name` and `value` of the argument. Any function which accepts sensitive data (such as a private key) will include the string `"[[REDACTED]]"` instead of the value passed in.


#### *Logger* . *errors* . **MISSING_ARGUMENT**

An expected parameter was not specified.


#### *Logger* . *errors* . **MISSING_NEW**

An object is a Class, but is not being called with `new`.


#### *Logger* . *errors* . **UNEXPECTED_ARGUMENT**

Too many parameters we passed into a function.


### Ethereum Error Codes

#### *Logger* . *errors* . **CALL_EXCEPTION**

An attempt to call a blockchain contract (getter) resulted in a revert or other error, such as insufficient gas (out-of-gas) or an invalid opcode. This can also occur during gas estimation or if waiting for a [TransactionReceipt](/v5/api/providers/types/#providers-TransactionReceipt) which failed during execution.

Consult the contract to determine the cause, such as a failed condition in a `require` statement. The `reason` property may provide more context for the cause of this error.


#### *Logger* . *errors* . **INSUFFICIENT_FUNDS**

The account is attempting to make a transaction which costs more than is available.

A sending account must have enough ether to pay for the value, the gas limit (at the gas price) as well as the intrinsic cost of data. The intrinsic cost of data is 4 gas for each zero byte and 68 gas for each non-zero byte, as well as 35000 gas if a transaction contains no `to` property and is therefore expected to create a new account.


#### *Logger* . *errors* . **NETWORK_ERROR**

An Ethereum network validation error, such as an invalid chain ID.


#### *Logger* . *errors* . **NONCE_EXPIRED**

The nonce being specified has already been used in a mined transaction.


#### *Logger* . *errors* . **REPLACEMENT_UNDERPRICED**

When replacing a transaction, by using a nonce which has already been sent to the network, but which has not been mined yet the new transaction must specify a higher gas price.

This error occurs when the gas price is insufficient to *bribe* the transaction pool to prefer the new transaction over the old one. Generally, the new gas price should be about 50% + 1 wei more, so if a gas price of 10 gwei was used, the replacement should be 15.000000001 gwei. This is not enforced by the protocol, as it deals with unmined transactions, and can be configured by each node, however to ensure a transaction is propagated to a miner it is best practice to follow the defaults most nodes have enabled.


#### *Logger* . *errors* . **UNPREDICTABLE_GAS_LIMIT**

When estimating the required amount of gas for a transaction, a node is queried for its best guess.

If a node is unable (or unwilling) to predict the cost, this error occurs.

The best remedy for this situation is to specify a gas limit in the transaction manually.

This error can also indicate that the transaction is expected to fail regardless, if for example an account with no tokens is attempting to send a token.


Log Levels
----------

#### *Logger* . *levels* . **DEBUG**

Log all output, including debugging information.


#### *Logger* . *levels* . **INFO**

Only log output for informational, warnings and errors.


#### *Logger* . *levels* . **WARNING**

Only log output for warnings and errors.


#### *Logger* . *levels* . **ERROR**

Only log output for errors.


#### *Logger* . *levels* . **OFF**

Do not output any logs.


