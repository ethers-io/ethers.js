import { ethers } from "ethers";
declare function randomBytes(seed: string, lower: number, upper?: number): Uint8Array;
declare function randomHexString(seed: string, lower: number, upper?: number): string;
declare function randomNumber(seed: string, lower: number, upper: number): number;
declare function equals(a: any, b: any): boolean;
export declare function fundAddress(address: string): Promise<string>;
export declare function returnFunds(wallet: ethers.Wallet): Promise<string>;
export declare function sendTransaction(txObj: ethers.providers.TransactionRequest): Promise<string>;
export { randomBytes, randomHexString, randomNumber, equals };
//# sourceMappingURL=utils.d.ts.map