-----

Documentation: [html](https://docs.ethers.io/)

-----

AbiCoder
========

Creating Instance
-----------------

#### **new ***ethers* . *utils* . **AbiCoder**( [ coerceFunc ] )

Create a new AbiCoder instance, which will call the *coerceFunc* on every decode, where the result of the call will be used in the Result.

The function signature is `(type, value)`, where the *type* is the string describing the type and the *value* is the processed value from the underlying Coder.

If the callback throws, the Result will contain a property that when accessed will throw, allowing for higher level libraries to recover from data errors.


#### *ethers* . *utils* . **defaultAbiCoder** => *[AbiCoder](/v5/api/utils/abi/coder/)*

An [AbiCoder](/v5/api/utils/abi/coder/) created when the library is imported which is used by the [Interface](/v5/api/utils/abi/interface/).


Coding Methods
--------------

#### *abiCoder* . **encode**( types , values ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Encode the array *values* according the array of *types*, each of which may be a string or a [ParamType](/v5/api/utils/abi/fragments/#ParamType).


#### *abiCoder* . **decode**( types , data ) => *[Result](/v5/api/utils/abi/interface/#Result)*

Decode the *data* according to the array of *types*, each of which may be a string or [ParamType](/v5/api/utils/abi/fragments/#ParamType).


