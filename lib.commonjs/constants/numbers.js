"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxInt256 = exports.MinInt256 = exports.MaxUint256 = exports.WeiPerEther = exports.N = void 0;
/**
 *  A constant for the order N for the secp256k1 curve.
 */
exports.N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
/**
 *  A constant for the number of wei in a single ether.
 */
exports.WeiPerEther = BigInt("1000000000000000000");
/**
 *  A constant for the maximum value for a ``uint256``.
 */
exports.MaxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
/**
 *  A constant for the minimum value for an ``int256``.
 */
exports.MinInt256 = BigInt("0x8000000000000000000000000000000000000000000000000000000000000000") * BigInt(-1);
/**
 *  A constant for the maximum value for an ``int256``.
 */
exports.MaxInt256 = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
//# sourceMappingURL=numbers.js.map