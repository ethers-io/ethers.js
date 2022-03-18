# Fragments

## Formats

### JSON String ABI (Solidity Output JSON)

The **JSON ABI Format** is the format that is [output from the Solidity compiler](https://solidity.readthedocs.io/en/v0.6.0/using-the-compiler.html#output-description).

A JSON serialized object is always a string, which represents an Array of Objects, where each Object has various properties describing the **Fragment** of the ABI.

The deserialized JSON string (which is a normal JavaScript Object) may also be passed into any function which accepts a JSON String ABI.

### Human-Readable ABI

The ABI is described by using an array of strings, where each string is the Solidity signature of the **constructor**, **function**, **event** or **error**.

When parsing a fragment, all inferred properties will be injected (e.g. a _payable_ method will have its `constant` property set to false).

Tuples can be specified by using the `tuple(...)` syntax or with bare (additional) parenthesis, `(...)`.

```typescript
const ABI = [
  // Constructor
  "constructor(address ens)",

  // Constant functions (pure or view)
  "function balanceOf(address owner) view returns (uint)",

  // State-mutating functions (payable or non-payable)
  "function mint(uint amount) payable",
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",

  // Errors
  "error InsufficientFunds(address from, uint balance)",
]
```

### Output Formats

Each [Fragment](fragments.md#fragment) and [ParamType](fragments.md#paramtype) may be output using its `format` method.

#### `hethers.utils.FormatTypes.full ⇒ string` <a href="#utils.formattypes.full" id="utils.formattypes.full"></a>

This is a full human-readable string, including all parameter names, any optional modifiers (e.g. `indexed`, `public`, etc) and white-space to aid in human readability.

#### `hethers.utils.FormatTypes.minimal ⇒ string` <a href="#utils.formattypes.minimal" id="utils.formattypes.minimal"></a>

This is similar to `full`, except with no unnecessary whitespace or parameter names. This is useful for storing a minimal string which can still fully reconstruct the original **Fragment** using [Fragment from](fragments.md#utils.fragment.from).

#### `hethers.utils.FormatTypes.json ⇒ string` <a href="#utils.formattypes.json" id="utils.formattypes.json"></a>

This returns a JavaScript Object which is safe to call `JSON.stringify` on to create a JSON string.

#### `hethers.utils.FormatTypes.sighash ⇒ string` <a href="#utils.formattypes.sighash" id="utils.formattypes.sighash"></a>

This is a minimal output format, which is used by Solidity when computing a signature hash or an event topic hash.

{% hint style="info" %}
The `sighash` format is **insufficient** to re-create the original **Fragment**, since it discards modifiers such as indexed, anonymous, stateMutability, etc.

It is only useful for computing the selector for a Fragment, and cannot be used to format an Interface.
{% endhint %}

### Fragment

An ABI is a collection of **Fragments**, where each fragment specifies:

* An [Error](fragments.md#errorfragmentinherits-fragmentsource)
* An [Event](fragments.md#eventfragment-inherits-fragment)
* A [Function](fragments.md#functionfragment-inherits-constructorfragment)
* A [Constructor](fragments.md#constructorfragment-inherits-fragment)

#### Properties

#### `fragment.name ⇒ string` <a href="#fragment.name" id="fragment.name"></a>

This is the name of the Event or Function. This will be null for a [ConstructorFragment](fragments.md#constructorfragment-inherits-fragment).



#### `fragment.type ⇒ string` <a href="#fragment.type" id="fragment.type"></a>

This is a string which indicates the type of the [Fragment](fragments.md#fragment). This will be one of:

* `constructor`
* `event`
* `function`

``

#### `fragment.inputs ⇒ Array<`[`ParamType`](fragments.md#paramtype)`>` <a href="#fragment.inputs" id="fragment.inputs"></a>

This is an array of each [**ParamType**](fragments.md#paramtype) for the input parameters to the Constructor, Event of Function.

#### Methods

#### `fragment.format( [ format = sighash ] ) ⇒ string` <a href="#fragment.format" id="fragment.format"></a>

Creates a string representation of the Fragment using the available [output formats](fragments.md#output-formats).

#### `hethers.utils.Fragment.from( objectOrString ) ⇒` [`Fragment`](fragments.md#fragment)`` <a href="#utils.fragment.from" id="utils.fragment.from"></a>

Creates a new **Fragment** sub-class from any compatible _objectOrString_.

#### `hethers.utils.Fragment.isFragment( object ) ⇒ boolean` <a href="#utils.fragment.isfragment" id="utils.fragment.isfragment"></a>

Returns true if _object_ is a **Fragment**.

### ConstructorFragment (inherits [Fragment](fragments.md#fragment))

#### Properties

#### `fragment.gas ⇒` [`BigNumber`](../bignumber.md)`` <a href="#fragment.gas" id="fragment.gas"></a>

This is the gas limit that should be used during deployment. It may be null.

#### `fragment.payable ⇒ boolean` <a href="#fragment.payable" id="fragment.payable"></a>

This is whether the constructor may receive ether during deployment as an endowment (i.e. msg.value != 0).

#### `fragment.stateMutability ⇒ string` <a href="#fragment.statemutability" id="fragment.statemutability"></a>

This is the state mutability of the constructor. It can be any of:

* `nonpayable`
* `payable`

#### Methods

#### `hethers.utls.ConstructorFragment.from( objectOrString ) ⇒` [`ConstructorFragment`](fragments.md#constructorfragment-inherits-fragment)`` <a href="#utls.constructorfragment.from" id="utls.constructorfragment.from"></a>

Creates a new **ConstructorFragment** from any compatible _objectOrString_.

#### `hethers.utils.ConstructorFragment.isConstructorFragment( object ) ⇒ boolean` <a href="#utils.constructorfragment.isconstructorfragment" id="utils.constructorfragment.isconstructorfragment"></a>

Returns true if _object_ is a **ConstructorFragment**.

### ErrorFragment (inherits [Fragment](fragments.md#fragment))

#### Methods

#### `hethers.utils.ErroFragment.from( objectOrString ) ⇒` [`ErrorFragment`](fragments.md#errorfragment-inherits-fragment)`` <a href="#utils.errofragment.from" id="utils.errofragment.from"></a>

Creates a new **ErrorFragment** from any compatible _objectOrString_.

#### `hethers.utils.ErrorFragment.isErrorFragment( object ) ⇒ boolean` <a href="#utils.errorfragment.iserrorfragment" id="utils.errorfragment.iserrorfragment"></a>

Returns true if _object_ is an **ErrorFragment**.

### EventFragment (inherits [Fragment](fragments.md#fragment))

#### Properties

#### `fragment.anonymous ⇒ boolean` <a href="#fragment.anonymous" id="fragment.anonymous"></a>

This is whether the event is anonymous. An anonymous Event does not inject its topic hash as topic0 when creating a log.

#### Methods

#### `hethers.utils.EventFragment.from( objectOrString ) ⇒ EventFragment` <a href="#utils.eventfragment.from" id="utils.eventfragment.from"></a>

Creates a new **EventFragment** from any compatible _objectOrString_.

#### `hethers.utils.EventFragment.isEventFragment( object ) ⇒ boolean` <a href="#utils.eventfragment.iseventfragment" id="utils.eventfragment.iseventfragment"></a>

Returns true if _object_ is an **EventFragment**.

### FunctionFragment (inherits [ConstructorFragment](fragments.md#constructorfragment-inherits-fragment))

#### Properties

#### `fragment.constant ⇒ boolean` <a href="#fragment.constant" id="fragment.constant"></a>

This is whether the function is constant (i.e. does not change state). This is true if the state mutability is `pure` or `view`.

#### `fragment.stateMutability ⇒ string` <a href="#fragment.statemutability" id="fragment.statemutability"></a>

This is the state mutability of the constructor. It can be any of:

* `nonpayable`
* `payable`
* `pure`
* `view`

#### `fragment.outputs ⇒ Array<ParamType>` <a href="#fragment.outputs" id="fragment.outputs"></a>

A list of the Function output parameters.

#### Methods

#### `hethers.utils.FunctionFragment.from( objectOrString ) ⇒` [`FunctionFragment`](fragments.md#functionfragment-inherits-constructorfragment)`` <a href="#utils.functionfragment.from" id="utils.functionfragment.from"></a>

Creates a new **FunctionFragment** from any compatible _objectOrString_.

#### `hethers.utils.FunctionFragment.isFunctionFragment( object ) ⇒ boolean` <a href="#utils.functionfragment.isfunctionfragment" id="utils.functionfragment.isfunctionfragment"></a>

Returns true if _object_ is a **FunctionFragment**.

### ParamType

The following examples will represent the Solidity parameter:

`string foobar`

#### Properties

#### `paramType.name ⇒ string` <a href="#paramtype.name" id="paramtype.name"></a>

The local parameter name. This may be null for unnamed parameters. For example, the parameter definition `string foobar` would be `foobar`.

#### `paramType.type ⇒ string` <a href="#paramtype.type" id="paramtype.type"></a>

The full type of the parameter, including tuple and array symbols. This may be null for unnamed parameters. For the above example, this would be `foobar`.

#### `paramType.baseType ⇒ string` <a href="#paramtype.basetype" id="paramtype.basetype"></a>

The base type of the parameter. For primitive types (e.g. `address`, `uint256`, etc) this is equal to [type](fragments.md#paramtype.type). For arrays, it will be the string `array` and for a tuple, it will be the string `tuple`.

#### `paramType.indexed ⇒ boolean` <a href="#paramtype.indexed" id="paramtype.indexed"></a>

Whether the parameter has been marked as indexed. This **only** applies to parameters which are part of an [EventFragment](fragments.md#eventfragment-inherits-fragment).

#### `paramType.arrayChildren ⇒ ParamType` <a href="#paramtype.arraychildren" id="paramtype.arraychildren"></a>

The type of children of the array. This is null for any parameter which is not an array.

#### `paramType.arrayLength ⇒ number` <a href="#paramtype.arraylength" id="paramtype.arraylength"></a>

The length of the array, or `-1` for dynamic-length arrays. This is null for parameters which are not arrays.

#### `paramType.components ⇒ Array<ParamType>` <a href="#paramtype.components" id="paramtype.components"></a>

The components of a tuple. This is null for non-tuple parameters.

#### Methods

#### `paramType.format( [ outputType = sighash ] )` <a href="#paramtype.format" id="paramtype.format"></a>

Creates a string representation of the Fragment using the available [output formats](fragments.md#output-formats).

#### `hethers.utils.ParamType.from( objectOrString ) ⇒ ParamType` <a href="#utils.paramtype.from" id="utils.paramtype.from"></a>

Creates a new **ParamType** from any compatible _objectOrString_.

#### `hethers.utils.ParamType.isParamType( object ) ⇒ boolean` <a href="#utils.paramtype.isparamtype" id="utils.paramtype.isparamtype"></a>

Returns true if _object_ is a **ParamType**.
