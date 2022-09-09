import { throwArgumentError, throwError } from "./errors.js";


export type BytesLike = string | Uint8Array;

function _getBytes(value: BytesLike, name?: string, copy?: boolean): Uint8Array {
    if (value instanceof Uint8Array) {
        if (copy) { return new Uint8Array(value); }
        return value;
    }

    if (typeof(value) === "string" && value.match(/^0x([0-9a-f][0-9a-f])*$/i)) {
        const result = new Uint8Array((value.length - 2) / 2);
        let offset = 2;
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(value.substring(offset, offset + 2), 16);
            offset += 2;
        }
        return result;
    }

    return throwArgumentError("invalid BytesLike value", name || "value", value);
}

export function getBytes(value: BytesLike, name?: string): Uint8Array {
    return _getBytes(value, name, false);
}

export function getBytesCopy(value: BytesLike, name?: string): Uint8Array {
    return _getBytes(value, name, true);
}


export function isHexString(value: any, length?: number | boolean): value is `0x${ string }` {
    if (typeof(value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false
    }

    if (typeof(length) === "number" && value.length !== 2 + 2 * length) { return false; }
    if (length === true && (value.length % 2) !== 0) { return false; }

    return true;
}

export function isBytesLike(value: any): value is BytesLike {
    return (isHexString(value, true) || (value instanceof Uint8Array));
}

const HexCharacters: string = "0123456789abcdef";
export function hexlify(data: BytesLike): string {
    const bytes = getBytes(data);

    let result = "0x";
    for (let i = 0; i < bytes.length; i++) {
        const v = bytes[i];
        result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
}

export function concat(datas: ReadonlyArray<BytesLike>): string {
    return "0x" + datas.map((d) => hexlify(d).substring(2)).join("");
}

export function dataLength(data: BytesLike): number {
    if (isHexString(data, true)) { return (data.length - 2) / 2; }
    return getBytes(data).length;
}

export function dataSlice(data: BytesLike, start?: number, end?: number): string {
    const bytes = getBytes(data);
    if (end != null && end > bytes.length) { throwError("cannot slice beyond data bounds", "BUFFER_OVERRUN", {
        buffer: bytes, length: bytes.length, offset: end
    }); }
    return hexlify(bytes.slice((start == null) ? 0: start, (end == null) ? bytes.length: end));
}

export function stripZerosLeft(data: BytesLike): string {
    let bytes = hexlify(data).substring(2);
    while (bytes.substring(0, 2) == "00") { bytes = bytes.substring(2); }
    return "0x" + bytes;
}


function zeroPad(data: BytesLike, length: number, left: boolean): string {
    const bytes = getBytes(data);
    if (length < bytes.length) {
       throwError("padding exceeds data length", "BUFFER_OVERRUN", {
            buffer: new Uint8Array(bytes),
            length: length,
            offset: length + 1
        });
    }

    const result = new Uint8Array(length);
    result.fill(0);
    if (left) {
        result.set(bytes, length - bytes.length);
    } else {
        result.set(bytes, 0);
    }

    return hexlify(result);
}

export function zeroPadValue(data: BytesLike, length: number): string {
    return zeroPad(data, length, true);
}

export function zeroPadBytes(data: BytesLike, length: number): string {
    return zeroPad(data, length, false);
}
