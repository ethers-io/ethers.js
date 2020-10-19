import { createHash } from "crypto";
import { saveTests as _saveTests } from "../../lib/index";
import { ethers } from "../../../ethers";

import * as TestCase from "../../lib/testcases";
export { TestCase };

function sha256(value: Buffer): Buffer {
    return createHash("sha256").update(value).digest();
}

const words = "lorem ipsum dolor sit amet  consectetur adipiscing elit  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua  ut enim ad minim veniam  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat  duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur  excepteur sint occaecat cupidatat non proident  sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

export abstract class AbstractTest<T = any> {
    readonly seed: string;
    _seed: Buffer;

    constructor(seed: string) {
        this.seed = seed;
        this._seed = sha256(Buffer.from(seed));
    }

    _nextWord(): Buffer {
        const result = this._seed;
        this._seed = sha256(this._seed);
        return result;
    }

    randomBytes(lower: number, upper?: number): Buffer {
        if (!upper) { upper = lower; }

        if (upper === 0 && upper === lower) { return Buffer.alloc(0); }

        let result = this._nextWord();
        while (result.length < upper) {
            result = Buffer.concat([ result, this._nextWord() ]);
        }

        const top = this._nextWord();
        const percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

        return result.slice(0, lower + Math.floor((upper - lower) * percent));
    }

    randomFloat(): number {
        const top = this._nextWord();
        return ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    }

    randomInteger(lower: number, upper: number): number {
        return lower + Math.floor((upper - lower) * this.randomFloat());
    }

    randomChoice<T>(choice: Array<T>): T {
        return choice[this.randomInteger(0, choice.length)];
    }

    randomAddress(): string {
        while (true) {
            const address = this.randomHexString(20);
            if (address.match(/[a-f]/i)) {
                return ethers.utils.getAddress(address);
            }
        }
    }

    randomHexString(lower: number, upper?: number): string {
        return "0x" + this.randomBytes(lower, upper).toString("hex");
    }

    randomString(lower: number, upper?: number): string {
        if (!upper) { upper = lower; }
        if (upper === 0 && upper === lower) { return ""; }

        const length = this.randomInteger(lower, upper);

        let result = "";
        while (result.length < length + 1) {
            result += this.randomChoice(words) + " ";
        }

        return result.substring(0, length);
    }

    abstract generateTest(): T;
}

export function saveTests(tag: string, tests: Array<any>): void {
    // @TODO : copy defn files over for testcase.ts and testcase.d.ts
    _saveTests(tag, tests);
}
