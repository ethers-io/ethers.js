"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEther = exports.formatEther = exports.parseUnits = exports.formatUnits = void 0;
const fixednumber_js_1 = require("./fixednumber.js");
const logger_js_1 = require("./logger.js");
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
function formatUnits(value, unit) {
    if (typeof (unit) === "string") {
        const index = names.indexOf(unit);
        if (index === -1) {
            logger_js_1.logger.throwArgumentError("invalid unit", "unit", unit);
        }
        unit = 3 * index;
    }
    return (0, fixednumber_js_1.formatFixed)(value, (unit != null) ? unit : 18);
}
exports.formatUnits = formatUnits;
/**
 *  Converts the //decimal string// %%value%% to a [[BigInt]], assuming
 *  %%unit%% decimal places. The %%unit%% may the number of decimal places
 *  or the name of a unit (e.g. ``"gwei"`` for 9 decimal places).
 */
function parseUnits(value, unit) {
    if (typeof (value) !== "string") {
        logger_js_1.logger.throwArgumentError("value must be a string", "value", value);
    }
    if (typeof (unit) === "string") {
        const index = names.indexOf(unit);
        if (index === -1) {
            logger_js_1.logger.throwArgumentError("invalid unit", "unit", unit);
        }
        unit = 3 * index;
    }
    return (0, fixednumber_js_1.parseFixed)(value, (unit != null) ? unit : 18);
}
exports.parseUnits = parseUnits;
/**
 *  Converts %%value%% into a //decimal string// using 18 decimal places.
 */
function formatEther(wei) {
    return formatUnits(wei, 18);
}
exports.formatEther = formatEther;
/**
 *  Converts the //decimal string// %%ether%% to a [[BigInt]], using 18
 *  decimal places.
 */
function parseEther(ether) {
    return parseUnits(ether, 18);
}
exports.parseEther = parseEther;
//# sourceMappingURL=units.js.map