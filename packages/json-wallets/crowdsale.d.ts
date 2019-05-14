import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { Bytes } from "@ethersproject/bytes";
import { Description } from "@ethersproject/properties";
export declare class CrowdsaleAccount extends Description implements ExternallyOwnedAccount {
    readonly address: string;
    readonly privateKey: string;
    readonly mnemonic?: string;
    readonly path?: string;
    isType(value: any): value is CrowdsaleAccount;
}
export declare function decrypt(json: string, password: Bytes | string): ExternallyOwnedAccount;
