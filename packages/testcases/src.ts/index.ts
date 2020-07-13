'use strict';

import fs from 'fs';
import path from 'path';
import zlib from 'browserify-zlib';

import { randomBytes, randomHexString, randomNumber } from "./random";
export { randomBytes, randomHexString, randomNumber };

export module TestCase {
    export type BigNumber = {
        testcase: string;
        value: string | number;
        expectedValue: string;
    };

    export type Hash = {
        data: string;
        keccak256: string;
        sha256: string;
        sha512: string;
    };

    export type HDWalletNode = {
        path: string;
        address: string;
        privateKey: string;
    };

    export type HDWallet = {
        name: string;

        seed: string;
        locale: string;
        password?: string;
        entropy: string;
        mnemonic: string;

        hdnodes: Array<HDWalletNode>
    };

    export type Nameprep = {
        comment: string;
        input: Array<number>;
        output: Array<number>;
        rc?: string;
        flags?: string;
    };

    export type Wallet = {
        name: string;
        type: "crowdsale" | "secret-storage";
        hasAddress: boolean;
        address: string;
        privateKey: string;
        mnemonic?: string;
        password?: string;
        json: string;
    };

    export type Wordlist = {
        locale: string;
        content: string;
    };

    export type Unit = {
         name: string

         ether: string,
         ether_format: string,

         wei: string,

         kwei?: string,
         mwei?: string,
         gwei?: string,
         szabo?: string,
         finney?: string,
         satoshi?: string

         kwei_format?: string,
         mwei_format?: string,
         gwei_format?: string,
         szabo_format?: string,
         finney_format?: string,
         satoshi_format?: string
    }

    export type SignedTransaction = {
        name: string;
        accountAddress: string;
        privateKey: string;

        signedTransaction: string
        unsignedTransaction: string;

        signedTransactionChainId5: string
        unsignedTransactionChainId5: string;

        nonce: number;
        gasLimit: string;
        gasPrice: string;
        to: string;
        value: string;
        data: string;
    };
}

export function saveTests(tag: string, data: any) {
   //let filename = path.resolve(__dirname, 'testcases', tag + '.json.gz');
   let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');

   fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(data, undefined, ' ') + '\n'));

   console.log('Save testcase: ' + filename);
}

export function loadTests(tag: string): any {
   let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');
   return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
}

export function loadData(filename: string): Buffer {
   return fs.readFileSync(path.resolve(__dirname, filename));
}

