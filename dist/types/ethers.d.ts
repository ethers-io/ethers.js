import { platform } from './utils/shims';
import { Contract, Interface } from './contracts';
import * as providers from './providers';
import * as utils from './utils';
import { HDNode, SigningKey, Wallet } from './wallet';
import * as wordlists from './wordlists';
import * as types from './utils/types';
import * as errors from './utils/errors';
import { version } from './_version';
declare const constants: {
    AddressZero: string;
    HashZero: string;
    NegativeOne: utils.types.BigNumber;
    Zero: utils.types.BigNumber;
    One: utils.types.BigNumber;
    Two: utils.types.BigNumber;
    WeiPerEther: utils.types.BigNumber;
};
export { Wallet, HDNode, SigningKey, Contract, Interface, providers, types, errors, constants, utils, wordlists, platform, version };
//# sourceMappingURL=ethers.d.ts.map