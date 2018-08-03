"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_1 = require("./bignumber");
var AddressZero = '0x0000000000000000000000000000000000000000';
var HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000';
// NFKD (decomposed)
//const EtherSymbol = '\uD835\uDF63';
// NFKC (composed)
var EtherSymbol = '\u039e';
exports.constants = {
    AddressZero: AddressZero,
    HashZero: HashZero,
    EtherSymbol: EtherSymbol,
    NegativeOne: bignumber_1.ConstantNegativeOne,
    Zero: bignumber_1.ConstantZero,
    One: bignumber_1.ConstantOne,
    Two: bignumber_1.ConstantTwo,
    WeiPerEther: bignumber_1.ConstantWeiPerEther,
    MaxUint256: bignumber_1.ConstantMaxUint256
};
