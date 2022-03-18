# Property Utilities

This is a collection of utility functions used for handling properties in a platform-safe way.

#### &#x20;`hethers.utils.checkProperties( object , check ) ⇒ void`

Checks that _object_ only contains properties included in _check_, and throws [`INVALID_ARGUMENT`](logging.md#logger.errors.invalid\_argument) if not.

`hethers.utils.deepCopy( anObject ) ⇒ any`

Creates a recursive copy of _anObject_. Frozen (i.e. and other known immutable) objects are copied by reference.

#### `hethers.utils.defineReadOnly( anObject , name , value ) ⇒ void`

Uses the `Object.defineProperty` method to set a read-only property on an object.

#### `hethers.utils.getStatic( aConstructor , key ) ⇒ any`

Recursively check for a static method _key_ on an inheritance chain from _aConstructor_ to all ancestors.

This is used to mimic behaviour in other languages where `this` in a static method will also search ancestors.

#### `hethers.utils.resolveProperties( anObject ) ⇒ Promise<any>`

Retruns a Promise which resolves all child values on _anObject_.

#### `hethers.utils.shallowCopy( anObject ) ⇒ any`

Returns a shallow copy of _anObject_. This is the same as using `Object.assign({ }, anObject)`.
