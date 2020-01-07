"use strict";
import { BigNumber } from "@ethersproject/bignumber";
const AddressZero = "0x0000000000000000000000000000000000000000";
const HashZero = "0x0000000000000000000000000000000000000000000000000000000000000000";
// NFKC (composed)             // (decomposed)
const EtherSymbol = "\u039e"; // "\uD835\uDF63";
const NegativeOne = BigNumber.from(-1);
const Zero = BigNumber.from(0);
const One = BigNumber.from(1);
const Two = BigNumber.from(2);
const WeiPerEther = BigNumber.from("1000000000000000000");
const MaxUint256 = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
export { AddressZero, HashZero, EtherSymbol, NegativeOne, Zero, One, Two, WeiPerEther, MaxUint256 };
