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
export function formatEther(wei) {
    return formatUnits(wei, 18);
}
export function parseEther(ether) {
    return parseUnits(ether, 18);
}
//# sourceMappingURL=units.js.map