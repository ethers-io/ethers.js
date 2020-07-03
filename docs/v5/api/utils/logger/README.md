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

Throw an [INVALID_ARGUMENT](/v5/api/utils/logger/#errors-InvalidArgument) Error with *name* and *value*.


### Usage Validation

#### *logger* . **checkAbstract**( target , kind ) => *void*

Checks that *target* is not *kind* and performs the same operatons as `checkNew`. This is useful for ensuring abstract classes are not being instantiated.


#### *logger* . **checkArgumentCount**( count , expectedCound [ , message ) => *void*

If *count* is not equal to *expectedCount*, throws a [MISSING_ARGUMENT](/v5/api/utils/logger/#errors-MissingArgument) or [UNEXPECTED_ARGUMENT](/v5/api/utils/logger/#errors-UnexpectedArgument) error.


#### *logger* . **checkNew**( target , kind ) => *void*

If *target* is not a valid `this` or `target` value, throw a [MISSING_NEW](/v5/api/utils/logger/#errors-MissingNew) error. This is useful to ensure callers of a Class are using `new`.


#### *logger* . **checkNormalize**( message ) => *void*

Check that the environment has a correctly functioning [String.normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize). If not, a [UNSUPPORTED_OPERATION](/v5/api/utils/logger/#errors-UnsupportedOperation) error is thrown.


#### *logger* . **checkSafeUint53**( value [ , message ] ) => *void*

If *value* is not safe as a [JavaScript number](https://en.wikipedia.org/wiki/Double-precision_floating-point_format), throws a [NUMERIC_FAULT](/v5/api/utils/logger/#errors-NumericFault) error.


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

The operation is not implemented.


#### *Logger* . *errors* . **SERVER_ERROR**

There was an error communicating with a server.


#### *Logger* . *errors* . **TIMEOUT**

A timeout occurred.


#### *Logger* . *errors* . **UNKNOWN_ERROR**

A generic unknown error.


#### *Logger* . *errors* . **UNSUPPORTED_OPERATION**

The operation is not supported.


### Safety Error Codes

#### *Logger* . *errors* . **BUFFER_OVERRUN**

The amount of data needed is more than the amount of data required, which would cause the data buffer to read past its end.


#### *Logger* . *errors* . **NUMERIC_FAULT**

There was an invalid operation done on numeric values.

Common cases of this occur when there is [overflow](https://en.wikipedia.org/wiki/Integer_overflow), [arithmetic underflow](https://en.wikipedia.org/wiki/Arithmetic_underflow) in fixed numeric types or division by zero.


### Usage Error Codes

#### *Logger* . *errors* . **INVALID_ARGUMENT**

The type or value of an argument is invalid. This will generally also include the `name` and `value` of the argument. Any function which accepts sensitive data (such as a private key) will include the string `[[REDACTED]]` instead of the value passed in.


#### *Logger* . *errors* . **MISSING_ARGUMENT**

An expected parameter was not specified.


#### *Logger* . *errors* . **MISSING_NEW**

An object is a Class, but is now being called with `new`.


#### *Logger* . *errors* . **UNEXPECTED_ARGUMENT**

Too many parameters we passed into a function.


### Ethereum Error Codes

#### *Logger* . *errors* . **CALL_EXCEPTION**

An attempt to call a blockchain contract (getter) resulted in a revert or other error.


#### *Logger* . *errors* . **INSUFFICIENT_FUNDS**

The account is attempting to make a transaction which costs more than is available.

A sending account must have enough ether to pay for the value, the gas limit (at the gas price) as well as the intrinsic cost of data. The intrinsic cost of data is 4 gas for each zero byte and 68 gas for each non-zero byte.


#### *Logger* . *errors* . **NETWORK_ERROR**

An Ethereum network validation error, such as an invalid chain ID.


#### *Logger* . *errors* . **NONCE_EXPIRED**

The nonce being specified has already been used in a mined transaction.


#### *Logger* . *errors* . **REPLACEMENT_UNDERPRICED**

When replacing a transaction, by using a nonce which has already been sent to the network, but which has not been mined yet the new transaction must specify a higher gas price.

This error occurs when the gas price is insufficient to *bribe* the transaction pool to prefer the new transaction over the old one. Generally, the new gas price should be about 50% + 1 wei more, so if a gas price of 10 gwei was used, the replacement should be 15.000000001 gwei.


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

Only log output for infomational, warnings and errors.


#### *Logger* . *levels* . **WARNING**

Only log output for warnings and errors.


#### *Logger* . *levels* . **ERROR**

Only log output for errors.


#### *Logger* . *levels* . **OFF**

Do not output any logs.


