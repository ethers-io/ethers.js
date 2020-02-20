-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Logger
======



Errors
------



#### *Logger* . *errors* . **UNKNOWN_ERROR**

A generic unknown error.




#### *Logger* . *errors* . **NOT_IMPLEMENTED**

The operation is not implemented.




#### *Logger* . *errors* . **UNSUPPORTED_OPERATION**

The operation is not supported.




#### *Logger* . *errors* . **NETWORK_ERROR**

An Ethereum network validation error, such as an invalid chain ID.




#### *Logger* . *errors* . **SERVER_ERROR**

There was an error communicating with a server.




#### *Logger* . *errors* . **TIMEOUT**

A timeout occurred.




#### *Logger* . *errors* . **BUFFER_OVERRUN**

The amount of data needed is more than the amount of data required,
which would cause the data buffer to read past its end.




#### *Logger* . *errors* . **NUMERIC_FAULT**

There was an invalid operation done on numeric values.

Common cases of this occur when there is [overflow](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Integer_overflow),
[arithmetic underflow](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Arithmetic_underflow) in fixed numeric types or division by zero.




#### *Logger* . *errors* . **MISSING_NEW**

An object is a Class, but is now being called with `new`.




#### *Logger* . *errors* . **INVALID_ARGUMENT**

The type or value of an argument is invalid. This will generally also
include the `name` and `value` of the argument. Any function which
accepts sensitive data (such as a private key) will include the string
`[REDACTED]]` instead of the value passed in.




#### *Logger* . *errors* . **MISSING_ARGUMENT**

An expected parameter was not specified.




#### *Logger* . *errors* . **UNEXPECTED_ARGUMENT**

Too many parameters we passed into a function.




#### *Logger* . *errors* . **CALL_EXCEPTION**

An attempt to call a blockchain contract (getter) resulted in a
revert or other error.




#### *Logger* . *errors* . **INSUFFICIENT_FUNDS**

The account is attempting to make a transaction which costs more than is
available.

A sending account must have enough ether to pay for the value, the gas limit
(at the gas price) as well as the intrinsic cost of data. The intrinsic cost
of data is 4 gas for each zero byte and 68 gas for each non-zero byte.




#### *Logger* . *errors* . **NONCE_EXPIRED**

The nonce being specified has already been used in a mined transaction.




#### *Logger* . *errors* . **REPLACEMENT_UNDERPRICED**

When replacing a transaction, by using a nonce which has already been sent to
the network, but which has not been mined yet the new transaction must specify
a higher gas price.

This error occurs when the gas price is insufficient to *bribe* the transaction
pool to prefer the new transaction over the old one. Generally, the new gas price
should be about 50% + 1 wei more, so if a gas price of 10 gwei was used, the
replacement should be 15.000000001 gwei.




#### *Logger* . *errors* . **UNPREDICTABLE_GAS_LIMIT**

When estimating the required amount of gas for a transaction, a node is queried for
its best guess.

If a node is unable (or unwilling) to predict the cost, this error occurs.

The best remedy for this situation is to specify a gas limit in the transaction
manually.

This error can also indicate that the transaction is expected to fail regardless,
if for example an account with no tokens is attempting to send a token.




Creating instances
------------------



#### **new** *ethers* . *utils* . **Logger** ( version ) 

Create a new logger which will include *version* in all errors thrown.





-----
**Content Hash:** 8e9a442738b535dee543efeb8207f15f887a9ed3fbc984567c751c73c6ad541a