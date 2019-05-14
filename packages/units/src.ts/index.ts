"use strict";

import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { formatFixed, parseFixed } from "@ethersproject/bignumber/fixednumber";
import * as errors from "@ethersproject/errors";


const names = [
    "wei",
    "kwei",
    "mwei",
    "gwei",
    "szabo",
    "finney",
    "ether",
];


// Some environments have issues with RegEx that contain back-tracking, so we cannot
// use them.
export function commify(value: string | number): string {
    let comps = String(value).split(".");

    if (comps.length > 2 || !comps[0].match(/^-?[0-9]*$/) || (comps[1] && !comps[1].match(/^[0-9]*$/)) || value === "." || value === "-.") {
        errors.throwError("invalid value", errors.INVALID_ARGUMENT, { argument: "value", value: value });
    }

    // Make sure we have at least one whole digit (0 if none)
    let whole = comps[0];

    let negative = "";
    if (whole.substring(0, 1) === "-") {
        negative = "-";
        whole = whole.substring(1);
    }

    // Make sure we have at least 1 whole digit with no leading zeros
    while (whole.substring(0, 1) === "0") { whole = whole.substring(1); }
    if (whole === "") { whole = "0"; }

    let suffix = "";
    if (comps.length === 2) { suffix = "." + (comps[1] || "0"); }

    let formatted = [];
    while (whole.length) {
        if (whole.length <= 3) {
            formatted.unshift(whole);
            break;
        } else {
            let index = whole.length - 3;
            formatted.unshift(whole.substring(index));
            whole = whole.substring(0, index);
        }
    }

    return negative + formatted.join(",") + suffix;
}

export function formatUnits(value: BigNumberish, unitName?: string | BigNumberish): string {
    if (typeof(unitName) === "string") {
        let index = names.indexOf(unitName);
        if (index !== -1) { unitName = 3 * index; }
    }
    return formatFixed(value, (unitName != null) ? unitName: 18);
}

export function parseUnits(value: string, unitName?: BigNumberish): BigNumber {
    if (typeof(unitName) === "string") {
        let index = names.indexOf(unitName);
        if (index !== -1) { unitName = 3 * index; }
    }
    return parseFixed(value, (unitName != null) ? unitName: 18);
}

export function formatEther(wei: BigNumberish): string {
    return formatUnits(wei, 18);
}

export function parseEther(ether: string): BigNumber {
    return parseUnits(ether, 18);
}

