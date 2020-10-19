/// <reference types="node" />
import * as TestCase from "../../lib/testcases";
export { TestCase };
export declare abstract class AbstractTest<T = any> {
    readonly seed: string;
    _seed: Buffer;
    constructor(seed: string);
    _nextWord(): Buffer;
    randomBytes(lower: number, upper?: number): Buffer;
    randomFloat(): number;
    randomInteger(lower: number, upper: number): number;
    randomChoice<T>(choice: Array<T>): T;
    randomAddress(): string;
    randomHexString(lower: number, upper?: number): string;
    randomString(lower: number, upper?: number): string;
    abstract generateTest(): T;
}
export declare function saveTests(tag: string, tests: Array<any>): void;
