import type { ProgressCallback } from "../crypto/index.js";
import type { BytesLike } from "../utils/index.js";
export declare type KeystoreAccount = {
    address: string;
    privateKey: string;
    mnemonic?: {
        path?: string;
        locale?: string;
        entropy: string;
    };
};
export declare type EncryptOptions = {
    progressCallback?: ProgressCallback;
    iv?: BytesLike;
    entropy?: BytesLike;
    client?: string;
    salt?: BytesLike;
    uuid?: string;
    scrypt?: {
        N?: number;
        r?: number;
        p?: number;
    };
};
export declare function isKeystoreJson(json: string): boolean;
declare type ScryptParams = {
    name: "scrypt";
    salt: Uint8Array;
    N: number;
    r: number;
    p: number;
    dkLen: number;
};
export declare function decryptKeystoreJsonSync(json: string, _password: string | Uint8Array): KeystoreAccount;
export declare function decryptKeystoreJson(json: string, _password: string | Uint8Array, progress?: ProgressCallback): Promise<KeystoreAccount>;
export declare function _encryptKeystore(key: Uint8Array, kdf: ScryptParams, account: KeystoreAccount, options: EncryptOptions): any;
export declare function encryptKeystoreJsonSync(account: KeystoreAccount, password: string | Uint8Array, options?: EncryptOptions): string;
export declare function encryptKeystoreJson(account: KeystoreAccount, password: string | Uint8Array, options?: EncryptOptions): Promise<string>;
export {};
//# sourceMappingURL=json-keystore.d.ts.map