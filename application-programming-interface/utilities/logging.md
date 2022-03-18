# Logging

## Logging

These are just a few simple logging utilities provided to simplify and standardize the error facilities across the **Hethers** library.

The **Logger** library has zero dependencies and is intentionally very light so it can be easily included in each library.

The **Censorship** functionality relies on one instance of the **Hethers** library being included. In large bundled packages or when `npm link` is used, this may not be the case. If you require this functionality, ensure that your bundling is configured properly.

## Logger

#### `new hethers.utils.Logger( version )`

Create a new logger which will include _version_ in all errors thrown.

#### `Logger.globalLogger( ) ⇒ Logger`

Returns the singleton global logger.

### Logging Output

#### `logger.debug( ...args ) ⇒ void`

Log debugging information.

#### `logger.info( ...args ) ⇒ void`

Log generic information.

#### `logger.warn( ...args ) ⇒ void`

Log warnings.

### Errors

These functions honor the current [Censorship](logging.md#censorship) and help create a standard error model for detecting and processing errors within Hethers.

#### `logger.makeError( message [, code = UNKNOWN_ERROR [, params ] ] ) ⇒ Error`

Create an Error object with _message_ and an optional _code_ and additional _params_ set. This is useful when an error is needed to be rejected instead of thrown.

#### `logger.throwError( message [, code = UNKNOWN_ERROR [, params ] ] ) ⇒ never`

Throw an Error with _message_ and an optional _code_ and additional _params_ set.

#### `logger.throwArgumentError( message, name, value ) ⇒ never`

Throw an [INVALID\_ARGUMENT](logging.md#logger.errors.invalid\_argument) Error with _name_ and _value_.

### Usage Validation

There can be used to ensure various properties and actions are safe.

#### `logger.checkAbstract( target, kind ) ⇒ void`

If _target_ is _kind_, throws a [UNSUPPORTED\_OPERATION](logging.md#logger.errors.unsupported\_operation) error otherwise performs the same operations as [**checkNew**](logging.md#logger.checknew-target-kind-void).

This is useful for ensuring abstract classes are not being instantiated.

#### `logger.checkArgumentCount( count, expectedCount [, message ) ⇒ void`

If _count_ is not equal to _expectedCount_, throws a [MISSING\_ARGUMENT](logging.md#logger.errors.missing\_argument) or [UNEXPECTED\_ARGUMENT](logging.md#logger.errors.unexpected\_argument) error.

#### `logger.checkNew( target, kind ) ⇒ void`

If _target_ is not a valid `this` or `target` value, throw a [MISSING\_NEW](logging.md#logger.errors.missing\_new) error. This is useful to ensure callers of a Class are using `new`.

#### `logger.checkNormalize( message ) ⇒ void`

Check that the environment has a correctly functioning [String.normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/String/normalize). If not, a [UNSUPPORTED\_OPERATION](logging.md#logger.errors.unsupported\_operation) error is thrown.

#### `logger.checkSafeUint53( value [, message ] ) ⇒ void`

If _value_ is not safe as a [JavaScript number](https://en.wikipedia.org/wiki/Double-precision\_floating-point\_format), throws a [NUMERIC\_FAULT](logging.md#logger.errors.numeric\_fault) error.

### Censorship

#### `Logger.setCensorship( censor [, permanent = false ] ) ⇒ void`

Set error censorship, optionally preventing errors from being uncensored.

In production applications, this prevents any error from leaking information by masking the message and values of errors.

This can impact debugging, making it substantially more difficult.

#### `Logger.setLogLevel( logLevel ) ⇒ void`

Set the log level, to suppress logging output below a [particular log level](logging.md#log-levels).

### Errors

Every error in **Hethers** has a `code` value, which is a string that will match one of the following error codes.

#### Generic Error Codes

#### `Logger.errors.NOT_IMPLEMENTED`

The operation is not implemented. This may occur when calling a method on a sub-class that has not fully implemented its abstract superclass.

#### `Logger.errors.SERVER_ERROR`

There was an error communicating with a server.

This may occur for a number of reasons, for example:

* a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) issue; this is quite often the problem and also the hardest to diagnose and fix, so it is very beneficial to familiarize yourself with CORS; some backends allow you configure your CORS, such as the geth command-line or conifguration files or the INFURA and Alchemy dashboards by specifing allowed Origins, methods, etc.
* an SSL issue; for example, if you are trying to connect to a local node via HTTP but are serving the content from a secure HTTPS website
* a link issue; a firewall is preventing the traffic from reaching the server
* a server issue; the server is down, or is returning 500 error codes
* a backend **DDoS** mitigation proxy; for example a Cloudflare proxy, which will block traffic if the request is sent via specific User Agents or the client fingerprint is detected as a bot in some cases

#### `Logger.errors.TIMEOUT`

A timeout occurred.

#### `Logger.errors.UNKNOWN_ERROR`

A generic unknown error.

#### `Logger.errors.UNSUPPORTED_OPERATION`

The operation is not supported.

This can happen for a variety reasons, for example:

* Some backends do not support certain operations
* A [Contract](../contract-interaction/contract.md) object connected to [Provider](../providers/provider/) (instead of a [Signer](../signers.md#signer)) cannot [sign](../signers.md#signing) or [send](../signers.md#signer.sendtransaction-transactionrequest-promise-less-than-transactionresponse-greater-than) transactions
* a [Contract](../contract-interaction/contract.md) connected to a [Signer](../signers.md#signer) without a [Provider](../providers/provider/) is write-only and cannot estimate gas or execute static calls

#### Safety Error Codes

#### `Logger.errors.BUFFER_OVERRUN`

The amount of data needed is more than the amount of data required, which would cause the data buffer to read past its end.

This can occur if a contract erroneously returns invalid ABI-encoded data or RLP data is malformed.

#### `Logger.errors.NUMERIC_FAULT`

There was an invalid operation done on numeric values.

Common cases of this occur when there is [overflow](https://en.wikipedia.org/wiki/Integer\_overflow), [arithmetic underflow](https://en.wikipedia.org/wiki/Arithmetic\_underflow) in fixed numeric types or division by zero.

#### Usage Error Codes

#### `Logger.errors.INVALID_ARGUMENT`

The type or value of an argument is invalid. This will generally also include the `name` and `value` of the argument. Any function which accepts sensitive data (such as a private key) will include the string `"[[REDACTED]]"` instead of the value passed in.

#### `Logger.errors.MISSING_ARGUMENT`

An expected parameter was not specified.

#### `Logger.errors.MISSING_NEW`

An object is a Class, but is not being called with `new`.

#### `Logger.errors.UNEXPECTED_ARGUMENT`

Too many parameters we passed into a function.

#### Hedera Error Codes

#### `Logger.errors.CALL_EXCEPTION`

An attempt to call a contract (getter) resulted in a revert or other error, such as insufficient gas (out-of-gas) or an invalid opcode. This can also occur during gas estimation or if waiting for a **TransactionReceipt** which failed during execution.

Consult the contract to determine the cause, such as a failed condition in a `require` statement. The `reason` property may provide more context for the cause of this error.

#### `Logger.errors.INSUFFICIENT_FUNDS`

The account is attempting to make a transaction which costs more than is available.

A sending account must have enough **hbar** to pay for the value, the gas limit (at the gas price) as well as the intrinsic cost of data.

#### `Logger.errors.NETWORK_ERROR`

A **Hedera** network validation error, such as an invalid chain ID.

#### `Logger.errors.UNPREDICTABLE_GAS_LIMIT`

When estimating the required amount of gas for a transaction, a node is queried for its best guess.

If a node is unable (or unwilling) to predict the cost, this error occurs.

The best remedy for this situation is to specify a gas limit in the transaction manually.

This error can also indicate that the transaction is expected to fail regardless, if for example an account with no tokens is attempting to send a token.

### Log Levels

#### `Logger.levels.DEBUG`

Log all output, including debugging information.

#### `Logger.levels.INFO`

Only log output for informational, warnings and errors.

#### `Logger.levels.WARNING`

Only log output for warnings and errors.

#### `Logger.levels.ERROR`

Only log output for errors.

#### `Logger.levels.OFF`

Do not output any logs.
