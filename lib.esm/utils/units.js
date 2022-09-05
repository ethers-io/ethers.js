import { formatFixed, parseFixed } from "./fixednumber.js";
import { logger } from "./logger.js";
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
export function formatUnits(value, unit) {
    if (typeof (unit) === "string") {
        const index = names.indexOf(unit);
        if (index === -1) {
            logger.throwArgumentError("invalid unit", "unit", unit);
        }
        unit = 3 * index;
    }
    return formatFixed(value, (unit != null) ? unit : 18);
}
/**
 *  Converts the //decimal string// %%value%% to a [[BigInt]], assuming
 *  %%unit%% decimal places. The %%unit%% may the number of decimal places
 *  or the name of a unit (e.g. ``"gwei"`` for 9 decimal places).
 */
export function parseUnits(value, unit) {
    if (typeof (value) !== "string") {
        logger.throwArgumentError("value must be a string", "value", value);
    }
    if (typeof (unit) === "string") {
        const index = names.indexOf(unit);
        if (index === -1) {
            logger.throwArgumentError("invalid unit", "unit", unit);
        }
        unit = 3 * index;
    }
    return parseFixed(value, (unit != null) ? unit : 18);
}
/**
 *  Converts %%value%% into a //decimal string// using 18 decimal places.
 */
export function formatEther(wei) {
    return formatUnits(wei, 18);
}
/**
 *  Converts the //decimal string// %%ether%% to a [[BigInt]], using 18
 *  decimal places.
 */
export function parseEther(ether) {
    return parseUnits(ether, 18);
}
//# sourceMappingURL=units.js.map