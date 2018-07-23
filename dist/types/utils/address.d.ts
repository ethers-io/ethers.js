import { Arrayish, BigNumber } from './types';
export declare function getAddress(address: string): string;
export declare function getIcapAddress(address: string): string;
export declare function getContractAddress(transaction: {
    from: string;
    nonce: Arrayish | BigNumber | number;
}): string;
//# sourceMappingURL=address.d.ts.map