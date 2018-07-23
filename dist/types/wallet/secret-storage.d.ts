import { SigningKey } from './signing-key';
import { Arrayish, EncryptOptions, ProgressCallback } from '../utils/types';
export declare function decryptCrowdsale(json: string, password: Arrayish | string): SigningKey;
export declare function decrypt(json: string, password: Arrayish, progressCallback?: ProgressCallback): Promise<SigningKey>;
export declare function encrypt(privateKey: Arrayish | SigningKey, password: Arrayish | string, options?: EncryptOptions, progressCallback?: ProgressCallback): Promise<string>;
//# sourceMappingURL=secret-storage.d.ts.map