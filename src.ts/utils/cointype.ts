import { assert } from "./errors.js";

const COIN_TYPE_ETH = 60n;
const COIN_TYPE_DEFAULT = 1n << 31n;

export function coinTypeFromChain(chain: number): bigint {
    if (chain === 1) return COIN_TYPE_ETH;
    assert((chain & Number(COIN_TYPE_DEFAULT - 1n)) === chain, "invalid chain id", "INVALID_ARGUMENT", {
        argument: 'chain',
        value: chain
    });
    return BigInt(chain) | COIN_TYPE_DEFAULT
}

export function chainFromCoinType(coinType: bigint): number {
    if (coinType == COIN_TYPE_ETH) return 1;
    coinType ^= COIN_TYPE_DEFAULT;
    return coinType >= 0 && coinType < COIN_TYPE_DEFAULT ? Number(coinType) : 0;
}

export function isEVMCoinType(coinType: bigint) {
    return coinType === COIN_TYPE_DEFAULT || chainFromCoinType(coinType) > 0
}
