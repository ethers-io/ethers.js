/// <reference types="node" />
export declare module TestCase {
    type HDWalletNode = {
        path: string;
        address: string;
        privateKey: string;
    };
    type HDWallet = {
        name: string;
        seed: string;
        locale: string;
        password?: string;
        entropy: string;
        mnemonic: string;
        hdnodes: Array<HDWalletNode>;
    };
    type Wordlist = {
        locale: string;
        content: string;
    };
    type Unit = {
        name: string;
        ether: string;
        ether_format: string;
        wei: string;
        kwei?: string;
        mwei?: string;
        gwei?: string;
        szabo?: string;
        finney?: string;
        satoshi?: string;
        kwei_format?: string;
        mwei_format?: string;
        gwei_format?: string;
        szabo_format?: string;
        finney_format?: string;
        satoshi_format?: string;
    };
}
export declare function saveTests(tag: string, data: any): void;
export declare function loadTests(tag: string): any;
export declare function loadData(filename: string): Buffer;
export declare function randomBytes(seed: string, lower: number, upper?: number): Uint8Array;
export declare function randomHexString(seed: string, lower: number, upper?: number): string;
export declare function randomNumber(seed: string, lower: number, upper: number): number;
