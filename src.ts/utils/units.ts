/**
 *  Most interactions with Ethereum requires integer values, which use
 *  the smallest magnitude unit.
 *
 *  For example, imagine dealing with dollars and cents. Since dollars
 *  are divisible, non-integer values are possible, such as ``$10.77``.
 *  By using the smallest indivisible unit (i.e. cents), the value can
 *  be kept as the integer ``1077``.
 *
 *  When receiving decimal input from the user (as a decimal string),
 *  the value should be converted to an integer and when showing a user
 *  a value, the integer value should be converted to a decimal string.
 *
 *  This creates a clear distinction, between values to be used by code
 *  (integers) and values used for display logic to users (decimals).
 *
 *  The native unit in Ethereum, //ether// is divisible to 18 decimal places,
 *  where each individual unit is called a //wei//.
 *
 *  @_subsection api/utils:Unit Conversion  [about-units]
 */
import { assertArgument } from "./errors.js";
import { FixedNumber } from "./fixednumber.js";
import { getNumber } from "./maths.js";

import type { BigNumberish, Numeric } from "../utils/index.js";


const names = [
    "wei",
    "kwei",
    "mwei",
    "gwei",
    "szabo",
    "finney",
    "ether",
];

/**
 *  Converts %%value%% into a //decimal string//, assuming %%unit%% decimal
 *  places. The %%unit%% may be the number of decimal places or the name of
 *  a unit (e.g. ``"gwei"`` for 9 decimal places).
 *
 */
export function formatUnits(value: BigNumberish, unit?: string | Numeric): string {
    let decimals = 18;
    if (typeof(unit) === "string") {
        const index = names.indexOf(unit);
        assertArgument(index >= 0, "invalid unit", "unit", unit);
        decimals = 3 * index;
    } else if (unit != null) {
        decimals = getNumber(unit, "unit");
    }

    return FixedNumber.fromValue(value, decimals, { decimals, width: 512 }).toString();
}

/**
 *  Converts the //decimal string// %%value%% to a BigInt, assuming
 *  %%unit%% decimal places. The %%unit%% may the number of decimal places
 *  or the name of a unit (e.g. ``"gwei"`` for 9 decimal places).
 */
export function parseUnits(value: string, unit?: string | Numeric): bigint {
    assertArgument(typeof(value) === "string", "value must be a string", "value", value);

    let decimals = 18;
    if (typeof(unit) === "string") {
        const index = names.indexOf(unit);
        assertArgument(index >= 0, "invalid unit", "unit", unit);
        decimals = 3 * index;
    } else if (unit != null) {
        decimals = getNumber(unit, "unit");
    }

    return FixedNumber.fromString(value, { decimals, width: 512 }).value;
}

/**
 *  Converts %%value%% into a //decimal string// using 18 decimal places.
 */
export function formatEther(wei: BigNumberish): string {
    return formatUnits(wei, 18);
}

/**
 *  Converts the //decimal string// %%ether%% to a BigInt, using 18
 *  decimal places.
 */
export function parseEther(ether: string): bigint {
    return parseUnits(ether, 18);
}

/**
 *  Converts %%value%% into a //decimal string// using the number of
 *  decimal places for the given %%unit%% name (e.g. ``"gwei"``).
 *
 *  This is a convenience function that resolves unit names.
 *
 *  @example:
 *    formatGwei(1000000000n)
 *    //_result:
 *
 *    formatGwei(1500000000n)
 *    //_result:
 */
export function formatGwei(wei: BigNumberish): string {
    return formatUnits(wei, "gwei");
}

/**
 *  Converts the //decimal string// %%value%% to a BigInt, using 9
 *  decimal places (gwei).
 *
 *  @example:
 *    parseGwei("1.0")
 *    //_result:
 *
 *    parseGwei("20.5")
 *    //_result:
 */
export function parseGwei(value: string): bigint {
    return parseUnits(value, "gwei");
}

/**
 *  Converts %%value%% from one unit to another.
 *
 *  The %%fromUnit%% and %%toUnit%% can be unit names (e.g. ``"gwei"``,
 *  ``"ether"``) or decimal counts.
 *
 *  @example:
 *    // Convert 1 ether to gwei
 *    convertUnits("1.0", "ether", "gwei")
 *    //_result:
 *
 *    // Convert 1000000000 gwei to ether
 *    convertUnits("1000000000", "gwei", "ether")
 *    //_result:
 */
export function convertUnits(value: string, fromUnit: string | Numeric, toUnit: string | Numeric): string {
    assertArgument(typeof value === "string", "value must be a string", "value", value);
    // Parse from fromUnit to base (wei), then format in toUnit
    const baseValue = parseUnits(value, fromUnit);
    return formatUnits(baseValue, toUnit);
}

/**
 *  Returns ``true`` if %%value%% is a valid decimal string that
 *  can be parsed by [[parseUnits]].
 *
 *  @example:
 *    isValidDecimalString("1.5")
 *    //_result:
 *
 *    isValidDecimalString("abc")
 *    //_result:
 *
 *    isValidDecimalString("1.2.3")
 *    //_result:
 */
export function isValidDecimalString(value: string): boolean {
    if (typeof value !== "string") { return false; }
    return !!value.match(/^-?[0-9]+(\.[0-9]+)?$/);
}
