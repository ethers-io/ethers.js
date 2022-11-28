/**
 *  About fixed-point math...
 *
 *  @_section: api/utils/fixed-point-math:Fixed-Point Maths  [fixed-point-math]
 */
import { getBytes } from "./data.js";
import { assert, assertArgument, assertPrivate } from "./errors.js";
import { getBigInt, getNumber, fromTwos, toBigInt, toHex, toTwos } from "./maths.js";

import type { BigNumberish, BytesLike, Numeric } from "./index.js";


const _guard = { };

const NegativeOne = BigInt(-1);

function throwFault(message: string, fault: string, operation: string, value?: any): never {
    const params: any = { fault: fault, operation: operation };
    if (value !== undefined) { params.value = value; }
    assert(false, message, "NUMERIC_FAULT", params);
}

// Constant to pull zeros from for multipliers
let zeros = "0";
while (zeros.length < 256) { zeros += zeros; }

// Returns a string "1" followed by decimal "0"s
function getMultiplier(decimals: number): bigint {

    assertArgument(Number.isInteger(decimals) && decimals >= 0 && decimals <= 256,
        "invalid decimal length", "decimals", decimals);

    return BigInt("1" + zeros.substring(0, decimals));
}

/**
 *  Returns the fixed-point string representation of %%value%% to
 *  divided by %%decimal%% places.
 *
 *  @param {Numeric = 18} decimals
 */
export function formatFixed(_value: BigNumberish, _decimals?: Numeric): string {
    if (_decimals == null) { _decimals = 18; }

    let value = getBigInt(_value, "value");
    const decimals = getNumber(_decimals, "decimals");

    const multiplier = getMultiplier(decimals);
    const multiplierStr = String(multiplier);

    const negative = (value < 0);
    if (negative) { value *= NegativeOne; }

    let fraction = String(value % multiplier);

    // Make sure there are enough place-holders
    while (fraction.length < multiplierStr.length - 1) { fraction = "0" + fraction; }

    // Strip training 0
    while (fraction.length > 1 && fraction.substring(fraction.length - 1) === "0") {
        fraction = fraction.substring(0, fraction.length - 1);
    }

    let result = String(value / multiplier);
    if (multiplierStr.length !== 1) { result += "." + fraction; }

    if (negative) { result = "-" + result; }

    return result;
}

/**
 *  Returns the value of %%value%% multiplied by %%decimal%% places.
 *
 *  @param {Numeric = 18} decimals
 */
export function parseFixed(str: string, _decimals: Numeric): bigint {
    if (_decimals == null) { _decimals = 18; }
    const decimals = getNumber(_decimals, "decimals");

    const multiplier = getMultiplier(decimals);

    assertArgument(typeof(str) === "string" && str.match(/^-?[0-9.]+$/),
        "invalid decimal value", "str", str);

    // Is it negative?
    const negative = (str.substring(0, 1) === "-");
    if (negative) { str = str.substring(1); }

    assertArgument(str !== ".", "missing value", "str", str);

    // Split it into a whole and fractional part
    const comps = str.split(".");
    assertArgument(comps.length <= 2, "too many decimal points", "str", str);

    let whole = (comps[0] || "0"), fraction = (comps[1] || "0");

    // Trim trialing zeros
    while (fraction[fraction.length - 1] === "0") {
        fraction = fraction.substring(0, fraction.length - 1);
    }

    // Check the fraction doesn't exceed our decimals size
    if (fraction.length > String(multiplier).length - 1) {
        throwFault("fractional component exceeds decimals", "underflow", "parseFixed");
    }

    // If decimals is 0, we have an empty string for fraction
    if (fraction === "") { fraction = "0"; }

    // Fully pad the string with zeros to get to wei
    while (fraction.length < String(multiplier).length - 1) { fraction += "0"; }

    const wholeValue = BigInt(whole);
    const fractionValue = BigInt(fraction);

    let wei = (wholeValue * multiplier) + fractionValue;

    if (negative) { wei *= NegativeOne; }

    return wei;
}

/**
 *  A FixedFormat encapsulates the properties required to describe
 *  a fixed-point arithmetic field.
 */
