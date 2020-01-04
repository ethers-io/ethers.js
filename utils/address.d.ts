import { BigNumber } from './bignumber';
import { Arrayish } from './bytes';
export declare function getAddress(address: string): string;
export declare function getIcapAddress(address: string): string;
export declare function getContractAddress(transaction: {
    from: string;
    nonce: Arrayish | BigNumber | number;
}): string;
export declare type Create2Options = {
    from: string;
    salt: Arrayish;
    initCode?: Arrayish;
    initCodeHash?: Arrayish;
};
export declare function getCreate2Address(options: Create2Options): string;
