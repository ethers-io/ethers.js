-----

Documentation: [html](https://docs.ethers.io/)

-----

Property Utilities
==================

#### *ethers* . *utils* . **checkProperties**( object , check ) => *void*

Checks that *object* only contains properties included in *check*, and throws [INVALID_ARGUMENT](/v5/api/utils/logger/#errors--invalid-argument) if not.


#### *ethers* . *utils* . **deepCopy**( anObject ) => *any*

Creates a recursive copy of *anObject*. Frozen (i.e. and other known immutable) objects are copied by reference.


#### *ethers* . *utils* . **defineReadOnly**( anObject , name , value ) => *void*

Uses the `Object.defineProperty` method to set a read-only property on an object.


#### *ethers* . *utils* . **getStatic**( aConstructor , key ) => *any*

Recursively check for a static method *key* on an inheritance chain from *aConstructor* to all ancestors.

This is used to mimic behaviour in other languages where `this` in a static method will also search ancestors.


#### *ethers* . *utils* . **resolveProperties**( anObject ) => *Promise< any >*

Retruns a Promise which resolves all child values on *anObject*.


#### *ethers* . *utils* . **shallowCopy**( anObject ) => *any*

Returns a shallow copy of *anObject*. This is the same as using `Object.assign({ }, anObject)`.


