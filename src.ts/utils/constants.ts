import {
    ConstantNegativeOne,
    ConstantZero,
    ConstantOne,
    ConstantTwo,
    ConstantWeiPerEther,
    ConstantMaxUint256
} from './bignumber';

const AddressZero = '0x0000000000000000000000000000000000000000';
const HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000';

// NFKD (decomposed)
//const EtherSymbol = '\uD835\uDF63';

// NFKC (composed)
const EtherSymbol = '\u039e';

export const constants = {
    AddressZero: AddressZero,
    HashZero: HashZero,

    EtherSymbol: EtherSymbol,

    NegativeOne: ConstantNegativeOne,
    Zero: ConstantZero,
    One: ConstantOne,
    Two: ConstantTwo,
    WeiPerEther: ConstantWeiPerEther,
    MaxUint256: ConstantMaxUint256
};
