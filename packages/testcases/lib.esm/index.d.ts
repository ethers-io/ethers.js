/// <reference types="node" />
import { randomBytes, randomHexString, randomNumber } from "./random";
export { randomBytes, randomHexString, randomNumber };
import * as TestCase from "./testcases";
export { TestCase };
export declare function saveTests(tag: string, data: any): void;
export declare function loadTests<T = any>(tag: string): T;
export declare function loadData(filename: string): Buffer;
