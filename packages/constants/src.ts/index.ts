"use strict";

import { BigNumber } from "@ethersproject/bignumber";

const AddressZero = "0x0000000000000000000000000000000000000000";
const HashZero = "0x0000000000000000000000000000000000000000000000000000000000000000";

// NFKD (decomposed)
//const EtherSymbol = "\uD835\uDF63";

// NFKC (composed)
const EtherSymbol = "\u039e";

const NegativeOne: BigNumber = BigNumber.from(-1);
const Zero: BigNumber = BigNumber.from(0);
const One: BigNumber = BigNumber.from(1);
const Two: BigNumber = BigNumber.from(2);
const WeiPerEther: BigNumber = BigNumber.from("1000000000000000000");
const MaxUint256: BigNumber = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export {
    AddressZero,
    HashZero,

    EtherSymbol,

    NegativeOne,
    Zero,
    One,
    Two,
    WeiPerEther,
    MaxUint256
};
