declare module "browserify-zlib" {
    export interface ZlibOptions {
        flush?: number;
        finishFlush?: number;
        chunkSize?: number;
        windowBits?: number;
        level?: number;
        memLevel?: number;
        strategy?: number;
        dictionary?: any;
    }

    type InputType = string | Buffer | DataView | ArrayBuffer;

    export function gzipSync(buf: InputType, options?: ZlibOptions): Buffer;
    export function gunzipSync(buf: InputType, options?: ZlibOptions): Buffer;
}

declare module "tiny-inflate" {
    export function inflate(compressedBuffer: Uint8Array, outputBuffer: Uint8Array): void;
    export default inflate;
}

declare module "*.json" {
    const value: any;
    export default value;
}

declare module "ethereumjs-util" {
    export function privateToAddress(privateKey: Buffer | Uint8Array): Buffer | Uint8Array;
    export function toChecksumAddress(address: string): string;
    export function keccak256(data: string): Buffer;
    class BN {
        constructor(value: string, radix: number);
        toString(): string;
    }
}

declare module "solc" {
    function compile(input: string): string;
}
