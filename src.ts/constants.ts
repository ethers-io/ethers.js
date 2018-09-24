import { BigNumber, bigNumberify } from './utils/bignumber';

const AddressZero = '0x0000000000000000000000000000000000000000';
const HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000';

// NFKD (decomposed)
//const EtherSymbol = '\uD835\uDF63';

// NFKC (composed)
const EtherSymbol = '\u039e';

const NegativeOne: BigNumber = bigNumberify(-1);
const Zero: BigNumber = bigNumberify(0);
const One: BigNumber = bigNumberify(1);
const Two: BigNumber = bigNumberify(2);
const WeiPerEther: BigNumber = bigNumberify('1000000000000000000');
const MaxUint256: BigNumber = bigNumberify('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

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
