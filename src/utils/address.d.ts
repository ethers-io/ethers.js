import { BigNumber } from './bignumber';
import { Arrayish } from './convert';
export declare function getAddress(address: string, icapFormat?: boolean): string;
export declare function getContractAddress(transaction: {
    from: string;
    nonce: Arrayish | BigNumber | number;
}): string;
