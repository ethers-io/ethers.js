import { BigNumber } from './bignumber';
import { BigNumberish } from './bignumber';
export declare function formatUnits(value: BigNumberish, unitType?: string | number, options?: any): string;
export declare function parseUnits(value: string, unitType?: string | number): BigNumber;
export declare function formatEther(wei: BigNumberish, options?: any): string;
export declare function parseEther(ether: string): BigNumber;
