'use strict';

import fs from 'fs';
import path from 'path';
import zlib from 'browserify-zlib';

import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

export module TestCase {
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
}

export function saveTests(tag: string, data: any) {
   //let filename = path.resolve(__dirname, 'testcases', tag + '.json.gz');
   let filename = path.resolve('../testcases', tag + '.json.gz');

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

export function randomBytes(seed: string, lower: number, upper?: number): Uint8Array {
    if (!upper) { upper = lower; }

    if (upper === 0 && upper === lower) { return new Uint8Array(0); }

    let result = arrayify(keccak256(toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = concat([result, keccak256(result)]);
    }

    let top = arrayify(keccak256(result));
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}

export function randomHexString(seed: string, lower: number, upper?: number): string {
    return hexlify(randomBytes(seed, lower, upper));
}

export function randomNumber(seed: string, lower: number, upper: number): number {
    let top = randomBytes(seed, 3);
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}
