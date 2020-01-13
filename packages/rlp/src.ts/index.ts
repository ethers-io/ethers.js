"use strict";

//See: https://github.com/ethereum/wiki/wiki/RLP


import { arrayify, BytesLike, hexlify } from "@ethersproject/bytes";

function arrayifyInteger(value: number): Array<number> {
    const result = [];
    while (value) {
        result.unshift(value & 0xff);
        value >>= 8;
    }
    return result;
}

function unarrayifyInteger(data: Uint8Array, offset: number, length: number): number {
    let result = 0;
    for (let i = 0; i < length; i++) {
        result = (result * 256) + data[offset + i];
    }
    return result;
}

function _encode(object: Array<any> | string): Array<number> {
    if (Array.isArray(object)) {
        let payload: Array<number> = [];
        object.forEach(function(child) {
            payload = payload.concat(_encode(child));
        });

        if (payload.length <= 55) {
            payload.unshift(0xc0 + payload.length)
            return payload;
        }

        const length = arrayifyInteger(payload.length);
        length.unshift(0xf7 + length.length);

        return length.concat(payload);

    }

    const data: Array<number> = Array.prototype.slice.call(arrayify(object));

    if (data.length === 1 && data[0] <= 0x7f) {
        return data;

    } else if (data.length <= 55) {
        data.unshift(0x80 + data.length);
        return data;
    }

    const length = arrayifyInteger(data.length);
    length.unshift(0xb7 + length.length);

    return length.concat(data);
}

export function encode(object: any): string {
    return hexlify(_encode(object));
}

type Decoded = {
    result: any;
    consumed: number;
};

function _decodeChildren(data: Uint8Array, offset: number, childOffset: number, length: number): Decoded {
    const result = [];

    while (childOffset < offset + 1 + length) {
        const decoded = _decode(data, childOffset);

        result.push(decoded.result);

        childOffset += decoded.consumed;
        if (childOffset > offset + 1 + length) {
            throw new Error("invalid rlp");
        }
    }

    return {consumed: (1 + length), result: result};
}

// returns { consumed: number, result: Object }
function _decode(data: Uint8Array, offset: number): { consumed: number, result: any } {
    if (data.length === 0) { throw new Error("invalid rlp data"); }

    // Array with extra length prefix
    if (data[offset] >= 0xf8) {
        const lengthLength = data[offset] - 0xf7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error("too short");
        }

        const length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error("to short");
        }

        return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);

    } else if (data[offset] >= 0xc0) {
        const length = data[offset] - 0xc0;
        if (offset + 1 + length > data.length) {
            throw new Error("invalid rlp data");
        }

        return _decodeChildren(data, offset, offset + 1, length);

    } else if (data[offset] >= 0xb8) {
        const lengthLength = data[offset] - 0xb7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error("invalid rlp data");
        }

        const length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error("invalid rlp data");
        }

        const result = hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
        return { consumed: (1 + lengthLength + length), result: result }

    } else if (data[offset] >= 0x80) {
        const length = data[offset] - 0x80;
        if (offset + 1 + length > data.length) {
            throw new Error("invalid rlp data");
        }

        const result = hexlify(data.slice(offset + 1, offset + 1 + length));
        return { consumed: (1 + length), result: result }
    }
    return { consumed: 1, result: hexlify(data[offset]) };
}

export function decode(data: BytesLike): any {
    const bytes = arrayify(data);
    const decoded = _decode(bytes, 0);
    if (decoded.consumed !== bytes.length) {
        throw new Error("invalid rlp data");
    }
    return decoded.result;
}

