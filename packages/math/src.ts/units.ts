import { BigNumberish, Numeric } from "@ethersproject/logger";

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

export function formatUnits(value: BigNumberish, unit?: string | Numeric): string {
    if (typeof(unit) === "string") {
        const index = names.indexOf(unit);
        if (index === -1) { logger.throwArgumentError("invalid unit", "unit", unit); }
        unit = 3 * index;
    }
    return formatFixed(value, (unit != null) ? unit: 18);
}

export function parseUnits(value: string, unit?: string | Numeric): bigint {
    if (typeof(value) !== "string") {
        logger.throwArgumentError("value must be a string", "value", value);
    }
    if (typeof(unit) === "string") {
        const index = names.indexOf(unit);
        if (index === -1) { logger.throwArgumentError("invalid unit", "unit", unit); }
        unit = 3 * index;
    }
    return parseFixed(value, (unit != null) ? unit: 18);
}

export function formatEther(wei: BigNumberish): string {
    return formatUnits(wei, 18);
}

export function parseEther(ether: string): bigint {
    return parseUnits(ether, 18);
}
