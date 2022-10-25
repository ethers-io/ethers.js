import { formatFixed, parseFixed } from "./fixednumber.js";
import { assertArgument } from "./errors.js";

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
    if (typeof(unit) === "string") {
        const index = names.indexOf(unit);
        assertArgument(index >= 0, "invalid unit", "unit", unit);
        unit = 3 * index;
    }
    return formatFixed(value, (unit != null) ? unit: 18);
}

/**
 *  Converts the //decimal string// %%value%% to a [[BigInt]], assuming
 *  %%unit%% decimal places. The %%unit%% may the number of decimal places
 *  or the name of a unit (e.g. ``"gwei"`` for 9 decimal places).
 */
export function parseUnits(value: string, unit?: string | Numeric): bigint {
    assertArgument(typeof(value) === "string", "value must be a string", "value", value);

    if (typeof(unit) === "string") {
        const index = names.indexOf(unit);
        assertArgument(index >= 0, "invalid unit", "unit", unit);
        unit = 3 * index;
    }

    return parseFixed(value, (unit != null) ? unit: 18);
}

/**
 *  Converts %%value%% into a //decimal string// using 18 decimal places.
 */
export function formatEther(wei: BigNumberish): string {
    return formatUnits(wei, 18);
}

/**
 *  Converts the //decimal string// %%ether%% to a [[BigInt]], using 18
 *  decimal places.
 */
export function parseEther(ether: string): bigint {
    return parseUnits(ether, 18);
}
