'use strict';

import fs from 'fs';
import path from 'path';
import zlib from 'browserify-zlib';

import { randomBytes, randomHexString, randomNumber } from "./random";
export { randomBytes, randomHexString, randomNumber };

import * as TestCase from "./testcases";
export { TestCase };

export function saveTests(tag: string, data: any) {
   //let filename = path.resolve(__dirname, 'testcases', tag + '.json.gz');
   let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');

   fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(data, undefined, ' ') + '\n'));

   console.log('Save testcase: ' + filename);
}

export function loadTests<T = any>(tag: string): T {
   let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');
   return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
}

export function loadData(filename: string): Buffer {
   return fs.readFileSync(path.resolve(__dirname, filename));
}

