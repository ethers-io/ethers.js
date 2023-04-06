/**
 *  A Typed object allows a value to have its type explicitly
 *  specified.
 *
 *  For example, in Solidity, the value ``45`` could represent a
 *  ``uint8`` or a ``uint256``. The value ``0x1234`` could represent
 *  a ``bytes2`` or ``bytes``.
 *
 *  Since JavaScript has no meaningful way to explicitly inform any
 *  APIs which what the type is, this allows transparent interoperation
 *  with Soldity.
 *
 *  @_subsection: api/abi:Typed Values
 */
import { assertPrivate, defineProperties } from "../utils/index.js";
const _gaurd = {};
function n(value, width) {
    let signed = false;
    if (width < 0) {
        signed = true;
        width *= -1;
    }
    // @TODO: Check range is valid for value
    return new Typed(_gaurd, `${signed ? "" : "u"}int${width}`, value, { signed, width });
}
function b(value, size) {
    // @TODO: Check range is valid for value
    return new Typed(_gaurd, `bytes${(size) ? size : ""}`, value, { size });
}
const _typedSymbol = Symbol.for("_ethers_typed");
export class Typed {
    type;
    value;
    #options;
    _typedSymbol;
    constructor(gaurd, type, value, options) {
        if (options == null) {
            options = null;
        }
        assertPrivate(_gaurd, gaurd, "Typed");
        defineProperties(this, { _typedSymbol, type, value });
        this.#options = options;
        // Check the value is valid
        this.format();
    }
    format() {
        if (this.type === "array") {
            throw new Error("");
        }
        else if (this.type === "dynamicArray") {
            throw new Error("");
        }
        else if (this.type === "tuple") {
            return `tuple(${this.value.map((v) => v.format()).join(",")})`;
        }
        return this.type;
    }
    defaultValue() {
        return 0;
    }
    minValue() {
        return 0;
    }
    maxValue() {
        return 0;
    }
    isBigInt() {
        return !!(this.type.match(/^u?int[0-9]+$/));
    }
    isData() {
        return this.type.startsWith("bytes");
    }
    isString() {
        return (this.type === "string");
    }
    get tupleName() {
        if (this.type !== "tuple") {
            throw TypeError("not a tuple");
        }
        return this.#options;
    }
    // Returns the length of this type as an array
    // - `null` indicates the length is unforced, it could be dynamic
    // - `-1` indicates the length is dynamic
    // - any other value indicates it is a static array and is its length
    get arrayLength() {
        if (this.type !== "array") {
            throw TypeError("not an array");
        }
        if (this.#options === true) {
            return -1;
        }
        if (this.#options === false) {
            return (this.value).length;
        }
        return null;
    }
    static from(type, value) {
        return new Typed(_gaurd, type, value);
    }
    static uint8(v) { return n(v, 8); }
    static uint16(v) { return n(v, 16); }
    static uint24(v) { return n(v, 24); }
    static uint32(v) { return n(v, 32); }
    static uint40(v) { return n(v, 40); }
    static uint48(v) { return n(v, 48); }
    static uint56(v) { return n(v, 56); }
    static uint64(v) { return n(v, 64); }
    static uint72(v) { return n(v, 72); }
    static uint80(v) { return n(v, 80); }
    static uint88(v) { return n(v, 88); }
    static uint96(v) { return n(v, 96); }
    static uint104(v) { return n(v, 104); }
    static uint112(v) { return n(v, 112); }
    static uint120(v) { return n(v, 120); }
    static uint128(v) { return n(v, 128); }
    static uint136(v) { return n(v, 136); }
    static uint144(v) { return n(v, 144); }
    static uint152(v) { return n(v, 152); }
    static uint160(v) { return n(v, 160); }
    static uint168(v) { return n(v, 168); }
    static uint176(v) { return n(v, 176); }
    static uint184(v) { return n(v, 184); }
    static uint192(v) { return n(v, 192); }
    static uint200(v) { return n(v, 200); }
    static uint208(v) { return n(v, 208); }
    static uint216(v) { return n(v, 216); }
    static uint224(v) { return n(v, 224); }
    static uint232(v) { return n(v, 232); }
    static uint240(v) { return n(v, 240); }
    static uint248(v) { return n(v, 248); }
    static uint256(v) { return n(v, 256); }
    static uint(v) { return n(v, 256); }
    static int8(v) { return n(v, -8); }
    static int16(v) { return n(v, -16); }
    static int24(v) { return n(v, -24); }
    static int32(v) { return n(v, -32); }
    static int40(v) { return n(v, -40); }
    static int48(v) { return n(v, -48); }
    static int56(v) { return n(v, -56); }
    static int64(v) { return n(v, -64); }
    static int72(v) { return n(v, -72); }
    static int80(v) { return n(v, -80); }
    static int88(v) { return n(v, -88); }
    static int96(v) { return n(v, -96); }
    static int104(v) { return n(v, -104); }
    static int112(v) { return n(v, -112); }
    static int120(v) { return n(v, -120); }
    static int128(v) { return n(v, -128); }
    static int136(v) { return n(v, -136); }
    static int144(v) { return n(v, -144); }
    static int152(v) { return n(v, -152); }
    static int160(v) { return n(v, -160); }
    static int168(v) { return n(v, -168); }
    static int176(v) { return n(v, -176); }
    static int184(v) { return n(v, -184); }
    static int192(v) { return n(v, -192); }
    static int200(v) { return n(v, -200); }
    static int208(v) { return n(v, -208); }
    static int216(v) { return n(v, -216); }
    static int224(v) { return n(v, -224); }
    static int232(v) { return n(v, -232); }
    static int240(v) { return n(v, -240); }
    static int248(v) { return n(v, -248); }
    static int256(v) { return n(v, -256); }
    static int(v) { return n(v, -256); }
    static bytes1(v) { return b(v, 1); }
    static bytes2(v) { return b(v, 2); }
    static bytes3(v) { return b(v, 3); }
    static bytes4(v) { return b(v, 4); }
    static bytes5(v) { return b(v, 5); }
    static bytes6(v) { return b(v, 6); }
    static bytes7(v) { return b(v, 7); }
    static bytes8(v) { return b(v, 8); }
    static bytes9(v) { return b(v, 9); }
    static bytes10(v) { return b(v, 10); }
    static bytes11(v) { return b(v, 11); }
    static bytes12(v) { return b(v, 12); }
    static bytes13(v) { return b(v, 13); }
    static bytes14(v) { return b(v, 14); }
    static bytes15(v) { return b(v, 15); }
    static bytes16(v) { return b(v, 16); }
    static bytes17(v) { return b(v, 17); }
    static bytes18(v) { return b(v, 18); }
    static bytes19(v) { return b(v, 19); }
    static bytes20(v) { return b(v, 20); }
    static bytes21(v) { return b(v, 21); }
    static bytes22(v) { return b(v, 22); }
    static bytes23(v) { return b(v, 23); }
    static bytes24(v) { return b(v, 24); }
    static bytes25(v) { return b(v, 25); }
    static bytes26(v) { return b(v, 26); }
    static bytes27(v) { return b(v, 27); }
    static bytes28(v) { return b(v, 28); }
    static bytes29(v) { return b(v, 29); }
    static bytes30(v) { return b(v, 30); }
    static bytes31(v) { return b(v, 31); }
    static bytes32(v) { return b(v, 32); }
    static address(v) { return new Typed(_gaurd, "address", v); }
    static bool(v) { return new Typed(_gaurd, "bool", !!v); }
    static bytes(v) { return new Typed(_gaurd, "bytes", v); }
    static string(v) { return new Typed(_gaurd, "string", v); }
    static array(v, dynamic) {
        throw new Error("not implemented yet");
        return new Typed(_gaurd, "array", v, dynamic);
    }
    static tuple(v, name) {
        throw new Error("not implemented yet");
        return new Typed(_gaurd, "tuple", v, name);
    }
    static overrides(v) {
        return new Typed(_gaurd, "overrides", Object.assign({}, v));
    }
    /**
     *  Returns true only if %%value%% is a [[Typed]] instance.
     */
    static isTyped(value) {
        return (value && value._typedSymbol === _typedSymbol);
    }
    /**
     *  If the value is a [[Typed]] instance, validates the underlying value
     *  and returns it, otherwise returns value directly.
     *
     *  This is useful for functions that with to accept either a [[Typed]]
     *  object or values.
     */
    static dereference(value, type) {
        if (Typed.isTyped(value)) {
            if (value.type !== type) {
                throw new Error(`invalid type: expecetd ${type}, got ${value.type}`);
            }
            return value.value;
        }
        return value;
    }
}
//# sourceMappingURL=typed.js.map