
import { logger } from "./logger.js";

import type { BigNumberish, Numeric } from "@ethersproject/logger";



const BN_0 = BigInt(0);
const BN_1 = BigInt(1);

// Convert a value from a twos-compliment value
export function fromTwos(_value: BigNumberish, _width: Numeric): bigint {
    const value = logger.getBigInt(_value, "value");
    const width = BigInt(logger.getNumber(_width, "width"));

    // Top bit set; treat as a negative value
    if (value >> (width - BN_1)) {
        const mask = (BN_1 << width) - BN_1;
        return -(((~value) & mask) + BN_1);
    }

    return value;
}

// Convert value to a twos-compliment value
export function toTwos(_value: BigNumberish, _width: Numeric): bigint {
    const value = logger.getBigInt(_value, "value");
    const width = BigInt(logger.getNumber(_width, "width"));

    if (value < BN_0) {
        const mask = (BN_1 << width) - BN_1;
        return ((~(-value)) & mask) + BN_1;
    }

    return value;
}

export function mask(_value: BigNumberish, _bits: Numeric): bigint {
    const value = logger.getBigInt(_value, "value");
    const bits = logger.getBigInt(_bits, "bits");
    return value & ((BN_1 << bits) - BN_1);
}
