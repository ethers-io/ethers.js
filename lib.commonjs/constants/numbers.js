"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxInt256 = exports.MinInt256 = exports.MaxUint256 = exports.WeiPerEther = exports.N = exports.Two = exports.One = exports.Zero = exports.NegativeOne = void 0;
/**
 *  A constant for the BigInt of -1.
 */
const NegativeOne = BigInt(-1);
exports.NegativeOne = NegativeOne;
/**
 *  A constant for the BigInt of 0.
 */
const Zero = BigInt(0);
exports.Zero = Zero;
/**
 *  A constant for the BigInt of 1.
 */
const One = BigInt(1);
exports.One = One;
/**
 *  A constant for the BigInt of 2.
 */
const Two = BigInt(2);
exports.Two = Two;
/**
 *  A constant for the order N for the secp256k1 curve.
 */
const N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
exports.N = N;
/**
 *  A constant for the number of wei in a single ether.
 */
const WeiPerEther = BigInt("1000000000000000000");
exports.WeiPerEther = WeiPerEther;
/**
 *  A constant for the maximum value for a ``uint256``.
 */
const MaxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
exports.MaxUint256 = MaxUint256;
/**
 *  A constant for the minimum value for an ``int256``.
 */
const MinInt256 = BigInt("0x8000000000000000000000000000000000000000000000000000000000000000") * NegativeOne;
exports.MinInt256 = MinInt256;
/**
 *  A constant for the maximum value for an ``int256``.
 */
const MaxInt256 = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
exports.MaxInt256 = MaxInt256;
//# sourceMappingURL=numbers.js.map