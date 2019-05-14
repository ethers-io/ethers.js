import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { Bytes, BytesLike } from "@ethersproject/bytes";
import { Description } from "@ethersproject/properties";
export declare class KeystoreAccount extends Description implements ExternallyOwnedAccount {
    readonly address: string;
    readonly privateKey: string;
    readonly mnemonic?: string;
    readonly path?: string;
    isType(value: any): value is KeystoreAccount;
}
export declare type ProgressCallback = (percent: number) => void;
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
export declare function decrypt(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<KeystoreAccount>;
export declare function encrypt(account: ExternallyOwnedAccount, password: Bytes | string, options?: EncryptOptions, progressCallback?: ProgressCallback): Promise<string>;