export class FixedFormat {
    /**
     *  If true, negative values are permitted, otherwise only
     *  positive values and zero are allowed.
     */
    readonly signed: boolean;

    /**
     *  The number of bits available to store the value in the
     *  fixed-point arithmetic field.
     */
    readonly width: number;

    /**
     *  The number of decimal places in the fixed-point arithment field.
     */
    readonly decimals: number;

    /**
     *  A human-readable representation of the fixed-point arithmetic field.
     */
    readonly name: string;

    /**
     *  @private
     */
    readonly _multiplier: bigint;

    /**
     *  @private
     */
    constructor(guard: any, signed: boolean, width: number, decimals: number) {
        assertPrivate(guard, _guard, "FixedFormat");

        this.signed = signed;
        this.width = width;
        this.decimals = decimals;

        this.name = (signed ? "": "u") + "fixed" + String(width) + "x" + String(decimals);

        this._multiplier = getMultiplier(decimals);

        Object.freeze(this);
    }

    /**
     *  Returns a new FixedFormat for %%value%%.
     *
     *  If %%value%% is specified as a ``number``, the bit-width is
     *  128 bits and %%value%% is used for the ``decimals``.
     *
     *  A string %%value%% may begin with ``fixed`` or ``ufixed``
     *  for signed and unsigned respectfully. If no other properties
     *  are specified, the bit-width is 128-bits with 18 decimals.
     *
     *  To specify the bit-width and demicals, append them separated
     *  by an ``"x"`` to the %%value%%.
     *
     *  For example, ``ufixed128x18`` describes an unsigned, 128-bit
     *  wide format with 18 decimals.
     *
     *  If %%value%% is an other object, its properties for ``signed``,
     *  ``width`` and ``decimals`` are checked.
     */
    static from(value: any): FixedFormat {
        if (value instanceof FixedFormat) { return value; }

        if (typeof(value) === "number") {
            value = `fixed128x${value}`
        }

        let signed = true;
        let width = 128;
        let decimals = 18;

        if (typeof(value) === "string") {
            if (value === "fixed") {
                // defaults...
            } else if (value === "ufixed") {
                signed = false;
            } else {
                const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
                assertArgument(match, "invalid fixed format", "format", value);
                signed = (match[1] !== "u");
                width = parseInt(match[2]);
                decimals = parseInt(match[3]);
            }
        } else if (value) {
            const check = (key: string, type: string, defaultValue: any): any => {
                if (value[key] == null) { return defaultValue; }
                assertArgument(typeof(value[key]) === type,
                    "invalid fixed format (" + key + " not " + type +")", "format." + key, value[key]);
                return value[key];
            }
            signed = check("signed", "boolean", signed);
            width = check("width", "number", width);
            decimals = check("decimals", "number", decimals);
        }

        assertArgument((width % 8) === 0, "invalid fixed format width (not byte aligned)", "format.width", width);
        assertArgument(decimals <= 80, "invalid fixed format (decimals too large)", "format.decimals", decimals);

        return new FixedFormat(_guard, signed, width, decimals);
    }
}

/**
 *  A FixedNumber represents a value over its [[FixedFormat]]
 *  arithmetic field.
 *
 *  A FixedNumber can be used to perform math, losslessly, on
 *  values which have decmial places.
 */
export class FixedNumber {
    readonly format: FixedFormat;

    /**
     *  @private
     */
    readonly _isFixedNumber: boolean;

    //#hex: string;
    #value: string;

    /**
     *  @private
     */
    constructor(guard: any, hex: string, value: string, format?: FixedFormat) {
        assertPrivate(guard, _guard, "FixedNumber");

        this.format = FixedFormat.from(format);
        //this.#hex = hex;
        this.#value = value;

        this._isFixedNumber = true;

        Object.freeze(this);
    }

