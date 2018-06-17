'use strict';

import { arrayify, Arrayish } from './bytes';

declare class Buffer implements ArrayLike<number> {
    constructor(data: any, encoding?: string);
    toString(encoding?: string): any;
    [key: number]: number;
    length: number;
}

export function decode(textData: string): Uint8Array {
    return arrayify(new Uint8Array(new Buffer(textData, 'base64')));
};

export function encode(data: Arrayish): string {
    return new Buffer(arrayify(data)).toString('base64');
}
