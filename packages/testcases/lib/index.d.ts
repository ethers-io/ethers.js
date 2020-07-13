/// <reference types="node" />
import { randomBytes, randomHexString, randomNumber } from "./random";
export { randomBytes, randomHexString, randomNumber };
export declare module TestCase {
    type BigNumber = {
        testcase: string;
        value: string | number;
        expectedValue: string;
    };
    type Hash = {
        data: string;
        keccak256: string;
        sha256: string;
        sha512: string;
    };
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
    type Nameprep = {
        comment: string;
        input: Array<number>;
        output: Array<number>;
        rc?: string;
        flags?: string;
    };
    type Wallet = {
        name: string;
        type: "crowdsale" | "secret-storage";
        hasAddress: boolean;
        address: string;
        privateKey: string;
        mnemonic?: string;
        password?: string;
        json: string;
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
    type SignedTransaction = {
        name: string;
        accountAddress: string;
        privateKey: string;
        signedTransaction: string;
        unsignedTransaction: string;
        signedTransactionChainId5: string;
        unsignedTransactionChainId5: string;
        nonce: number;
        gasLimit: string;
        gasPrice: string;
        to: string;
        value: string;
        data: string;
    };
}
export declare function saveTests(tag: string, data: any): void;
export declare function loadTests(tag: string): any;
export declare function loadData(filename: string): Buffer;