    #checkFormat(other: FixedNumber): void {
        assertArgument(this.format.name === other.format.name,
            "incompatible format; use fixedNumber.toFormat", "other", other);
    }

    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% added
     *  to %%other%%.
     */
    addUnsafe(other: FixedNumber): FixedNumber {
        this.#checkFormat(other);
        const a = parseFixed(this.#value, this.format.decimals);
        const b = parseFixed(other.#value, other.format.decimals);
        return FixedNumber.fromValue(a + b, this.format.decimals, this.format);
    }

    /**
     *  Returns a new [[FixedNumber]] with the result of %%other%% subtracted
     *   %%this%%.
     */
    subUnsafe(other: FixedNumber): FixedNumber {
        this.#checkFormat(other);
        const a = parseFixed(this.#value, this.format.decimals);
        const b = parseFixed(other.#value, other.format.decimals);
        return FixedNumber.fromValue(a - b, this.format.decimals, this.format);
    }

    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% multiplied
     *  by %%other%%.
     */
    mulUnsafe(other: FixedNumber): FixedNumber {
        this.#checkFormat(other);
        const a = parseFixed(this.#value, this.format.decimals);
        const b = parseFixed(other.#value, other.format.decimals);
        return FixedNumber.fromValue((a * b) / this.format._multiplier, this.format.decimals, this.format);
    }

    /**
     *  Returns a new [[FixedNumber]] with the result of %%this%% divided
     *  by %%other%%.
     */
    divUnsafe(other: FixedNumber): FixedNumber {
        this.#checkFormat(other);
        const a = parseFixed(this.#value, this.format.decimals);
        const b = parseFixed(other.#value, other.format.decimals);
        return FixedNumber.fromValue((a * this.format._multiplier) / b, this.format.decimals, this.format);
    }

    /**
     *  Returns a new [[FixedNumber]] which is the largest **integer**
     *  that is less than or equal to %%this%%.
     *
     *  The decimal component of the result will always be ``0``.
     */
    floor(): FixedNumber {
        const comps = this.toString().split(".");
        if (comps.length === 1) { comps.push("0"); }

        let result = FixedNumber.from(comps[0], this.format);

        const hasFraction = !comps[1].match(/^(0*)$/);
        if (this.isNegative() && hasFraction) {
            result = result.subUnsafe(ONE.toFormat(result.format));
        }

        return result;
    }

    /**
     *  Returns a new [[FixedNumber]] which is the smallest **integer**
     *  that is greater than or equal to %%this%%.
     *
     *  The decimal component of the result will always be ``0``.
     */
    ceiling(): FixedNumber {
        const comps = this.toString().split(".");
        if (comps.length === 1) { comps.push("0"); }

        let result = FixedNumber.from(comps[0], this.format);

        const hasFraction = !comps[1].match(/^(0*)$/);
        if (!this.isNegative() && hasFraction) {
            result = result.addUnsafe(ONE.toFormat(result.format));
        }

        return result;
    }

    /**
     *  Returns a new [[FixedNumber]] with the decimal component
     *  rounded up on ties.
     *
     *  The decimal component of the result will always be ``0``.
     *
     *  @param {number = 0} decimals
     */
    round(decimals?: number): FixedNumber {
        if (decimals == null) { decimals = 0; }

        // If we are already in range, we're done
        const comps = this.toString().split(".");
        if (comps.length === 1) { comps.push("0"); }

        assertArgument(Number.isInteger(decimals) && decimals >= 0 && decimals <= 80,
            "invalid decimal count", "decimals", decimals);

        if (comps[1].length <= decimals) { return this; }

        const factor = FixedNumber.from("1" + zeros.substring(0, decimals), this.format);
        const bump = BUMP.toFormat(this.format);

        return this.mulUnsafe(factor).addUnsafe(bump).floor().divUnsafe(factor);
    }

    /**
     *  Returns true if %%this%% is equal to ``0``.
     */
    isZero(): boolean {
        return (this.#value === "0.0" || this.#value === "0");
    }

    /**
     *  Returns true if %%this%% is less than ``0``.
     */
    isNegative(): boolean {
        return (this.#value[0] === "-");
    }

    /**
     *  Returns the string representation of %%this%%.
     */
    toString(): string { return this.#value; }

    toHexString(_width: Numeric): string {
        throw new Error("TODO");
        /*
        return toHex();
        if (width == null) { return this.#hex; }

        const width = logger.getNumeric(_width);
        if (width % 8) { logger.throwArgumentError("invalid byte width", "width", width); }

        const hex = BigNumber.from(this.#hex).fromTwos(this.format.width).toTwos(width).toHexString();
        return zeroPadLeft(hex, width / 8);
        */
    }

    /**
     *  Returns a float approximation.
     *
     *  Due to IEEE 754 precission (or lack thereof), this function
     *  can only return an approximation and most values will contain
     *  rounding errors.
     */
    toUnsafeFloat(): number { return parseFloat(this.toString()); }

    /**
     *  Return a new [[FixedNumber]] with the same value but has had
     *  its field set to %%format%%.
     *
     *  This will throw if the value cannot fit into %%format%%.
     */
    toFormat(format: FixedFormat | string): FixedNumber {
        return FixedNumber.fromString(this.#value, format);
    }

    /**
     *  Creates a new [[FixedNumber]] for %%value%% multiplied by
     *  %%decimal%% places with %%format%%.
     *
     *  @param {number = 0} decimals
     *  @param {FixedFormat | string | number = "fixed"} format
     */
    static fromValue(value: BigNumberish, decimals?: number, format?: FixedFormat | string | number): FixedNumber {
        if (decimals == null) { decimals = 0; }
        if (format == null) { format = "fixed"; }
        return FixedNumber.fromString(formatFixed(value, decimals), FixedFormat.from(format));
    }

    /**
     *  Creates a new [[FixedNumber]] for %%value%% with %%format%%.
     *
     *  @param {FixedFormat | string | number = "fixed"} format
     */
    static fromString(value: string, format?: FixedFormat | string | number): FixedNumber {
        if (format == null) { format = "fixed"; }
        const fixedFormat = FixedFormat.from(format);
        const numeric = parseFixed(value, fixedFormat.decimals);

        if (!fixedFormat.signed && numeric < 0) {
            throwFault("unsigned value cannot be negative", "overflow", "value", value);
        }

        const hex = (function() {
            if (fixedFormat.signed) {
                return toHex(toTwos(numeric, fixedFormat.width));
            }
            return toHex(numeric, fixedFormat.width / 8);
        })();

        const decimal = formatFixed(numeric, fixedFormat.decimals);

        return new FixedNumber(_guard, hex, decimal, fixedFormat);
    }

    /**
     *  Creates a new [[FixedNumber]] with the big-endian representation
     *  %%value%% with %%format%%.
     */
    static fromBytes(_value: BytesLike, format?: FixedFormat | string | number): FixedNumber {
        if (format == null) { format = "fixed"; }
        const value = getBytes(_value, "value");
        const fixedFormat = FixedFormat.from(format);

        if (value.length > fixedFormat.width / 8) {
            throw new Error("overflow");
        }

        let numeric = toBigInt(value);
        if (fixedFormat.signed) { numeric = fromTwos(numeric, fixedFormat.width); }

        const hex = toHex(toTwos(numeric, (fixedFormat.signed ? 0: 1) + fixedFormat.width));
        const decimal = formatFixed(numeric, fixedFormat.decimals);

        return new FixedNumber(_guard, hex, decimal, fixedFormat);
    }

    /**
     *  Creates a new [[FixedNumber]].
     */
    static from(value: any, format?: FixedFormat | string | number): FixedNumber {
        if (typeof(value) === "string") {
            return FixedNumber.fromString(value, format);
        }

        if (value instanceof Uint8Array) {
            return FixedNumber.fromBytes(value, format);
        }

        try {
            return FixedNumber.fromValue(value, 0, format);
        } catch (error: any) {
            // Allow NUMERIC_FAULT to bubble up
            if (error.code !== "INVALID_ARGUMENT") {
                throw error;
            }
        }

        assertArgument(false, "invalid FixedNumber value", "value", value);
    }

    /**
     *  Returns true if %%value%% is a [[FixedNumber]].
     */
    static isFixedNumber(value: any): value is FixedNumber {
        return !!(value && value._isFixedNumber);
    }
}

const ONE = FixedNumber.from(1);
const BUMP = FixedNumber.from("0.5");
