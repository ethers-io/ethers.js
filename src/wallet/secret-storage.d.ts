import { Arrayish } from '../utils/convert';
import { SigningKey } from './signing-key';
export interface ProgressCallback {
    (percent: number): void;
}
export declare function isCrowdsaleWallet(json: string): boolean;
export declare function isValidWallet(json: string): boolean;
export declare function decryptCrowdsale(json: string, password: Arrayish | string): SigningKey;
export declare function decrypt(json: string, password: any, progressCallback?: ProgressCallback): Promise<SigningKey>;
export declare function encrypt(privateKey: Arrayish | SigningKey, password: Arrayish | string, options?: any, progressCallback?: ProgressCallback): Promise<string>;
