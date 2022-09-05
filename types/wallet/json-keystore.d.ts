import type { ProgressCallback } from "../crypto/index.js";
import type { BytesLike } from "../utils/index.js";
export declare type KeystoreAccountParams = {
    privateKey: string;
    address?: string;
    mnemonic?: {
        entropy: string;
        path: string;
        locale: string;
    };
};
export declare type KeystoreAccount = {
    address: string;
    privateKey: string;
    mnemonic?: {
        entropy: string;
        path: string;
        locale: string;
    };
};
export declare type EncryptOptions = {
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
export declare function decryptKeystoreJsonSync(json: string, _password: string | Uint8Array): KeystoreAccount;
export declare function decryptKeystoreJson(json: string, _password: string | Uint8Array, progress?: ProgressCallback): Promise<KeystoreAccount>;
export declare function encryptKeystoreJson(account: KeystoreAccount, password: string | Uint8Array, options?: EncryptOptions, progressCallback?: ProgressCallback): Promise<string>;
//# sourceMappingURL=json-keystore.d.ts.map