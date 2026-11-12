/**
 *  The Application Binary Interface (ABI) describes how method input
 *  parameters should be encoded, their results decoded, and how to
 *  decode events and errors.
 *
 *  See [About ABIs](docs-abi) for more details how they are used.
 *
 *  @_section api/abi:Application Binary Interface  [about-abi]
 *  @_navTitle: ABI
 */


//////
export { AbiCoder } from "./abi-coder.js";

export { decodeBytes32String, encodeBytes32String } from "./bytes32.js";

export {
    ConstructorFragment, ErrorFragment, EventFragment, FallbackFragment,
    Fragment, FunctionFragment, NamedFragment, ParamType, StructFragment,
} from "./fragments.js";

export {
    checkResultErrors,
    Indexed,
    Interface,
    ErrorDescription, LogDescription, TransactionDescription,
    Result
} from "./interface.js";

export { Typed } from "./typed.js";

export { Coder, Reader, Writer } from "./coders/abstract-coder.js";

export { AddressCoder } from "./coders/address.js";
export { AnonymousCoder } from "./coders/anonymous.js";
export { ArrayCoder } from "./coders/array.js";
export { BooleanCoder } from "./coders/boolean.js";
export { BytesCoder, DynamicBytesCoder } from "./coders/bytes.js";
export { FixedBytesCoder } from "./coders/fixed-bytes.js";
export { NullCoder } from "./coders/null.js";
export { NumberCoder } from "./coders/number.js";
export { StringCoder } from "./coders/string.js";
export { TupleCoder } from "./coders/tuple.js";

export type {
    JsonFragment, JsonFragmentType,
    FormatType, FragmentType, ParamTypeWalkAsyncFunc, ParamTypeWalkFunc
} from "./fragments.js";

export type {
    InterfaceAbi,
} from "./interface.js";

