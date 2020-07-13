"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_1 = require("@ethersproject/bignumber");
var AddressZero = "0x0000000000000000000000000000000000000000";
exports.AddressZero = AddressZero;
var HashZero = "0x0000000000000000000000000000000000000000000000000000000000000000";
exports.HashZero = HashZero;
// NFKC (composed)             // (decomposed)
var EtherSymbol = "\u039e"; // "\uD835\uDF63";
exports.EtherSymbol = EtherSymbol;
var NegativeOne = bignumber_1.BigNumber.from(-1);
exports.NegativeOne = NegativeOne;
var Zero = bignumber_1.BigNumber.from(0);
exports.Zero = Zero;
var One = bignumber_1.BigNumber.from(1);
exports.One = One;
var Two = bignumber_1.BigNumber.from(2);
exports.Two = Two;
var WeiPerEther = bignumber_1.BigNumber.from("1000000000000000000");
exports.WeiPerEther = WeiPerEther;
var MaxUint256 = bignumber_1.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
exports.MaxUint256 = MaxUint256;
//# sourceMappingURL=index.js.map