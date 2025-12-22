"use strict";
/*
 * MIT License
 *
 * Copyright (c) 2023 Brume Wallet ☁️
 * Copyright (c) 2025 Ethereuem Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
/*!
 * hash-wasm (https://www.npmjs.com/package/hash-wasm)
 * (c) Dani Biro
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tor = exports.storage = exports.Log = void 0;
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
let Mutex$1 = class Mutex {
    constructor() {
        this.mutex = Promise.resolve();
    }
    lock() {
        let begin = () => { };
        this.mutex = this.mutex.then(() => new Promise(begin));
        return new Promise((res) => {
            begin = res;
        });
    }
    dispatch(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            const unlock = yield this.lock();
            try {
                return yield Promise.resolve(fn());
            }
            finally {
                unlock();
            }
        });
    }
};
var _a;
function getGlobal() {
    if (typeof globalThis !== "undefined")
        return globalThis;
    if (typeof self !== "undefined")
        return self;
    if (typeof window !== "undefined")
        return window;
    return global;
}
const globalObject = getGlobal();
const nodeBuffer = (_a = globalObject.Buffer) !== null && _a !== void 0 ? _a : null;
const textEncoder = globalObject.TextEncoder
    ? new globalObject.TextEncoder()
    : null;
function hexCharCodesToInt(a, b) {
    return ((((a & 0xf) + ((a >> 6) | ((a >> 3) & 0x8))) << 4) |
        ((b & 0xf) + ((b >> 6) | ((b >> 3) & 0x8))));
}
function writeHexToUInt8(buf, str) {
    const size = str.length >> 1;
    for (let i = 0; i < size; i++) {
        const index = i << 1;
        buf[i] = hexCharCodesToInt(str.charCodeAt(index), str.charCodeAt(index + 1));
    }
}
function hexStringEqualsUInt8(str, buf) {
    if (str.length !== buf.length * 2) {
        return false;
    }
    for (let i = 0; i < buf.length; i++) {
        const strIndex = i << 1;
        if (buf[i] !==
            hexCharCodesToInt(str.charCodeAt(strIndex), str.charCodeAt(strIndex + 1))) {
            return false;
        }
    }
    return true;
}
const alpha = "a".charCodeAt(0) - 10;
const digit = "0".charCodeAt(0);
function getDigestHex(tmpBuffer, input, hashLength) {
    let p = 0;
    for (let i = 0; i < hashLength; i++) {
        let nibble = input[i] >>> 4;
        tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
        nibble = input[i] & 0xf;
        tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
    }
    return String.fromCharCode.apply(null, tmpBuffer);
}
const getUInt8Buffer = nodeBuffer !== null
    ? (data) => {
        if (typeof data === "string") {
            const buf = nodeBuffer.from(data, "utf8");
            return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
        }
        if (nodeBuffer.isBuffer(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.length);
        }
        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        throw new Error("Invalid data type!");
    }
    : (data) => {
        if (typeof data === "string") {
            return textEncoder.encode(data);
        }
        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        throw new Error("Invalid data type!");
    };
const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
    base64Lookup[base64Chars.charCodeAt(i)] = i;
}
function getDecodeBase64Length(data) {
    let bufferLength = Math.floor(data.length * 0.75);
    const len = data.length;
    if (data[len - 1] === "=") {
        bufferLength -= 1;
        if (data[len - 2] === "=") {
            bufferLength -= 1;
        }
    }
    return bufferLength;
}
function decodeBase64(data) {
    const bufferLength = getDecodeBase64Length(data);
    const len = data.length;
    const bytes = new Uint8Array(bufferLength);
    let p = 0;
    for (let i = 0; i < len; i += 4) {
        const encoded1 = base64Lookup[data.charCodeAt(i)];
        const encoded2 = base64Lookup[data.charCodeAt(i + 1)];
        const encoded3 = base64Lookup[data.charCodeAt(i + 2)];
        const encoded4 = base64Lookup[data.charCodeAt(i + 3)];
        bytes[p] = (encoded1 << 2) | (encoded2 >> 4);
        p += 1;
        bytes[p] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        p += 1;
        bytes[p] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        p += 1;
    }
    return bytes;
}
const MAX_HEAP = 16 * 1024;
const WASM_FUNC_HASH_LENGTH = 4;
const wasmMutex = new Mutex$1();
const wasmModuleCache = new Map();
function WASMInterface(binary, hashLength) {
    return __awaiter(this, void 0, void 0, function* () {
        let wasmInstance = null;
        let memoryView = null;
        let initialized = false;
        if (typeof WebAssembly === "undefined") {
            throw new Error("WebAssembly is not supported in this environment!");
        }
        const writeMemory = (data, offset = 0) => {
            memoryView.set(data, offset);
        };
        const getMemory = () => memoryView;
        const getExports = () => wasmInstance.exports;
        const setMemorySize = (totalSize) => {
            wasmInstance.exports.Hash_SetMemorySize(totalSize);
            const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            memoryView = new Uint8Array(memoryBuffer, arrayOffset, totalSize);
        };
        const getStateSize = () => {
            const view = new DataView(wasmInstance.exports.memory.buffer);
            const stateSize = view.getUint32(wasmInstance.exports.STATE_SIZE, true);
            return stateSize;
        };
        const loadWASMPromise = wasmMutex.dispatch(() => __awaiter(this, void 0, void 0, function* () {
            if (!wasmModuleCache.has(binary.name)) {
                const asm = decodeBase64(binary.data);
                const promise = WebAssembly.compile(asm);
                wasmModuleCache.set(binary.name, promise);
            }
            const module = yield wasmModuleCache.get(binary.name);
            wasmInstance = yield WebAssembly.instantiate(module, {
            // env: {
            //   emscripten_memcpy_big: (dest, src, num) => {
            //     const memoryBuffer = wasmInstance.exports.memory.buffer;
            //     const memView = new Uint8Array(memoryBuffer, 0);
            //     memView.set(memView.subarray(src, src + num), dest);
            //   },
            //   print_memory: (offset, len) => {
            //     const memoryBuffer = wasmInstance.exports.memory.buffer;
            //     const memView = new Uint8Array(memoryBuffer, 0);
            //     console.log('print_int32', memView.subarray(offset, offset + len));
            //   },
            // },
            });
            // wasmInstance.exports._start();
        }));
        const setupInterface = () => __awaiter(this, void 0, void 0, function* () {
            if (!wasmInstance) {
                yield loadWASMPromise;
            }
            const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            memoryView = new Uint8Array(memoryBuffer, arrayOffset, MAX_HEAP);
        });
        const init = (bits = null) => {
            initialized = true;
            wasmInstance.exports.Hash_Init(bits);
        };
        const updateUInt8Array = (data) => {
            let read = 0;
            while (read < data.length) {
                const chunk = data.subarray(read, read + MAX_HEAP);
                read += chunk.length;
                memoryView.set(chunk);
                wasmInstance.exports.Hash_Update(chunk.length);
            }
        };
        const update = (data) => {
            if (!initialized) {
                throw new Error("update() called before init()");
            }
            const Uint8Buffer = getUInt8Buffer(data);
            updateUInt8Array(Uint8Buffer);
        };
        const digestChars = new Uint8Array(hashLength * 2);
        const digest = (outputType, padding = null) => {
            if (!initialized) {
                throw new Error("digest() called before init()");
            }
            initialized = false;
            wasmInstance.exports.Hash_Final(padding);
            if (outputType === "binary") {
                // the data is copied to allow GC of the original memory object
                return memoryView.slice(0, hashLength);
            }
            return getDigestHex(digestChars, memoryView, hashLength);
        };
        const save = () => {
            if (!initialized) {
                throw new Error("save() can only be called after init() and before digest()");
            }
            const stateOffset = wasmInstance.exports.Hash_GetState();
            const stateLength = getStateSize();
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            const internalState = new Uint8Array(memoryBuffer, stateOffset, stateLength);
            // prefix is 4 bytes from SHA1 hash of the WASM binary
            // it is used to detect incompatible internal states between different versions of hash-wasm
            const prefixedState = new Uint8Array(WASM_FUNC_HASH_LENGTH + stateLength);
            writeHexToUInt8(prefixedState, binary.hash);
            prefixedState.set(internalState, WASM_FUNC_HASH_LENGTH);
            return prefixedState;
        };
        const load = (state) => {
            if (!(state instanceof Uint8Array)) {
                throw new Error("load() expects an Uint8Array generated by save()");
            }
            const stateOffset = wasmInstance.exports.Hash_GetState();
            const stateLength = getStateSize();
            const overallLength = WASM_FUNC_HASH_LENGTH + stateLength;
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            if (state.length !== overallLength) {
                throw new Error(`Bad state length (expected ${overallLength} bytes, got ${state.length})`);
            }
            if (!hexStringEqualsUInt8(binary.hash, state.subarray(0, WASM_FUNC_HASH_LENGTH))) {
                throw new Error("This state was written by an incompatible hash implementation");
            }
            const internalState = state.subarray(WASM_FUNC_HASH_LENGTH);
            new Uint8Array(memoryBuffer, stateOffset, stateLength).set(internalState);
            initialized = true;
        };
        const isDataShort = (data) => {
            if (typeof data === "string") {
                // worst case is 4 bytes / char
                return data.length < MAX_HEAP / 4;
            }
            return data.byteLength < MAX_HEAP;
        };
        let canSimplify = isDataShort;
        switch (binary.name) {
            case "argon2":
            case "scrypt":
                canSimplify = () => true;
                break;
            case "blake2b":
            case "blake2s":
                // if there is a key at blake2 then cannot simplify
                canSimplify = (data, initParam) => initParam <= 512 && isDataShort(data);
                break;
            case "blake3":
                // if there is a key at blake3 then cannot simplify
                canSimplify = (data, initParam) => initParam === 0 && isDataShort(data);
                break;
            case "xxhash64": // cannot simplify
            case "xxhash3":
            case "xxhash128":
            case "crc64":
                canSimplify = () => false;
                break;
        }
        // shorthand for (init + update + digest) for better performance
        const calculate = (data, initParam = null, digestParam = null) => {
            if (!canSimplify(data, initParam)) {
                init(initParam);
                update(data);
                return digest("hex", digestParam);
            }
            const buffer = getUInt8Buffer(data);
            memoryView.set(buffer);
            wasmInstance.exports.Hash_Calculate(buffer.length, initParam, digestParam);
            return getDigestHex(digestChars, memoryView, hashLength);
        };
        yield setupInterface();
        return {
            getMemory,
            writeMemory,
            getExports,
            setMemorySize,
            init,
            update,
            digest,
            save,
            load,
            calculate,
            hashLength,
        };
    });
}
function lockedCreate(mutex, binary, hashLength) {
    return __awaiter(this, void 0, void 0, function* () {
        const unlock = yield mutex.lock();
        const wasm = yield WASMInterface(binary, hashLength);
        unlock();
        return wasm;
    });
}
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
var name$c = "sha1";
var data$c = "AGFzbQEAAAABEQRgAAF/YAF/AGAAAGACf38AAwkIAAECAwECAAEFBAEBAgIGDgJ/AUHgiQULfwBBgAgLB3AIBm1lbW9yeQIADkhhc2hfR2V0QnVmZmVyAAAJSGFzaF9Jbml0AAILSGFzaF9VcGRhdGUABApIYXNoX0ZpbmFsAAUNSGFzaF9HZXRTdGF0ZQAGDkhhc2hfQ2FsY3VsYXRlAAcKU1RBVEVfU0laRQMBCpoqCAUAQYAJC68iCgF+An8BfgF/AX4DfwF+AX8Bfkd/QQAgACkDECIBQiCIpyICQRh0IAJBgP4DcUEIdHIgAUIoiKdBgP4DcSABQjiIp3JyIgMgACkDCCIEQiCIpyICQRh0IAJBgP4DcUEIdHIgBEIoiKdBgP4DcSAEQjiIp3JyIgVzIAApAygiBkIgiKciAkEYdCACQYD+A3FBCHRyIAZCKIinQYD+A3EgBkI4iKdyciIHcyAEpyICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZyciIIIAApAwAiBKciAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnIiCXMgACkDICIKpyICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZyciILcyAAKQMwIgxCIIinIgJBGHQgAkGA/gNxQQh0ciAMQiiIp0GA/gNxIAxCOIincnIiAnNBAXciDXNBAXciDiAFIARCIIinIg9BGHQgD0GA/gNxQQh0ciAEQiiIp0GA/gNxIARCOIincnIiEHMgCkIgiKciD0EYdCAPQYD+A3FBCHRyIApCKIinQYD+A3EgCkI4iKdyciIRcyAAKQM4IgSnIg9BGHQgD0GA/gNxQQh0ciAPQQh2QYD+A3EgD0EYdnJyIg9zQQF3IhJzIAcgEXMgEnMgCyAAKQMYIgqnIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyIhNzIA9zIA5zQQF3IgBzQQF3IhRzIA0gD3MgAHMgAiAHcyAOcyAGpyIVQRh0IBVBgP4DcUEIdHIgFUEIdkGA/gNxIBVBGHZyciIWIAtzIA1zIApCIIinIhVBGHQgFUGA/gNxQQh0ciAKQiiIp0GA/gNxIApCOIincnIiFyADcyACcyABpyIVQRh0IBVBgP4DcUEIdHIgFUEIdkGA/gNxIBVBGHZyciIYIAhzIBZzIARCIIinIhVBGHQgFUGA/gNxQQh0ciAEQiiIp0GA/gNxIARCOIincnIiFXNBAXciGXNBAXciGnNBAXciG3NBAXciHHNBAXciHXNBAXciHiASIBVzIBEgF3MgFXMgEyAYcyAMpyIfQRh0IB9BgP4DcUEIdHIgH0EIdkGA/gNxIB9BGHZyciIgcyASc0EBdyIfc0EBdyIhcyAPICBzIB9zIBRzQQF3IiJzQQF3IiNzIBQgIXMgI3MgACAfcyAicyAec0EBdyIkc0EBdyIlcyAdICJzICRzIBwgFHMgHnMgGyAAcyAdcyAaIA5zIBxzIBkgDXMgG3MgFSACcyAacyAgIBZzIBlzICFzQQF3IiZzQQF3IidzQQF3IihzQQF3IilzQQF3IipzQQF3IitzQQF3IixzQQF3Ii0gIyAncyAhIBpzICdzIB8gGXMgJnMgI3NBAXciLnNBAXciL3MgIiAmcyAucyAlc0EBdyIwc0EBdyIxcyAlIC9zIDFzICQgLnMgMHMgLXNBAXciMnNBAXciM3MgLCAwcyAycyArICVzIC1zICogJHMgLHMgKSAecyArcyAoIB1zICpzICcgHHMgKXMgJiAbcyAocyAvc0EBdyI0c0EBdyI1c0EBdyI2c0EBdyI3c0EBdyI4c0EBdyI5c0EBdyI6c0EBdyI7IDEgNXMgLyApcyA1cyAuIChzIDRzIDFzQQF3IjxzQQF3Ij1zIDAgNHMgPHMgM3NBAXciPnNBAXciP3MgMyA9cyA/cyAyIDxzID5zIDtzQQF3IkBzQQF3IkFzIDogPnMgQHMgOSAzcyA7cyA4IDJzIDpzIDcgLXMgOXMgNiAscyA4cyA1ICtzIDdzIDQgKnMgNnMgPXNBAXciQnNBAXciQ3NBAXciRHNBAXciRXNBAXciRnNBAXciR3NBAXciSHNBAXciSSA+IEJzIDwgNnMgQnMgP3NBAXciSnMgQXNBAXciSyA9IDdzIENzIEpzQQF3IkwgRCA5IDIgMSA0ICkgHSAUIB8gFSAWQQAoAoCJASJNQQV3QQAoApCJASJOaiAJakEAKAKMiQEiT0EAKAKIiQEiCXNBACgChIkBIlBxIE9zakGZ84nUBWoiUUEedyJSIANqIFBBHnciAyAFaiBPIAMgCXMgTXEgCXNqIBBqIFFBBXdqQZnzidQFaiIQIFIgTUEedyIFc3EgBXNqIAkgCGogUSADIAVzcSADc2ogEEEFd2pBmfOJ1AVqIlFBBXdqQZnzidQFaiJTIFFBHnciAyAQQR53IghzcSAIc2ogBSAYaiBRIAggUnNxIFJzaiBTQQV3akGZ84nUBWoiBUEFd2pBmfOJ1AVqIhhBHnciUmogU0EedyIWIAtqIAggE2ogBSAWIANzcSADc2ogGEEFd2pBmfOJ1AVqIgggUiAFQR53IgtzcSALc2ogAyAXaiAYIAsgFnNxIBZzaiAIQQV3akGZ84nUBWoiBUEFd2pBmfOJ1AVqIhMgBUEedyIWIAhBHnciA3NxIANzaiALIBFqIAUgAyBSc3EgUnNqIBNBBXdqQZnzidQFaiIRQQV3akGZ84nUBWoiUkEedyILaiACIBNBHnciFWogByADaiARIBUgFnNxIBZzaiBSQQV3akGZ84nUBWoiByALIBFBHnciAnNxIAJzaiAgIBZqIFIgAiAVc3EgFXNqIAdBBXdqQZnzidQFaiIRQQV3akGZ84nUBWoiFiARQR53IhUgB0EedyIHc3EgB3NqIA8gAmogESAHIAtzcSALc2ogFkEFd2pBmfOJ1AVqIgtBBXdqQZnzidQFaiIRQR53IgJqIBIgFWogESALQR53Ig8gFkEedyISc3EgEnNqIA0gB2ogCyASIBVzcSAVc2ogEUEFd2pBmfOJ1AVqIg1BBXdqQZnzidQFaiIVQR53Ih8gDUEedyIHcyAZIBJqIA0gAiAPc3EgD3NqIBVBBXdqQZnzidQFaiINc2ogDiAPaiAVIAcgAnNxIAJzaiANQQV3akGZ84nUBWoiAkEFd2pBodfn9gZqIg5BHnciD2ogACAfaiACQR53IgAgDUEedyINcyAOc2ogGiAHaiANIB9zIAJzaiAOQQV3akGh1+f2BmoiAkEFd2pBodfn9gZqIg5BHnciEiACQR53IhRzICEgDWogDyAAcyACc2ogDkEFd2pBodfn9gZqIgJzaiAbIABqIBQgD3MgDnNqIAJBBXdqQaHX5/YGaiIAQQV3akGh1+f2BmoiDUEedyIOaiAcIBJqIABBHnciDyACQR53IgJzIA1zaiAmIBRqIAIgEnMgAHNqIA1BBXdqQaHX5/YGaiIAQQV3akGh1+f2BmoiDUEedyISIABBHnciFHMgIiACaiAOIA9zIABzaiANQQV3akGh1+f2BmoiAHNqICcgD2ogFCAOcyANc2ogAEEFd2pBodfn9gZqIgJBBXdqQaHX5/YGaiINQR53Ig5qICggEmogAkEedyIPIABBHnciAHMgDXNqICMgFGogACAScyACc2ogDUEFd2pBodfn9gZqIgJBBXdqQaHX5/YGaiINQR53IhIgAkEedyIUcyAeIABqIA4gD3MgAnNqIA1BBXdqQaHX5/YGaiIAc2ogLiAPaiAUIA5zIA1zaiAAQQV3akGh1+f2BmoiAkEFd2pBodfn9gZqIg1BHnciDmogKiAAQR53IgBqIA4gAkEedyIPcyAkIBRqIAAgEnMgAnNqIA1BBXdqQaHX5/YGaiIUc2ogLyASaiAPIABzIA1zaiAUQQV3akGh1+f2BmoiDUEFd2pBodfn9gZqIgAgDUEedyICciAUQR53IhJxIAAgAnFyaiAlIA9qIBIgDnMgDXNqIABBBXdqQaHX5/YGaiINQQV3akHc+e74eGoiDkEedyIPaiA1IABBHnciAGogKyASaiANIAByIAJxIA0gAHFyaiAOQQV3akHc+e74eGoiEiAPciANQR53Ig1xIBIgD3FyaiAwIAJqIA4gDXIgAHEgDiANcXJqIBJBBXdqQdz57vh4aiIAQQV3akHc+e74eGoiAiAAQR53Ig5yIBJBHnciEnEgAiAOcXJqICwgDWogACASciAPcSAAIBJxcmogAkEFd2pB3Pnu+HhqIgBBBXdqQdz57vh4aiINQR53Ig9qIDwgAkEedyICaiA2IBJqIAAgAnIgDnEgACACcXJqIA1BBXdqQdz57vh4aiISIA9yIABBHnciAHEgEiAPcXJqIC0gDmogDSAAciACcSANIABxcmogEkEFd2pB3Pnu+HhqIgJBBXdqQdz57vh4aiINIAJBHnciDnIgEkEedyIScSANIA5xcmogNyAAaiACIBJyIA9xIAIgEnFyaiANQQV3akHc+e74eGoiAEEFd2pB3Pnu+HhqIgJBHnciD2ogMyANQR53Ig1qID0gEmogACANciAOcSAAIA1xcmogAkEFd2pB3Pnu+HhqIhIgD3IgAEEedyIAcSASIA9xcmogOCAOaiACIAByIA1xIAIgAHFyaiASQQV3akHc+e74eGoiAkEFd2pB3Pnu+HhqIg0gAkEedyIOciASQR53IhJxIA0gDnFyaiBCIABqIAIgEnIgD3EgAiAScXJqIA1BBXdqQdz57vh4aiIAQQV3akHc+e74eGoiAkEedyIPaiBDIA5qIAIgAEEedyIUciANQR53Ig1xIAIgFHFyaiA+IBJqIAAgDXIgDnEgACANcXJqIAJBBXdqQdz57vh4aiIAQQV3akHc+e74eGoiAkEedyISIABBHnciDnMgOiANaiAAIA9yIBRxIAAgD3FyaiACQQV3akHc+e74eGoiAHNqID8gFGogAiAOciAPcSACIA5xcmogAEEFd2pB3Pnu+HhqIgJBBXdqQdaDi9N8aiINQR53Ig9qIEogEmogAkEedyIUIABBHnciAHMgDXNqIDsgDmogACAScyACc2ogDUEFd2pB1oOL03xqIgJBBXdqQdaDi9N8aiINQR53Ig4gAkEedyIScyBFIABqIA8gFHMgAnNqIA1BBXdqQdaDi9N8aiIAc2ogQCAUaiASIA9zIA1zaiAAQQV3akHWg4vTfGoiAkEFd2pB1oOL03xqIg1BHnciD2ogQSAOaiACQR53IhQgAEEedyIAcyANc2ogRiASaiAAIA5zIAJzaiANQQV3akHWg4vTfGoiAkEFd2pB1oOL03xqIg1BHnciDiACQR53IhJzIEIgOHMgRHMgTHNBAXciFSAAaiAPIBRzIAJzaiANQQV3akHWg4vTfGoiAHNqIEcgFGogEiAPcyANc2ogAEEFd2pB1oOL03xqIgJBBXdqQdaDi9N8aiINQR53Ig9qIEggDmogAkEedyIUIABBHnciAHMgDXNqIEMgOXMgRXMgFXNBAXciGSASaiAAIA5zIAJzaiANQQV3akHWg4vTfGoiAkEFd2pB1oOL03xqIg1BHnciDiACQR53IhJzID8gQ3MgTHMgS3NBAXciGiAAaiAPIBRzIAJzaiANQQV3akHWg4vTfGoiAHNqIEQgOnMgRnMgGXNBAXciGyAUaiASIA9zIA1zaiAAQQV3akHWg4vTfGoiAkEFd2pB1oOL03xqIg1BHnciDyBOajYCkIkBQQAgTyBKIERzIBVzIBpzQQF3IhQgEmogAEEedyIAIA5zIAJzaiANQQV3akHWg4vTfGoiEkEedyIVajYCjIkBQQAgCSBFIDtzIEdzIBtzQQF3IA5qIAJBHnciAiAAcyANc2ogEkEFd2pB1oOL03xqIg1BHndqNgKIiQFBACBQIEAgSnMgS3MgSXNBAXcgAGogDyACcyASc2ogDUEFd2pB1oOL03xqIgBqNgKEiQFBACBNIEwgRXMgGXMgFHNBAXdqIAJqIBUgD3MgDXNqIABBBXdqQdaDi9N8ajYCgIkBCzoAQQBC/rnrxemOlZkQNwKIiQFBAEKBxpS6lvHq5m83AoCJAUEAQvDDy54MNwKQiQFBAEEANgKYiQELqAMBCH9BACECQQBBACgClIkBIgMgAUEDdGoiBDYClIkBQQBBACgCmIkBIAQgA0lqIAFBHXZqNgKYiQECQCADQQN2QT9xIgUgAWpBwABJDQBBwAAgBWsiAkEDcSEGQQAhAwJAIAVBP3NBA0kNACAFQYCJAWohByACQfwAcSEIQQAhAwNAIAcgA2oiBEEcaiAAIANqIgktAAA6AAAgBEEdaiAJQQFqLQAAOgAAIARBHmogCUECai0AADoAACAEQR9qIAlBA2otAAA6AAAgCCADQQRqIgNHDQALCwJAIAZFDQAgACADaiEEIAMgBWpBnIkBaiEDA0AgAyAELQAAOgAAIARBAWohBCADQQFqIQMgBkF/aiIGDQALC0GciQEQASAFQf8AcyEDQQAhBSADIAFPDQADQCAAIAJqEAEgAkH/AGohAyACQcAAaiIEIQIgAyABSQ0ACyAEIQILAkAgASACRg0AIAEgAmshCSAAIAJqIQIgBUGciQFqIQNBACEEA0AgAyACLQAAOgAAIAJBAWohAiADQQFqIQMgCSAEQQFqIgRB/wFxSw0ACwsLCQBBgAkgABADC6YDAQJ/IwBBEGsiACQAIABBgAE6AAcgAEEAKAKYiQEiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2AAggAEEAKAKUiQEiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2AAwgAEEHakEBEAMCQEEAKAKUiQFB+ANxQcADRg0AA0AgAEEAOgAHIABBB2pBARADQQAoApSJAUH4A3FBwANHDQALCyAAQQhqQQgQA0EAQQAoAoCJASIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYCgAlBAEEAKAKEiQEiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2AoQJQQBBACgCiIkBIgFBGHQgAUGA/gNxQQh0ciABQQh2QYD+A3EgAUEYdnJyNgKICUEAQQAoAoyJASIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYCjAlBAEEAKAKQiQEiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2ApAJIABBEGokAAsGAEGAiQELQwBBAEL+uevF6Y6VmRA3AoiJAUEAQoHGlLqW8ermbzcCgIkBQQBC8MPLngw3ApCJAUEAQQA2ApiJAUGACSAAEAMQBQsLCwEAQYAICwRcAAAA";
var hash$c = "6b530c24";
var wasmJson$c = {
    name: name$c,
    data: data$c,
    hash: hash$c
};
new Mutex$1();
/**
 * Creates a new SHA-1 hash instance
 */
function createSHA1() {
    return WASMInterface(wasmJson$c, 20).then((wasm) => {
        wasm.init();
        const obj = {
            init: () => {
                wasm.init();
                return obj;
            },
            update: (data) => {
                wasm.update(data);
                return obj;
            },
            // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
            digest: (outputType) => wasm.digest(outputType),
            save: () => wasm.save(),
            load: (data) => {
                wasm.load(data);
                return obj;
            },
            blockSize: 64,
            digestSize: 20,
        };
        return obj;
    });
}
var name$b = "sha3";
var data$b = "AGFzbQEAAAABFARgAAF/YAF/AGACf38AYAN/f38AAwgHAAEBAgEAAwUEAQECAgYOAn8BQZCNBQt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAQtIYXNoX1VwZGF0ZQACCkhhc2hfRmluYWwABA1IYXNoX0dldFN0YXRlAAUOSGFzaF9DYWxjdWxhdGUABgpTVEFURV9TSVpFAwEKpBwHBQBBgAoL1wMAQQBCADcDgI0BQQBCADcD+IwBQQBCADcD8IwBQQBCADcD6IwBQQBCADcD4IwBQQBCADcD2IwBQQBCADcD0IwBQQBCADcDyIwBQQBCADcDwIwBQQBCADcDuIwBQQBCADcDsIwBQQBCADcDqIwBQQBCADcDoIwBQQBCADcDmIwBQQBCADcDkIwBQQBCADcDiIwBQQBCADcDgIwBQQBCADcD+IsBQQBCADcD8IsBQQBCADcD6IsBQQBCADcD4IsBQQBCADcD2IsBQQBCADcD0IsBQQBCADcDyIsBQQBCADcDwIsBQQBCADcDuIsBQQBCADcDsIsBQQBCADcDqIsBQQBCADcDoIsBQQBCADcDmIsBQQBCADcDkIsBQQBCADcDiIsBQQBCADcDgIsBQQBCADcD+IoBQQBCADcD8IoBQQBCADcD6IoBQQBCADcD4IoBQQBCADcD2IoBQQBCADcD0IoBQQBCADcDyIoBQQBCADcDwIoBQQBCADcDuIoBQQBCADcDsIoBQQBCADcDqIoBQQBCADcDoIoBQQBCADcDmIoBQQBCADcDkIoBQQBCADcDiIoBQQBCADcDgIoBQQBBwAwgAEEBdGtBA3Y2AoyNAUEAQQA2AoiNAQuMAwEIfwJAQQAoAoiNASIBQQBIDQBBACABIABqQQAoAoyNASICcDYCiI0BAkACQCABDQBBgAohAwwBCwJAIAIgAWsiBCAAIAQgAEkbIgNFDQAgA0EDcSEFQQAhBgJAIANBBEkNACABQYCKAWohByADQXxxIQhBACEGA0AgByAGaiIDQcgBaiAGQYAKai0AADoAACADQckBaiAGQYEKai0AADoAACADQcoBaiAGQYIKai0AADoAACADQcsBaiAGQYMKai0AADoAACAIIAZBBGoiBkcNAAsLIAVFDQAgAUHIiwFqIQMDQCADIAZqIAZBgApqLQAAOgAAIAZBAWohBiAFQX9qIgUNAAsLIAAgBEkNAUHIiwEgAhADIAAgBGshACAEQYAKaiEDCwJAIAAgAkkNAANAIAMgAhADIAMgAmohAyAAIAJrIgAgAk8NAAsLIABFDQBBACECQcgBIQYDQCAGQYCKAWogAyAGakG4fmotAAA6AAAgBkEBaiEGIAAgAkEBaiICQf8BcUsNAAsLC+ALAS1+IAApA0AhAkEAKQPAigEhAyAAKQM4IQRBACkDuIoBIQUgACkDMCEGQQApA7CKASEHIAApAyghCEEAKQOoigEhCSAAKQMgIQpBACkDoIoBIQsgACkDGCEMQQApA5iKASENIAApAxAhDkEAKQOQigEhDyAAKQMIIRBBACkDiIoBIREgACkDACESQQApA4CKASETQQApA8iKASEUAkACQCABQcgASw0AQQApA+iKASEVQQApA/iKASEWQQApA/CKASEXQQApA4CLASEYQQApA9CKASEZQQApA+CKASEaQQApA9iKASEbDAELQQApA+CKASAAKQNghSEaQQApA9iKASAAKQNYhSEbQQApA9CKASAAKQNQhSEZIBQgACkDSIUhFEEAKQPoigEhFUEAKQP4igEhFkEAKQPwigEhF0EAKQOAiwEhGCABQekASQ0AIBggACkDgAGFIRggFiAAKQN4hSEWIBcgACkDcIUhFyAVIAApA2iFIRUgAUGJAUkNAEEAQQApA4iLASAAKQOIAYU3A4iLAQsgAyAChSEcIAUgBIUhHSAHIAaFIQcgCSAIhSEIIAsgCoUhHiANIAyFIQkgDyAOhSEKIBEgEIUhCyATIBKFIQxBACkDuIsBIRBBACkDkIsBIRFBACkDoIsBIRJBACkDsIsBIRNBACkDiIsBIQ1BACkDwIsBIQ5BACkDmIsBIR9BACkDqIsBIQ9BwH4hAANAIB4gByALhSAbhSAYhSAPhUIBiYUgFIUgF4UgH4UgDoUhAiAMIB0gCoUgGoUgDYUgE4VCAYmFIAiFIBmFIBaFIBKFIgMgB4UhICAJIAggDIUgGYUgFoUgEoVCAYmFIByFIBWFIBGFIBCFIgQgDoUhISAcIAogFCAehSAXhSAfhSAOhUIBiYUgHYUgGoUgDYUgE4UiBYVCN4kiIiALIBwgCYUgFYUgEYUgEIVCAYmFIAeFIBuFIBiFIA+FIgYgCoVCPokiI0J/hYMgAyAPhUICiSIkhSEOIBYgAoVCKYkiJSAEIBeFQieJIiZCf4WDICKFIQ8gECAFhUI4iSIQIAYgDYVCD4kiJ0J/hYMgAyAbhUIKiSIohSENIAQgHoVCG4kiKSAoIAggAoVCJIkiKkJ/hYOFIRYgBiAdhUIGiSIrIAMgC4VCAYkiLEJ/hYMgEiAChUISiSIthSEXICsgBCAfhUIIiSIuIBUgBYVCGYkiFUJ/hYOFIRsgBiAThUI9iSIdIAQgFIVCFIkiBCAJIAWFQhyJIghCf4WDhSEUIAggHUJ/hYMgAyAYhUItiSIDhSEcIB0gA0J/hYMgGSAChUIDiSIJhSEdIAQgAyAJQn+Fg4UhByAJIARCf4WDIAiFIQggDCAChSICICFCDokiA0J/hYMgESAFhUIViSIEhSEJIAYgGoVCK4kiBSADIARCf4WDhSEKIAQgBUJ/hYMgIEIsiSIEhSELIABB0AlqKQMAIAUgBEJ/hYOFIAKFIQwgJyAoQn+FgyAqhSIFIRggAyAEIAJCf4WDhSICIR4gKiApQn+FgyAQhSIDIR8gLSAuQn+FgyAVhSIEIRogJiAkICVCf4WDhSIGIRMgFSArQn+FgyAshSIoIRkgIyAmICJCf4WDhSIiIRIgLiAsIC1Cf4WDhSImIRUgJyApIBBCf4WDhSInIREgIyAkQn+FgyAlhSIjIRAgAEEIaiIADQALQQAgDzcDqIsBQQAgBTcDgIsBQQAgGzcD2IoBQQAgBzcDsIoBQQAgCzcDiIoBQQAgDjcDwIsBQQAgAzcDmIsBQQAgFzcD8IoBQQAgFDcDyIoBQQAgAjcDoIoBQQAgBjcDsIsBQQAgDTcDiIsBQQAgBDcD4IoBQQAgHTcDuIoBQQAgCjcDkIoBQQAgIjcDoIsBQQAgFjcD+IoBQQAgKDcD0IoBQQAgCDcDqIoBQQAgDDcDgIoBQQAgIzcDuIsBQQAgJzcDkIsBQQAgJjcD6IoBQQAgHDcDwIoBQQAgCTcDmIoBC/gCAQV/QeQAQQAoAoyNASIBQQF2ayECAkBBACgCiI0BIgNBAEgNACABIQQCQCABIANGDQAgA0HIiwFqIQVBACEDA0AgBSADakEAOgAAIANBAWoiAyABQQAoAoiNASIEa0kNAAsLIARByIsBaiIDIAMtAAAgAHI6AAAgAUHHiwFqIgMgAy0AAEGAAXI6AABByIsBIAEQA0EAQYCAgIB4NgKIjQELAkAgAkEESQ0AIAJBAnYiA0EDcSEFQQAhBAJAIANBf2pBA0kNACADQfz///8DcSEBQQAhA0EAIQQDQCADQYAKaiADQYCKAWooAgA2AgAgA0GECmogA0GEigFqKAIANgIAIANBiApqIANBiIoBaigCADYCACADQYwKaiADQYyKAWooAgA2AgAgA0EQaiEDIAEgBEEEaiIERw0ACwsgBUUNACAFQQJ0IQEgBEECdCEDA0AgA0GACmogA0GAigFqKAIANgIAIANBBGohAyABQXxqIgENAAsLCwYAQYCKAQvRBgEDf0EAQgA3A4CNAUEAQgA3A/iMAUEAQgA3A/CMAUEAQgA3A+iMAUEAQgA3A+CMAUEAQgA3A9iMAUEAQgA3A9CMAUEAQgA3A8iMAUEAQgA3A8CMAUEAQgA3A7iMAUEAQgA3A7CMAUEAQgA3A6iMAUEAQgA3A6CMAUEAQgA3A5iMAUEAQgA3A5CMAUEAQgA3A4iMAUEAQgA3A4CMAUEAQgA3A/iLAUEAQgA3A/CLAUEAQgA3A+iLAUEAQgA3A+CLAUEAQgA3A9iLAUEAQgA3A9CLAUEAQgA3A8iLAUEAQgA3A8CLAUEAQgA3A7iLAUEAQgA3A7CLAUEAQgA3A6iLAUEAQgA3A6CLAUEAQgA3A5iLAUEAQgA3A5CLAUEAQgA3A4iLAUEAQgA3A4CLAUEAQgA3A/iKAUEAQgA3A/CKAUEAQgA3A+iKAUEAQgA3A+CKAUEAQgA3A9iKAUEAQgA3A9CKAUEAQgA3A8iKAUEAQgA3A8CKAUEAQgA3A7iKAUEAQgA3A7CKAUEAQgA3A6iKAUEAQgA3A6CKAUEAQgA3A5iKAUEAQgA3A5CKAUEAQgA3A4iKAUEAQgA3A4CKAUEAQcAMIAFBAXRrQQN2NgKMjQFBAEEANgKIjQEgABACQeQAQQAoAoyNASIAQQF2ayEDAkBBACgCiI0BIgFBAEgNACAAIQQCQCAAIAFGDQAgAUHIiwFqIQVBACEBA0AgBSABakEAOgAAIAFBAWoiASAAQQAoAoiNASIEa0kNAAsLIARByIsBaiIBIAEtAAAgAnI6AAAgAEHHiwFqIgEgAS0AAEGAAXI6AABByIsBIAAQA0EAQYCAgIB4NgKIjQELAkAgA0EESQ0AIANBAnYiAUEDcSEFQQAhBAJAIAFBf2pBA0kNACABQfz///8DcSEAQQAhAUEAIQQDQCABQYAKaiABQYCKAWooAgA2AgAgAUGECmogAUGEigFqKAIANgIAIAFBiApqIAFBiIoBaigCADYCACABQYwKaiABQYyKAWooAgA2AgAgAUEQaiEBIAAgBEEEaiIERw0ACwsgBUUNACAFQQJ0IQAgBEECdCEBA0AgAUGACmogAUGAigFqKAIANgIAIAFBBGohASAAQXxqIgANAAsLCwvYAQEAQYAIC9ABkAEAAAAAAAAAAAAAAAAAAAEAAAAAAAAAgoAAAAAAAACKgAAAAAAAgACAAIAAAACAi4AAAAAAAAABAACAAAAAAIGAAIAAAACACYAAAAAAAICKAAAAAAAAAIgAAAAAAAAACYAAgAAAAAAKAACAAAAAAIuAAIAAAAAAiwAAAAAAAICJgAAAAAAAgAOAAAAAAACAAoAAAAAAAICAAAAAAAAAgAqAAAAAAAAACgAAgAAAAICBgACAAAAAgICAAAAAAACAAQAAgAAAAAAIgACAAAAAgA==";
var hash$b = "fb24e536";
var wasmJson$b = {
    name: name$b,
    data: data$b,
    hash: hash$b
};
const mutex$c = new Mutex$1();
let wasmCache$c = null;
function validateBits$1(bits) {
    if (![224, 256, 384, 512].includes(bits)) {
        return new Error("Invalid variant! Valid values: 224, 256, 384, 512");
    }
    return null;
}
/**
 * Calculates SHA-3 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param bits Number of output bits. Valid values: 224, 256, 384, 512
 * @returns Computed hash as a hexadecimal string
 */
function sha3(data, bits = 512) {
    if (validateBits$1(bits)) {
        return Promise.reject(validateBits$1(bits));
    }
    const hashLength = bits / 8;
    if (wasmCache$c === null || wasmCache$c.hashLength !== hashLength) {
        return lockedCreate(mutex$c, wasmJson$b, hashLength).then((wasm) => {
            wasmCache$c = wasm;
            return wasmCache$c.calculate(data, bits, 0x06);
        });
    }
    try {
        const hash = wasmCache$c.calculate(data, bits, 0x06);
        return Promise.resolve(hash);
    }
    catch (err) {
        return Promise.reject(err);
    }
}
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
new Mutex$1();
/**
 * Utilities for hex, bytes, CSPRNG.
 * @module
 */
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
function isBytes(a) {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}
/** Asserts something is positive integer. */
function anumber(n, title = '') {
    if (!Number.isSafeInteger(n) || n < 0) {
        const prefix = title && `"${title}" `;
        throw new Error(`${prefix}expected integer >= 0, got ${n}`);
    }
}
/** Asserts something is Uint8Array. */
function abytes(value, length, title = '') {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== undefined;
    if (!bytes || (needsLen && len !== length)) {
        const prefix = title && `"${title}" `;
        const ofLen = needsLen ? ` of length ${length}` : '';
        const got = bytes ? `length=${len}` : `type=${typeof value}`;
        throw new Error(prefix + 'expected Uint8Array' + ofLen + ', got ' + got);
    }
    return value;
}
// Built-in hex conversion https://caniuse.com/mdn-javascript_builtins_uint8array_fromhex
const hasHexBuiltin = /* @__PURE__ */ (() => 
// @ts-ignore
typeof Uint8Array.from([]).toHex === 'function' && typeof Uint8Array.fromHex === 'function')();
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * Convert byte array to hex string. Uses built-in function, when available.
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    abytes(bytes);
    // @ts-ignore
    if (hasHexBuiltin)
        return bytes.toHex();
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
        return ch - asciis._0; // '2' => 50-48
    if (ch >= asciis.A && ch <= asciis.F)
        return ch - (asciis.A - 10); // 'B' => 66-(65-10)
    if (ch >= asciis.a && ch <= asciis.f)
        return ch - (asciis.a - 10); // 'b' => 98-(97-10)
    return;
}
/**
 * Convert hex string to byte array. Uses built-in function, when available.
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    // @ts-ignore
    if (hasHexBuiltin)
        return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
        throw new Error('hex string expected, got unpadded hex of length ' + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // multiply first octet, e.g. 'a3' => 10*16+3 => 160 + 3 => 163
    }
    return array;
}
/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
function randomBytes(bytesLength = 32) {
    const cr = typeof globalThis === 'object' ? globalThis.crypto : null;
    if (typeof cr?.getRandomValues !== 'function')
        throw new Error('crypto.getRandomValues must be defined');
    return cr.getRandomValues(new Uint8Array(bytesLength));
}
/**
 * Hex, bytes and number utilities.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$2 = /* @__PURE__ */ BigInt(0);
// Used in weierstrass, der
function abignumber(n) {
    if (typeof n === 'bigint') {
        if (!isPosBig(n))
            throw new Error('positive bigint expected, got ' + n);
    }
    else
        anumber(n);
    return n;
}
function hexToNumber(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    return hex === '' ? _0n$2 : BigInt('0x' + hex); // Big Endian
}
function bytesToNumberLE(bytes) {
    return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
    anumber(len);
    n = abignumber(n);
    const res = hexToBytes(n.toString(16).padStart(len * 2, '0'));
    if (res.length !== len)
        throw new Error('number too large');
    return res;
}
function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
}
/**
 * Copies Uint8Array. We can't use u8a.slice(), because u8a can be Buffer,
 * and Buffer#slice creates mutable copy. Never use Buffers!
 */
function copyBytes(bytes) {
    return Uint8Array.from(bytes);
}
// Is positive bigint
const isPosBig = (n) => typeof n === 'bigint' && _0n$2 <= n;
function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
/**
 * Asserts min <= n < max. NOTE: It's < max and not <= max.
 * @example
 * aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
 */
function aInRange(title, n, min, max) {
    // Why min <= n < max and not a (min < n < max) OR b (min <= n <= max)?
    // consider P=256n, min=0n, max=P
    // - a for min=0 would require -1:          `inRange('x', x, -1n, P)`
    // - b would commonly require subtraction:  `inRange('x', x, 0n, P - 1n)`
    // - our way is the cleanest:               `inRange('x', x, 0n, P)
    if (!inRange(n, min, max))
        throw new Error('expected valid ' + title + ': ' + min + ' <= n < ' + max + ', got ' + n);
}
function validateObject(object, fields = {}, optFields = {}) {
    if (!object || typeof object !== 'object')
        throw new Error('expected valid options object');
    function checkField(fieldName, expectedType, isOpt) {
        const val = object[fieldName];
        if (isOpt && val === undefined)
            return;
        const current = typeof val;
        if (current !== expectedType || val === null)
            throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
    }
    const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
    iter(fields, false);
    iter(optFields, true);
}
/**
 * Utils for modular division and fields.
 * Field over 11 is a finite (Galois) field is integer number operations `mod 11`.
 * There is no division: it is replaced by modular multiplicative inverse.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// Numbers aren't used in x25519 / x448 builds
// prettier-ignore
const _0n$1 = /* @__PURE__ */ BigInt(0);
// Calculates a modulo b
function mod(a, b) {
    const result = a % b;
    return result >= _0n$1 ? result : b + result;
}
/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n$1) {
        res *= res;
        res %= modulo;
    }
    return res;
}
/**
 * Methods for elliptic curve multiplication by scalars.
 * Contains wNAF, pippenger.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function createKeygen(randomSecretKey, getPublicKey) {
    return function keygen(seed) {
        const secretKey = randomSecretKey(seed);
        return { secretKey, publicKey: getPublicKey(secretKey) };
    };
}
/**
 * Montgomery curve methods. It's not really whole montgomery curve,
 * just bunch of very specific methods for X25519 / X448 from
 * [RFC 7748](https://www.rfc-editor.org/rfc/rfc7748)
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n = BigInt(0);
const _1n$1 = BigInt(1);
const _2n$1 = BigInt(2);
function validateOpts(curve) {
    validateObject(curve, {
        adjustScalarBytes: 'function',
        powPminus2: 'function',
    });
    return Object.freeze({ ...curve });
}
function montgomery(curveDef) {
    const CURVE = validateOpts(curveDef);
    const { P, type, adjustScalarBytes, powPminus2, randomBytes: rand } = CURVE;
    const is25519 = type === 'x25519';
    if (!is25519 && type !== 'x448')
        throw new Error('invalid type');
    const randomBytes_ = rand || randomBytes;
    const montgomeryBits = is25519 ? 255 : 448;
    const fieldLen = is25519 ? 32 : 56;
    const Gu = is25519 ? BigInt(9) : BigInt(5);
    // RFC 7748 #5:
    // The constant a24 is (486662 - 2) / 4 = 121665 for curve25519/X25519 and
    // (156326 - 2) / 4 = 39081 for curve448/X448
    // const a = is25519 ? 156326n : 486662n;
    const a24 = is25519 ? BigInt(121665) : BigInt(39081);
    // RFC: x25519 "the resulting integer is of the form 2^254 plus
    // eight times a value between 0 and 2^251 - 1 (inclusive)"
    // x448: "2^447 plus four times a value between 0 and 2^445 - 1 (inclusive)"
    const minScalar = is25519 ? _2n$1 ** BigInt(254) : _2n$1 ** BigInt(447);
    const maxAdded = is25519
        ? BigInt(8) * _2n$1 ** BigInt(251) - _1n$1
        : BigInt(4) * _2n$1 ** BigInt(445) - _1n$1;
    const maxScalar = minScalar + maxAdded + _1n$1; // (inclusive)
    const modP = (n) => mod(n, P);
    const GuBytes = encodeU(Gu);
    function encodeU(u) {
        return numberToBytesLE(modP(u), fieldLen);
    }
    function decodeU(u) {
        const _u = copyBytes(abytes(u, fieldLen, 'uCoordinate'));
        // RFC: When receiving such an array, implementations of X25519
        // (but not X448) MUST mask the most significant bit in the final byte.
        if (is25519)
            _u[31] &= 127; // 0b0111_1111
        // RFC: Implementations MUST accept non-canonical values and process them as
        // if they had been reduced modulo the field prime.  The non-canonical
        // values are 2^255 - 19 through 2^255 - 1 for X25519 and 2^448 - 2^224
        // - 1 through 2^448 - 1 for X448.
        return modP(bytesToNumberLE(_u));
    }
    function decodeScalar(scalar) {
        return bytesToNumberLE(adjustScalarBytes(copyBytes(abytes(scalar, fieldLen, 'scalar'))));
    }
    function scalarMult(scalar, u) {
        const pu = montgomeryLadder(decodeU(u), decodeScalar(scalar));
        // Some public keys are useless, of low-order. Curve author doesn't think
        // it needs to be validated, but we do it nonetheless.
        // https://cr.yp.to/ecdh.html#validate
        if (pu === _0n)
            throw new Error('invalid private or public key received');
        return encodeU(pu);
    }
    // Computes public key from private. By doing scalar multiplication of base point.
    function scalarMultBase(scalar) {
        return scalarMult(scalar, GuBytes);
    }
    const getPublicKey = scalarMultBase;
    const getSharedSecret = scalarMult;
    // cswap from RFC7748 "example code"
    function cswap(swap, x_2, x_3) {
        // dummy = mask(swap) AND (x_2 XOR x_3)
        // Where mask(swap) is the all-1 or all-0 word of the same length as x_2
        // and x_3, computed, e.g., as mask(swap) = 0 - swap.
        const dummy = modP(swap * (x_2 - x_3));
        x_2 = modP(x_2 - dummy); // x_2 = x_2 XOR dummy
        x_3 = modP(x_3 + dummy); // x_3 = x_3 XOR dummy
        return { x_2, x_3 };
    }
    /**
     * Montgomery x-only multiplication ladder.
     * @param pointU u coordinate (x) on Montgomery Curve 25519
     * @param scalar by which the point would be multiplied
     * @returns new Point on Montgomery curve
     */
    function montgomeryLadder(u, scalar) {
        aInRange('u', u, _0n, P);
        aInRange('scalar', scalar, minScalar, maxScalar);
        const k = scalar;
        const x_1 = u;
        let x_2 = _1n$1;
        let z_2 = _0n;
        let x_3 = u;
        let z_3 = _1n$1;
        let swap = _0n;
        for (let t = BigInt(montgomeryBits - 1); t >= _0n; t--) {
            const k_t = (k >> t) & _1n$1;
            swap ^= k_t;
            ({ x_2, x_3 } = cswap(swap, x_2, x_3));
            ({ x_2: z_2, x_3: z_3 } = cswap(swap, z_2, z_3));
            swap = k_t;
            const A = x_2 + z_2;
            const AA = modP(A * A);
            const B = x_2 - z_2;
            const BB = modP(B * B);
            const E = AA - BB;
            const C = x_3 + z_3;
            const D = x_3 - z_3;
            const DA = modP(D * A);
            const CB = modP(C * B);
            const dacb = DA + CB;
            const da_cb = DA - CB;
            x_3 = modP(dacb * dacb);
            z_3 = modP(x_1 * modP(da_cb * da_cb));
            x_2 = modP(AA * BB);
            z_2 = modP(E * (AA + modP(a24 * E)));
        }
        ({ x_2, x_3 } = cswap(swap, x_2, x_3));
        ({ x_2: z_2, x_3: z_3 } = cswap(swap, z_2, z_3));
        const z2 = powPminus2(z_2); // `Fp.pow(x, P - _2n)` is much slower equivalent
        return modP(x_2 * z2); // Return x_2 * (z_2^(p - 2))
    }
    const lengths = {
        secretKey: fieldLen,
        publicKey: fieldLen,
        seed: fieldLen,
    };
    const randomSecretKey = (seed = randomBytes_(fieldLen)) => {
        abytes(seed, lengths.seed, 'seed');
        return seed;
    };
    const utils = { randomSecretKey };
    return Object.freeze({
        keygen: createKeygen(randomSecretKey, getPublicKey),
        getSharedSecret,
        getPublicKey,
        scalarMult,
        scalarMultBase,
        utils,
        GuBytes: GuBytes.slice(),
        lengths,
    });
}
/**
 * ed25519 Twisted Edwards curve with following addons:
 * - X25519 ECDH
 * - Ristretto cofactor elimination
 * - Elligator hash-to-group / point indistinguishability
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// prettier-ignore
const _1n = BigInt(1), _2n = BigInt(2), _3n = /* @__PURE__ */ BigInt(3);
// prettier-ignore
const _5n = BigInt(5);
BigInt(8);
// P = 2n**255n - 19n
const ed25519_CURVE_p = BigInt('0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed');
function ed25519_pow_2_252_3(x) {
    // prettier-ignore
    const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
    const P = ed25519_CURVE_p;
    const x2 = (x * x) % P;
    const b2 = (x2 * x) % P; // x^3, 11
    const b4 = (pow2(b2, _2n, P) * b2) % P; // x^15, 1111
    const b5 = (pow2(b4, _1n, P) * x) % P; // x^31
    const b10 = (pow2(b5, _5n, P) * b5) % P;
    const b20 = (pow2(b10, _10n, P) * b10) % P;
    const b40 = (pow2(b20, _20n, P) * b20) % P;
    const b80 = (pow2(b40, _40n, P) * b40) % P;
    const b160 = (pow2(b80, _80n, P) * b80) % P;
    const b240 = (pow2(b160, _80n, P) * b80) % P;
    const b250 = (pow2(b240, _10n, P) * b10) % P;
    const pow_p_5_8 = (pow2(b250, _2n, P) * x) % P;
    // ^ To pow to (p+3)/8, multiply it by x.
    return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes) {
    // Section 5: For X25519, in order to decode 32 random bytes as an integer scalar,
    // set the three least significant bits of the first byte
    bytes[0] &= 248; // 0b1111_1000
    // and the most significant bit of the last to zero,
    bytes[31] &= 127; // 0b0111_1111
    // set the second most significant bit of the last byte to 1
    bytes[31] |= 64; // 0b0100_0000
    return bytes;
}
/**
 * ECDH using curve25519 aka x25519.
 * @example
 * ```js
 * import { x25519 } from '@noble/curves/ed25519.js';
 * const alice = x25519.keygen();
 * const bob = x25519.keygen();
 * const shared = x25519.getSharedSecret(alice.secretKey, bob.publicKey);
 * ```
 */
const x25519 = /* @__PURE__ */ (() => {
    const P = ed25519_CURVE_p;
    return montgomery({
        P,
        type: 'x25519',
        powPminus2: (x) => {
            // x^(p-2) aka x^(2^255-21)
            const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
            return mod(pow2(pow_p_5_8, _3n, P) * b2, P);
        },
        adjustScalarBytes,
    });
})();
/*
How it works:
`this.#head` is an instance of `Node` which keeps track of its current value and nests another instance of `Node` that keeps the value that comes after it. When a value is provided to `.enqueue()`, the code needs to iterate through `this.#head`, going deeper and deeper to find the last value. However, iterating through every single item is slow. This problem is solved by saving a reference to the last value as `this.#tail` so that it can reference it to add a new value.
*/
class Node {
    value;
    next;
    constructor(value) {
        this.value = value;
    }
}
class Queue {
    #head;
    #tail;
    #size;
    constructor() {
        this.clear();
    }
    enqueue(value) {
        const node = new Node(value);
        if (this.#head) {
            this.#tail.next = node;
            this.#tail = node;
        }
        else {
            this.#head = node;
            this.#tail = node;
        }
        this.#size++;
    }
    dequeue() {
        const current = this.#head;
        if (!current) {
            return;
        }
        this.#head = this.#head.next;
        this.#size--;
        // Clean up tail reference when queue becomes empty
        if (!this.#head) {
            this.#tail = undefined;
        }
        return current.value;
    }
    peek() {
        if (!this.#head) {
            return;
        }
        return this.#head.value;
        // TODO: Node.js 18.
        // return this.#head?.value;
    }
    clear() {
        this.#head = undefined;
        this.#tail = undefined;
        this.#size = 0;
    }
    get size() {
        return this.#size;
    }
    *[Symbol.iterator]() {
        let current = this.#head;
        while (current) {
            yield current.value;
            current = current.next;
        }
    }
    *drain() {
        while (this.#head) {
            yield this.dequeue();
        }
    }
}
function pLimit(concurrency) {
    validateConcurrency(concurrency);
    const queue = new Queue();
    let activeCount = 0;
    const resumeNext = () => {
        // Process the next queued function if we're under the concurrency limit
        if (activeCount < concurrency && queue.size > 0) {
            activeCount++;
            queue.dequeue()();
        }
    };
    const next = () => {
        activeCount--;
        resumeNext();
    };
    const run = async (function_, resolve, arguments_) => {
        // Execute the function and capture the result promise
        const result = (async () => function_(...arguments_))();
        // Resolve immediately with the promise (don't wait for completion)
        resolve(result);
        // Wait for the function to complete (success or failure)
        // We catch errors here to prevent unhandled rejections,
        // but the original promise rejection is preserved for the caller
        try {
            await result;
        }
        catch { }
        // Decrement active count and process next queued function
        next();
    };
    const enqueue = (function_, resolve, arguments_) => {
        // Queue the internal resolve function instead of the run function
        // to preserve the asynchronous execution context.
        new Promise(internalResolve => {
            queue.enqueue(internalResolve);
        }).then(run.bind(undefined, function_, resolve, arguments_)); // eslint-disable-line promise/prefer-await-to-then
        // Start processing immediately if we haven't reached the concurrency limit
        if (activeCount < concurrency) {
            resumeNext();
        }
    };
    const generator = (function_, ...arguments_) => new Promise(resolve => {
        enqueue(function_, resolve, arguments_);
    });
    Object.defineProperties(generator, {
        activeCount: {
            get: () => activeCount,
        },
        pendingCount: {
            get: () => queue.size,
        },
        clearQueue: {
            value() {
                queue.clear();
            },
        },
        concurrency: {
            get: () => concurrency,
            set(newConcurrency) {
                validateConcurrency(newConcurrency);
                concurrency = newConcurrency;
                queueMicrotask(() => {
                    // eslint-disable-next-line no-unmodified-loop-condition
                    while (activeCount < concurrency && queue.size > 0) {
                        resumeNext();
                    }
                });
            },
        },
        map: {
            async value(iterable, function_) {
                const promises = Array.from(iterable, (value, index) => this(function_, value, index));
                return Promise.all(promises);
            },
        },
    });
    return generator;
}
function validateConcurrency(concurrency) {
    if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
        throw new TypeError('Expected `concurrency` to be a number from 1 and up');
    }
}
var events = { exports: {} };
var hasRequiredEvents;
function requireEvents() {
    if (hasRequiredEvents)
        return events.exports;
    hasRequiredEvents = 1;
    var R = typeof Reflect === 'object' ? Reflect : null;
    var ReflectApply = R && typeof R.apply === 'function'
        ? R.apply
        : function ReflectApply(target, receiver, args) {
            return Function.prototype.apply.call(target, receiver, args);
        };
    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === 'function') {
        ReflectOwnKeys = R.ownKeys;
    }
    else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
            return Object.getOwnPropertyNames(target)
                .concat(Object.getOwnPropertySymbols(target));
        };
    }
    else {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
            return Object.getOwnPropertyNames(target);
        };
    }
    function ProcessEmitWarning(warning) {
        if (console && console.warn)
            console.warn(warning);
    }
    var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
        return value !== value;
    };
    function EventEmitter() {
        EventEmitter.init.call(this);
    }
    events.exports = EventEmitter;
    events.exports.once = once;
    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;
    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = undefined;
    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    var defaultMaxListeners = 10;
    function checkListener(listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
        }
    }
    Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
        enumerable: true,
        get: function () {
            return defaultMaxListeners;
        },
        set: function (arg) {
            if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
                throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
            }
            defaultMaxListeners = arg;
        }
    });
    EventEmitter.init = function () {
        if (this._events === undefined ||
            this._events === Object.getPrototypeOf(this)._events) {
            this._events = Object.create(null);
            this._eventsCount = 0;
        }
        this._maxListeners = this._maxListeners || undefined;
    };
    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
            throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
        }
        this._maxListeners = n;
        return this;
    };
    function _getMaxListeners(that) {
        if (that._maxListeners === undefined)
            return EventEmitter.defaultMaxListeners;
        return that._maxListeners;
    }
    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this);
    };
    EventEmitter.prototype.emit = function emit(type) {
        var args = [];
        for (var i = 1; i < arguments.length; i++)
            args.push(arguments[i]);
        var doError = (type === 'error');
        var events = this._events;
        if (events !== undefined)
            doError = (doError && events.error === undefined);
        else if (!doError)
            return false;
        // If there is no 'error' event listener then throw.
        if (doError) {
            var er;
            if (args.length > 0)
                er = args[0];
            if (er instanceof Error) {
                // Note: The comments on the `throw` lines are intentional, they show
                // up in Node's output if this results in an unhandled exception.
                throw er; // Unhandled 'error' event
            }
            // At least give some kind of context to the user
            var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
            err.context = er;
            throw err; // Unhandled 'error' event
        }
        var handler = events[type];
        if (handler === undefined)
            return false;
        if (typeof handler === 'function') {
            ReflectApply(handler, this, args);
        }
        else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
                ReflectApply(listeners[i], this, args);
        }
        return true;
    };
    function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;
        checkListener(listener);
        events = target._events;
        if (events === undefined) {
            events = target._events = Object.create(null);
            target._eventsCount = 0;
        }
        else {
            // To avoid recursion in the case that type === "newListener"! Before
            // adding it to the listeners, first emit "newListener".
            if (events.newListener !== undefined) {
                target.emit('newListener', type, listener.listener ? listener.listener : listener);
                // Re-assign `events` because a newListener handler could have caused the
                // this._events to be assigned to a new object
                events = target._events;
            }
            existing = events[type];
        }
        if (existing === undefined) {
            // Optimize the case of one listener. Don't need the extra array object.
            existing = events[type] = listener;
            ++target._eventsCount;
        }
        else {
            if (typeof existing === 'function') {
                // Adding the second element, need to change to array.
                existing = events[type] =
                    prepend ? [listener, existing] : [existing, listener];
                // If we've already got an array, just append.
            }
            else if (prepend) {
                existing.unshift(listener);
            }
            else {
                existing.push(listener);
            }
            // Check for listener leak
            m = _getMaxListeners(target);
            if (m > 0 && existing.length > m && !existing.warned) {
                existing.warned = true;
                // No error code for this since it is a Warning
                // eslint-disable-next-line no-restricted-syntax
                var w = new Error('Possible EventEmitter memory leak detected. ' +
                    existing.length + ' ' + String(type) + ' listeners ' +
                    'added. Use emitter.setMaxListeners() to ' +
                    'increase limit');
                w.name = 'MaxListenersExceededWarning';
                w.emitter = target;
                w.type = type;
                w.count = existing.length;
                ProcessEmitWarning(w);
            }
        }
        return target;
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
            return _addListener(this, type, listener, true);
        };
    function onceWrapper() {
        if (!this.fired) {
            this.target.removeListener(this.type, this.wrapFn);
            this.fired = true;
            if (arguments.length === 0)
                return this.listener.call(this.target);
            return this.listener.apply(this.target, arguments);
        }
    }
    function _onceWrap(target, type, listener) {
        var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
    }
    EventEmitter.prototype.once = function once(type, listener) {
        checkListener(listener);
        this.on(type, _onceWrap(this, type, listener));
        return this;
    };
    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
            checkListener(listener);
            this.prependListener(type, _onceWrap(this, type, listener));
            return this;
        };
    // Emits a 'removeListener' event if and only if the listener was removed.
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
            var list, events, position, i, originalListener;
            checkListener(listener);
            events = this._events;
            if (events === undefined)
                return this;
            list = events[type];
            if (list === undefined)
                return this;
            if (list === listener || list.listener === listener) {
                if (--this._eventsCount === 0)
                    this._events = Object.create(null);
                else {
                    delete events[type];
                    if (events.removeListener)
                        this.emit('removeListener', type, list.listener || listener);
                }
            }
            else if (typeof list !== 'function') {
                position = -1;
                for (i = list.length - 1; i >= 0; i--) {
                    if (list[i] === listener || list[i].listener === listener) {
                        originalListener = list[i].listener;
                        position = i;
                        break;
                    }
                }
                if (position < 0)
                    return this;
                if (position === 0)
                    list.shift();
                else {
                    spliceOne(list, position);
                }
                if (list.length === 1)
                    events[type] = list[0];
                if (events.removeListener !== undefined)
                    this.emit('removeListener', type, originalListener || listener);
            }
            return this;
        };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
            var listeners, events, i;
            events = this._events;
            if (events === undefined)
                return this;
            // not listening for removeListener, no need to emit
            if (events.removeListener === undefined) {
                if (arguments.length === 0) {
                    this._events = Object.create(null);
                    this._eventsCount = 0;
                }
                else if (events[type] !== undefined) {
                    if (--this._eventsCount === 0)
                        this._events = Object.create(null);
                    else
                        delete events[type];
                }
                return this;
            }
            // emit removeListener for all listeners on all events
            if (arguments.length === 0) {
                var keys = Object.keys(events);
                var key;
                for (i = 0; i < keys.length; ++i) {
                    key = keys[i];
                    if (key === 'removeListener')
                        continue;
                    this.removeAllListeners(key);
                }
                this.removeAllListeners('removeListener');
                this._events = Object.create(null);
                this._eventsCount = 0;
                return this;
            }
            listeners = events[type];
            if (typeof listeners === 'function') {
                this.removeListener(type, listeners);
            }
            else if (listeners !== undefined) {
                // LIFO order
                for (i = listeners.length - 1; i >= 0; i--) {
                    this.removeListener(type, listeners[i]);
                }
            }
            return this;
        };
    function _listeners(target, type, unwrap) {
        var events = target._events;
        if (events === undefined)
            return [];
        var evlistener = events[type];
        if (evlistener === undefined)
            return [];
        if (typeof evlistener === 'function')
            return unwrap ? [evlistener.listener || evlistener] : [evlistener];
        return unwrap ?
            unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
    };
    EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
    };
    EventEmitter.listenerCount = function (emitter, type) {
        if (typeof emitter.listenerCount === 'function') {
            return emitter.listenerCount(type);
        }
        else {
            return listenerCount.call(emitter, type);
        }
    };
    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
        var events = this._events;
        if (events !== undefined) {
            var evlistener = events[type];
            if (typeof evlistener === 'function') {
                return 1;
            }
            else if (evlistener !== undefined) {
                return evlistener.length;
            }
        }
        return 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i)
            copy[i] = arr[i];
        return copy;
    }
    function spliceOne(list, index) {
        for (; index + 1 < list.length; index++)
            list[index] = list[index + 1];
        list.pop();
    }
    function unwrapListeners(arr) {
        var ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
            ret[i] = arr[i].listener || arr[i];
        }
        return ret;
    }
    function once(emitter, name) {
        return new Promise(function (resolve, reject) {
            function errorListener(err) {
                emitter.removeListener(name, resolver);
                reject(err);
            }
            function resolver() {
                if (typeof emitter.removeListener === 'function') {
                    emitter.removeListener('error', errorListener);
                }
                resolve([].slice.call(arguments));
            }
            eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
            if (name !== 'error') {
                addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
            }
        });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === 'function') {
            eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
        }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === 'function') {
            if (flags.once) {
                emitter.once(name, listener);
            }
            else {
                emitter.on(name, listener);
            }
        }
        else if (typeof emitter.addEventListener === 'function') {
            // EventTarget does not have `error` event semantics like Node
            // EventEmitters, we do not listen for `error` events here.
            emitter.addEventListener(name, function wrapListener(arg) {
                // IE does not have builtin `{ once: true }` support so we
                // have to do it manually.
                if (flags.once) {
                    emitter.removeEventListener(name, wrapListener);
                }
                listener(arg);
            });
        }
        else {
            throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
        }
    }
    return events.exports;
}
var eventsExports = requireEvents();
var __defProp = Object.defineProperty;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
    throw TypeError(msg);
};
var __export = (target, all) => {
    for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
};
var __using = (stack, value, async) => {
    if (value != null) {
        if (typeof value !== "object" && typeof value !== "function")
            __typeError("Object expected");
        var dispose, inner;
        if (dispose === void 0) {
            dispose = value[__knownSymbol("dispose")];
        }
        if (typeof dispose !== "function")
            __typeError("Object not disposable");
        if (inner)
            dispose = function () {
                try {
                    inner.call(this);
                }
                catch (e) {
                    return Promise.reject(e);
                }
            };
        stack.push([async, dispose, value]);
    }
    return value;
};
var __callDispose = (stack, error, hasError) => {
    var E = typeof SuppressedError === "function" ? SuppressedError : function (e, s, m, _) {
        return _ = Error(m), _.name = "SuppressedError", _.error = e, _.suppressed = s, _;
    };
    var fail = (e) => error = hasError ? new E(e, error, "An error was suppressed during disposal") : (hasError = true, e);
    var next = (it) => {
        while (it = stack.pop()) {
            try {
                var result = it[1] && it[1].call(it[2]);
                if (it[0])
                    return Promise.resolve(result).then(next, (e) => (fail(e), next()));
            }
            catch (e) {
                fail(e);
            }
        }
        if (hasError)
            throw error;
    };
    return next();
};
// src/clock/SystemClock.ts
var SystemClock = class {
    now() {
        return Date.now();
    }
    delay(ms) {
        return new Promise((resolve) => {
            this.setTimeout(resolve, ms);
        });
    }
    delayUnref(ms) {
        return new Promise((resolve) => {
            const timerId = this.setTimeout(resolve, ms);
            this.unref(timerId);
        });
    }
    setTimeout(callback, delay) {
        return setTimeout(callback, delay);
    }
    clearTimeout(timerId) {
        clearTimeout(timerId);
    }
    setInterval(callback, interval) {
        return setInterval(callback, interval);
    }
    clearInterval(timerId) {
        clearInterval(timerId);
    }
    unref(timerId) {
        const timer = timerId;
        if (timer && typeof timer.unref === "function") {
            timer.unref();
        }
    }
    ref(timerId) {
        const timer = timerId;
        if (timer && typeof timer.ref === "function") {
            timer.ref();
        }
    }
};
// src/Log/index.ts
var Log = class _Log {
    clock;
    rawLog;
    parentStartTime;
    namePrefix;
    constructor(params = {}) {
        this.clock = params.clock ?? new SystemClock();
        this.parentStartTime = params.parentStartTime ?? this.clock.now();
        this.namePrefix = params.namePrefix ?? "";
        if (params.rawLog) {
            this.rawLog = params.rawLog;
        }
        else {
            this.rawLog = this.defaultRawLog.bind(this);
        }
    }
    /**
     * Create a child logger with a prefixed name.
     * Multiple calls to child() create new instances (not memoized).
     */
    child(name) {
        const newPrefix = this.namePrefix ? `${this.namePrefix}.${name}` : name;
        return new _Log({
            clock: this.clock,
            rawLog: this.rawLog,
            parentStartTime: this.parentStartTime,
            namePrefix: newPrefix
        });
    }
    debug(...args) {
        this.log("debug", ...args);
    }
    info(...args) {
        this.log("info", ...args);
    }
    warn(...args) {
        this.log("warn", ...args);
    }
    error(...args) {
        this.log("error", ...args);
    }
    log(level, ...args) {
        const elapsed = this.clock.now() - this.parentStartTime;
        const timestamp = this.formatTimestamp(elapsed);
        let allArgs;
        if (this.namePrefix) {
            allArgs = [`[${timestamp}]`, `[${this.namePrefix}]`, ...args];
        }
        else {
            allArgs = [`[${timestamp}]`, ...args];
        }
        this.rawLog(level, ...allArgs);
    }
    /**
     * Format elapsed milliseconds as a relative timestamp.
     *
     * Format depends on elapsed time:
     * - SS.mmm (seconds) e.g., "07.138"
     * - MM:SS.mmm (minutes) e.g., "05:07.138"
     * - HH:MM:SS.mmm (hours) e.g., "01:05:07.138"
     * - Xd HH:MM:SS.mmm (days) e.g., "3d 01:05:07.138"
     */
    formatTimestamp(elapsedMs) {
        const totalSeconds = Math.floor(elapsedMs / 1e3);
        const milliseconds = elapsedMs % 1e3;
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds % 86400 / 3600);
        const minutes = Math.floor(totalSeconds % 3600 / 60);
        const seconds = totalSeconds % 60;
        const ms = String(milliseconds).padStart(3, "0");
        if (days > 0) {
            const h = String(hours).padStart(2, "0");
            const m = String(minutes).padStart(2, "0");
            const s2 = String(seconds).padStart(2, "0");
            return `${days}d ${h}:${m}:${s2}.${ms}`;
        }
        if (hours > 0) {
            const h = String(hours).padStart(2, "0");
            const m = String(minutes).padStart(2, "0");
            const s2 = String(seconds).padStart(2, "0");
            return `${h}:${m}:${s2}.${ms}`;
        }
        if (minutes > 0) {
            const m = String(minutes).padStart(2, "0");
            const s2 = String(seconds).padStart(2, "0");
            return `${m}:${s2}.${ms}`;
        }
        const s = String(seconds).padStart(2, "0");
        return `${s}.${ms}`;
    }
    defaultRawLog(level, ...args) {
        const consoleMethod = this.getConsoleMethod(level);
        consoleMethod(...args);
    }
    getConsoleMethod(level) {
        switch (level) {
            case "debug":
                return console.debug;
            case "info":
                return console.info;
            case "warn":
                return console.warn;
            case "error":
                return console.error;
        }
    }
};
exports.Log = Log;
// src/utils/assert.ts
function assert(cond, message) {
    if (!cond) {
        throw new Error(message || "Assertion failed");
    }
}
// src/storage/index.ts
var storage_exports = {};
exports.storage = storage_exports;
__export(storage_exports, {
    FsStorage: () => FsStorage,
    IndexedDBStorage: () => IndexedDBStorage,
    MemoryStorage: () => MemoryStorage,
    createAutoStorage: () => createAutoStorage
});
// src/storage/memory.ts
var MemoryStorage = class {
    data = /* @__PURE__ */ new Map();
    async read(key) {
        const value = this.data.get(key);
        assert(value !== void 0, `Key not found: ${key}`);
        return value;
    }
    async write(key, value) {
        this.data.set(key, value);
    }
    async list(keyPrefix) {
        const keys = [];
        for (const key of this.data.keys()) {
            if (key.startsWith(keyPrefix)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }
    async remove(key) {
        this.data.delete(key);
    }
    async removeAll(keyPrefix = "") {
        const keysToRemove = [];
        for (const key of this.data.keys()) {
            if (key.startsWith(keyPrefix)) {
                keysToRemove.push(key);
            }
        }
        for (const key of keysToRemove) {
            this.data.delete(key);
        }
    }
};
// src/storage/indexeddb.ts
var IndexedDBStorage = class {
    dbName;
    storeName = "keyvalue";
    dbPromise = null;
    constructor(name) {
        this.dbName = `storage-${name}`;
    }
    getDB() {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
            });
        }
        return this.dbPromise;
    }
    async read(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                if (request.result === void 0) {
                    reject(new Error(`Key not found: ${key}`));
                }
                else {
                    resolve(request.result);
                }
            };
        });
    }
    async write(key, value) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    async list(keyPrefix) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const allKeys = request.result;
                const filtered = allKeys.filter((key) => key.startsWith(keyPrefix)).sort();
                resolve(filtered);
            };
        });
    }
    async remove(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    async removeAll(keyPrefix = "") {
        const db = await this.getDB();
        const keysToRemove = await this.list(keyPrefix);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            let errorOccurred = false;
            for (const key of keysToRemove) {
                const request = store.delete(key);
                request.onerror = () => {
                    if (!errorOccurred) {
                        errorOccurred = true;
                        reject(request.error);
                    }
                };
            }
            transaction.oncomplete = () => {
                if (!errorOccurred) {
                    resolve();
                }
            };
            transaction.onerror = () => {
                if (!errorOccurred) {
                    errorOccurred = true;
                    reject(transaction.error);
                }
            };
        });
    }
};
// src/storage/getNodeDeps.ts
var nodeDepsPromise = void 0;
async function getNodeDeps() {
    if (!nodeDepsPromise) {
        nodeDepsPromise = (async () => {
            const [fs, os, path] = await Promise.all([
                import('fs/promises').then((m) => m.default),
                import('os').then((m) => m.default),
                import('path').then((m) => m.default)
            ]);
            return { fs, os, path };
        })();
    }
    return await nodeDepsPromise;
}
// src/hazae41/common/Ascii.ts
var Ascii;
((Ascii2) => {
    Ascii2.encoder = new TextEncoder();
    Ascii2.decoder = new TextDecoder("ascii");
})(Ascii || (Ascii = {}));
// src/hazae41/bytes/index.ts
var Bytes;
((Bytes2) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    function empty() {
        return alloc(0);
    }
    Bytes2.empty = empty;
    function alloc(length) {
        return new Uint8Array(length);
    }
    Bytes2.alloc = alloc;
    function from(array) {
        return new Uint8Array(array);
    }
    Bytes2.from = from;
    function random(length) {
        const bytes = alloc(length);
        crypto.getRandomValues(bytes);
        return bytes;
    }
    Bytes2.random = random;
    function is(bytes, length) {
        return bytes.length.valueOf() === length.valueOf();
    }
    Bytes2.is = is;
    function equals(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        const len = a.length;
        for (let i = 0; i < len; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    Bytes2.equals = equals;
    function equals2(a, b) {
        return equals(b, a);
    }
    Bytes2.equals2 = equals2;
    function asOrThrow(bytes, length) {
        if (!is(bytes, length))
            throw new Error();
        return bytes;
    }
    Bytes2.asOrThrow = asOrThrow;
    function fromView(view) {
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
    Bytes2.fromView = fromView;
    function encodeUtf8(text) {
        return encoder.encode(text);
    }
    Bytes2.encodeUtf8 = encodeUtf8;
    function decodeUtf8(bytes) {
        return decoder.decode(bytes);
    }
    Bytes2.decodeUtf8 = decodeUtf8;
    function fromAscii(text) {
        return Ascii.encoder.encode(text);
    }
    Bytes2.fromAscii = fromAscii;
    function toAscii(bytes) {
        return Ascii.decoder.decode(bytes);
    }
    Bytes2.toAscii = toAscii;
    function sliceOrPadStart(bytes, length) {
        if (bytes.length >= length) {
            const slice = bytes.slice(bytes.length - length, bytes.length);
            return fromView(slice);
        }
        const array = alloc(length);
        array.set(bytes, length - bytes.length);
        return array;
    }
    Bytes2.sliceOrPadStart = sliceOrPadStart;
    function padStart(bytes, length) {
        if (bytes.length >= length)
            return bytes;
        const array = alloc(length);
        array.set(bytes, length - bytes.length);
        return array;
    }
    Bytes2.padStart = padStart;
    function concat(...list) {
        const length = list.reduce((p, c) => p + c.length, 0);
        const result = alloc(length);
        let offset = 0;
        for (const bytes of list) {
            result.set(bytes, offset);
            offset += bytes.length;
        }
        return result;
    }
    Bytes2.concat = concat;
    function indexOf(bytes, search, start = 0) {
        while (true) {
            const index = bytes.indexOf(search[0], start);
            if (index === -1)
                return -1;
            if (equals(bytes.subarray(index, index + search.length), search))
                return index;
            start = index + 1;
        }
    }
    Bytes2.indexOf = indexOf;
    function assertLen(bytes, len) {
        assert(bytes.length === len);
    }
    Bytes2.assertLen = assertLen;
    function toHex(bytes) {
        let hex = "";
        for (let i = 0; i < bytes.length; i++) {
            hex += bytes[i].toString(16).padStart(2, "0");
        }
        return hex;
    }
    Bytes2.toHex = toHex;
    function fromHex(hex) {
        if (hex.length % 2 !== 0) {
            throw new Error("Hex string must have even length");
        }
        const bytes = alloc(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            const byte = parseInt(hex.substring(i, i + 2), 16);
            if (isNaN(byte)) {
                throw new Error(`Invalid hex character at position ${i}`);
            }
            bytes[i / 2] = byte;
        }
        return bytes;
    }
    Bytes2.fromHex = fromHex;
    function fromHexAllowMissing0(hex) {
        if (hex.length % 2 === 1) {
            return fromHex("0" + hex);
        }
        return fromHex(hex);
    }
    Bytes2.fromHexAllowMissing0 = fromHexAllowMissing0;
    function toBase64(bytes, options) {
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        let encoded = btoa(binary);
        if (options?.alphabet === "base64url") {
            encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_");
        }
        if (options?.omitPadding) {
            encoded = encoded.replace(/=/g, "");
        }
        return encoded;
    }
    Bytes2.toBase64 = toBase64;
    function fromBase64(text, options) {
        let normalized = text;
        if (options?.alphabet === "base64url") {
            normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
        }
        const paddingLength = (4 - normalized.length % 4) % 4;
        normalized = normalized + "=".repeat(paddingLength);
        try {
            const binary = atob(normalized);
            const bytes = alloc(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        }
        catch {
            throw new Error("Invalid base64 string");
        }
    }
    Bytes2.fromBase64 = fromBase64;
})(Bytes || (Bytes = {}));
// src/storage/fs.ts
function isNodeFsError(error) {
    return error instanceof Error && "code" in error;
}
function mangleKey(key) {
    let result = "";
    for (let i = 0; i < key.length; i++) {
        const char = key[i];
        const code = char.charCodeAt(0);
        if (code >= 97 && code <= 122 || // a-z
            code >= 65 && code <= 90 || // A-Z
            code >= 48 && code <= 57) {
            result += char;
        }
        else {
            if (code <= 255) {
                result += "_" + code.toString(16).padStart(2, "0") + "_";
            }
            else {
                result += "_" + code.toString(16).padStart(4, "0") + "_";
            }
        }
    }
    return result;
}
function unmangleKey(filename) {
    let result = "";
    let i = 0;
    while (i < filename.length) {
        if (filename[i] === "_") {
            if (i + 5 < filename.length && filename[i + 5] === "_") {
                const hex4 = filename.slice(i + 1, i + 5);
                if (/^[0-9a-f]{4}$/i.test(hex4)) {
                    const code = parseInt(hex4, 16);
                    result += String.fromCharCode(code);
                    i += 6;
                    continue;
                }
            }
            if (i + 3 < filename.length && filename[i + 3] === "_") {
                const hex2 = filename.slice(i + 1, i + 3);
                if (/^[0-9a-f]{2}$/i.test(hex2)) {
                    const code = parseInt(hex2, 16);
                    result += String.fromCharCode(code);
                    i += 4;
                    continue;
                }
            }
            result += "_";
            i++;
        }
        else {
            result += filename[i];
            i++;
        }
    }
    return result;
}
var FsStorage = class _FsStorage {
    dirPath;
    useTmp;
    initialized = false;
    constructor(dirPath, useTmp = false) {
        this.dirPath = dirPath;
        this.useTmp = useTmp;
    }
    /**
     * Create FsStorage in system temp directory.
     * The path will be /tmp/{name}
     */
    static tmp(name) {
        return new _FsStorage(name, true);
    }
    async ensureDir() {
        if (!this.initialized) {
            const { fs } = await getNodeDeps();
            await fs.mkdir(await this.getPath(), { recursive: true });
            this.initialized = true;
        }
    }
    async getPath(key) {
        const { os, path } = await getNodeDeps();
        const fullDirPath = this.useTmp ? path.join(os.tmpdir(), this.dirPath) : this.dirPath;
        if (key === void 0) {
            return fullDirPath;
        }
        return path.join(fullDirPath, mangleKey(key));
    }
    async read(key) {
        const { fs } = await getNodeDeps();
        await this.ensureDir();
        try {
            const data = await fs.readFile(await this.getPath(key));
            return Bytes.from(data);
        }
        catch (error) {
            if (isNodeFsError(error) && error.code === "ENOENT") {
                throw new Error(`Key not found: ${key}`);
            }
            throw error;
        }
    }
    async write(key, value) {
        const { fs } = await getNodeDeps();
        await this.ensureDir();
        await fs.writeFile(await this.getPath(key), value);
    }
    async list(keyPrefix) {
        const { fs } = await getNodeDeps();
        await this.ensureDir();
        try {
            const files = await fs.readdir(await this.getPath());
            const keys = files.map(unmangleKey).filter((key) => key.startsWith(keyPrefix)).sort();
            return keys;
        }
        catch (error) {
            if (isNodeFsError(error) && error.code === "ENOENT") {
                return [];
            }
            throw error;
        }
    }
    async remove(key) {
        const { fs } = await getNodeDeps();
        await this.ensureDir();
        try {
            await fs.unlink(await this.getPath(key));
        }
        catch (error) {
            if (isNodeFsError(error) && error.code === "ENOENT") {
                return;
            }
            throw error;
        }
    }
    async removeAll(keyPrefix = "") {
        const { fs } = await getNodeDeps();
        await this.ensureDir();
        try {
            const files = await fs.readdir(await this.getPath());
            const keysToRemove = files.map(unmangleKey).filter((key) => key.startsWith(keyPrefix));
            await Promise.all(keysToRemove.map(async (key) => fs.unlink(await this.getPath(key)).catch((error) => {
                if (isNodeFsError(error) && error.code === "ENOENT") {
                    return;
                }
                throw error;
            })));
        }
        catch (error) {
            if (isNodeFsError(error) && error.code === "ENOENT") {
                return;
            }
            throw error;
        }
    }
};
// src/storage/index.ts
function isBrowserEnvironment() {
    return typeof globalThis !== "undefined" && typeof globalThis.indexedDB !== "undefined";
}
function isNodeEnvironment() {
    return typeof globalThis !== "undefined" && typeof globalThis.process !== "undefined" && globalThis.process.versions?.node !== void 0;
}
function createAutoStorage(name) {
    if (isBrowserEnvironment()) {
        return new IndexedDBStorage(name);
    }
    if (isNodeEnvironment()) {
        return FsStorage.tmp(name);
    }
    throw new Error("No persistent storage backend available: IndexedDB (browser) and filesystem (Node.js) not detected");
}
// src/utils/AbstractApp.ts
var AbstractApp = class {
    /**
     * Map of registered constructors/classes for each component type.
     *
     * Populated via `register()`. Missing entries indicate components
     * that cannot currently be constructed.
     */
    constructors = {};
    /**
     * Internal store of instances keyed by `"name::subname"`.
     */
    instances = /* @__PURE__ */ new Map();
    /**
     * Create an empty app.
     *
     * Use `register()` to add constructors before calling `create()`.
     */
    constructor() {
    }
    /** Build a stable string key from (name, subname). */
    makeKey(name, subname) {
        return `${String(name)}::${subname ?? "default"}`;
    }
    /**
     * Heuristic: treat “class” constructors differently from plain functions.
     * This avoids extra type gymnastics and keeps the runtime logic simple.
     */
    isClassFunction(fn) {
        return typeof fn === "function" && /^class\s/.test(Function.prototype.toString.call(fn));
    }
    register(name, ctor) {
        this.constructors[name] = ctor;
    }
    create(name, ...params) {
        const entry = this.constructors[name];
        if (!entry) {
            throw new Error(`No constructor registered for component "${String(name)}"`);
        }
        if (this.isClassFunction(entry)) {
            const Cls = entry;
            return new Cls(...params);
        }
        else {
            const fn = entry;
            return fn(...params);
        }
    }
    tryGet(name, subname) {
        const key = this.makeKey(name, subname);
        const instance = this.instances.get(key);
        return instance;
    }
    get(name, subname) {
        const instance = this.tryGet(name, subname);
        if (!instance) {
            let msg = `No instance registered for component "${String(name)}"`;
            if (subname) {
                msg += `with subname "${subname}"`;
            }
            throw new Error(msg);
        }
        return instance;
    }
    set(name, subnameOrInstance, maybeInstance) {
        let subname;
        let instance;
        if (typeof subnameOrInstance === "string") {
            subname = subnameOrInstance;
            if (maybeInstance === void 0) {
                throw new Error("set called without instance parameter");
            }
            instance = maybeInstance;
        }
        else {
            subname = void 0;
            instance = subnameOrInstance;
        }
        const key = this.makeKey(name, subname);
        this.instances.set(key, instance);
    }
};
// src/TorClient/App.ts
var App = class extends AbstractApp {
};
// src/hazae41/symbol-dispose-polyfill/mods/symbol-dispose-polyfill.ts
if (typeof Symbol.dispose !== "symbol")
    Object.defineProperty(Symbol, "dispose", { value: /* @__PURE__ */ Symbol.for("dispose") });
if (typeof Symbol.asyncDispose !== "symbol")
    Object.defineProperty(Symbol, "asyncDispose", {
        value: /* @__PURE__ */ Symbol.for("asyncDispose")
    });
// src/hazae41/cadenas/mods/algorithms/prf/prf.ts
async function hmacOrThrow(key, seed) {
    return Bytes.from(await crypto.subtle.sign("HMAC", key, seed));
}
async function A(key, seed, index) {
    if (index === 0)
        return seed;
    const prev = await A(key, seed, index - 1);
    const hmac = await hmacOrThrow(key, prev);
    return hmac;
}
async function P(key, seed, length) {
    let result = Bytes.empty();
    for (let i = 1; result.length < length; i++)
        result = Bytes.concat(result, await hmacOrThrow(key, Bytes.concat(await A(key, seed, i), seed)));
    return result.subarray(0, length);
}
async function prfOrThrow(hash, secret, label, seed, length) {
    const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash }, false, ["sign"]);
    const prf = await P(key, Bytes.concat(Bytes.encodeUtf8(label), seed), length);
    return prf;
}
// src/hazae41/cadenas/mods/binary/lists/writable.ts
var List = class {
    constructor(array) {
        this.array = array;
    }
    static from(array) {
        return new this(array);
    }
    sizeOrThrow() {
        let size = 0;
        for (const element of this.array)
            size += element.sizeOrThrow();
        return size;
    }
    writeOrThrow(cursor) {
        for (const element of this.array)
            element.writeOrThrow(cursor);
        return;
    }
};
// src/hazae41/cadenas/mods/binary/lists/readable.ts
var ReadableList = ($readable) => class {
    static readOrThrow(cursor) {
        const array = new Array();
        while (cursor.remaining)
            array.push($readable.readOrThrow(cursor));
        return new List(array);
    }
};
// src/hazae41/cadenas/mods/binary/numbers/number16.ts
var Number16 = class _Number16 {
    constructor(value) {
        this.value = value;
    }
    #class = _Number16;
    static size = 2;
    static new(value) {
        return new _Number16(value);
    }
    sizeOrThrow() {
        return this.#class.size;
    }
    writeOrThrow(cursor) {
        cursor.writeUint16OrThrow(this.value);
    }
    static readOrThrow(cursor) {
        return new _Number16(cursor.readUint16OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/numbers/number24.ts
var Number24 = class _Number24 {
    constructor(value) {
        this.value = value;
    }
    #class = _Number24;
    static size = 3;
    static new(value) {
        return new _Number24(value);
    }
    sizeOrThrow() {
        return this.#class.size;
    }
    writeOrThrow(cursor) {
        cursor.writeUint24OrThrow(this.value);
    }
    static readOrThrow(cursor) {
        return new _Number24(cursor.readUint24OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/numbers/number8.ts
var Number8 = class _Number8 {
    constructor(value) {
        this.value = value;
    }
    #class = _Number8;
    static size = 1;
    static new(value) {
        return new _Number8(value);
    }
    sizeOrThrow() {
        return this.#class.size;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.value);
    }
    static readOrThrow(cursor) {
        return new _Number8(cursor.readUint8OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/random.ts
var Random = class _Random {
    constructor(gmt_unix_time, random_bytes) {
        this.gmt_unix_time = gmt_unix_time;
        this.random_bytes = random_bytes;
    }
    static default() {
        const gmt_unix_time = ~~(Date.now() / 1e3);
        const random_bytes = Bytes.random(28);
        return new this(gmt_unix_time, random_bytes);
    }
    sizeOrThrow() {
        return 4 + this.random_bytes.length;
    }
    writeOrThrow(cursor) {
        cursor.writeUint32OrThrow(this.gmt_unix_time);
        cursor.writeOrThrow(this.random_bytes);
    }
    static readOrThrow(cursor) {
        const gmt_unix_time = cursor.readUint32OrThrow();
        const random_bytes = cursor.readAndCopyOrThrow(28);
        return new _Random(gmt_unix_time, random_bytes);
    }
};
// src/hazae41/cursor/index.ts
var CursorReadLengthOverflowError = class _CursorReadLengthOverflowError extends Error {
    constructor(cursorOffset, cursorLength, bytesLength) {
        super(`Overflow reading ${bytesLength} bytes at offset ${cursorOffset}/${cursorLength}`);
        this.cursorOffset = cursorOffset;
        this.cursorLength = cursorLength;
        this.bytesLength = bytesLength;
    }
    #class = _CursorReadLengthOverflowError;
    name = this.#class.name;
    static from(cursor, bytesLength) {
        return new _CursorReadLengthOverflowError(cursor.offset, cursor.length, bytesLength);
    }
};
var CursorWriteLengthOverflowError = class _CursorWriteLengthOverflowError extends Error {
    constructor(cursorOffset, cursorLength, bytesLength) {
        super(`Overflow writing ${bytesLength} bytes at offset ${cursorOffset}/${cursorLength}`);
        this.cursorOffset = cursorOffset;
        this.cursorLength = cursorLength;
        this.bytesLength = bytesLength;
    }
    #class = _CursorWriteLengthOverflowError;
    name = this.#class.name;
    static from(cursor, bytesLength) {
        return new _CursorWriteLengthOverflowError(cursor.offset, cursor.length, bytesLength);
    }
};
var CursorReadNullOverflowError = class _CursorReadNullOverflowError extends Error {
    constructor(cursorOffset, cursorLength) {
        super(`Overflow reading null byte at offset ${cursorOffset}/${cursorLength}`);
        this.cursorOffset = cursorOffset;
        this.cursorLength = cursorLength;
    }
    #class = _CursorReadNullOverflowError;
    name = this.#class.name;
    static from(cursor) {
        return new _CursorReadNullOverflowError(cursor.offset, cursor.length);
    }
};
var Cursor = class {
    /**
     * A cursor for bytes
     * @param inner
     * @param offset
     */
    constructor(bytes) {
        this.bytes = bytes;
        this.data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }
    data;
    offset = 0;
    /**
     * @returns total number of bytes
     */
    get length() {
        return this.bytes.length;
    }
    /**
     * @returns number of remaining bytes
     */
    get remaining() {
        return this.length - this.offset;
    }
    /**
     * Get a subarray of the bytes before the current offset
     * @returns subarray of the bytes before the current offset
     */
    get before() {
        return this.bytes.subarray(0, this.offset);
    }
    /**
     * Get a subarray of the bytes after the current offset
     * @returns subarray of the bytes after the current offset
     */
    get after() {
        return this.bytes.subarray(this.offset);
    }
    /**
     * Get a subarray of the bytes
     * @param length
     * @returns subarray of the bytes
     */
    getOrThrow(length) {
        if (this.remaining < length)
            throw CursorReadLengthOverflowError.from(this, length);
        const subarray = this.bytes.subarray(this.offset, this.offset + length);
        return subarray;
    }
    getAndCopyOrThrow(length) {
        return Bytes.from(this.getOrThrow(length));
    }
    /**
     * Read a subarray of the bytes
     * @param length
     * @returns subarray of the bytes
     */
    readOrThrow(length) {
        const subarray = this.getOrThrow(length);
        this.offset += length;
        return subarray;
    }
    readAndCopyOrThrow(length) {
        const subarray = this.getAndCopyOrThrow(length);
        this.offset += length;
        return subarray;
    }
    /**
     * Set an array to the bytes
     * @param array array
     */
    setOrThrow(array) {
        if (this.remaining < array.length)
            throw CursorWriteLengthOverflowError.from(this, array.length);
        this.bytes.set(array, this.offset);
    }
    /**
     * Split into chunks of maximum length bytes
     * @param length chunk size
     */
    *splitOrThrow(length) {
        while (this.remaining >= length)
            yield this.readOrThrow(length);
        if (this.remaining)
            yield this.readOrThrow(this.remaining);
        return;
    }
    /**
     * Fill length bytes with value after offset
     * @param value value to fill
     * @param length length to fill
     */
    fillOrThrow(value, length) {
        if (this.remaining < length)
            throw CursorWriteLengthOverflowError.from(this, length);
        this.bytes.fill(value, this.offset, this.offset + length);
        this.offset += length;
    }
    getNullOrThrow() {
        let i = this.offset;
        while (i < this.bytes.length && this.bytes[i] > 0)
            i++;
        if (i === this.bytes.length)
            throw CursorReadNullOverflowError.from(this);
        return i;
    }
    getNulledOrThrow() {
        return this.getOrThrow(this.getNullOrThrow());
    }
    readNulledOrThrow() {
        return this.readOrThrow(this.getNullOrThrow());
    }
    writeNulledOrThrow(array) {
        this.writeOrThrow(array);
        this.writeUint8OrThrow(0);
    }
    /**
     * Write an array to the bytes
     * @param array array
     */
    writeOrThrow(array) {
        this.setOrThrow(array);
        this.offset += array.length;
    }
    getUint8OrThrow() {
        return this.data.getUint8(this.offset);
    }
    readUint8OrThrow() {
        const x = this.getUint8OrThrow();
        this.offset++;
        return x;
    }
    setUint8OrThrow(x) {
        this.data.setUint8(this.offset, x);
    }
    writeUint8OrThrow(x) {
        this.setUint8OrThrow(x);
        this.offset++;
    }
    getInt8OrThrow() {
        return this.data.getInt8(this.offset);
    }
    readInt8OrThrow() {
        const x = this.getInt8OrThrow();
        this.offset++;
        return x;
    }
    setInt8OrThrow(x) {
        this.data.setInt8(this.offset, x);
    }
    writeInt8OrThrow(x) {
        this.setInt8OrThrow(x);
        this.offset++;
    }
    getUint16OrThrow(littleEndian) {
        return this.data.getUint16(this.offset, littleEndian);
    }
    readUint16OrThrow(littleEndian) {
        const x = this.getUint16OrThrow(littleEndian);
        this.offset += 2;
        return x;
    }
    setUint16OrThrow(x, littleEndian) {
        this.data.setUint16(this.offset, x, littleEndian);
    }
    writeUint16OrThrow(x, littleEndian) {
        this.setUint16OrThrow(x, littleEndian);
        this.offset += 2;
    }
    getInt16OrThrow(littleEndian) {
        return this.data.getInt16(this.offset, littleEndian);
    }
    readInt16OrThrow(littleEndian) {
        const x = this.getInt16OrThrow(littleEndian);
        this.offset += 2;
        return x;
    }
    setInt16OrThrow(x, littleEndian) {
        this.data.setInt16(this.offset, x, littleEndian);
    }
    writeInt16OrThrow(x, littleEndian) {
        this.setInt16OrThrow(x, littleEndian);
        this.offset += 2;
    }
    getUint24OrThrow(littleEndian) {
        if (littleEndian) {
            return this.bytes[this.offset] | this.bytes[this.offset + 1] << 8 | this.bytes[this.offset + 2] << 16;
        }
        else {
            return this.bytes[this.offset] << 16 | this.bytes[this.offset + 1] << 8 | this.bytes[this.offset + 2];
        }
    }
    readUint24OrThrow(littleEndian) {
        const x = this.getUint24OrThrow(littleEndian);
        this.offset += 3;
        return x;
    }
    setUint24OrThrow(x, littleEndian) {
        if (littleEndian) {
            this.bytes[this.offset] = x & 255;
            this.bytes[this.offset + 1] = x >> 8 & 255;
            this.bytes[this.offset + 2] = x >> 16 & 255;
        }
        else {
            this.bytes[this.offset] = x >> 16 & 255;
            this.bytes[this.offset + 1] = x >> 8 & 255;
            this.bytes[this.offset + 2] = x & 255;
        }
    }
    writeUint24OrThrow(x, littleEndian) {
        this.setUint24OrThrow(x, littleEndian);
        this.offset += 3;
    }
    getUint32OrThrow(littleEndian) {
        return this.data.getUint32(this.offset, littleEndian);
    }
    readUint32OrThrow(littleEndian) {
        const x = this.getUint32OrThrow(littleEndian);
        this.offset += 4;
        return x;
    }
    setUint32OrThrow(x, littleEndian) {
        this.data.setUint32(this.offset, x, littleEndian);
    }
    writeUint32OrThrow(x, littleEndian) {
        this.setUint32OrThrow(x, littleEndian);
        this.offset += 4;
    }
    getInt32OrThrow(littleEndian) {
        return this.data.getInt32(this.offset, littleEndian);
    }
    readInt32OrThrow(littleEndian) {
        const x = this.getInt32OrThrow(littleEndian);
        this.offset += 4;
        return x;
    }
    setInt32OrThrow(x, littleEndian) {
        this.data.setInt32(this.offset, x, littleEndian);
    }
    writeInt32OrThrow(x, littleEndian) {
        this.setInt32OrThrow(x, littleEndian);
        this.offset += 4;
    }
    getBigUint64OrThrow(littleEndian) {
        return this.data.getBigUint64(this.offset, littleEndian);
    }
    readBigUint64OrThrow(littleEndian) {
        const x = this.getBigUint64OrThrow(littleEndian);
        this.offset += 8;
        return x;
    }
    setBigUint64OrThrow(x, littleEndian) {
        this.data.setBigUint64(this.offset, x, littleEndian);
    }
    writeBigUint64OrThrow(x, littleEndian) {
        this.setBigUint64OrThrow(x, littleEndian);
        this.offset += 8;
    }
    getBigInt64OrThrow(littleEndian) {
        return this.data.getBigInt64(this.offset, littleEndian);
    }
    readBigInt64OrThrow(littleEndian) {
        const x = this.getBigInt64OrThrow(littleEndian);
        this.offset += 8;
        return x;
    }
    setBigInt64OrThrow(x, littleEndian) {
        this.data.setBigInt64(this.offset, x, littleEndian);
    }
    writeBigInt64OrThrow(x, littleEndian) {
        this.setBigInt64OrThrow(x, littleEndian);
        this.offset += 8;
    }
    getFloat32OrThrow(littleEndian) {
        return this.data.getFloat32(this.offset, littleEndian);
    }
    readFloat32OrThrow(littleEndian) {
        const x = this.getFloat32OrThrow(littleEndian);
        this.offset += 4;
        return x;
    }
    setFloat32OrThrow(x, littleEndian) {
        this.data.setFloat32(this.offset, x, littleEndian);
    }
    writeFloat32OrThrow(x, littleEndian) {
        this.setFloat32OrThrow(x, littleEndian);
        this.offset += 4;
    }
    getFloat64OrThrow(littleEndian) {
        return this.data.getFloat64(this.offset, littleEndian);
    }
    readFloat64OrThrow(littleEndian) {
        const x = this.getFloat64OrThrow(littleEndian);
        this.offset += 8;
        return x;
    }
    setFloat64OrThrow(x, littleEndian) {
        this.data.setFloat64(this.offset, x, littleEndian);
    }
    writeFloat64OrThrow(x, littleEndian) {
        this.setFloat64OrThrow(x, littleEndian);
        this.offset += 8;
    }
};
// src/hazae41/binary/empty.ts
var Empty = class {
    constructor() {
    }
    sizeOrThrow() {
        return 0;
    }
    // deno-lint-ignore no-unused-vars
    writeOrThrow(_cursor) {
        return;
    }
    cloneOrThrow() {
        return this;
    }
};
((Empty4) => {
    function readOrThrow(_cursor) {
        return new Empty4();
    }
    Empty4.readOrThrow = readOrThrow;
})(Empty || (Empty = {}));
// src/hazae41/binary/readable.ts
var ReadUnderflowError = class _ReadUnderflowError extends Error {
    constructor(cursorOffset, cursorLength) {
        super(`Cursor has ${cursorLength - cursorOffset} remaining bytes after read`);
        this.cursorOffset = cursorOffset;
        this.cursorLength = cursorLength;
    }
    #class = _ReadUnderflowError;
    name = this.#class.name;
    static from(cursor) {
        return new _ReadUnderflowError(cursor.offset, cursor.length);
    }
};
var Readable;
((Readable6) => {
    function readOrRollbackAndThrow(readable, cursor) {
        const offset = cursor.offset;
        try {
            return readable.readOrThrow(cursor);
        }
        catch (e) {
            cursor.offset = offset;
            throw e;
        }
    }
    Readable6.readOrRollbackAndThrow = readOrRollbackAndThrow;
    function readFromBytesOrNull(readable, bytes) {
        try {
            const cursor = new Cursor(bytes);
            const output = readable.readOrThrow(cursor);
            if (cursor.remaining)
                return void 0;
            return output;
        }
        catch {
            return;
        }
    }
    Readable6.readFromBytesOrNull = readFromBytesOrNull;
    function readFromBytesOrThrow(readable, bytes) {
        const cursor = new Cursor(bytes);
        const output = readable.readOrThrow(cursor);
        if (cursor.remaining)
            throw ReadUnderflowError.from(cursor);
        return output;
    }
    Readable6.readFromBytesOrThrow = readFromBytesOrThrow;
})(Readable || (Readable = {}));
// src/hazae41/binary/writable.ts
var WriteUnderflowError = class _WriteUnderflowError extends Error {
    constructor(cursorOffset, cursorLength) {
        super(`Cursor has ${cursorLength - cursorOffset} remaining bytes after write`);
        this.cursorOffset = cursorOffset;
        this.cursorLength = cursorLength;
    }
    #class = _WriteUnderflowError;
    name = this.#class.name;
    static from(cursor) {
        return new _WriteUnderflowError(cursor.offset, cursor.length);
    }
};
var Writable;
((Writable23) => {
    function writeToBytesOrThrow2(writable) {
        const size = writable.sizeOrThrow();
        const bytes = Bytes.alloc(size);
        const cursor = new Cursor(bytes);
        writable.writeOrThrow(cursor);
        if (cursor.remaining)
            throw WriteUnderflowError.from(cursor);
        return bytes;
    }
    Writable23.writeToBytesOrThrow = writeToBytesOrThrow2;
})(Writable || (Writable = {}));
// src/hazae41/binary/Unknown.ts
var Unknown = class _Unknown {
    constructor(bytes) {
        this.bytes = bytes;
    }
    sizeOrThrow() {
        return this.bytes.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.bytes);
    }
    cloneOrThrow() {
        return new _Unknown(Bytes.from(this.bytes));
    }
    readIntoOrThrow(readable) {
        return Readable.readFromBytesOrThrow(readable, this.bytes);
    }
};
((Unknown5) => {
    function readOrThrow(cursor) {
        return new Unknown5(cursor.readOrThrow(cursor.remaining));
    }
    Unknown5.readOrThrow = readOrThrow;
    function writeFromOrThrow(writable) {
        if (writable instanceof Unknown5)
            return writable;
        return new Unknown5(Writable.writeToBytesOrThrow(writable));
    }
    Unknown5.writeFromOrThrow = writeFromOrThrow;
})(Unknown || (Unknown = {}));
// src/hazae41/cadenas/mods/binary/records/generic_ciphers/aead/aead.ts
var GenericAEADCipher = class _GenericAEADCipher {
    constructor(nonce_explicit, block) {
        this.nonce_explicit = nonce_explicit;
        this.block = block;
    }
    sizeOrThrow() {
        return this.nonce_explicit.length + this.block.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.nonce_explicit);
        cursor.writeOrThrow(this.block);
    }
    static readOrThrow(cursor) {
        const nonce_explicit = Bytes.from(cursor.readOrThrow(8));
        const block = Bytes.from(cursor.readOrThrow(cursor.remaining));
        return new _GenericAEADCipher(nonce_explicit, block);
    }
    static async encryptOrThrow(record, encrypter, sequence) {
        const nonce = new Cursor(Bytes.alloc(encrypter.fixed_iv_length + 8));
        nonce.writeOrThrow(encrypter.secrets.client_write_IV);
        nonce.writeBigUint64OrThrow(sequence);
        nonce.offset = 0;
        Bytes.from(nonce.readOrThrow(4));
        const nonce_explicit = Bytes.from(nonce.readOrThrow(8));
        const content = Writable.writeToBytesOrThrow(record.fragment);
        const additional_data = new Cursor(Bytes.alloc(8 + 1 + 2 + 2));
        additional_data.writeBigUint64OrThrow(sequence);
        additional_data.writeUint8OrThrow(record.type);
        additional_data.writeUint16OrThrow(record.version);
        additional_data.writeUint16OrThrow(record.fragment.sizeOrThrow());
        const ciphertext = await encrypter.encryptOrThrow(nonce.bytes, content, additional_data.bytes);
        return new _GenericAEADCipher(nonce_explicit, ciphertext);
    }
    async decryptOrThrow(record, encrypter, sequence) {
        const nonce = new Cursor(Bytes.alloc(encrypter.fixed_iv_length + 8));
        nonce.writeOrThrow(encrypter.secrets.server_write_IV);
        nonce.writeOrThrow(this.nonce_explicit);
        const additional_data = new Cursor(Bytes.alloc(8 + 1 + 2 + 2));
        additional_data.writeBigUint64OrThrow(sequence);
        additional_data.writeUint8OrThrow(record.type);
        additional_data.writeUint16OrThrow(record.version);
        additional_data.writeUint16OrThrow(record.fragment.sizeOrThrow() - 24);
        const plaintext = await encrypter.decryptOrThrow(nonce.bytes, this.block, additional_data.bytes);
        return new Unknown(plaintext);
    }
};
// src/hazae41/cadenas/mods/binary/records/generic_ciphers/block/block.ts
function modulup(x, m) {
    return (m - (x + m) % m) % m;
}
var GenericBlockCipher = class _GenericBlockCipher {
    constructor(iv, block) {
        this.iv = iv;
        this.block = block;
    }
    sizeOrThrow() {
        return this.iv.length + this.block.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.iv);
        cursor.writeOrThrow(this.block);
    }
    static readOrThrow(cursor) {
        const iv = cursor.readAndCopyOrThrow(16);
        const block = cursor.readAndCopyOrThrow(cursor.remaining);
        return new _GenericBlockCipher(iv, block);
    }
    static async encryptOrThrow(record, encrypter, sequence) {
        const iv = Bytes.random(16);
        const content = Writable.writeToBytesOrThrow(record.fragment);
        const premac = new Cursor(Bytes.alloc(8 + record.sizeOrThrow()));
        premac.writeBigUint64OrThrow(sequence);
        record.writeOrThrow(premac);
        const mac = await encrypter.macher.writeOrThrow(premac.bytes);
        const length = content.length + mac.length;
        const padding_length = modulup(length + 1, 16);
        const padding = Bytes.alloc(padding_length + 1);
        padding.fill(padding_length);
        const plaintext = Bytes.concat(content, mac, padding);
        const ciphertext = await encrypter.encryptOrThrow(iv, plaintext);
        return new _GenericBlockCipher(iv, ciphertext);
    }
    async decryptOrThrow(record, encrypter, _sequence) {
        const plaintext = await encrypter.decryptOrThrow(this.iv, this.block);
        const content = plaintext.subarray(0, -encrypter.macher.mac_length);
        plaintext.subarray(-encrypter.macher.mac_length);
        return new Unknown(content);
    }
};
// src/hazae41/cadenas/mods/binary/records/record.ts
var Record;
((Record2) => {
    Record2.types = {
        invalid: 0,
        change_cipher_spec: 20,
        alert: 21,
        handshake: 22,
        application_data: 23
    };
})(Record || (Record = {}));
var PlaintextRecord = class _PlaintextRecord {
    constructor(type, version, fragment) {
        this.type = type;
        this.version = version;
        this.fragment = fragment;
    }
    static from(record, version) {
        return new _PlaintextRecord(record.record_type, version, record);
    }
    sizeOrThrow() {
        return 1 + 2 + 2 + this.fragment.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
        cursor.writeUint16OrThrow(this.version);
        const size = this.fragment.sizeOrThrow();
        cursor.writeUint16OrThrow(size);
        this.fragment.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const type = cursor.readUint8OrThrow();
        const version = cursor.readUint16OrThrow();
        const size = cursor.readUint16OrThrow();
        const bytes = cursor.readAndCopyOrThrow(size);
        const fragment = new Unknown(bytes);
        return new _PlaintextRecord(type, version, fragment);
    }
    async #encryptBlockOrThrow(encrypter, sequence) {
        const fragment = await GenericBlockCipher.encryptOrThrow(this, encrypter, sequence);
        return new BlockCiphertextRecord(this.type, this.version, fragment);
    }
    async #encryptAeadOrThrow(encrypter, sequence) {
        const fragment = await GenericAEADCipher.encryptOrThrow(this, encrypter, sequence);
        return new AEADCiphertextRecord(this.type, this.version, fragment);
    }
    async encryptOrThrow(encrypter, sequence) {
        if (encrypter.cipher_type === "block")
            return this.#encryptBlockOrThrow(encrypter, sequence);
        if (encrypter.cipher_type === "aead")
            return this.#encryptAeadOrThrow(encrypter, sequence);
        throw new Error(`Invalid cipher type`);
    }
};
var BlockCiphertextRecord = class _BlockCiphertextRecord {
    constructor(type, version, fragment) {
        this.type = type;
        this.version = version;
        this.fragment = fragment;
    }
    static fromOrThrow(record) {
        const fragment = record.fragment.readIntoOrThrow(GenericBlockCipher);
        return new _BlockCiphertextRecord(record.type, record.version, fragment);
    }
    sizeOrThrow() {
        return 1 + 2 + 2 + this.fragment.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
        cursor.writeUint16OrThrow(this.version);
        const size = this.fragment.sizeOrThrow();
        cursor.writeUint16OrThrow(size);
        this.fragment.writeOrThrow(cursor);
    }
    async decryptOrThrow(encrypter, sequence) {
        const fragment = await this.fragment.decryptOrThrow(this, encrypter, sequence);
        return new PlaintextRecord(this.type, this.version, fragment);
    }
};
var AEADCiphertextRecord = class _AEADCiphertextRecord {
    constructor(type, version, fragment) {
        this.type = type;
        this.version = version;
        this.fragment = fragment;
    }
    static fromOrThrow(record) {
        const fragment = record.fragment.readIntoOrThrow(GenericAEADCipher);
        return new _AEADCiphertextRecord(record.type, record.version, fragment);
    }
    sizeOrThrow() {
        return 1 + 2 + 2 + this.fragment.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
        cursor.writeUint16OrThrow(this.version);
        const size = this.fragment.sizeOrThrow();
        cursor.writeUint16OrThrow(size);
        this.fragment.writeOrThrow(cursor);
    }
    async decryptOrThrow(encrypter, sequence) {
        const fragment = await this.fragment.decryptOrThrow(this, encrypter, sequence);
        return new PlaintextRecord(this.type, this.version, fragment);
    }
};
// src/hazae41/cadenas/mods/binary/records/alerts/alert.ts
var Alert = class _Alert {
    constructor(level, description) {
        this.level = level;
        this.description = description;
    }
    #class = _Alert;
    static record_type = Record.types.alert;
    static levels = {
        warning: 1,
        fatal: 2
    };
    static descriptions = {
        close_notify: 0,
        unexpected_message: 10,
        bad_record_mac: 20,
        record_overflow: 22,
        handshake_failure: 40,
        bad_certificate: 42,
        unsupported_certificate: 43,
        certificate_revoked: 44,
        certificate_expired: 45,
        certificate_unknown: 46,
        illegal_parameter: 47,
        unknown_ca: 48,
        access_denied: 49,
        decode_error: 50,
        decrypt_error: 51,
        protocol_version: 70,
        insufficient_security: 71,
        internal_error: 80,
        inappropriate_fallback: 86,
        user_canceled: 90,
        missing_extension: 109,
        unsupported_extension: 110,
        unrecognized_name: 112,
        bad_certificate_status_response: 113,
        unknown_psk_identity: 115,
        certificate_required: 116,
        no_application_protocol: 120
    };
    get record_type() {
        return this.#class.record_type;
    }
    sizeOrThrow() {
        return 2;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.level);
        cursor.writeUint8OrThrow(this.description);
    }
    static readOrThrow(cursor) {
        const level = cursor.readUint8OrThrow();
        const description = cursor.readUint8OrThrow();
        return new _Alert(level, description);
    }
};
// src/hazae41/cadenas/mods/binary/records/change_cipher_spec/change_cipher_spec.ts
var ChangeCipherSpec = class _ChangeCipherSpec {
    constructor(type = _ChangeCipherSpec.types.change_cipher_spec) {
        this.type = type;
    }
    #class = _ChangeCipherSpec;
    static record_type = Record.types.change_cipher_spec;
    static types = {
        change_cipher_spec: 1
    };
    static new(type) {
        return new _ChangeCipherSpec(type);
    }
    get record_type() {
        return this.#class.record_type;
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        return cursor.writeUint8OrThrow(this.type);
    }
    static readOrThrow(cursor) {
        return new _ChangeCipherSpec(cursor.readUint8OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/handshake.ts
var Handshake = class _Handshake {
    constructor(type, fragment) {
        this.type = type;
        this.fragment = fragment;
    }
    #class = _Handshake;
    static record_type = Record.types.handshake;
    static types = {
        hello_request: 0,
        client_hello: 1,
        server_hello: 2,
        certificate: 11,
        server_key_exchange: 12,
        certificate_request: 13,
        server_hello_done: 14,
        certificate_verify: 15,
        client_key_exchange: 16,
        finished: 20
    };
    static from(handshake) {
        return new _Handshake(handshake.handshake_type, handshake);
    }
    get record_type() {
        return this.#class.record_type;
    }
    sizeOrThrow() {
        return 1 + 3 + this.fragment.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
        const size = this.fragment.sizeOrThrow();
        cursor.writeUint24OrThrow(size);
        this.fragment.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const type = cursor.readUint8OrThrow();
        const size = cursor.readUint24OrThrow();
        const bytes = cursor.readAndCopyOrThrow(size);
        const fragment = new Unknown(bytes);
        return new _Handshake(type, fragment);
    }
};
// src/hazae41/cadenas/mods/binary/vectors/writable.ts
var Vector = ($length) => class {
    constructor(value) {
        this.value = value;
    }
    static from(value) {
        return new this(value);
    }
    get length() {
        return $length;
    }
    sizeOrThrow() {
        return $length.size + this.value.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        const size = this.value.sizeOrThrow();
        new $length(size).writeOrThrow(cursor);
        this.value.writeOrThrow(cursor);
    }
};
// src/hazae41/cadenas/mods/binary/vectors/readable.ts
var ReadableVector = ($length, $readable) => class {
    static readOrThrow(cursor) {
        const length = $length.readOrThrow(cursor).value;
        const bytes = cursor.readOrThrow(length);
        const value = Readable.readFromBytesOrThrow($readable, bytes);
        return new (Vector($length))(value);
    }
};
// src/hazae41/binary/safe-unknown.ts
var SafeUnknown = class _SafeUnknown {
    constructor(bytes) {
        this.bytes = bytes;
    }
    sizeOrThrow() {
        return this.bytes.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.bytes);
    }
    cloneOrThrow() {
        return new _SafeUnknown(Bytes.from(this.bytes));
    }
    readIntoOrThrow(readable) {
        return Readable.readFromBytesOrThrow(readable, Bytes.from(this.bytes));
    }
};
((SafeUnknown2) => {
    function readOrThrow(cursor) {
        return new SafeUnknown2(Bytes.from(cursor.readOrThrow(cursor.remaining)));
    }
    SafeUnknown2.readOrThrow = readOrThrow;
    function writeFromOrThrow(writable) {
        if (writable instanceof SafeUnknown2)
            return writable.cloneOrThrow();
        return new SafeUnknown2(Writable.writeToBytesOrThrow(writable));
    }
    SafeUnknown2.writeFromOrThrow = writeFromOrThrow;
})(SafeUnknown || (SafeUnknown = {}));
// src/hazae41/cadenas/mods/binary/records/handshakes/certificate/certificate2.ts
var Certificate2 = class _Certificate2 {
    constructor(certificate_list) {
        this.certificate_list = certificate_list;
    }
    #class = _Certificate2;
    static handshake_type = Handshake.types.certificate;
    get handshake_type() {
        return this.#class.handshake_type;
    }
    sizeOrThrow() {
        return this.certificate_list.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        return this.certificate_list.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const opaque_vector24 = ReadableVector(Number24, SafeUnknown);
        const opaque_vector24_list = ReadableList(opaque_vector24);
        const opaque_vector_list_vector24 = ReadableVector(Number24, opaque_vector24_list);
        const certificate_list = opaque_vector_list_vector24.readOrThrow(cursor);
        return new _Certificate2(certificate_list);
    }
};
// src/hazae41/cadenas/mods/binary/signatures/hash_algorithm.ts
var HashAlgorithm = class _HashAlgorithm {
    constructor(type) {
        this.type = type;
    }
    static types = {
        none: 0,
        md5: 1,
        sha1: 2,
        sha224: 3,
        sha256: 4,
        sha384: 5,
        sha512: 6,
        intrinsic: 8
    };
    static instances = {
        none: new _HashAlgorithm(_HashAlgorithm.types.none),
        md5: new _HashAlgorithm(_HashAlgorithm.types.md5),
        sha1: new _HashAlgorithm(_HashAlgorithm.types.sha1),
        sha224: new _HashAlgorithm(_HashAlgorithm.types.sha224),
        sha256: new _HashAlgorithm(_HashAlgorithm.types.sha256),
        sha384: new _HashAlgorithm(_HashAlgorithm.types.sha384),
        sha512: new _HashAlgorithm(_HashAlgorithm.types.sha512),
        intrinsic: new _HashAlgorithm(_HashAlgorithm.types.intrinsic)
    };
    static new(type) {
        return new _HashAlgorithm(type);
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        return cursor.writeUint8OrThrow(this.type);
    }
    static readOrThrow(cursor) {
        return new _HashAlgorithm(cursor.readUint8OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/signatures/signature_algorithm.ts
var SignatureAlgorithm = class _SignatureAlgorithm {
    constructor(type) {
        this.type = type;
    }
    static types = {
        anonymous: 0,
        rsa: 1,
        dsa: 2,
        ecdsa: 3,
        ed25519: 7,
        ed448: 8
    };
    static instances = {
        anonymous: new _SignatureAlgorithm(_SignatureAlgorithm.types.anonymous),
        rsa: new _SignatureAlgorithm(_SignatureAlgorithm.types.rsa),
        dsa: new _SignatureAlgorithm(_SignatureAlgorithm.types.dsa),
        ecdsa: new _SignatureAlgorithm(_SignatureAlgorithm.types.ecdsa),
        ed25519: new _SignatureAlgorithm(_SignatureAlgorithm.types.ed25519),
        ed448: new _SignatureAlgorithm(_SignatureAlgorithm.types.ed448)
    };
    static new(type) {
        return new _SignatureAlgorithm(type);
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        return cursor.writeUint8OrThrow(this.type);
    }
    static readOrThrow(cursor) {
        return new _SignatureAlgorithm(cursor.readUint8OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/signatures/signature_and_hash_algorithm.ts
var SignatureAndHashAlgorithm = class _SignatureAndHashAlgorithm {
    constructor(hash, signature) {
        this.hash = hash;
        this.signature = signature;
    }
    static instances = {
        rsa_pkcs1_sha256: new this(HashAlgorithm.instances.sha256, SignatureAlgorithm.instances.rsa),
        ecdsa_secp256r1_sha256: new this(HashAlgorithm.instances.sha256, SignatureAlgorithm.instances.ecdsa),
        ed25519: new this(HashAlgorithm.instances.intrinsic, SignatureAlgorithm.instances.ed25519),
        ed448: new this(HashAlgorithm.instances.intrinsic, SignatureAlgorithm.instances.ed448)
    };
    sizeOrThrow() {
        return this.hash.sizeOrThrow() + this.signature.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.hash.writeOrThrow(cursor);
        this.signature.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const hash = HashAlgorithm.readOrThrow(cursor);
        const signature = SignatureAlgorithm.readOrThrow(cursor);
        return new _SignatureAndHashAlgorithm(hash, signature);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/certificate_request/certificate_request2.ts
var ClientCertificateType = class _ClientCertificateType {
    constructor(type) {
        this.type = type;
    }
    static types = {
        rsa_sign: 1,
        dss_sign: 2,
        rsa_fixed_dh: 3,
        dss_fixed_dh: 4,
        rsa_ephemeral_dh_RESERVED: 5,
        dss_ephemeral_dh_RESERVED: 6,
        fortezza_dms_RESERVED: 20
    };
    static new(type) {
        return new _ClientCertificateType(type);
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
    }
    static readOrThrow(cursor) {
        return new _ClientCertificateType(cursor.readUint8OrThrow());
    }
};
var CertificateRequest2 = class _CertificateRequest2 {
    constructor(certificate_types, supported_signature_algorithms, certificate_authorities) {
        this.certificate_types = certificate_types;
        this.supported_signature_algorithms = supported_signature_algorithms;
        this.certificate_authorities = certificate_authorities;
    }
    static type = Handshake.types.certificate_request;
    sizeOrThrow() {
        return 0 + this.certificate_types.sizeOrThrow() + this.supported_signature_algorithms.sizeOrThrow() + this.certificate_authorities.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.certificate_types.writeOrThrow(cursor);
        this.supported_signature_algorithms.writeOrThrow(cursor);
        this.certificate_authorities.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const certificate_types = ReadableVector(Number8, ReadableList(ClientCertificateType)).readOrThrow(cursor);
        const supported_signature_algorithms = ReadableVector(Number16, ReadableList(SignatureAndHashAlgorithm)).readOrThrow(cursor);
        const certificate_authorities = ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
        return new _CertificateRequest2(certificate_types, supported_signature_algorithms, certificate_authorities);
    }
};
// src/hazae41/option/mods/option/none.ts
var NoneError = class extends Error {
    constructor() {
        super(`Option is a None`);
    }
};
var None = class _None {
    /**
     * An empty value
     */
    constructor(inner = void 0) {
        this.inner = inner;
    }
    static create() {
        return new _None();
    }
    static from(_init) {
        return new _None();
    }
    /**
     * Returns an iterator over the possibly contained value
     * @yields `this.inner` if `Some`
     */
    // eslint-disable-next-line require-yield
    *[Symbol.iterator]() {
        return;
    }
    /**
     * Type guard for `Some`
     * @returns `true` if `Some`, `false` if `None`
     */
    isSome() {
        return false;
    }
    /**
     * Returns `true` if the option is a `Some` and the value inside of it matches a predicate
     * @param somePredicate
     * @returns `true` if `Some` and `await somePredicate(this.inner)`, `None` otherwise
     */
    async isSomeAnd(_somePredicate) {
        return false;
    }
    /**
     * Returns `true` if the option is a `Some` and the value inside of it matches a predicate
     * @param somePredicate
     * @returns `true` if `Some` and `somePredicate(this.inner)`, `None` otherwise
     */
    isSomeAndSync(_somePredicate) {
        return false;
    }
    /**
     * Type guard for `None`
     * @returns `true` if `None`, `false` if `Some`
     */
    isNone() {
        return true;
    }
    /**
     * Compile-time safely get `this.inner`
     * @returns `this.inner`
     */
    get() {
        throw new Error("Panic");
    }
    /**
     * Get the inner value or throw an error
     * @returns
     */
    getOrThrow() {
        throw new NoneError();
    }
    /**
     * Get the inner value or `null`
     * @returns
     */
    getOrNull() {
        return;
    }
    /**
     * Get the inner value or a default one
     * @param value
     * @returns `this.inner` if `Some`, `value` if `None`
     */
    getOr(value) {
        return value;
    }
    /**
     * Returns the contained `Some` value or computes it from a closure
     * @param noneCallback
     * @returns `this.inner` if `Some`, `await noneCallback()` if `None`
     */
    async getOrElse(noneCallback) {
        return await noneCallback();
    }
    /**
     * Returns the contained `Some` value or computes it from a closure
     * @param noneCallback
     * @returns `this.inner` if `Some`, `noneCallback()` if `None`
     */
    getOrElseSync(noneCallback) {
        return noneCallback();
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `somePredicate` with the wrapped value
     * @param somePredicate
     * @returns `Some` if `Some` and `await somePredicate(this.inner)`, `None` otherwise
     */
    async filter(_somePredicate) {
        return this;
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `somePredicate` with the wrapped value
     * @param somePredicate
     * @returns `Some` if `Some` and `somePredicate(this.inner)`, `None` otherwise
     */
    filterSync(_somePredicate) {
        return this;
    }
    /**
     * Transform `Option<Promise<T>>` into `Promise<Option<T>>`
     * @returns `Promise<Option<T>>`
     */
    async await() {
        return this;
    }
    /**
     * Returns `true` if the option is a `Some` value containing the given value
     * @param value
     * @returns `true` if `Some` and `this.inner === value`, `None` otherwise
     */
    contains(_value) {
        return false;
    }
    /**
     * Calls the given callback with the inner value if `Ok`
     * @param someCallback
     * @returns `this`
     */
    async inspect(_someCallback) {
        return this;
    }
    /**
     * Calls the given callback with the inner value if `Ok`
     * @param someCallback
     * @returns `this`
     */
    inspectSync(_someCallback) {
        return this;
    }
    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`) or returns `None` (if `None`)
     * @param someMapper
     * @returns `Some(await someMapper(this.inner))` if `Some`, `this` if `None`
     */
    async map(_someMapper) {
        return this;
    }
    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`) or returns `None` (if `None`)
     * @param someMapper
     * @returns `Some(someMapper(this.inner))` if `Some`, `this` if `None`
     */
    mapSync(_someMapper) {
        return this;
    }
    /**
     * Returns the provided default result (if none), or applies a function to the contained value (if any)
     * @param value
     * @param someMapper
     * @returns `value` if `None`, `await someMapper(this.inner)` if `Some`
     */
    async mapOr(value, _someMapper) {
        return value;
    }
    /**
     * Returns the provided default result (if none), or applies a function to the contained value (if any)
     * @param value
     * @param someMapper
     * @returns `value` if `None`, `someMapper(this.inner)` if `Some`
     */
    mapOrSync(value, _someMapper) {
        return value;
    }
    /**
     * Computes a default function result (if none), or applies a different function to the contained value (if any)
     * @param noneCallback
     * @param someMapper
     * @returns `await someMapper(this.inner)` if `Some`, `await noneCallback()` if `None`
     */
    async mapOrElse(noneCallback, _someMapper) {
        return await noneCallback();
    }
    /**
     * Computes a default function result (if none), or applies a different function to the contained value (if any)
     * @param noneCallback
     * @param someMapper
     * @returns `someMapper(this.inner)` if `Some`, `noneCallback()` if `None`
     */
    mapOrElseSync(noneCallback, _someMapper) {
        return noneCallback();
    }
    /**
     * Returns `None` if the option is `None`, otherwise returns `value`
     * @param value
     * @returns `None` if `None`, `value` if `Some`
     */
    and(_value) {
        return this;
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `someMapper` with the wrapped value and returns the result
     * @param someMapper
     * @returns `None` if `None`, `await someMapper(this.inner)` if `Some`
     */
    async andThen(_someMapper) {
        return this;
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `someMapper` with the wrapped value and returns the result
     * @param someMapper
     * @returns `None` if `None`, `someMapper(this.inner)` if `Some`
     */
    andThenSync(_someMapper) {
        return this;
    }
    /**
     * Returns `this` if `Some`, otherwise returns `value`
     * @param value
     * @returns `this` if `Some`, `value` if `None`
     */
    or(value) {
        return value;
    }
    /**
     * Returns `this` if `Some`, otherwise calls `noneCallback` and returns the result
     * @param noneCallback
     * @returns `this` if `Some`, `await noneCallback()` if `None`
     */
    async orElse(noneCallback) {
        return await noneCallback();
    }
    /**
     * Returns `this` if `Some`, otherwise calls `noneCallback` and returns the result
     * @param noneCallback
     * @returns `this` if `Some`, `noneCallback()` if `None`
     */
    orElseSync(noneCallback) {
        return noneCallback();
    }
    /**
     * Returns `Some` if exactly one of the options is `Some`, otherwise returns `None`
     * @param value
     * @returns `None` if both are `Some` or both are `None`, the only `Some` otherwise
     */
    xor(value) {
        return value;
    }
    /**
     * Zips `this` with another `Option`
     * @param other
     * @returns `Some([this.inner, other.inner])` if both are `Some`, `None` if one of them is `None`
     */
    zip(_other) {
        return this;
    }
};
// src/hazae41/option/mods/option/some.ts
var Some = class _Some {
    /**
     * An existing value
     * @param inner
     */
    constructor(inner) {
        this.inner = inner;
    }
    static create(inner) {
        return new _Some(inner);
    }
    static from(init) {
        return new _Some(init.inner);
    }
    /**
     * Returns an iterator over the possibly contained value
     * @yields `this.inner` if `Some`
     */
    *[Symbol.iterator]() {
        yield this.inner;
    }
    /**
     * Type guard for `Some`
     * @returns `true` if `Some`, `false` if `None`
     */
    isSome() {
        return true;
    }
    /**
     * Returns `true` if the option is a `Some` and the value inside of it matches a predicate
     * @param somePredicate
     * @returns `true` if `Some` and `await somePredicate(this.inner)`, `None` otherwise
     */
    async isSomeAnd(somePredicate) {
        return await somePredicate(this.inner);
    }
    /**
     * Returns `true` if the option is a `Some` and the value inside of it matches a predicate
     * @param somePredicate
     * @returns `true` if `Some` and `somePredicate(this.inner)`, `None` otherwise
     */
    isSomeAndSync(somePredicate) {
        return somePredicate(this.inner);
    }
    /**
     * Type guard for `None`
     * @returns `true` if `None`, `false` if `Some`
     */
    isNone() {
        return false;
    }
    /**
     * Compile-time safely get `this.inner`
     * @returns `this.inner`
     */
    get() {
        return this.inner;
    }
    /**
     * Get the inner value or throw an error
     * @returns
     */
    getOrThrow() {
        return this.inner;
    }
    /**
     * Get the inner value or `null`
     * @returns
     */
    getOrNull() {
        return this.inner;
    }
    /**
     * Get the inner value or a default one
     * @param value
     * @returns `this.inner` if `Some`, `value` if `None`
     */
    getOr(_value) {
        return this.inner;
    }
    /**
     * Returns the contained `Some` value or computes it from a closure
     * @param noneCallback
     * @returns `this.inner` if `Some`, `await noneCallback()` if `None`
     */
    async getOrElse(_noneCallback) {
        return this.inner;
    }
    /**
     * Returns the contained `Some` value or computes it from a closure
     * @param noneCallback
     * @returns `this.inner` if `Some`, `noneCallback()` if `None`
     */
    getOrElseSync(_noneCallback) {
        return this.inner;
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `somePredicate` with the wrapped value
     * @param somePredicate
     * @returns `Some` if `Some` and `await somePredicate(this.inner)`, `None` otherwise
     */
    async filter(somePredicate) {
        if (await somePredicate(this.inner))
            return this;
        else
            return new None();
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `somePredicate` with the wrapped value
     * @param somePredicate
     * @returns `Some` if `Some` and `somePredicate(this.inner)`, `None` otherwise
     */
    filterSync(somePredicate) {
        if (somePredicate(this.inner))
            return this;
        else
            return new None();
    }
    /**
     * Transform `Option<Promise<T>>` into `Promise<Option<T>>`
     * @returns `Promise<Option<T>>`
     */
    async await() {
        return new _Some(await this.inner);
    }
    /**
     * Returns `true` if the option is a `Some` value containing the given value
     * @param value
     * @returns `true` if `Some` and `this.inner === value`, `None` otherwise
     */
    contains(value) {
        return this.inner === value;
    }
    /**
     * Calls the given callback with the inner value if `Ok`
     * @param someCallback
     * @returns `this`
     */
    async inspect(someCallback) {
        await someCallback(this.inner);
        return this;
    }
    /**
     * Calls the given callback with the inner value if `Ok`
     * @param someCallback
     * @returns `this`
     */
    inspectSync(someCallback) {
        someCallback(this.inner);
        return this;
    }
    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`) or returns `None` (if `None`)
     * @param someMapper
     * @returns `Some(await someMapper(this.inner))` if `Some`, `this` if `None`
     */
    async map(someMapper) {
        return new _Some(await someMapper(this.inner));
    }
    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`) or returns `None` (if `None`)
     * @param someMapper
     * @returns `Some(someMapper(this.inner))` if `Some`, `this` if `None`
     */
    mapSync(someMapper) {
        return new _Some(someMapper(this.inner));
    }
    /**
     * Returns the provided default result (if none), or applies a function to the contained value (if any)
     * @param value
     * @param someMapper
     * @returns `value` if `None`, `await someMapper(this.inner)` if `Some`
     */
    async mapOr(value, someMapper) {
        return await someMapper(this.inner);
    }
    /**
     * Returns the provided default result (if none), or applies a function to the contained value (if any)
     * @param value
     * @param someMapper
     * @returns `value` if `None`, `someMapper(this.inner)` if `Some`
     */
    mapOrSync(value, someMapper) {
        return someMapper(this.inner);
    }
    /**
     * Computes a default function result (if none), or applies a different function to the contained value (if any)
     * @param noneCallback
     * @param someMapper
     * @returns `await someMapper(this.inner)` if `Some`, `await noneCallback()` if `None`
     */
    async mapOrElse(noneCallback, someMapper) {
        return await someMapper(this.inner);
    }
    /**
     * Computes a default function result (if none), or applies a different function to the contained value (if any)
     * @param noneCallback
     * @param someMapper
     * @returns `someMapper(this.inner)` if `Some`, `noneCallback()` if `None`
     */
    mapOrElseSync(noneCallback, someMapper) {
        return someMapper(this.inner);
    }
    /**
     * Returns `None` if the option is `None`, otherwise returns `value`
     * @param value
     * @returns `None` if `None`, `value` if `Some`
     */
    and(value) {
        return value;
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `someMapper` with the wrapped value and returns the result
     * @param someMapper
     * @returns `None` if `None`, `await someMapper(this.inner)` if `Some`
     */
    async andThen(someMapper) {
        return await someMapper(this.inner);
    }
    /**
     * Returns `None` if the option is `None`, otherwise calls `someMapper` with the wrapped value and returns the result
     * @param someMapper
     * @returns `None` if `None`, `someMapper(this.inner)` if `Some`
     */
    andThenSync(someMapper) {
        return someMapper(this.inner);
    }
    /**
     * Returns `this` if `Some`, otherwise returns `value`
     * @param value
     * @returns `this` if `Some`, `value` if `None`
     */
    or(_value) {
        return this;
    }
    /**
     * Returns `this` if `Some`, otherwise calls `noneCallback` and returns the result
     * @param noneCallback
     * @returns `this` if `Some`, `await noneCallback()` if `None`
     */
    async orElse(_noneCallback) {
        return this;
    }
    /**
     * Returns `this` if `Some`, otherwise calls `noneCallback` and returns the result
     * @param noneCallback
     * @returns `this` if `Some`, `noneCallback()` if `None`
     */
    orElseSync(_noneCallback) {
        return this;
    }
    /**
     * Returns `Some` if exactly one of the options is `Some`, otherwise returns `None`
     * @param value
     * @returns `None` if both are `Some` or both are `None`, the only `Some` otherwise
     */
    xor(value) {
        if (value.isSome())
            return new None();
        else
            return this;
    }
    /**
     * Zips `this` with another `Option`
     * @param other
     * @returns `Some([this.inner, other.inner])` if both are `Some`, `None` if one of them is `None`
     */
    zip(other) {
        if (other.isSome())
            return new _Some([this.inner, other.inner]);
        else
            return other;
    }
};
// src/hazae41/option/mods/option/option.ts
var Option;
((Option5) => {
    function from(init) {
        if ("inner" in init)
            return new Some(init.inner);
        return new None();
    }
    Option5.from = from;
    function wrap(inner) {
        if (inner == null)
            return new None();
        return new Some(inner);
    }
    Option5.wrap = wrap;
})(Option || (Option = {}));
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/ec_point_formats/ec_point_format.ts
var ECPointFormat = class _ECPointFormat {
    constructor(value) {
        this.value = value;
    }
    static types = {
        uncompressed: 0
        // deprecated: 1..2,
        // reserved: 248..255
    };
    static instances = {
        uncompressed: new this(this.types.uncompressed)
    };
    static new(value) {
        return new _ECPointFormat(value);
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.value);
    }
    static readOrThrow(cursor) {
        return new _ECPointFormat(cursor.readUint8OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/ec_point_formats/ec_point_format_list.ts
var ECPointFormatList = class _ECPointFormatList {
    constructor(ec_point_format_list) {
        this.ec_point_format_list = ec_point_format_list;
    }
    static new(ec_point_format_list) {
        return new _ECPointFormatList(ec_point_format_list);
    }
    static default() {
        const { uncompressed } = ECPointFormat.instances;
        return this.from([uncompressed]);
    }
    static from(ec_point_formats) {
        const ec_point_format_list = Vector(Number8).from(List.from(ec_point_formats));
        return new this(ec_point_format_list);
    }
    sizeOrThrow() {
        return this.ec_point_format_list.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        return this.ec_point_format_list.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ECPointFormatList(ReadableVector(Number8, ReadableList(ECPointFormat)).readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/extension.ts
var Extension = class _Extension {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
    static types = {
        server_name: 0,
        elliptic_curves: 10,
        ec_point_formats: 11,
        signature_algorithms: 13
    };
    static from(extension) {
        const extension_data = Vector(Number16).from(extension);
        return new _Extension(extension.extension_type, extension_data);
    }
    sizeOrThrow() {
        return 2 + this.data.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint16OrThrow(this.type);
        this.data.writeOrThrow(cursor);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/ec_point_formats/ec_point_formats.ts
var ECPointFormats = class _ECPointFormats {
    constructor(ec_point_format_list) {
        this.ec_point_format_list = ec_point_format_list;
    }
    #class = _ECPointFormats;
    static extension_type = Extension.types.ec_point_formats;
    static new(ec_point_format_list) {
        return new _ECPointFormats(ec_point_format_list);
    }
    static default() {
        return new this(ECPointFormatList.default());
    }
    get extension_type() {
        return this.#class.extension_type;
    }
    sizeOrThrow() {
        return this.ec_point_format_list.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.ec_point_format_list.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ECPointFormats(ECPointFormatList.readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/elliptic_curves/named_curve.ts
var NamedCurve = class _NamedCurve {
    constructor(value) {
        this.value = value;
    }
    static types = {
        secp256r1: 23,
        secp384r1: 24,
        secp521r1: 25,
        x25519: 29,
        x448: 30
    };
    static instances = {
        secp256r1: new this(this.types.secp256r1),
        secp384r1: new this(this.types.secp384r1),
        secp521r1: new this(this.types.secp521r1),
        x25519: new this(this.types.x25519),
        x448: new this(this.types.x448)
    };
    static new(value) {
        return new _NamedCurve(value);
    }
    sizeOrThrow() {
        return 2;
    }
    writeOrThrow(cursor) {
        cursor.writeUint16OrThrow(this.value);
    }
    static readOrThrow(cursor) {
        return new _NamedCurve(cursor.readUint16OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/elliptic_curves/named_curve_list.ts
var NamedCurveList = class _NamedCurveList {
    constructor(named_curve_list) {
        this.named_curve_list = named_curve_list;
    }
    static new(named_curve_list) {
        return new _NamedCurveList(named_curve_list);
    }
    static default() {
        const { secp256r1, secp384r1: _1, secp521r1: _2, x25519: _3, x448: _4 } = NamedCurve.instances;
        return this.from([secp256r1]);
    }
    static from(named_curves) {
        const named_curve_list = Vector(Number16).from(List.from(named_curves));
        return new this(named_curve_list);
    }
    sizeOrThrow() {
        return this.named_curve_list.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.named_curve_list.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _NamedCurveList(ReadableVector(Number16, ReadableList(NamedCurve)).readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/elliptic_curves/elliptic_curves.ts
var EllipticCurves = class _EllipticCurves {
    constructor(named_curve_list) {
        this.named_curve_list = named_curve_list;
    }
    #class = _EllipticCurves;
    static extension_type = Extension.types.elliptic_curves;
    static new(named_curve_list) {
        return new _EllipticCurves(named_curve_list);
    }
    static default() {
        return new this(NamedCurveList.default());
    }
    get extension_type() {
        return this.#class.extension_type;
    }
    sizeOrThrow() {
        return this.named_curve_list.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        return this.named_curve_list.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _EllipticCurves(NamedCurveList.readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/signature_algorithms/signature_algorithms.ts
var SignatureAlgorithms = class _SignatureAlgorithms {
    constructor(supported_signature_algorithms) {
        this.supported_signature_algorithms = supported_signature_algorithms;
    }
    #class = _SignatureAlgorithms;
    static extension_type = Extension.types.signature_algorithms;
    static new(supported_signature_algorithms) {
        return new _SignatureAlgorithms(supported_signature_algorithms);
    }
    static from(supported_signature_algorithms_list) {
        const supported_signature_algorithms = Vector(Number16).from(List.from(supported_signature_algorithms_list));
        return new this(supported_signature_algorithms);
    }
    static default() {
        const { rsa_pkcs1_sha256, ecdsa_secp256r1_sha256, ed25519, ed448: _1 } = SignatureAndHashAlgorithm.instances;
        return this.from([rsa_pkcs1_sha256, ecdsa_secp256r1_sha256, ed25519]);
    }
    get extension_type() {
        return this.#class.extension_type;
    }
    sizeOrThrow() {
        return this.supported_signature_algorithms.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        return this.supported_signature_algorithms.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _SignatureAlgorithms(ReadableVector(Number16, ReadableList(SignatureAndHashAlgorithm)).readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/resolved.ts
var ResolvedExtension;
((ResolvedExtension2) => {
    function resolveOrThrow2(type, cursor) {
        if (type === Extension.types.signature_algorithms)
            return ReadableVector(Number16, SignatureAlgorithms).readOrThrow(cursor);
        if (type === Extension.types.elliptic_curves)
            return ReadableVector(Number16, EllipticCurves).readOrThrow(cursor);
        if (type === Extension.types.ec_point_formats)
            return ReadableVector(Number16, ECPointFormats).readOrThrow(cursor);
        return ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
    }
    function readOrThrow(cursor) {
        const type = cursor.readUint16OrThrow();
        const data = resolveOrThrow2(type, cursor);
        return new Extension(type, data);
    }
    ResolvedExtension2.readOrThrow = readOrThrow;
})(ResolvedExtension || (ResolvedExtension = {}));
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/server_name/name_type.ts
var NameType = class _NameType {
    constructor(type) {
        this.type = type;
    }
    static types = {
        host_name: 0
    };
    static instances = {
        host_name: new _NameType(_NameType.types.host_name)
    };
    static new(type) {
        return new _NameType(type);
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
    }
    static readOrThrow(cursor) {
        return new _NameType(cursor.readUint8OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/server_name/server_name.ts
var ServerName = class _ServerName {
    constructor(name_type, host_name) {
        this.name_type = name_type;
        this.host_name = host_name;
    }
    static new(name_type, host_name) {
        return new _ServerName(name_type, host_name);
    }
    static from(host_name) {
        return new _ServerName(NameType.instances.host_name, Vector(Number16).from(new Unknown(Bytes.fromAscii(host_name))));
    }
    sizeOrThrow() {
        return this.name_type.sizeOrThrow() + this.host_name.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.name_type.writeOrThrow(cursor);
        this.host_name.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const name_type = NameType.readOrThrow(cursor);
        const host_name = ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
        return new _ServerName(name_type, host_name);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/server_name/server_name_list.ts
var ServerNameList = class _ServerNameList {
    constructor(server_name_list) {
        this.server_name_list = server_name_list;
    }
    #class = _ServerNameList;
    static extension_type = Extension.types.server_name;
    static new(server_name_list) {
        return new _ServerNameList(server_name_list);
    }
    // static default(host_name: string) {
    //   const { secp256r1, secp384r1, secp521r1, x25519, x448 } = NamedCurve.instances
    //   return this.from([secp256r1]) // TODO
    // }
    static from(server_names) {
        const server_name_list = Vector(Number16).from(List.from(server_names));
        return new _ServerNameList(server_name_list);
    }
    get extension_type() {
        return this.#class.extension_type;
    }
    sizeOrThrow() {
        return this.server_name_list.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        return this.server_name_list.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ServerNameList(ReadableVector(Number16, ReadableList(ServerName)).readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/client_hello/client_hello2.ts
var ClientHello2 = class _ClientHello2 {
    constructor(version, random, session_id, cipher_suites, compression_methods, extensions) {
        this.version = version;
        this.random = random;
        this.session_id = session_id;
        this.cipher_suites = cipher_suites;
        this.compression_methods = compression_methods;
        this.extensions = extensions;
    }
    #class = _ClientHello2;
    static handshake_type = Handshake.types.client_hello;
    get handshake_type() {
        return this.#class.handshake_type;
    }
    static default(ciphers, host_name) {
        const version = 771;
        const random = Random.default();
        const session_id = Vector(Number8).from(new Unknown(Bytes.empty()));
        const cipher_suites = Vector(Number16).from(List.from(ciphers.map((it) => new Number16(it.id))));
        const compression_methods = Vector(Number8).from(List.from([new Number8(0)]));
        const extensions = new Some(Vector(Number16).from(List.from([])));
        if (host_name) {
            const server_name = Extension.from(ServerNameList.from([ServerName.from(host_name)]));
            extensions.inner.value.array.push(server_name);
        }
        const signature_algorithms = Extension.from(SignatureAlgorithms.default());
        const elliptic_curves = Extension.from(EllipticCurves.default());
        const ec_point_formats = Extension.from(ECPointFormats.default());
        extensions.inner.value.array.push(signature_algorithms, elliptic_curves, ec_point_formats);
        return new this(version, random, session_id, cipher_suites, compression_methods, extensions);
    }
    sizeOrThrow() {
        return 0 + 2 + this.random.sizeOrThrow() + this.session_id.sizeOrThrow() + this.cipher_suites.sizeOrThrow() + this.compression_methods.sizeOrThrow() + this.extensions.mapOrSync(0, (x) => x.sizeOrThrow());
    }
    writeOrThrow(cursor) {
        cursor.writeUint16OrThrow(this.version);
        this.random.writeOrThrow(cursor);
        this.session_id.writeOrThrow(cursor);
        this.cipher_suites.writeOrThrow(cursor);
        this.compression_methods.writeOrThrow(cursor);
        this.extensions.mapSync((x) => x.writeOrThrow(cursor));
    }
    static readOrThrow(cursor) {
        const version = cursor.readUint16OrThrow();
        const random = Random.readOrThrow(cursor);
        const session_id = ReadableVector(Number8, SafeUnknown).readOrThrow(cursor);
        const cipher_suites = ReadableVector(Number16, ReadableList(Number16)).readOrThrow(cursor);
        const compression_methods = ReadableVector(Number8, ReadableList(Number8)).readOrThrow(cursor);
        const extensions = cursor.remaining > 0 ? new Some(ReadableVector(Number16, ReadableList(ResolvedExtension)).readOrThrow(cursor)) : new None();
        return new _ClientHello2(version, random, session_id, cipher_suites, compression_methods, extensions);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/client_key_exchange/client_diffie_hellman_public.ts
var ClientDiffieHellmanPublic = class _ClientDiffieHellmanPublic {
    constructor(dh_Yc) {
        this.dh_Yc = dh_Yc;
    }
    static new(dh_Yc) {
        return new _ClientDiffieHellmanPublic(dh_Yc);
    }
    static from(bytes) {
        const dh_Yc = Vector(Number16).from(new Unknown(bytes));
        return new _ClientDiffieHellmanPublic(dh_Yc);
    }
    sizeOrThrow() {
        return this.dh_Yc.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.dh_Yc.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ClientDiffieHellmanPublic(ReadableVector(Number16, SafeUnknown).readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/ec_point.ts
var ECPoint = class _ECPoint {
    constructor(point) {
        this.point = point;
    }
    static new(point) {
        return new _ECPoint(point);
    }
    static from(bytes) {
        const point = Vector(Number8).from(new Unknown(bytes));
        return new this(point);
    }
    sizeOrThrow() {
        return this.point.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.point.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ECPoint(ReadableVector(Number8, SafeUnknown).readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/client_key_exchange/client_ec_diffie_hellman_public.ts
var ClientECDiffieHellmanPublic = class _ClientECDiffieHellmanPublic {
    constructor(ecdh_Yc) {
        this.ecdh_Yc = ecdh_Yc;
    }
    static new(ecdh_Yc) {
        return new _ClientECDiffieHellmanPublic(ecdh_Yc);
    }
    static from(bytes) {
        return new _ClientECDiffieHellmanPublic(ECPoint.from(bytes));
    }
    sizeOrThrow() {
        return this.ecdh_Yc.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        return this.ecdh_Yc.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ClientECDiffieHellmanPublic(ECPoint.readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/client_key_exchange/client_key_exchange2_dh.ts
var ClientKeyExchange2DH = class _ClientKeyExchange2DH {
    constructor(exchange_keys) {
        this.exchange_keys = exchange_keys;
    }
    #class = _ClientKeyExchange2DH;
    static handshake_type = Handshake.types.client_key_exchange;
    static new(exchange_keys) {
        return new _ClientKeyExchange2DH(exchange_keys);
    }
    static from(bytes) {
        return new _ClientKeyExchange2DH(ClientDiffieHellmanPublic.from(bytes));
    }
    get handshake_type() {
        return this.#class.handshake_type;
    }
    sizeOrThrow() {
        return this.exchange_keys.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.exchange_keys.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ClientKeyExchange2DH(ClientDiffieHellmanPublic.readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/ciphers/key_exchanges/dhe_rsa/dhe_rsa.ts
var DHE_RSA = class {
    static ephemeral = true;
    static anonymous = false;
};
// src/hazae41/cadenas/mods/ciphers/key_exchanges/ecdhe_rsa/ecdhe_rsa.ts
var ECDHE_RSA = class {
    static ephemeral = true;
    static anonymous = false;
};
// src/hazae41/cadenas/mods/binary/records/handshakes/client_key_exchange/client_key_exchange2_ecdh.ts
var ClientKeyExchange2ECDH = class _ClientKeyExchange2ECDH {
    constructor(exchange_keys) {
        this.exchange_keys = exchange_keys;
    }
    #class = _ClientKeyExchange2ECDH;
    static handshake_type = Handshake.types.client_key_exchange;
    static new(exchange_keys) {
        return new _ClientKeyExchange2ECDH(exchange_keys);
    }
    static from(bytes) {
        return new _ClientKeyExchange2ECDH(ClientECDiffieHellmanPublic.from(bytes));
    }
    get handshake_type() {
        return this.#class.handshake_type;
    }
    sizeOrThrow() {
        return this.exchange_keys.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        return this.exchange_keys.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ClientKeyExchange2ECDH(ClientECDiffieHellmanPublic.readOrThrow(cursor));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/client_key_exchange/client_key_exchange2.ts
var ReadableClientKeyExchange2;
((ReadableClientKeyExchange22) => {
    function getOrThrow(cipher) {
        if (cipher.key_exchange === DHE_RSA)
            return ClientKeyExchange2DH;
        if (cipher.key_exchange === ECDHE_RSA)
            return ClientKeyExchange2ECDH;
        throw new Error(`Invalid key exchange`);
    }
    ReadableClientKeyExchange22.getOrThrow = getOrThrow;
})(ReadableClientKeyExchange2 || (ReadableClientKeyExchange2 = {}));
// src/hazae41/cadenas/mods/binary/records/handshakes/extensions/opaque.ts
var OpaqueExtension;
((OpaqueExtension2) => {
    function readOrThrow(cursor) {
        const extension_type = cursor.readUint16OrThrow();
        const extension_data = ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
        return new Extension(extension_type, extension_data);
    }
    OpaqueExtension2.readOrThrow = readOrThrow;
})(OpaqueExtension || (OpaqueExtension = {}));
// src/hazae41/cadenas/mods/binary/records/handshakes/finished/finished2.ts
var Finished2 = class _Finished2 {
    constructor(verify_data) {
        this.verify_data = verify_data;
    }
    #class = _Finished2;
    static handshake_type = Handshake.types.finished;
    static new(verify_data) {
        return new _Finished2(verify_data);
    }
    get handshake_type() {
        return this.#class.handshake_type;
    }
    sizeOrThrow() {
        return this.verify_data.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.verify_data);
    }
    static readOrThrow(cursor) {
        return new _Finished2(cursor.readAndCopyOrThrow(cursor.remaining));
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_hello/server_hello2.ts
var ServerHello2 = class _ServerHello2 {
    constructor(server_version, random, session_id, cipher_suite, compression_methods, extensions) {
        this.server_version = server_version;
        this.random = random;
        this.session_id = session_id;
        this.cipher_suite = cipher_suite;
        this.compression_methods = compression_methods;
        this.extensions = extensions;
    }
    static type = Handshake.types.server_hello;
    sizeOrThrow() {
        return 0 + 2 + this.random.sizeOrThrow() + this.session_id.sizeOrThrow() + 2 + this.compression_methods.sizeOrThrow() + this.extensions.mapOrSync(0, (x) => x.sizeOrThrow());
    }
    writeOrThrow(cursor) {
        cursor.writeUint16OrThrow(this.server_version);
        this.random.writeOrThrow(cursor);
        this.session_id.writeOrThrow(cursor);
        cursor.writeUint16OrThrow(this.cipher_suite);
        this.compression_methods.writeOrThrow(cursor);
        this.extensions.mapSync((x) => x.writeOrThrow(cursor));
    }
    static readOrThrow(cursor) {
        const server_version = cursor.readUint16OrThrow();
        const random = Random.readOrThrow(cursor);
        const session_id = ReadableVector(Number8, SafeUnknown).readOrThrow(cursor);
        const cipher_suite = cursor.readUint16OrThrow();
        const compression_methods = ReadableVector(Number8, ReadableList(Number8)).readOrThrow(cursor);
        const extensions = cursor.remaining > 0 ? new Some(ReadableVector(Number16, ReadableList(ResolvedExtension)).readOrThrow(cursor)) : new None();
        return new _ServerHello2(server_version, random, session_id, cipher_suite, compression_methods, extensions);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_hello_done/server_hello_done2.ts
var ServerHelloDone2 = class _ServerHelloDone2 {
    static type = Handshake.types.server_hello_done;
    sizeOrThrow() {
        return 0;
    }
    writeOrThrow(_cursor) {
        return;
    }
    static readOrThrow(_cursor) {
        return new _ServerHelloDone2();
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/ec_curve_type.ts
var ECCurveType = class _ECCurveType {
    constructor(value) {
        this.value = value;
    }
    static types = {
        // deprecated: 1..2,
        named_curve: 3
        // reserved: 248..255
    };
    static instances = {
        named_curve: new this(this.types.named_curve)
    };
    static new(value) {
        return new _ECCurveType(value);
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.value);
    }
    static readOrThrow(cursor) {
        return new _ECCurveType(cursor.readUint8OrThrow());
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/ec_parameters.ts
var ECParameters = class _ECParameters {
    constructor(curve_type, named_curve) {
        this.curve_type = curve_type;
        this.named_curve = named_curve;
    }
    sizeOrThrow() {
        return this.curve_type.sizeOrThrow() + this.named_curve.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.curve_type.writeOrThrow(cursor);
        this.named_curve.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const curve_type = ECCurveType.readOrThrow(cursor);
        const named_curve = NamedCurve.readOrThrow(cursor);
        return new _ECParameters(curve_type, named_curve);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/server_dh_params.ts
var ServerDHParams = class _ServerDHParams {
    constructor(dh_p, dh_g, dh_Ys) {
        this.dh_p = dh_p;
        this.dh_g = dh_g;
        this.dh_Ys = dh_Ys;
    }
    sizeOrThrow() {
        return 0 + this.dh_p.sizeOrThrow() + this.dh_g.sizeOrThrow() + this.dh_Ys.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.dh_p.writeOrThrow(cursor);
        this.dh_g.writeOrThrow(cursor);
        this.dh_Ys.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const dh_p = ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
        const dh_g = ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
        const dh_Ys = ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
        return new _ServerDHParams(dh_p, dh_g, dh_Ys);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/server_ecdh_params.ts
var ServerECDHParams = class _ServerECDHParams {
    constructor(curve_params, public_point) {
        this.curve_params = curve_params;
        this.public_point = public_point;
    }
    sizeOrThrow() {
        return this.curve_params.sizeOrThrow() + this.public_point.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.curve_params.writeOrThrow(cursor);
        this.public_point.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const curve_params = ECParameters.readOrThrow(cursor);
        const public_point = ECPoint.readOrThrow(cursor);
        return new _ServerECDHParams(curve_params, public_point);
    }
};
// src/hazae41/cadenas/mods/ciphers/cipher.ts
var Cipher = class {
    constructor(id, key_exchange, encryption, hash) {
        this.id = id;
        this.key_exchange = key_exchange;
        this.encryption = encryption;
        this.hash = hash;
    }
    async initOrThrow(secrets) {
        const { hash } = this;
        if (this.encryption.cipher_type === "block")
            return await this.encryption.initOrThrow(secrets, hash.mac);
        else
            return await this.encryption.initOrThrow(secrets);
    }
};
// src/hazae41/cadenas/mods/ciphers/ciphers.ts
var ciphers_exports = {};
__export(ciphers_exports, {
    TLS_DHE_RSA_WITH_AES_128_CBC_SHA: () => TLS_DHE_RSA_WITH_AES_128_CBC_SHA,
    TLS_DHE_RSA_WITH_AES_128_CBC_SHA256: () => TLS_DHE_RSA_WITH_AES_128_CBC_SHA256,
    TLS_DHE_RSA_WITH_AES_128_GCM_SHA256: () => TLS_DHE_RSA_WITH_AES_128_GCM_SHA256,
    TLS_DHE_RSA_WITH_AES_256_CBC_SHA: () => TLS_DHE_RSA_WITH_AES_256_CBC_SHA,
    TLS_DHE_RSA_WITH_AES_256_CBC_SHA256: () => TLS_DHE_RSA_WITH_AES_256_CBC_SHA256,
    TLS_DHE_RSA_WITH_AES_256_GCM_SHA384: () => TLS_DHE_RSA_WITH_AES_256_GCM_SHA384,
    TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384: () => TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
    TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384: () => TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
});
// src/hazae41/cadenas/mods/ciphers/encryptions/aes_128_cbc/aes_128_cbc.ts
var AES_128_CBC = class _AES_128_CBC {
    constructor(macher, encryption_key, decryption_key) {
        this.macher = macher;
        this.encryption_key = encryption_key;
        this.decryption_key = decryption_key;
    }
    #class = _AES_128_CBC;
    static cipher_type = "block";
    static enc_key_length = 16;
    static block_length = 16;
    static fixed_iv_length = this.block_length;
    static record_iv_length = this.block_length;
    static async initOrThrow(secrets, mac) {
        const macher = await mac.initOrThrow(secrets);
        const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 128 }, false, ["encrypt"]);
        const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-CBC", length: 128 }, false, ["decrypt"]);
        return new _AES_128_CBC(macher, encryption, decryption);
    }
    get cipher_type() {
        return this.#class.cipher_type;
    }
    get enc_key_length() {
        return this.#class.enc_key_length;
    }
    get block_length() {
        return this.#class.block_length;
    }
    get fixed_iv_length() {
        return this.#class.fixed_iv_length;
    }
    get record_iv_length() {
        return this.#class.record_iv_length;
    }
    async encryptOrThrow(iv, plaintext) {
        const pkcs7 = Bytes.from(await crypto.subtle.encrypt({ name: "AES-CBC", iv }, this.encryption_key, plaintext));
        return pkcs7.subarray(0, -16);
    }
    async decryptOrThrow(iv, ciphertext) {
        const unpkcs7 = Bytes.from(await crypto.subtle.decrypt({ name: "AES-CBC", iv }, this.decryption_key, ciphertext));
        return unpkcs7.subarray(0, -1);
    }
};
// src/hazae41/cadenas/mods/ciphers/encryptions/aes_128_gcm/aes_128_gcm.ts
var AES_128_GCM = class _AES_128_GCM {
    constructor(secrets, encryption_key, decryption_key) {
        this.secrets = secrets;
        this.encryption_key = encryption_key;
        this.decryption_key = decryption_key;
    }
    #class = _AES_128_GCM;
    static cipher_type = "aead";
    static enc_key_length = 16;
    static block_length = 16;
    static fixed_iv_length = 4;
    static record_iv_length = 8;
    static async initOrThrow(secrets) {
        const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-GCM", length: 128 }, false, ["encrypt"]);
        const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-GCM", length: 128 }, false, ["decrypt"]);
        return new _AES_128_GCM(secrets, encryption, decryption);
    }
    get cipher_type() {
        return this.#class.cipher_type;
    }
    get enc_key_length() {
        return this.#class.enc_key_length;
    }
    get block_length() {
        return this.#class.block_length;
    }
    get fixed_iv_length() {
        return this.#class.fixed_iv_length;
    }
    get record_iv_length() {
        return this.#class.record_iv_length;
    }
    async encryptOrThrow(nonce, block, additionalData) {
        return Bytes.from(await crypto.subtle.encrypt({ name: "AES-GCM", length: 128, iv: nonce, additionalData }, this.encryption_key, block));
    }
    async decryptOrThrow(nonce, block, additionalData) {
        return Bytes.from(await crypto.subtle.decrypt({ name: "AES-GCM", length: 128, iv: nonce, additionalData }, this.decryption_key, block));
    }
};
// src/hazae41/cadenas/mods/ciphers/encryptions/aes_256_cbc/aes_256_cbc.ts
var AES_256_CBC = class _AES_256_CBC {
    constructor(macher, encryption_key, decryption_key) {
        this.macher = macher;
        this.encryption_key = encryption_key;
        this.decryption_key = decryption_key;
    }
    #class = _AES_256_CBC;
    static cipher_type = "block";
    static enc_key_length = 32;
    static block_length = 16;
    static fixed_iv_length = this.block_length;
    static record_iv_length = this.block_length;
    static async initOrThrow(secrets, mac) {
        const macher = await mac.initOrThrow(secrets);
        const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 256 }, false, ["encrypt"]);
        const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-CBC", length: 256 }, false, ["decrypt"]);
        return new _AES_256_CBC(macher, encryption, decryption);
    }
    get cipher_type() {
        return this.#class.cipher_type;
    }
    get enc_key_length() {
        return this.#class.enc_key_length;
    }
    get block_length() {
        return this.#class.block_length;
    }
    get fixed_iv_length() {
        return this.#class.fixed_iv_length;
    }
    get record_iv_length() {
        return this.#class.record_iv_length;
    }
    async encryptOrThrow(iv, plaintext) {
        const pkcs7 = Bytes.from(await crypto.subtle.encrypt({ name: "AES-CBC", iv }, this.encryption_key, plaintext));
        return pkcs7.subarray(0, -16);
    }
    async decryptOrThrow(iv, ciphertext) {
        const unpkcs7 = Bytes.from(await crypto.subtle.decrypt({ name: "AES-CBC", iv }, this.decryption_key, ciphertext));
        return unpkcs7.subarray(0, -1);
    }
};
// src/hazae41/cadenas/mods/ciphers/encryptions/aes_256_gcm/aes_256_gcm.ts
var AES_256_GCM = class _AES_256_GCM {
    constructor(secrets, encryption_key, decryption_key) {
        this.secrets = secrets;
        this.encryption_key = encryption_key;
        this.decryption_key = decryption_key;
    }
    #class = _AES_256_GCM;
    static cipher_type = "aead";
    static enc_key_length = 32;
    static block_length = 16;
    static fixed_iv_length = 4;
    static record_iv_length = 8;
    static async initOrThrow(secrets) {
        const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
        const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
        return new _AES_256_GCM(secrets, encryption, decryption);
    }
    get cipher_type() {
        return this.#class.cipher_type;
    }
    get enc_key_length() {
        return this.#class.enc_key_length;
    }
    get block_length() {
        return this.#class.block_length;
    }
    get fixed_iv_length() {
        return this.#class.fixed_iv_length;
    }
    get record_iv_length() {
        return this.#class.record_iv_length;
    }
    async encryptOrThrow(nonce, block, additionalData) {
        return Bytes.from(await crypto.subtle.encrypt({ name: "AES-GCM", length: 256, iv: nonce, additionalData }, this.encryption_key, block));
    }
    async decryptOrThrow(nonce, block, additionalData) {
        return Bytes.from(await crypto.subtle.decrypt({ name: "AES-GCM", length: 256, iv: nonce, additionalData }, this.decryption_key, block));
    }
};
// src/hazae41/cadenas/mods/ciphers/hashes/sha/sha.ts
var HMAC_SHA = class _HMAC_SHA {
    constructor(mac_key) {
        this.mac_key = mac_key;
    }
    #class = _HMAC_SHA;
    static mac_length = 20;
    static mac_key_length = 20;
    get mac_length() {
        return this.#class.mac_length;
    }
    get mac_key_length() {
        return this.#class.mac_key_length;
    }
    static async initOrThrow(secrets) {
        const mac_key = await crypto.subtle.importKey("raw", secrets.client_write_MAC_key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
        return new _HMAC_SHA(mac_key);
    }
    async writeOrThrow(seed) {
        return Bytes.from(await crypto.subtle.sign("HMAC", this.mac_key, seed));
    }
};
var SHA = class _SHA {
    #class = _SHA;
    static mac = HMAC_SHA;
    static mac_length = 20;
    static mac_key_length = 20;
    static handshake_md = "SHA-256";
    static prf_md = "SHA-256";
    constructor() {
    }
    get mac_length() {
        return this.#class.mac_length;
    }
    get mac_key_length() {
        return this.#class.mac_key_length;
    }
};
// src/hazae41/cadenas/mods/ciphers/hashes/sha256/sha256.ts
var HMAC_SHA256 = class _HMAC_SHA256 {
    constructor(mac_key) {
        this.mac_key = mac_key;
    }
    #class = _HMAC_SHA256;
    static mac_length = 32;
    static mac_key_length = 32;
    get mac_length() {
        return this.#class.mac_length;
    }
    get mac_key_length() {
        return this.#class.mac_key_length;
    }
    static async initOrThrow(secrets) {
        const mac_key = await crypto.subtle.importKey("raw", secrets.client_write_MAC_key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        return new _HMAC_SHA256(mac_key);
    }
    async writeOrThrow(seed) {
        return Bytes.from(await crypto.subtle.sign("HMAC", this.mac_key, seed));
    }
};
var SHA256 = class _SHA256 {
    #class = _SHA256;
    static mac = HMAC_SHA256;
    static mac_length = 32;
    static mac_key_length = 32;
    static handshake_md = "SHA-256";
    static prf_md = "SHA-256";
    constructor() {
    }
    get mac_length() {
        return this.#class.mac_length;
    }
    get mac_key_length() {
        return this.#class.mac_key_length;
    }
};
// src/hazae41/cadenas/mods/ciphers/hashes/sha384/sha384.ts
var HMAC_SHA384 = class _HMAC_SHA384 {
    constructor(mac_key) {
        this.mac_key = mac_key;
    }
    #class = _HMAC_SHA384;
    static mac_length = 48;
    static mac_key_length = 48;
    get mac_length() {
        return this.#class.mac_length;
    }
    get mac_key_length() {
        return this.#class.mac_key_length;
    }
    static async initOrThrow(secrets) {
        const mac_key = await crypto.subtle.importKey("raw", secrets.client_write_MAC_key, { name: "HMAC", hash: "SHA-384" }, false, ["sign"]);
        return new _HMAC_SHA384(mac_key);
    }
    async writeOrThrow(seed) {
        return Bytes.from(await crypto.subtle.sign("HMAC", this.mac_key, seed));
    }
};
var SHA384 = class _SHA384 {
    #class = _SHA384;
    static mac = HMAC_SHA384;
    static mac_length = 48;
    static mac_key_length = 48;
    static handshake_md = "SHA-384";
    static prf_md = "SHA-384";
    constructor() {
    }
    get mac_length() {
        return this.#class.mac_length;
    }
    get mac_key_length() {
        return this.#class.mac_key_length;
    }
};
// src/hazae41/cadenas/mods/ciphers/key_exchanges/ecdhe_ecdsa/ecdhe_ecdsa.ts
var ECDHE_ECDSA = class {
    static ephemeral = true;
    static anonymous = false;
};
// src/hazae41/cadenas/mods/ciphers/ciphers.ts
var TLS_DHE_RSA_WITH_AES_128_CBC_SHA = new Cipher(51, DHE_RSA, AES_128_CBC, SHA);
var TLS_DHE_RSA_WITH_AES_256_CBC_SHA = new Cipher(57, DHE_RSA, AES_256_CBC, SHA);
var TLS_DHE_RSA_WITH_AES_128_CBC_SHA256 = new Cipher(103, DHE_RSA, AES_128_CBC, SHA256);
var TLS_DHE_RSA_WITH_AES_256_CBC_SHA256 = new Cipher(107, DHE_RSA, AES_256_CBC, SHA256);
var TLS_DHE_RSA_WITH_AES_128_GCM_SHA256 = new Cipher(158, DHE_RSA, AES_128_GCM, SHA256);
var TLS_DHE_RSA_WITH_AES_256_GCM_SHA384 = new Cipher(159, DHE_RSA, AES_256_GCM, SHA384);
var TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 = new Cipher(49200, ECDHE_RSA, AES_256_GCM, SHA384);
var TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 = new Cipher(49196, ECDHE_ECDSA, AES_256_GCM, SHA384);
// src/hazae41/cadenas/mods/binary/signatures/digitally_signed.ts
var DigitallySigned = class _DigitallySigned {
    constructor(algorithm, signature) {
        this.algorithm = algorithm;
        this.signature = signature;
    }
    sizeOrThrow() {
        return this.algorithm.sizeOrThrow() + this.signature.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.algorithm.writeOrThrow(cursor);
        this.signature.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const algorithm = SignatureAndHashAlgorithm.readOrThrow(cursor);
        const signature = ReadableVector(Number16, SafeUnknown).readOrThrow(cursor);
        return new _DigitallySigned(algorithm, signature);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/server_key_exchange2_dh_signed.ts
var ServerKeyExchange2DHSigned = class _ServerKeyExchange2DHSigned {
    constructor(params, signed_params) {
        this.params = params;
        this.signed_params = signed_params;
    }
    static type = Handshake.types.server_key_exchange;
    sizeOrThrow() {
        return 0 + this.params.sizeOrThrow() + this.signed_params.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.params.writeOrThrow(cursor);
        this.signed_params.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const params = ServerDHParams.readOrThrow(cursor);
        const signed_params = DigitallySigned.readOrThrow(cursor);
        return new _ServerKeyExchange2DHSigned(params, signed_params);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/server_key_exchange2_ecdh_signed.ts
var ServerKeyExchange2ECDHSigned = class _ServerKeyExchange2ECDHSigned {
    constructor(params, signed_params) {
        this.params = params;
        this.signed_params = signed_params;
    }
    static type = Handshake.types.server_key_exchange;
    sizeOrThrow() {
        return this.params.sizeOrThrow() + this.signed_params.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.params.writeOrThrow(cursor);
        this.signed_params.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const params = ServerECDHParams.readOrThrow(cursor);
        const signed_params = DigitallySigned.readOrThrow(cursor);
        return new _ServerKeyExchange2ECDHSigned(params, signed_params);
    }
};
var ServerKeyExchange2ECDHPreSigned = class {
    constructor(client_random, server_random, params) {
        this.client_random = client_random;
        this.server_random = server_random;
        this.params = params;
    }
    sizeOrThrow() {
        return this.client_random.length + this.server_random.length + this.params.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.client_random);
        cursor.writeOrThrow(this.server_random);
        this.params.writeOrThrow(cursor);
    }
};
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/server_key_exchange2.ts
var ReadableServerKeyExchange2;
((ReadableServerKeyExchange22) => {
    function getOrThrow(cipher) {
        if (cipher.key_exchange === DHE_RSA)
            return ServerKeyExchange2DHSigned;
        if (cipher.key_exchange === ECDHE_RSA)
            return ServerKeyExchange2ECDHSigned;
        if (cipher.key_exchange === ECDHE_ECDSA)
            return ServerKeyExchange2ECDHSigned;
        throw new Error(`Invalid key exchange`);
    }
    ReadableServerKeyExchange22.getOrThrow = getOrThrow;
})(ReadableServerKeyExchange2 || (ReadableServerKeyExchange2 = {}));
// src/hazae41/cadenas/mods/binary/records/handshakes/server_key_exchange/server_key_exchange2_dh.ts
(class _ServerKeyExchange2DH {
    constructor(params) {
        this.params = params;
    }
    static type = Handshake.types.server_key_exchange;
    static new(params) {
        return new _ServerKeyExchange2DH(params);
    }
    sizeOrThrow() {
        return this.params.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.params.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _ServerKeyExchange2DH(ServerDHParams.readOrThrow(cursor));
    }
});
// src/hazae41/asn1/mods/errors/errors.ts
var Unimplemented = class _Unimplemented extends Error {
    #class = _Unimplemented;
    name = this.#class.name;
    constructor() {
        super(`Unimplemented`);
    }
};
var InvalidLengthError = class _InvalidLengthError extends Error {
    constructor(triplet, length) {
        super(`Invalid length ${length} for ${triplet}`);
        this.triplet = triplet;
        this.length = length;
    }
    #class = _InvalidLengthError;
    name = this.#class.name;
};
var InvalidTypeError = class _InvalidTypeError extends Error {
    constructor(triplet, byte) {
        super(`Invalid type ${byte} for ${triplet}`);
        this.triplet = triplet;
        this.byte = byte;
    }
    #class = _InvalidTypeError;
    name = this.#class.name;
};
var InvalidValueError = class _InvalidValueError extends Error {
    constructor(triplet, value) {
        super(`Invalid value ${value} for ${triplet}`);
        this.triplet = triplet;
        this.value = value;
    }
    #class = _InvalidValueError;
    name = this.#class.name;
};
// src/hazae41/asn1/mods/length/length.ts
var Length = class _Length {
    constructor(value) {
        this.value = value;
    }
    toDER() {
        return _Length.DER.from(this);
    }
};
((Length3) => {
    ((DER3) => {
        function from(length) {
            if (length.value < 128)
                return new Short(length.value);
            let floor = length.value;
            const values = new Array();
            do {
                values.push(floor % 256);
                floor = Math.floor(floor / 256);
            } while (floor);
            values.reverse();
            return new Long(length.value, values);
        }
        DER3.from = from;
        function readOrThrow(cursor) {
            const first = cursor.readUint8OrThrow();
            if (first < 128)
                return new Short(first);
            let count = first;
            count &= -129;
            let value = 0;
            const values = new Array();
            for (let i = 0; i < count; i++) {
                const byte = cursor.readUint8OrThrow();
                value = value * 256 + byte;
                values.push(byte);
            }
            return new Long(value, values);
        }
        DER3.readOrThrow = readOrThrow;
        class Short extends Length3 {
            constructor(value) {
                super(value);
                this.value = value;
            }
            sizeOrThrow() {
                return 1;
            }
            writeOrThrow(cursor) {
                cursor.writeUint8OrThrow(this.value);
            }
        }
        DER3.Short = Short;
        class Long extends Length3 {
            constructor(value, values) {
                super(value);
                this.value = value;
                this.values = values;
            }
            sizeOrThrow() {
                return 1 + this.values.length;
            }
            writeOrThrow(cursor) {
                let count = this.values.length;
                count |= 1 << 8 - 0 - 1;
                cursor.writeUint8OrThrow(count);
                for (const byte of this.values)
                    cursor.writeUint8OrThrow(byte);
                return;
            }
        }
        DER3.Long = Long;
    })(Length3.DER || (Length3.DER = {}));
})(Length || (Length = {}));
// src/hazae41/asn1/mods/type/type.ts
var Type = class _Type {
    constructor(clazz, wrap, tag) {
        this.clazz = clazz;
        this.wrap = wrap;
        this.tag = tag;
    }
    static clazzes = {
        UNIVERSAL: 0,
        APPLICATION: 1,
        CONTEXT: 2,
        PRIVATE: 3
    };
    static wraps = {
        PRIMITIVE: 0,
        CONSTRUCTED: 1
    };
    static tags = {
        BOOLEAN: 1,
        INTEGER: 2,
        BIT_STRING: 3,
        OCTET_STRING: 4,
        NULL: 5,
        OBJECT_IDENTIFIER: 6,
        UTF8_STRING: 12,
        SEQUENCE: 16,
        SET: 17,
        NUMERIC_STRING: 18,
        PRINTABLE_STRING: 19,
        TELETEX_STRING: 20,
        VIDEO_TEX_STRING: 21,
        IA5_STRING: 22,
        UTC_TIME: 23,
        GENERALIZED_TIME: 24
    };
    static create(clazz, wrap, tag) {
        return new _Type(clazz, wrap, tag);
    }
    static context(constructed, tag) {
        const wrap = constructed ? _Type.wraps.CONSTRUCTED : _Type.wraps.PRIMITIVE;
        return new _Type(_Type.clazzes.CONTEXT, wrap, tag);
    }
    static application(constructed, tag) {
        const wrap = constructed ? _Type.wraps.CONSTRUCTED : _Type.wraps.PRIMITIVE;
        return new _Type(_Type.clazzes.APPLICATION, wrap, tag);
    }
    static private(constructed, tag) {
        const wrap = constructed ? _Type.wraps.CONSTRUCTED : _Type.wraps.PRIMITIVE;
        return new _Type(_Type.clazzes.PRIVATE, wrap, tag);
    }
    toDER() {
        return _Type.DER.from(this);
    }
};
((Type2) => {
    class DER2 extends Type2 {
        constructor(byte, clazz, wrap, tag) {
            super(clazz, wrap, tag);
            this.byte = byte;
            this.clazz = clazz;
            this.wrap = wrap;
            this.tag = tag;
        }
        static size = 1;
        static from(type) {
            let byte = 0;
            byte |= type.clazz << 6;
            byte |= type.wrap << 5;
            byte |= type.tag;
            return new DER2(byte, type.clazz, type.wrap, type.tag);
        }
        equals(other) {
            return this.byte === other.byte;
        }
        static context(constructed, tag) {
            return super.context(constructed, tag).toDER();
        }
        static application(constructed, tag) {
            return super.application(constructed, tag).toDER();
        }
        static private(constructed, tag) {
            return super.private(constructed, tag).toDER();
        }
        sizeOrThrow() {
            return 1;
        }
        writeOrThrow(cursor) {
            cursor.writeUint8OrThrow(this.byte);
        }
        static readOrThrow(cursor) {
            const byte = cursor.readUint8OrThrow();
            const clazz = byte >> 6;
            const wrap = byte >> 5 & 1;
            const tag = byte & 31;
            if (tag > 30)
                throw new Unimplemented();
            return new DER2(byte, clazz, wrap, tag);
        }
    }
    Type2.DER = DER2;
})(Type || (Type = {}));
// src/hazae41/asn1/mods/resolvers/der/triplet.ts
var DERTriplet;
((DERTriplet15) => {
    function sizeOrThrow(length) {
        return Type.DER.size + length.sizeOrThrow() + length.value;
    }
    DERTriplet15.sizeOrThrow = sizeOrThrow;
})(DERTriplet || (DERTriplet = {}));
// src/hazae41/asn1/mods/triplets/boolean/boolean.ts
var Boolean2 = class _Boolean {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.BOOLEAN);
    static create(type = this.type, value) {
        return new _Boolean(type, value);
    }
    toDER() {
        return _Boolean.DER.from(this);
    }
    toString() {
        return `BOOLEAN ${this.value !== 0}`;
    }
};
((Boolean3) => {
    class DER2 extends Boolean3 {
        constructor(type, value) {
            super(type, value);
            this.type = type;
            this.value = value;
        }
        static type = Boolean3.type.toDER();
        static length = new Length(1).toDER();
        get length() {
            return DER2.length;
        }
        static from(asn1) {
            return new DER2(asn1.type.toDER(), asn1.value);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeUint8OrThrow(this.value);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            if (length.value !== this.length.value)
                throw new InvalidLengthError(`Boolean`, length.value);
            const value = cursor.readUint8OrThrow();
            return new DER2(type, value);
        }
    }
    Boolean3.DER = DER2;
})(Boolean2 || (Boolean2 = {}));
// src/hazae41/asn1/mods/triplets/integer/integer.ts
var bn256 = BigInt(256);
var Integer = class _Integer {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.INTEGER);
    static create(type = this.type, value) {
        return new _Integer(type, value);
    }
    toDER() {
        return _Integer.DER.from(this);
    }
    toString() {
        return `INTEGER ${this.value}`;
    }
};
((Integer2) => {
    class DER2 extends Integer2 {
        constructor(type, length, value, values) {
            super(type, value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.values = values;
        }
        static type = Integer2.type.toDER();
        static from(asn1) {
            let divided = asn1.value < 0 ? ~asn1.value : asn1.value;
            const values = new Array();
            do {
                values.push(Number(divided % bn256));
                divided /= bn256;
            } while (divided);
            if (values[values.length - 1] > 127)
                values.push(0);
            values.reverse();
            const length = new Length(values.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, values);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            const negative = this.value < 0;
            let first = this.values[0];
            if (negative) {
                first = (1 << 8) - first - 1;
                first |= 1 << 8 - 0 - 1;
            }
            cursor.writeUint8OrThrow(first);
            for (let i = 1; i < this.values.length; i++) {
                let byte = this.values[i];
                if (negative)
                    byte = (1 << 8) - byte - 1;
                cursor.writeUint8OrThrow(byte);
            }
            return;
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            let value = BigInt(0);
            const values = new Array();
            const negative = cursor.getUint8OrThrow() & 1 << 8 - 0 - 1;
            for (let i = 0; i < length.value; i++) {
                let byte = cursor.readUint8OrThrow();
                if (negative)
                    byte = (1 << 8) - byte - 1;
                value = value * bn256 + BigInt(byte);
                values.push(byte);
            }
            if (negative)
                value = ~value;
            return new DER2(type, length, value, values);
        }
    }
    Integer2.DER = DER2;
})(Integer || (Integer = {}));
// src/hazae41/asn1/mods/triplets/set/set.ts
var stringify = (set) => `SET {
  ${set.triplets.map((it) => it?.toString()).join(`
`).replaceAll("\n", "\n  ")}
}`;
var Set2 = class _Set {
    constructor(type, triplets) {
        this.type = type;
        this.triplets = triplets;
    }
    static type = new Type(Type.clazzes.UNIVERSAL, Type.wraps.CONSTRUCTED, Type.tags.SET);
    static create(type = this.type, triplets) {
        return new _Set(type, triplets);
    }
    toDER() {
        return _Set.DER.from(this);
    }
    toString() {
        return stringify(this);
    }
};
((Set3) => {
    class DER2 extends Set3 {
        constructor(type, length, triplets) {
            super(type, triplets);
            this.type = type;
            this.length = length;
            this.triplets = triplets;
        }
        static type = Set3.type.toDER();
        static from(asn1) {
            const triplets = asn1.triplets.map((it) => it?.toDER());
            const size = triplets.reduce((p, c) => p + (c == null ? 0 : c.sizeOrThrow()), 0);
            const length = new Length(size).toDER();
            return new DER2(asn1.type.toDER(), length, triplets);
        }
        resolveOrThrow() {
            const resolved = this.triplets.map((it) => it.resolveOrThrow());
            return new DER2(this.type, this.length, resolved);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            for (const triplet of this.triplets)
                triplet?.writeOrThrow(cursor);
            return;
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const subcursor = new Cursor(cursor.readOrThrow(length.value));
            const triplets = new Array();
            while (subcursor.remaining)
                triplets.push(OpaqueTriplet.DER.readOrThrow(subcursor));
            return new DER2(type, length, triplets);
        }
    }
    Set3.DER = DER2;
})(Set2 || (Set2 = {}));
// src/hazae41/asn1/mods/triplets/bit_string/bit_string.ts
var BitString = class _BitString {
    constructor(type, padding, bytes) {
        this.type = type;
        this.padding = padding;
        this.bytes = bytes;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.BIT_STRING);
    static create(type = this.type, padding, bytes) {
        return new _BitString(type, padding, bytes);
    }
    toDER() {
        return _BitString.DER.from(this);
    }
    toString() {
        const bignum = BigInt("0x" + Bytes.toHex(this.bytes));
        const cursor = bignum.toString(2).padStart(this.bytes.length * 8, "0");
        return `BITSTRING ${cursor.slice(0, cursor.length - this.padding)}`;
    }
};
((BitString2) => {
    class DER2 extends BitString2 {
        constructor(type, length, padding, bytes) {
            super(type, padding, bytes);
            this.type = type;
            this.length = length;
            this.padding = padding;
            this.bytes = bytes;
        }
        static type = BitString2.type.toDER();
        static from(asn1) {
            const length = new Length(asn1.bytes.length + 1).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.padding, asn1.bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeUint8OrThrow(this.padding);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const subcursor = new Cursor(cursor.readOrThrow(length.value));
            const padding = subcursor.readUint8OrThrow();
            const bytes = Bytes.from(subcursor.readOrThrow(subcursor.remaining));
            return new DER2(type, length, padding, bytes);
        }
    }
    BitString2.DER = DER2;
})(BitString || (BitString = {}));
// src/hazae41/asn1/mods/triplets/generalized_time/generalized_time.ts
function pad2(value) {
    return value.toString().padStart(2, "0");
}
function pad4(value) {
    return value.toString().padStart(4, "0");
}
var GeneralizedTime = class _GeneralizedTime {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.GENERALIZED_TIME);
    static create(type = this.type, value) {
        return new _GeneralizedTime(type, value);
    }
    toDER() {
        return _GeneralizedTime.DER.from(this);
    }
    toString() {
        return `GeneralizedTime ${this.value.toUTCString()}`;
    }
};
((GeneralizedTime2) => {
    class DER2 extends GeneralizedTime2 {
        constructor(type, length, value, bytes) {
            super(type, value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.bytes = bytes;
        }
        static type = GeneralizedTime2.type.toDER();
        static from(asn1) {
            const year = asn1.value.getUTCFullYear();
            const YYYY = pad4(year);
            const MM = pad2(asn1.value.getUTCMonth() + 1);
            const DD = pad2(asn1.value.getUTCDate());
            const hh = pad2(asn1.value.getUTCHours());
            const mm = pad2(asn1.value.getUTCMinutes());
            const ss = pad2(asn1.value.getUTCSeconds());
            const bytes = Bytes.encodeUtf8(`${YYYY}${MM}${DD}${hh}${mm}${ss}Z`);
            const length = new Length(bytes.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const bytes = Bytes.from(cursor.readOrThrow(length.value));
            const text = new TextDecoder().decode(bytes);
            if (text.length !== 15)
                throw new InvalidValueError(`GeneralizedTime`, text);
            if (!text.endsWith("Z"))
                throw new InvalidValueError(`GeneralizedTime`, text);
            const YYYY = Number(text.slice(0, 4));
            const MM = Number(text.slice(4, 6));
            const DD = Number(text.slice(6, 8));
            const hh = Number(text.slice(8, 10));
            const mm = Number(text.slice(10, 12));
            const ss = Number(text.slice(12, 14));
            const value = /* @__PURE__ */ new Date();
            value.setUTCFullYear(YYYY, MM - 1, DD);
            value.setUTCHours(hh, mm, ss);
            value.setUTCMilliseconds(0);
            return new DER2(type, length, value, bytes);
        }
    }
    GeneralizedTime2.DER = DER2;
})(GeneralizedTime || (GeneralizedTime = {}));
// src/hazae41/asn1/mods/triplets/ia5_string/ia5_string.ts
var IA5String = class _IA5String {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.IA5_STRING);
    static is(value) {
        return /^[\x00-\x7F]*$/.test(value);
    }
    static createOrThrow(type = this.type, value) {
        if (!_IA5String.is(value))
            throw new InvalidValueError(`IA5String`, value);
        return new _IA5String(type, value);
    }
    toDER() {
        return _IA5String.DER.from(this);
    }
    toString() {
        return `IA5String ${this.value}`;
    }
};
((IA5String2) => {
    class DER2 extends IA5String2 {
        constructor(type, length, value, bytes) {
            super(type, value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.bytes = bytes;
        }
        static type = IA5String2.type.toDER();
        static from(asn1) {
            const bytes = Bytes.encodeUtf8(asn1.value);
            const length = new Length(bytes.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const bytes = Bytes.from(cursor.readOrThrow(length.value));
            const value = new TextDecoder().decode(bytes);
            if (!IA5String2.is(value))
                throw new InvalidValueError(`IA5String`, value);
            return new DER2(type, length, value, bytes);
        }
    }
    IA5String2.DER = DER2;
})(IA5String || (IA5String = {}));
// src/hazae41/asn1/mods/triplets/null/null.ts
var Null = class _Null {
    constructor(type) {
        this.type = type;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.NULL);
    static create(type = this.type) {
        return new _Null(type);
    }
    toDER() {
        return _Null.DER.from(this);
    }
    toString() {
        return `NULL`;
    }
};
((Null2) => {
    class DER2 extends Null2 {
        constructor(type) {
            super(type);
            this.type = type;
        }
        static type = Null2.type.toDER();
        static length = new Length(0).toDER();
        get length() {
            return DER2.length;
        }
        static from(asn1) {
            return new DER2(asn1.type.toDER());
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            if (length.value !== 0)
                throw new InvalidLengthError(`Null`, length.value);
            return new DER2(type);
        }
    }
    Null2.DER = DER2;
})(Null || (Null = {}));
// src/hazae41/common/Numbers.ts
var Numbers;
((Numbers2) => {
    function isSafeNonNegativeInteger(x) {
        return Number.isSafeInteger(x) && x >= 0;
    }
    Numbers2.isSafeNonNegativeInteger = isSafeNonNegativeInteger;
})(Numbers || (Numbers = {}));
// src/hazae41/asn1/mods/variable_length_quantity/variable_length_quantity.ts
var VLQ = class _VLQ {
    constructor(value) {
        this.value = value;
    }
    toDER() {
        return _VLQ.DER.from(this);
    }
};
((VLQ2) => {
    class DER2 extends VLQ2 {
        constructor(value, values) {
            super(value);
            this.value = value;
            this.values = values;
        }
        static from(vlq) {
            let value = vlq.value;
            const values = new Array();
            do {
                values.push(value % 128);
                value = Math.floor(value / 128);
            } while (value);
            values.reverse();
            return new DER2(vlq.value, values);
        }
        sizeOrThrow() {
            return this.values.length;
        }
        writeOrThrow(cursor) {
            for (let i = 0; i < this.values.length - 1; i++) {
                let byte = this.values[i];
                byte |= 1 << 8 - 0 - 1;
                cursor.writeUint8OrThrow(byte);
            }
            cursor.writeUint8OrThrow(this.values[this.values.length - 1]);
        }
        static readOrThrow(cursor) {
            let value = 0;
            const values = new Array();
            while (true) {
                const byte = cursor.readUint8OrThrow();
                if (byte <= 127) {
                    value = value * 128 + byte;
                    values.push(byte);
                    break;
                }
                let integer = byte;
                integer &= -129;
                value = value * 128 + integer;
                values.push(integer);
            }
            return new DER2(value, values);
        }
    }
    VLQ2.DER = DER2;
})(VLQ || (VLQ = {}));
// src/hazae41/asn1/mods/triplets/object_identifier/object_identifier.ts
var ObjectIdentifier = class _ObjectIdentifier {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.OBJECT_IDENTIFIER);
    static is(value) {
        return value.split(".").every((x) => Numbers.isSafeNonNegativeInteger(Number(x)));
    }
    static create(type = this.type, value) {
        return new _ObjectIdentifier(type, value);
    }
    static createOrThrow(type = this.type, value) {
        if (!_ObjectIdentifier.is(value))
            throw new InvalidValueError(`ObjectIdentifier`, value);
        return new _ObjectIdentifier(type, value);
    }
    toDER() {
        return _ObjectIdentifier.DER.from(this);
    }
    toString() {
        return `OBJECT IDENTIFIER ${this.value}`;
    }
};
((ObjectIdentifier2) => {
    class DER2 extends ObjectIdentifier2 {
        constructor(type, length, value, head, body) {
            super(type, value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.head = head;
            this.body = body;
        }
        static type = ObjectIdentifier2.type.toDER();
        static from(asn1) {
            const texts = asn1.value.split(".");
            const first = Number(texts[0]);
            const second = Number(texts[1]);
            const head = [first, second];
            let size = 1;
            const body = new Array();
            for (let i = 2; i < texts.length; i++) {
                const vlq = new VLQ(Number(texts[i])).toDER();
                size += vlq.sizeOrThrow();
                body.push(vlq);
            }
            const length = new Length(size).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, head, body);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            const [first, second] = this.head;
            cursor.writeUint8OrThrow(first * 40 + second);
            for (const vlq of this.body)
                vlq.writeOrThrow(cursor);
            return;
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const subcursor = new Cursor(cursor.readOrThrow(length.value));
            const byte = subcursor.readUint8OrThrow();
            const first = Math.floor(byte / 40);
            const second = byte % 40;
            const head = [first, second];
            const body = new Array();
            const all = [first, second];
            while (subcursor.remaining) {
                const vlq = VLQ.DER.readOrThrow(subcursor);
                body.push(vlq);
                all.push(vlq.value);
            }
            const value = all.join(".");
            if (!ObjectIdentifier2.is(value))
                throw new InvalidValueError(`ObjectIdentifier`, value);
            return new DER2(type, length, value, head, body);
        }
    }
    ObjectIdentifier2.DER = DER2;
})(ObjectIdentifier || (ObjectIdentifier = {}));
// src/hazae41/asn1/mods/triplets/octet_string/octet_string.ts
var OctetString = class _OctetString {
    constructor(type, bytes) {
        this.type = type;
        this.bytes = bytes;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.OCTET_STRING);
    static create(type = this.type, bytes) {
        return new _OctetString(type, bytes);
    }
    toDER() {
        return _OctetString.DER.from(this);
    }
    toString() {
        return `OCTET STRING ${Bytes.toHex(this.bytes)}`;
    }
};
((OctetString2) => {
    class DER2 extends OctetString2 {
        constructor(type, length, bytes) {
            super(type, bytes);
            this.type = type;
            this.length = length;
            this.bytes = bytes;
        }
        static type = OctetString2.type.toDER();
        static from(asn1) {
            const length = new Length(asn1.bytes.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const bytes = Bytes.from(cursor.readOrThrow(length.value));
            return new DER2(type, length, bytes);
        }
    }
    OctetString2.DER = DER2;
})(OctetString || (OctetString = {}));
// src/hazae41/asn1/mods/triplets/printable_string/printable_string.ts
var PrintableString = class _PrintableString {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.PRINTABLE_STRING);
    static is(value) {
        return /^[a-zA-Z0-9'()+,\-./:=? ]+$/g.test(value);
    }
    static createOrThrow(type = this.type, value) {
        if (!_PrintableString.is(value))
            throw new InvalidValueError(`PrintableString`, value);
        return new _PrintableString(type, value);
    }
    toDER() {
        return _PrintableString.DER.from(this);
    }
    toString() {
        return `PrintableString ${this.value}`;
    }
};
((PrintableString2) => {
    class DER2 extends PrintableString2 {
        constructor(type, length, value, bytes) {
            super(type.toDER(), value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.bytes = bytes;
        }
        static type = PrintableString2.type.toDER();
        static from(asn1) {
            const bytes = Bytes.encodeUtf8(asn1.value);
            const length = new Length(bytes.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const bytes = Bytes.from(cursor.readOrThrow(length.value));
            const value = new TextDecoder().decode(bytes);
            if (!PrintableString2.is(value))
                throw new InvalidValueError(`PrintableString`, value);
            return new DER2(type, length, value, bytes);
        }
    }
    PrintableString2.DER = DER2;
})(PrintableString || (PrintableString = {}));
// src/hazae41/asn1/mods/triplets/sequence/sequence.ts
var stringify2 = (parent) => `SEQUENCE {
  ${parent.triplets.map((it) => it?.toString()).join(`
`).replaceAll("\n", "\n  ")}
}`;
var Sequence = class _Sequence {
    constructor(type, triplets) {
        this.type = type;
        this.triplets = triplets;
    }
    static type = new Type(Type.clazzes.UNIVERSAL, Type.wraps.CONSTRUCTED, Type.tags.SEQUENCE);
    static create(type = this.type, triplets) {
        return new _Sequence(type, triplets);
    }
    toDER() {
        return _Sequence.DER.from(this);
    }
    toString() {
        return stringify2(this);
    }
};
((Sequence2) => {
    class DER2 extends Sequence2 {
        constructor(type, length, triplets) {
            super(type, triplets);
            this.type = type;
            this.length = length;
            this.triplets = triplets;
        }
        static type = Sequence2.type.toDER();
        static from(asn1) {
            const triplets = asn1.triplets.map((x) => x?.toDER());
            const size = triplets.reduce((p, c) => p + (c == null ? 0 : c.sizeOrThrow()), 0);
            const length = new Length(size).toDER();
            return new DER2(asn1.type.toDER(), length, triplets);
        }
        resolveOrThrow() {
            const resolved = this.triplets.map((it) => it.resolveOrThrow());
            return new DER2(this.type, this.length, resolved);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            for (const triplet of this.triplets)
                triplet?.writeOrThrow(cursor);
            return;
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const subcursor = new Cursor(cursor.readOrThrow(length.value));
            const triplets = new Array();
            while (subcursor.remaining)
                triplets.push(OpaqueTriplet.DER.readOrThrow(subcursor));
            return new DER2(type, length, triplets);
        }
    }
    Sequence2.DER = DER2;
})(Sequence || (Sequence = {}));
// src/hazae41/asn1/mods/triplets/teletex_string/teletex_string.ts
var TeletexString = class _TeletexString {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.TELETEX_STRING);
    static is(_value) {
        return true;
    }
    static create(type = this.type, value) {
        return new _TeletexString(type, value);
    }
    toDER() {
        return _TeletexString.DER.from(this);
    }
    toString() {
        return `TeletexString ${this.value}`;
    }
};
((TeletexString2) => {
    class DER2 extends TeletexString2 {
        constructor(type, length, value, bytes) {
            super(type, value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.bytes = bytes;
        }
        static type = TeletexString2.type.toDER();
        static from(asn1) {
            const bytes = Bytes.encodeUtf8(asn1.value);
            const length = new Length(bytes.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const bytes = Bytes.from(cursor.readOrThrow(length.value));
            const value = new TextDecoder().decode(bytes);
            return new DER2(type, length, value, bytes);
        }
    }
    TeletexString2.DER = DER2;
})(TeletexString || (TeletexString = {}));
// src/hazae41/asn1/mods/triplets/utc_time/utc_time.ts
function pad22(value) {
    return value.toString().padStart(2, "0");
}
var UTCTime = class _UTCTime {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.UTC_TIME);
    static create(type = this.type, value) {
        return new _UTCTime(type, value);
    }
    toDER() {
        return _UTCTime.DER.from(this);
    }
    toString() {
        return `UTCTime ${this.value.toUTCString()}`;
    }
};
((UTCTime2) => {
    class DER2 extends UTCTime2 {
        constructor(type, length, value, bytes) {
            super(type, value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.bytes = bytes;
        }
        static type = UTCTime2.type.toDER();
        static from(asn1) {
            const year = asn1.value.getUTCFullYear();
            const YY = year > 2e3 ? pad22(year - 2e3) : pad22(year - 1900);
            const MM = pad22(asn1.value.getUTCMonth() + 1);
            const DD = pad22(asn1.value.getUTCDate());
            const hh = pad22(asn1.value.getUTCHours());
            const mm = pad22(asn1.value.getUTCMinutes());
            const ss = pad22(asn1.value.getUTCSeconds());
            const bytes = Bytes.encodeUtf8(`${YY}${MM}${DD}${hh}${mm}${ss}Z`);
            const length = new Length(bytes.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const bytes = Bytes.from(cursor.readOrThrow(length.value));
            const text = new TextDecoder().decode(bytes);
            if (text.length !== 13)
                throw new InvalidValueError(`UTCTime`, text);
            if (!text.endsWith("Z"))
                throw new InvalidValueError(`UTCTime`, text);
            const YY = Number(text.slice(0, 2));
            const MM = Number(text.slice(2, 4));
            const DD = Number(text.slice(4, 6));
            const hh = Number(text.slice(6, 8));
            const mm = Number(text.slice(8, 10));
            const ss = Number(text.slice(10, 12));
            const year = YY > 50 ? 1900 + YY : 2e3 + YY;
            const value = /* @__PURE__ */ new Date();
            value.setUTCFullYear(year, MM - 1, DD);
            value.setUTCHours(hh, mm, ss);
            value.setUTCMilliseconds(0);
            return new DER2(type, length, value, bytes);
        }
    }
    UTCTime2.DER = DER2;
})(UTCTime || (UTCTime = {}));
// src/hazae41/asn1/mods/triplets/utf8_string/utf8_string.ts
var UTF8String = class _UTF8String {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static type = Type.create(Type.clazzes.UNIVERSAL, Type.wraps.PRIMITIVE, Type.tags.UTF8_STRING);
    static create(type = this.type, value) {
        return new _UTF8String(type, value);
    }
    toDER() {
        return _UTF8String.DER.from(this);
    }
    toString() {
        return `UTF8String ${this.value}`;
    }
};
((UTF8String2) => {
    class DER2 extends UTF8String2 {
        constructor(type, length, value, bytes) {
            super(type, value);
            this.type = type;
            this.length = length;
            this.value = value;
            this.bytes = bytes;
        }
        static type = UTF8String2.type.toDER();
        static from(asn1) {
            const bytes = Bytes.encodeUtf8(asn1.value);
            const length = new Length(bytes.length).toDER();
            return new DER2(asn1.type.toDER(), length, asn1.value, bytes);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const bytes = Bytes.from(cursor.readOrThrow(length.value));
            const value = new TextDecoder().decode(bytes);
            return new DER2(type, length, value, bytes);
        }
    }
    UTF8String2.DER = DER2;
})(UTF8String || (UTF8String = {}));
// src/hazae41/asn1/mods/triplets/opaque/opaque.ts
var OpaqueTriplet = class _OpaqueTriplet {
    /**
     * An opaque triplet
     * @param bytes
     */
    constructor(type, bytes) {
        this.type = type;
        this.bytes = bytes;
    }
    toDER() {
        return _OpaqueTriplet.DER.from(this);
    }
    toString() {
        return `OPAQUE ${Bytes.toHex(this.bytes)}`;
    }
    readIntoOrNull(readable) {
        return Readable.readFromBytesOrNull(readable, this.bytes);
    }
    readIntoOrThrow(readable) {
        return Readable.readFromBytesOrThrow(readable, this.bytes);
    }
};
((OpaqueTriplet2) => {
    class DER2 extends OpaqueTriplet2 {
        constructor(type, bytes) {
            super(type, bytes);
            this.type = type;
            this.bytes = bytes;
        }
        static from(asn1) {
            return new DER2(asn1.type.toDER(), asn1.bytes);
        }
        resolveOrThrow() {
            if (this.type.equals(Boolean2.DER.type))
                return this.readIntoOrThrow(Boolean2.DER);
            if (this.type.equals(Integer.DER.type))
                return this.readIntoOrThrow(Integer.DER);
            if (this.type.equals(BitString.DER.type))
                return this.readIntoOrThrow(BitString.DER);
            if (this.type.equals(OctetString.DER.type))
                return this.readIntoOrThrow(OctetString.DER);
            if (this.type.equals(Null.DER.type))
                return this.readIntoOrThrow(Null.DER);
            if (this.type.equals(ObjectIdentifier.DER.type))
                return this.readIntoOrThrow(ObjectIdentifier.DER);
            if (this.type.equals(UTF8String.DER.type))
                return this.readIntoOrThrow(UTF8String.DER.DER);
            if (this.type.equals(PrintableString.DER.type))
                return this.readIntoOrThrow(PrintableString.DER);
            if (this.type.equals(TeletexString.DER.type))
                return this.readIntoOrThrow(TeletexString.DER);
            if (this.type.equals(IA5String.DER.type))
                return this.readIntoOrThrow(IA5String.DER);
            if (this.type.equals(Sequence.DER.type))
                return this.readIntoOrThrow(Sequence.DER).resolveOrThrow();
            if (this.type.equals(Set2.DER.type))
                return this.readIntoOrThrow(Set2.DER).resolveOrThrow();
            if (this.type.equals(UTCTime.DER.type))
                return this.readIntoOrThrow(UTCTime.DER);
            if (this.type.equals(GeneralizedTime.DER.type))
                return this.readIntoOrThrow(GeneralizedTime.DER);
            return this;
        }
        sizeOrThrow() {
            return this.bytes.length;
        }
        writeOrThrow(cursor) {
            cursor.writeOrThrow(this.bytes);
        }
        static readOrThrow(cursor) {
            const start = cursor.offset;
            const type = Type.DER.readOrThrow(cursor);
            const length = Length.DER.readOrThrow(cursor);
            const end = cursor.offset;
            cursor.offset = start;
            const bytes = Bytes.from(cursor.readOrThrow(end - start + length.value));
            return new DER2(type, bytes);
        }
    }
    OpaqueTriplet2.DER = DER2;
})(OpaqueTriplet || (OpaqueTriplet = {}));
// src/hazae41/asn1/mods/resolvers/der/cursor.ts
var DERCursor = class _DERCursor {
    constructor(triplets) {
        this.triplets = triplets;
    }
    offset = 0;
    get remaining() {
        return this.triplets.length - this.offset;
    }
    get before() {
        return this.triplets.slice(0, this.offset);
    }
    get after() {
        return this.triplets.slice(this.offset);
    }
    get() {
        return this.triplets.at(this.offset);
    }
    getOrThrow() {
        const triplet = this.get();
        if (triplet == null)
            throw new _DERCursor.ReadError();
        return triplet;
    }
    getAs(clazz) {
        const triplet = this.get();
        if (triplet == null)
            return void 0;
        if (triplet instanceof clazz)
            return triplet;
        if (triplet instanceof OpaqueTriplet) {
            const resolved = triplet.readIntoOrNull(clazz);
            if (resolved != null)
                return resolved;
            return void 0;
        }
        return void 0;
    }
    getAsType(type, clazz) {
        const triplet = this.get();
        if (triplet == null)
            return void 0;
        if (!triplet.type.equals(type))
            return void 0;
        if (triplet instanceof clazz)
            return triplet;
        if (triplet instanceof OpaqueTriplet) {
            const resolved = triplet.readIntoOrNull(clazz);
            if (resolved != null)
                return resolved;
            return void 0;
        }
        return void 0;
    }
    read() {
        const triplet = this.get();
        if (triplet != null)
            this.offset++;
        return triplet;
    }
    readAs(clazz) {
        const triplet = this.getAs(clazz);
        if (triplet != null)
            this.offset++;
        return triplet;
    }
    readAsType(type, clazz) {
        const triplet = this.getAsType(type, clazz);
        if (triplet != null)
            this.offset++;
        return triplet;
    }
    readOrThrow() {
        const triplet = this.read();
        if (triplet == null)
            throw new _DERCursor.ReadError();
        return triplet;
    }
    readAsOrThrow(clazz) {
        const triplet = this.readAs(clazz);
        if (triplet == null)
            throw new _DERCursor.ReadError();
        return triplet;
    }
    readAsTypeOrThrow(type, clazzes) {
        const triplet = this.readAsType(type, clazzes);
        if (triplet == null)
            throw new _DERCursor.ReadError();
        return triplet;
    }
    subAs(clazz) {
        const triplet = this.readAs(clazz);
        if (triplet == null)
            return void 0;
        return new _DERCursor(triplet.triplets);
    }
    subAsType(type, clazz) {
        const triplet = this.readAsType(type, clazz);
        if (triplet == null)
            return void 0;
        return new _DERCursor(triplet.triplets);
    }
    subAsOrThrow(clazz) {
        return new _DERCursor(this.readAsOrThrow(clazz).triplets);
    }
    subAsTypeOrThrow(type, clazz) {
        return new _DERCursor(this.readAsTypeOrThrow(type, clazz).triplets);
    }
    resolveAsOrThrow(resolvable) {
        const struct = this.readAsOrThrow(resolvable.struct);
        const subcursor = new _DERCursor(struct.triplets);
        return resolvable.resolveOrThrow(subcursor);
    }
    resolveAsTypeOrThrow(type, resolvable) {
        const struct = this.readAsTypeOrThrow(type, resolvable.struct);
        const subcursor = new _DERCursor(struct.triplets);
        return resolvable.resolveOrThrow(subcursor);
    }
    resolveAs(resolvable) {
        const struct = this.readAs(resolvable.struct);
        if (struct == null)
            return void 0;
        const subcursor = new _DERCursor(struct.triplets);
        return resolvable.resolveOrThrow(subcursor);
    }
    resolveAsType(type, resolvable) {
        const struct = this.readAsType(type, resolvable.struct);
        if (struct == null)
            return void 0;
        const subcursor = new _DERCursor(struct.triplets);
        return resolvable.resolveOrThrow(subcursor);
    }
};
((DERCursor13) => {
    class CastError extends Error {
        #class = CastError;
        name = this.#class.name;
        constructor() {
            super(`Could not cast triplet`);
        }
    }
    DERCursor13.CastError = CastError;
    class ReadError extends Error {
        #class = ReadError;
        name = this.#class.name;
        constructor() {
            super(`Could not read triplet`);
        }
    }
    DERCursor13.ReadError = ReadError;
})(DERCursor || (DERCursor = {}));
// src/hazae41/asn1/mods/resolvers/der/reader.ts
var DER;
((DER2) => {
    function readOrThrow(cursor) {
        return OpaqueTriplet.DER.readOrThrow(cursor).resolveOrThrow();
    }
    DER2.readOrThrow = readOrThrow;
})(DER || (DER = {}));
// src/hazae41/asn1/mods/triplets/constructed/constructed.ts
var stringify3 = (parent) => `[${parent.type.tag}] {
  ${parent.triplets.map((it) => it?.toString()).join(`
`).replaceAll("\n", "\n  ")}
}`;
var Constructed = class _Constructed {
    constructor(type, triplets) {
        this.type = type;
        this.triplets = triplets;
    }
    static create(type, triplets) {
        return new _Constructed(type, triplets);
    }
    toDER() {
        return _Constructed.DER.from(this);
    }
    toString() {
        return stringify3(this);
    }
};
((Constructed2) => {
    class DER2 extends Constructed2 {
        constructor(type, length, triplets) {
            super(type, triplets);
            this.type = type;
            this.length = length;
            this.triplets = triplets;
        }
        static from(asn1) {
            const triplets = asn1.triplets.map((it) => it?.toDER());
            const size = triplets.reduce((p, c) => p + (c == null ? 0 : c.sizeOrThrow()), 0);
            const length = new Length(size).toDER();
            return new Constructed2.DER(asn1.type.toDER(), length, triplets);
        }
        resolveOrThrow() {
            const resolved = this.triplets.map((it) => it.resolveOrThrow());
            return new DER2(this.type, this.length, resolved);
        }
        sizeOrThrow() {
            return DERTriplet.sizeOrThrow(this.length);
        }
        writeOrThrow(cursor) {
            this.type.writeOrThrow(cursor);
            this.length.writeOrThrow(cursor);
            for (const triplet of this.triplets)
                triplet?.writeOrThrow(cursor);
            return;
        }
        static readOrThrow(cursor) {
            const type = Type.DER.readOrThrow(cursor);
            if (type.wrap !== Type.wraps.CONSTRUCTED)
                throw new InvalidTypeError(`Constructed`, type.byte);
            const length = Length.DER.readOrThrow(cursor);
            const subcursor = new Cursor(cursor.readOrThrow(length.value));
            const triplets = new Array();
            while (subcursor.remaining)
                triplets.push(OpaqueTriplet.DER.readOrThrow(subcursor));
            return new DER2(type, length, triplets);
        }
    }
    Constructed2.DER = DER2;
})(Constructed || (Constructed = {}));
// src/hazae41/x509/mods/index.ts
var mods_exports = {};
__export(mods_exports, {
    AlgorithmIdentifier: () => AlgorithmIdentifier,
    AttributeType: () => AttributeType,
    AttributeTypeAndValue: () => AttributeTypeAndValue,
    Certificate: () => Certificate,
    DirectoryString: () => DirectoryString,
    Extension: () => Extension2,
    Extensions: () => Extensions,
    GeneralName: () => GeneralName,
    GeneralNames: () => GeneralNames,
    InvalidFormatError: () => InvalidFormatError,
    KnownAttributeType: () => KnownAttributeType,
    KnownAttributeTypeAndValue: () => KnownAttributeTypeAndValue,
    KnownAttributeTypes: () => KnownAttributeTypes,
    KnownAttributeValue: () => KnownAttributeValue,
    Name: () => Name,
    OIDs: () => OIDs,
    OtherName: () => OtherName,
    OtherNameValue: () => OtherNameValue,
    PEM: () => PEM,
    RDNSequence: () => RDNSequence,
    RelativeDistinguishedName: () => RelativeDistinguishedName,
    ResolveError: () => ResolveError,
    RsaPublicKey: () => RsaPublicKey,
    SubjectAltName: () => SubjectAltName,
    SubjectPublicKeyInfo: () => SubjectPublicKeyInfo,
    TBSCertificate: () => TBSCertificate,
    TBSCertificateVersion: () => TBSCertificateVersion,
    Unimplemented: () => Unimplemented2,
    UnknownAttributeType: () => UnknownAttributeType,
    UnknownAttributeTypeAndValue: () => UnknownAttributeTypeAndValue,
    UnknownAttributeValue: () => UnknownAttributeValue,
    Validity: () => Validity,
    readAndResolveFromBytesOrThrow: () => readAndResolveFromBytesOrThrow,
    resolveOrThrow: () => resolveOrThrow,
    writeToBytesOrThrow: () => writeToBytesOrThrow
});
// src/hazae41/x509/mods/errors.ts
var Unimplemented2 = class _Unimplemented extends Error {
    #class = _Unimplemented;
    name = this.#class.name;
    constructor() {
        super(`Unimplemented`);
    }
};
var InvalidFormatError = class _InvalidFormatError extends Error {
    #class = _InvalidFormatError;
    name = this.#class.name;
};
// src/hazae41/common/invert.ts
function invert(object) {
    return Object.fromEntries(Object.entries(object).map(([k, v]) => [v, k]));
}
// src/hazae41/x509/mods/oids/oids.ts
var OIDs;
((OIDs2) => {
    OIDs2.keys = {
        commonName: "2.5.4.3",
        serialNumber: "2.5.4.5",
        countryName: "2.5.4.6",
        localityName: "2.5.4.7",
        stateOrProvinceName: "2.5.4.8",
        streetAddress: "2.5.4.9",
        organizationName: "2.5.4.10",
        organizationalUnitName: "2.5.4.11",
        emailAddress: "1.2.840.113549.1.9.1",
        sha256WithRSAEncryption: "1.2.840.113549.1.1.11",
        rsaEncryption: "1.2.840.113549.1.1.1",
        domainComponent: "0.9.2342.19200300.100.1.25",
        userId: "0.9.2342.19200300.100.1.1",
        subjectAltName: "2.5.29.17"
    };
    OIDs2.values = invert(OIDs2.keys);
})(OIDs || (OIDs = {}));
// src/hazae41/x509/mods/keys/rsa/public.ts
var RsaPublicKey = class _RsaPublicKey {
    constructor(publicExponent, modulus) {
        this.publicExponent = publicExponent;
        this.modulus = modulus;
    }
    static oid = OIDs.keys.rsaEncryption;
    toDER() {
        return Sequence.DER.create(void 0, [
            this.publicExponent,
            this.modulus
        ]).toDER();
    }
    toJSON() {
        const publicExponent = this.publicExponent.value.toString(16);
        const modulus = this.modulus.value.toString(16);
        return { publicExponent, modulus };
    }
    static fromJSON(json) {
        const publicExponent = Integer.create(void 0, BigInt("0x" + json.publicExponent));
        const modulus = Integer.create(void 0, BigInt("0x" + json.modulus));
        return new this(publicExponent, modulus);
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const publicExponent = cursor.readAsOrThrow(Integer.DER);
        const modulus = cursor.readAsOrThrow(Integer.DER);
        return new _RsaPublicKey(publicExponent, modulus);
    }
};
// src/hazae41/x509/mods/pem/pem.ts
var PEM;
((PEM2) => {
    PEM2.header = `-----BEGIN CERTIFICATE-----`;
    PEM2.footer = `-----END CERTIFICATE-----`;
    class MissingHeaderError extends Error {
        #class = MissingHeaderError;
        name = this.#class.name;
        constructor() {
            super(`Missing PEM header`);
        }
    }
    PEM2.MissingHeaderError = MissingHeaderError;
    class MissingFooterError extends Error {
        #class = MissingFooterError;
        name = this.#class.name;
        constructor() {
            super(`Missing PEM footer`);
        }
    }
    PEM2.MissingFooterError = MissingFooterError;
    function decodeOrThrow(text) {
        text = text.replaceAll(`
`, ``);
        if (!text.startsWith(PEM2.header))
            throw new MissingHeaderError();
        if (!text.endsWith(PEM2.footer))
            throw new MissingFooterError();
        const body = text.slice(PEM2.header.length, -PEM2.footer.length);
        return Bytes.fromBase64(body);
    }
    PEM2.decodeOrThrow = decodeOrThrow;
    function encodeOrThrow(bytes) {
        let result = `${PEM2.header}
`;
        let body = Bytes.toBase64(bytes);
        while (body) {
            result += `${body.slice(0, 64)}
`;
            body = body.slice(64);
        }
        result += `${PEM2.footer}
`;
        return result;
    }
    PEM2.encodeOrThrow = encodeOrThrow;
})(PEM || (PEM = {}));
// src/hazae41/x509/mods/types/algorithm_identifier/algorithm_identifier.ts
var AlgorithmIdentifier = class _AlgorithmIdentifier {
    constructor(algorithm, parameters) {
        this.algorithm = algorithm;
        this.parameters = parameters;
    }
    toDER() {
        return Sequence.create(void 0, [
            this.algorithm,
            this.parameters
        ]).toDER();
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const algorithm = cursor.readAsOrThrow(ObjectIdentifier.DER);
        const parameters = cursor.read();
        return new _AlgorithmIdentifier(algorithm, parameters);
    }
};
// src/hazae41/x509/mods/types/attribute_type/attribute_type.ts
var KnownAttributeTypes;
((KnownAttributeTypes2) => {
    KnownAttributeTypes2.keys = {
        [OIDs.keys.commonName]: "CN",
        [OIDs.keys.localityName]: "L",
        [OIDs.keys.stateOrProvinceName]: "ST",
        [OIDs.keys.organizationName]: "O",
        [OIDs.keys.organizationalUnitName]: "OU",
        [OIDs.keys.countryName]: "C",
        [OIDs.keys.streetAddress]: "STREET",
        [OIDs.keys.domainComponent]: "DC",
        [OIDs.keys.userId]: "UID"
    };
    function isKey(key) {
        return Object.keys(KnownAttributeTypes2.keys).includes(key);
    }
    KnownAttributeTypes2.isKey = isKey;
    function isValue(value) {
        return Object.keys(KnownAttributeTypes2.values).includes(value);
    }
    KnownAttributeTypes2.isValue = isValue;
    KnownAttributeTypes2.values = invert(KnownAttributeTypes2.keys);
})(KnownAttributeTypes || (KnownAttributeTypes = {}));
var KnownAttributeType = class _KnownAttributeType {
    constructor(inner) {
        this.inner = inner;
    }
    isKnown() {
        return true;
    }
    toDER() {
        return this.inner;
    }
    static fromASN1(triplet) {
        return new _KnownAttributeType(triplet);
    }
    toX501() {
        return KnownAttributeTypes.keys[this.inner.value];
    }
    static fromX501(name) {
        const key = KnownAttributeTypes.values[name];
        const inner = ObjectIdentifier.create(void 0, key).toDER();
        return new _KnownAttributeType(inner);
    }
};
var UnknownAttributeType = class _UnknownAttributeType {
    constructor(inner) {
        this.inner = inner;
    }
    isKnown() {
        return false;
    }
    toDER() {
        return this.inner;
    }
    static fromASN1(triplet) {
        return new _UnknownAttributeType(triplet);
    }
    toX501() {
        return this.inner.value;
    }
};
function isKnownOID(triplet) {
    return KnownAttributeTypes.isKey(triplet.value);
}
var AttributeType;
((AttributeType2) => {
    function fromASN1(triplet) {
        if (isKnownOID(triplet))
            return KnownAttributeType.fromASN1(triplet);
        else
            return UnknownAttributeType.fromASN1(triplet);
    }
    AttributeType2.fromASN1 = fromASN1;
    function fromX501OrThrow(x501) {
        if (KnownAttributeTypes.isValue(x501))
            return KnownAttributeType.fromX501(x501);
        const inner = ObjectIdentifier.create(void 0, x501).toDER();
        return new UnknownAttributeType(inner);
    }
    AttributeType2.fromX501OrThrow = fromX501OrThrow;
})(AttributeType || (AttributeType = {}));
// src/hazae41/x509/mods/types/directory_string/directory_string.ts
var DirectoryString = class _DirectoryString {
    constructor(inner) {
        this.inner = inner;
    }
    toDER() {
        return this.inner;
    }
    static fromASN1(inner) {
        return new _DirectoryString(inner);
    }
    static resolveOrThrow(parent) {
        const triplet = parent.readOrThrow();
        if (triplet instanceof UTF8String.DER)
            return _DirectoryString.fromASN1(triplet);
        if (triplet instanceof PrintableString.DER)
            return _DirectoryString.fromASN1(triplet);
        if (triplet instanceof TeletexString.DER)
            return _DirectoryString.fromASN1(triplet);
        throw new Unimplemented2();
    }
};
// src/hazae41/x509/mods/types/attribute_value/attribute_value.ts
function escape(match) {
    const bytes = Bytes.encodeUtf8(match);
    const hex = Bytes.toHex(bytes);
    return hex.replaceAll(/../g, (m) => "\\" + m);
}
function unescape(match) {
    const hex = match.replaceAll("\\", "");
    const decoded = Bytes.fromHexAllowMissing0(hex);
    return new TextDecoder().decode(decoded);
}
var KnownAttributeValue = class _KnownAttributeValue {
    constructor(inner) {
        this.inner = inner;
    }
    toDER() {
        return this.inner.inner;
    }
    static fromASN1(inner) {
        return new _KnownAttributeValue(DirectoryString.fromASN1(inner));
    }
    toX501() {
        let x501 = this.inner.inner.value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("#", "\\#").replaceAll("+", "\\+").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("<", "\\<").replaceAll("=", "\\=").replaceAll(">", "\\>").replaceAll(/[\p{Cc}\p{Cn}\p{Cs}]+/gu, escape);
        if (x501.startsWith(" "))
            x501 = "\\ " + x501.slice(1);
        if (x501.endsWith(" "))
            x501 = x501.slice(0, -1) + "\\ ";
        return x501;
    }
    static fromX501(x501, creator) {
        const value = x501.replaceAll("\\ ", " ").replaceAll('\\"', '"').replaceAll("\\#", "#").replaceAll("\\+", "+").replaceAll("\\,", ",").replaceAll("\\;", ";").replaceAll("\\<", "<").replaceAll("\\=", "=").replaceAll("\\>", ">").replaceAll("\\\\", "\\").replaceAll(/(\\[0-9A-Fa-f]{2})+/g, unescape);
        const inner = creator.create(void 0, value).toDER();
        const string = new DirectoryString(inner);
        return new _KnownAttributeValue(string);
    }
};
var UnknownAttributeValue = class _UnknownAttributeValue {
    constructor(inner) {
        this.inner = inner;
    }
    toDER() {
        return this.inner;
    }
    static fromASN1(inner) {
        return new this(inner);
    }
    toX501OrThrow() {
        const bytes = Writable.writeToBytesOrThrow(this.inner);
        const hex = Bytes.toHex(bytes);
        return `#${hex}`;
    }
    static fromX501OrThrow(hex) {
        if (!hex.startsWith("#"))
            throw new InvalidFormatError(`AttributeValue not preceded by hash`);
        const decoded = Bytes.fromHexAllowMissing0(hex.slice(1));
        const triplet = Readable.readFromBytesOrThrow(DER, decoded);
        return new _UnknownAttributeValue(triplet);
    }
};
// src/hazae41/x509/mods/types/attribute_type_and_value/attribute_type_and_value.ts
var KnownAttributeTypeAndValue = class {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    isKnown() {
        return true;
    }
    toX501OrThrow() {
        const type = this.type.toX501();
        const value = this.value.toX501();
        return `${type}=${value}`;
    }
    toDER() {
        return Sequence.create(void 0, [
            this.type.inner,
            this.value.inner.toDER()
        ]).toDER();
    }
};
var UnknownAttributeTypeAndValue = class {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    isKnown() {
        return false;
    }
    toX501OrThrow() {
        const type = this.type.toX501();
        const value = this.value.toX501OrThrow();
        return `${type}=${value}`;
    }
    toDER() {
        return Sequence.create(void 0, [
            this.type.inner,
            this.value.inner
        ]).toDER();
    }
};
var AttributeTypeAndValue;
((AttributeTypeAndValue2) => {
    function fromASN1(triplet) {
        const [type, value] = triplet.triplets;
        const type2 = AttributeType.fromASN1(type);
        if (type2.isKnown()) {
            const value22 = KnownAttributeValue.fromASN1(value);
            return new KnownAttributeTypeAndValue(type2, value22);
        }
        const value2 = UnknownAttributeValue.fromASN1(value);
        return new UnknownAttributeTypeAndValue(type2, value2);
    }
    AttributeTypeAndValue2.fromASN1 = fromASN1;
    function resolveOrThrow2(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const oid = cursor.readAsOrThrow(ObjectIdentifier.DER);
        const type = AttributeType.fromASN1(oid);
        if (type.isKnown()) {
            const string = DirectoryString.resolveOrThrow(cursor);
            const value2 = new KnownAttributeValue(string);
            return new KnownAttributeTypeAndValue(type, value2);
        }
        const inner = cursor.readOrThrow();
        const value = new UnknownAttributeValue(inner);
        return new UnknownAttributeTypeAndValue(type, value);
    }
    AttributeTypeAndValue2.resolveOrThrow = resolveOrThrow2;
    function fromX501OrThrow(x501) {
        const [rawType, rawValue] = x501.split("=");
        const type = AttributeType.fromX501OrThrow(rawType);
        if (type.isKnown()) {
            const value2 = KnownAttributeValue.fromX501(rawValue, UTF8String);
            return new KnownAttributeTypeAndValue(type, value2);
        }
        const value = UnknownAttributeValue.fromX501OrThrow(rawValue);
        return new UnknownAttributeTypeAndValue(type, value);
    }
    AttributeTypeAndValue2.fromX501OrThrow = fromX501OrThrow;
})(AttributeTypeAndValue || (AttributeTypeAndValue = {}));
// src/hazae41/x509/mods/types/relative_distinguished_name/relative_distinguished_name.ts
var UNESCAPED_PLUS_REGEX = /[^\\]\+/g;
var RelativeDistinguishedName = class _RelativeDistinguishedName {
    constructor(triplets) {
        this.triplets = triplets;
    }
    toDER() {
        return Set2.create(void 0, this.triplets.map((it) => it.toDER())).toDER();
    }
    toX501OrThrow() {
        return this.triplets.map((it) => it.toX501OrThrow()).join("+");
    }
    static fromX501OrThrow(x501) {
        const triplets = x501.replaceAll(UNESCAPED_PLUS_REGEX, ([c]) => `${c}++`).split("++").map((it) => AttributeTypeAndValue.fromX501OrThrow(it));
        return new _RelativeDistinguishedName(triplets);
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Set2.DER);
        const triplets = new Array(cursor.triplets.length);
        for (let i = 0; i < triplets.length; i++)
            triplets[i] = AttributeTypeAndValue.resolveOrThrow(cursor);
        return new _RelativeDistinguishedName(triplets);
    }
};
// src/hazae41/x509/mods/types/rdn_sequence/rdn_sequence.ts
var UNESCAPED_COMMA_REGEX = /[^\\],/g;
var RDNSequence = class _RDNSequence {
    constructor(triplets) {
        this.triplets = triplets;
    }
    toDER() {
        return Sequence.create(void 0, this.triplets.map((it) => it.toDER())).toDER();
    }
    toX501OrThrow() {
        return this.triplets.map((it) => it.toX501OrThrow()).reverse().join(",");
    }
    static fromX501OrThrow(x501) {
        const triplets = x501.replaceAll(UNESCAPED_COMMA_REGEX, ([c]) => `${c},,`).split(",,").reverse().map((it) => RelativeDistinguishedName.fromX501OrThrow(it));
        return new _RDNSequence(triplets);
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const triplets = new Array(cursor.triplets.length);
        for (let i = 0; i < triplets.length; i++)
            triplets[i] = RelativeDistinguishedName.resolveOrThrow(cursor);
        return new _RDNSequence(triplets);
    }
};
// src/hazae41/x509/mods/types/name/name.ts
var Name = class _Name {
    constructor(inner) {
        this.inner = inner;
    }
    toDER() {
        return this.inner.toDER();
    }
    toX501OrThrow() {
        return this.inner.toX501OrThrow();
    }
    static fromX501OrThrow(x501) {
        return new _Name(RDNSequence.fromX501OrThrow(x501));
    }
    static resolveOrThrow(cursor) {
        return new _Name(RDNSequence.resolveOrThrow(cursor));
    }
};
// src/hazae41/x509/mods/types/subject_public_key_info/subject_public_key_info.ts
var SubjectPublicKeyInfo = class _SubjectPublicKeyInfo {
    constructor(algorithm, subjectPublicKey) {
        this.algorithm = algorithm;
        this.subjectPublicKey = subjectPublicKey;
    }
    toDER() {
        return Sequence.create(void 0, [
            this.algorithm.toDER(),
            this.subjectPublicKey
        ]).toDER();
    }
    readPublicKeyOrThrow() {
        const triplet = Readable.readFromBytesOrThrow(DER, this.subjectPublicKey.bytes);
        if (this.algorithm.algorithm.value === RsaPublicKey.oid)
            return RsaPublicKey.resolveOrThrow(new DERCursor([triplet]));
        throw new Unimplemented2();
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const algorithm = AlgorithmIdentifier.resolveOrThrow(cursor);
        const subjectPublicKey = cursor.readAsOrThrow(BitString.DER);
        return new _SubjectPublicKeyInfo(algorithm, subjectPublicKey);
    }
};
// src/hazae41/x509/mods/types/tbs_certificate/tbs_certificate_version.ts
var TBSCertificateVersion = class _TBSCertificateVersion {
    constructor(value) {
        this.value = value;
    }
    #class = _TBSCertificateVersion;
    static type = new Type(Type.clazzes.CONTEXT, Type.wraps.CONSTRUCTED, 0).toDER();
    static values = {
        v1: 0n,
        v2: 1n,
        v3: 2n
    };
    toDER() {
        return new Constructed(this.#class.type, [this.value]).toDER();
    }
    static from(value) {
        return new this(Integer.create(void 0, value).toDER());
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsType(this.type, Constructed.DER);
        if (cursor == null)
            return void 0;
        const value = cursor.readAsOrThrow(Integer.DER);
        return new _TBSCertificateVersion(value);
    }
};
// src/hazae41/x509/mods/types/validity/validity.ts
var Validity = class _Validity {
    constructor(notBefore, notAfter) {
        this.notBefore = notBefore;
        this.notAfter = notAfter;
    }
    static generate(days) {
        const notBefore = /* @__PURE__ */ new Date();
        const notAfter = /* @__PURE__ */ new Date();
        notAfter.setDate(notAfter.getDate() + days);
        const notBefore2 = GeneralizedTime.create(void 0, notBefore).toDER();
        const notAfter2 = GeneralizedTime.create(void 0, notAfter).toDER();
        return new this(notBefore2, notAfter2);
    }
    toDER() {
        return Sequence.create(void 0, [
            this.notBefore,
            this.notAfter
        ]).toDER();
    }
    toJSON() {
        const notBefore = this.notBefore.value.toJSON();
        const notAfter = this.notAfter.value.toJSON();
        return { notBefore, notAfter };
    }
    static fromJSON(json) {
        const notBefore = GeneralizedTime.create(void 0, new Date(json.notBefore)).toDER();
        const notAfter = GeneralizedTime.create(void 0, new Date(json.notAfter)).toDER();
        return new _Validity(notBefore, notAfter);
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const notBefore = (() => {
            const utc = cursor.readAs(UTCTime.DER);
            if (utc != null)
                return utc;
            const gen = cursor.readAs(GeneralizedTime.DER);
            if (gen != null)
                return gen;
            throw new Error(`Expected UTCTime or GeneralizedTime`);
        })();
        const notAfter = (() => {
            const utc = cursor.readAs(UTCTime.DER);
            if (utc != null)
                return utc;
            const gen = cursor.readAs(GeneralizedTime.DER);
            if (gen != null)
                return gen;
            throw new Error(`Expected UTCTime or GeneralizedTime`);
        })();
        return new _Validity(notBefore, notAfter);
    }
};
// src/hazae41/x509/mods/types/extensions/subject_alt_name/subject_alt_name.ts
var SubjectAltName = class _SubjectAltName {
    constructor(inner) {
        this.inner = inner;
    }
    toDER() {
        return this.inner.toDER();
    }
    static resolveOrThrow(parent) {
        return new _SubjectAltName(GeneralNames.resolveOrThrow(parent));
    }
};
var GeneralNames = class _GeneralNames {
    constructor(names) {
        this.names = names;
    }
    toDER() {
        return Sequence.create(void 0, this.names.map((it) => it.toDER())).toDER();
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const names = cursor.triplets.map(() => GeneralName.resolveOrThrow(cursor));
        return new _GeneralNames(names);
    }
};
var GeneralName;
((GeneralName2) => {
    function resolveOrThrow2(cursor) {
        const otherName = cursor.resolveAsType(Type.DER.context(true, 0), OtherName);
        if (otherName != null)
            return otherName;
        const rfc822Name = cursor.readAsType(Type.DER.context(false, 1), IA5String.DER);
        if (rfc822Name != null)
            return rfc822Name;
        const dnsName = cursor.readAsType(Type.DER.context(false, 2), IA5String.DER);
        if (dnsName != null)
            return dnsName;
        return cursor.readOrThrow();
    }
    GeneralName2.resolveOrThrow = resolveOrThrow2;
})(GeneralName || (GeneralName = {}));
var OtherName = class _OtherName {
    constructor(identifier, value) {
        this.identifier = identifier;
        this.value = value;
    }
    static struct = Sequence.DER;
    toDER() {
        return _OtherName.struct.create(Type.DER.context(true, 0), [
            this.identifier,
            this.value.toDER()
        ]).toDER();
    }
    static resolveOrThrow(cursor) {
        const identifier = cursor.readAsOrThrow(ObjectIdentifier.DER);
        const value = OtherNameValue.resolveOrThrow(cursor);
        return new _OtherName(identifier, value);
    }
};
var OtherNameValue = class _OtherNameValue {
    constructor(triplet) {
        this.triplet = triplet;
    }
    static type = new Type(Type.clazzes.CONTEXT, Type.wraps.CONSTRUCTED, 0).toDER();
    toDER() {
        return Constructed.create(_OtherNameValue.type, [
            this.triplet
        ]).toDER();
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsTypeOrThrow(_OtherNameValue.type, Constructed.DER);
        const triplet = cursor.readOrThrow();
        return new _OtherNameValue(triplet);
    }
};
// src/hazae41/x509/mods/types/extensions/extensions.ts
var Extensions = class _Extensions {
    constructor(extensions) {
        this.extensions = extensions;
    }
    static type = new Type(Type.clazzes.CONTEXT, Type.wraps.CONSTRUCTED, 3).toDER();
    toDER() {
        return Constructed.create(_Extensions.type, [
            Sequence.create(void 0, this.extensions.map((ext) => ext.toDER())).toDER()
        ]).toDER();
    }
    static resolveOrThrow(parent) {
        const explicit = parent.subAsType(this.type, Constructed.DER);
        if (explicit == null)
            return void 0;
        const sequence = explicit.subAsOrThrow(Sequence.DER);
        if (sequence.triplets.length === 0)
            throw new Error("Extensions must be non-empty");
        return new _Extensions(sequence.triplets.map(() => Extension2.resolveOrThrow(sequence)));
    }
};
var Extension2 = class _Extension {
    constructor(extnID, critical, extnValue) {
        this.extnID = extnID;
        this.critical = critical;
        this.extnValue = extnValue;
    }
    toDER() {
        const bytes = Writable.writeToBytesOrThrow(this.extnValue.toDER());
        const extnValue = OctetString.create(void 0, bytes);
        return Sequence.create(void 0, [
            this.extnID,
            this.critical,
            extnValue
        ]).toDER();
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const identifier = cursor.readAsOrThrow(ObjectIdentifier.DER);
        const critical = cursor.readAs(Boolean2.DER);
        const string = cursor.readAsOrThrow(OctetString.DER);
        const asn1 = Readable.readFromBytesOrThrow(DER, string.bytes);
        if (identifier.value === OIDs.keys.subjectAltName) {
            const inner = SubjectAltName.resolveOrThrow(new DERCursor([asn1]));
            return new _Extension(identifier, critical, inner);
        }
        return new _Extension(identifier, critical, asn1);
    }
};
// src/hazae41/x509/mods/types/tbs_certificate/tbs_certificate.ts
var TBSCertificate = class _TBSCertificate {
    constructor(version, serialNumber, signature, issuer, validity, subject, subjectPublicKeyInfo, issuerUniqueID, subjectUniqueID, extensions) {
        this.version = version;
        this.serialNumber = serialNumber;
        this.signature = signature;
        this.issuer = issuer;
        this.validity = validity;
        this.subject = subject;
        this.subjectPublicKeyInfo = subjectPublicKeyInfo;
        this.issuerUniqueID = issuerUniqueID;
        this.subjectUniqueID = subjectUniqueID;
        this.extensions = extensions;
    }
    toDER() {
        return Sequence.create(void 0, [
            this.version?.toDER(),
            this.serialNumber,
            this.signature.toDER(),
            this.issuer.toDER(),
            this.validity.toDER(),
            this.subject.toDER(),
            this.subjectPublicKeyInfo.toDER(),
            this.issuerUniqueID,
            this.subjectUniqueID,
            this.extensions?.toDER()
        ]).toDER();
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const version = TBSCertificateVersion.resolveOrThrow(cursor);
        const serialNumber = cursor.readAsOrThrow(Integer.DER);
        const signature = AlgorithmIdentifier.resolveOrThrow(cursor);
        const issuer = Name.resolveOrThrow(cursor);
        const validity = Validity.resolveOrThrow(cursor);
        const subject = Name.resolveOrThrow(cursor);
        const subjectPublicKeyInfo = SubjectPublicKeyInfo.resolveOrThrow(cursor);
        const issuerUniqueID = cursor.readAsType(Type.DER.context(false, 1), BitString.DER);
        if (issuerUniqueID != null && version?.value?.value !== TBSCertificateVersion.values.v2 && version?.value?.value !== TBSCertificateVersion.values.v3)
            throw new Error("Issuer unique ID must not be present unless version is 2 or 3");
        const subjectUniqueID = cursor.readAsType(Type.DER.context(false, 2), BitString.DER);
        if (subjectUniqueID != null && version?.value?.value !== TBSCertificateVersion.values.v2 && version?.value?.value !== TBSCertificateVersion.values.v3)
            throw new Error("Subject unique ID must not be present unless version is 2 or 3");
        const extensions = Extensions.resolveOrThrow(cursor);
        if (extensions != null && version?.value?.value !== TBSCertificateVersion.values.v3)
            throw new Error("Extensions must not be present unless version is 3");
        return new _TBSCertificate(version, serialNumber, signature, issuer, validity, subject, subjectPublicKeyInfo, issuerUniqueID, subjectUniqueID, extensions);
    }
};
// src/hazae41/x509/mods/types/certificate/certificate.ts
var Certificate = class _Certificate {
    constructor(tbsCertificate, algorithmIdentifier, signatureValue) {
        this.tbsCertificate = tbsCertificate;
        this.algorithmIdentifier = algorithmIdentifier;
        this.signatureValue = signatureValue;
    }
    toDER() {
        return Sequence.create(void 0, [
            this.tbsCertificate.toDER(),
            this.algorithmIdentifier.toDER(),
            this.signatureValue
        ]).toDER();
    }
    static resolveOrThrow(parent) {
        const cursor = parent.subAsOrThrow(Sequence.DER);
        const tbsCertificate = TBSCertificate.resolveOrThrow(cursor);
        const algorithmIdentifier = AlgorithmIdentifier.resolveOrThrow(cursor);
        const signatureValue = cursor.readAsOrThrow(BitString.DER);
        return new _Certificate(tbsCertificate, algorithmIdentifier, signatureValue);
    }
};
// src/hazae41/x509/mods/types/read.ts
function readAndResolveFromBytesOrThrow(resolvable, bytes) {
    const triplet = Readable.readFromBytesOrThrow(DER, bytes);
    const cursor = new DERCursor([triplet]);
    return resolvable.resolveOrThrow(cursor);
}
// src/hazae41/x509/mods/types/resolve.ts
var ResolveError = class _ResolveError extends Error {
    #class = _ResolveError;
    name = this.#class.name;
    constructor(options) {
        super(`Could not resolve`, options);
    }
    static from(cause) {
        return new _ResolveError({ cause });
    }
};
function resolveOrThrow(resolvable, cursor) {
    return resolvable.resolveOrThrow(cursor);
}
// src/hazae41/x509/mods/types/write.ts
function writeToBytesOrThrow(type) {
    return Writable.writeToBytesOrThrow(type.toDER());
}
// src/hazae41/common/BigintBytes.ts
var BigintBytes;
((BigintBytes2) => {
    function toBytes(value) {
        return Bytes.fromHexAllowMissing0(value.toString(16));
    }
    BigintBytes2.toBytes = toBytes;
    function fromBytes(bytes) {
        return BigInt("0x" + Bytes.toHex(bytes));
    }
    BigintBytes2.fromBytes = fromBytes;
})(BigintBytes || (BigintBytes = {}));
// src/hazae41/cadenas/mods/ciphers/curves/secp256r1.ts
var Secp256r1 = class {
    async computeOrThrow(server_ecdh_params) {
        const yc = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
        const ecdh_Yc = Bytes.from(await crypto.subtle.exportKey("raw", yc.publicKey));
        const ecdh_Ys = server_ecdh_params.public_point.point.value.bytes;
        const Ys = await crypto.subtle.importKey("raw", ecdh_Ys, { name: "ECDH", namedCurve: "P-256" }, false, []);
        const ecdh_Z = Bytes.from(await crypto.subtle.deriveBits({ name: "ECDH", public: Ys }, yc.privateKey, 256));
        return { ecdh_Yc, ecdh_Z };
    }
};
// src/hazae41/cadenas/mods/console/index.ts
var Console;
((Console5) => {
    Console5.debugging = false;
    function debug(...params) {
        if (!Console5.debugging)
            return;
        console.debug(...params);
    }
    Console5.debug = debug;
})(Console || (Console = {}));
// src/hazae41/cadenas/mods/errors.ts
var InvalidTlsStateError = class _InvalidTlsStateError extends Error {
    #class = _InvalidTlsStateError;
    name = this.#class.name;
    constructor() {
        super(`Invalid TLS state`);
    }
};
var UnsupportedVersionError = class _UnsupportedVersionError extends Error {
    constructor(version) {
        super(`Unsupported version ${version}`);
        this.version = version;
    }
    #class = _UnsupportedVersionError;
    name = this.#class.name;
};
var UnsupportedCipherError = class _UnsupportedCipherError extends Error {
    constructor(cipher) {
        super(`Unsupported cipher ${cipher}`);
        this.cipher = cipher;
    }
    #class = _UnsupportedCipherError;
    name = this.#class.name;
};
var FatalAlertError = class _FatalAlertError extends Error {
    constructor(alert) {
        super(`Fatal alert ${alert.description}`);
        this.alert = alert;
    }
    #class = _FatalAlertError;
    name = this.#class.name;
};
var WarningAlertError = class _WarningAlertError extends Error {
    constructor(alert) {
        super(`Warning alert ${alert.description}`);
        this.alert = alert;
    }
    #class = _WarningAlertError;
    name = this.#class.name;
};
// src/hazae41/cadenas/mods/extensions.ts
var UnsupportedExtensionError = class _UnsupportedExtensionError extends Error {
    constructor(type) {
        super(`Unsupported extension ${type}`);
        this.type = type;
    }
    #class = _UnsupportedExtensionError;
    name = this.#class.name;
};
var DuplicatedExtensionError = class _DuplicatedExtensionError extends Error {
    constructor(type) {
        super(`Duplicated extension ${type}`);
        this.type = type;
    }
    #class = _DuplicatedExtensionError;
    name = this.#class.name;
};
var UnexpectedExtensionError = class _UnexpectedExtensionError extends Error {
    constructor(type) {
        super(`Unexpected extension ${type}`);
        this.type = type;
    }
    #class = _UnexpectedExtensionError;
    name = this.#class.name;
};
var Extensions2;
((Extensions3) => {
    function getClientExtensions(client_hello) {
        const client_extensions = {};
        if (client_hello.extensions.isNone())
            return client_extensions;
        for (const extension of client_hello.extensions.inner.value.array) {
            if (extension.data.value instanceof SignatureAlgorithms) {
                client_extensions.signature_algorithms = extension.data.value;
                continue;
            }
            if (extension.data.value instanceof EllipticCurves) {
                client_extensions.elliptic_curves = extension.data.value;
                continue;
            }
            if (extension.data.value instanceof ECPointFormats) {
                client_extensions.ec_point_formats = extension.data.value;
                continue;
            }
            if (extension.data.value instanceof ServerNameList) {
                client_extensions.server_name = extension.data.value;
                continue;
            }
            throw new UnsupportedExtensionError(extension.type);
        }
        return client_extensions;
    }
    Extensions3.getClientExtensions = getClientExtensions;
    function getServerExtensions(server_hello, client_extensions) {
        const server_extensions = {};
        if (server_hello.extensions.isNone())
            return server_extensions;
        const types = /* @__PURE__ */ new Set();
        for (const extension of server_hello.extensions.inner.value.array) {
            if (types.has(extension.type))
                throw new DuplicatedExtensionError(extension.type);
            types.add(extension.type);
            if (extension.data.value instanceof SignatureAlgorithms) {
                if (!client_extensions.signature_algorithms)
                    throw new UnexpectedExtensionError(extension.type);
                server_extensions.signature_algorithms = extension.data.value;
                continue;
            }
            if (extension.data.value instanceof EllipticCurves) {
                if (!client_extensions.elliptic_curves)
                    throw new UnexpectedExtensionError(extension.type);
                server_extensions.elliptic_curves = extension.data.value;
                continue;
            }
            if (extension.data.value instanceof ECPointFormats) {
                if (!client_extensions.ec_point_formats)
                    throw new UnexpectedExtensionError(extension.type);
                server_extensions.ec_point_formats = extension.data.value;
                continue;
            }
            if (extension.type === ServerNameList.extension_type) {
                if (!client_extensions.server_name)
                    throw new UnexpectedExtensionError(extension.type);
                continue;
            }
            throw new UnsupportedExtensionError(extension.type);
        }
        return server_extensions;
    }
    Extensions3.getServerExtensions = getServerExtensions;
})(Extensions2 || (Extensions2 = {}));
// src/hazae41/common/bigModularExponent.ts
function bigModularExponent(base, exponent, modulus) {
    if (base <= 0n)
        throw new Error(`Invalid base`);
    if (exponent <= 0n)
        throw new Error(`Invalid exponent`);
    if (modulus <= 0n)
        throw new Error(`Invalid modulus`);
    if (modulus === 1n)
        return 0n;
    let result = 1n;
    while (exponent > 0) {
        if (exponent % 2n === 1n)
            result = result * base % modulus;
        exponent /= 2n;
        base = base ** 2n % modulus;
    }
    return result;
}
// src/hazae41/cadenas/mods/state.ts
async function onAlert(state, record) {
    const alert = record.fragment.readIntoOrThrow(Alert);
    Console.debug(alert);
    if (alert.level === Alert.levels.fatal)
        throw new FatalAlertError(alert);
    if (alert.description === Alert.descriptions.close_notify)
        return state.client.input.close();
    if (alert.level === Alert.levels.warning)
        return console.warn(new WarningAlertError(alert));
    console.warn(`Unknown alert level ${alert.level}`);
}
var TlsClientNoneState = class {
    constructor(app, client2) {
        this.app = app;
        this.client = client2;
    }
    type = "none";
    client_encrypted = false;
    server_encrypted = false;
    async onOutputStart() {
        const client_hello = ClientHello2.default(this.client.params.ciphers, this.client.params.host_name);
        Console.debug(client_hello);
        const client_random = Writable.writeToBytesOrThrow(client_hello.random);
        const client_extensions = Extensions2.getClientExtensions(client_hello);
        const client_hello_handshake = Handshake.from(client_hello);
        this.client.state = new TlsClientHandshakeClientHelloState(this.app, this.client, {
            client_random,
            client_extensions
        });
        this.client.state.messages.push(Writable.writeToBytesOrThrow(client_hello_handshake));
        const client_hello_handshake_record = PlaintextRecord.from(client_hello_handshake, 769);
        this.client.output.enqueue(client_hello_handshake_record);
        const rejectOnClose2 = this.client.resolveOnClose.promise.then(() => {
            throw new Error("Closed");
        });
        const rejectOnError2 = this.client.resolveOnError.promise.then((cause) => {
            throw new Error("Errored", { cause });
        });
        await Promise.race([
            this.client.resolveOnHandshake.promise,
            rejectOnClose2,
            rejectOnError2
        ]);
    }
    async onOutputWrite(_chunk) {
        throw new InvalidTlsStateError();
    }
    async onRecord(_record) {
        throw new InvalidTlsStateError();
    }
};
var TlsClientHandshakeClientHelloState = class {
    constructor(app, client2, params) {
        this.app = app;
        this.client = client2;
        this.params = params;
        this.client_random = params.client_random;
        this.client_extensions = params.client_extensions;
    }
    type = "handshake";
    step = "client_hello";
    client_encrypted = false;
    server_encrypted = false;
    client_random;
    client_extensions;
    messages = new Array();
    async onOutputStart() {
        throw new InvalidTlsStateError();
    }
    async onOutputWrite(_chunk) {
        throw new InvalidTlsStateError();
    }
    async onRecord(record) {
        await this.onPlaintextRecord(record);
    }
    async onPlaintextRecord(record) {
        if (record.type === Alert.record_type)
            return await onAlert(this, record);
        if (record.type === Record.types.handshake)
            return await this.onHandshake(record);
        throw new InvalidTlsStateError();
    }
    async onHandshake(record) {
        const handshake = record.fragment.readIntoOrThrow(Handshake);
        if (handshake.type !== Handshake.types.hello_request)
            this.messages.push(Bytes.from(record.fragment.bytes));
        if (handshake.type === ServerHello2.type)
            return this.onServerHello(handshake);
        console.warn(handshake);
    }
    async onServerHello(handshake) {
        const server_hello = handshake.fragment.readIntoOrThrow(ServerHello2);
        Console.debug(server_hello);
        const version = server_hello.server_version;
        if (version !== 771)
            throw new UnsupportedVersionError(version);
        const cipher = this.client.params.ciphers.find((it) => it.id === server_hello.cipher_suite);
        if (cipher === void 0)
            throw new UnsupportedCipherError(server_hello.cipher_suite);
        const server_random = Writable.writeToBytesOrThrow(server_hello.random);
        const server_extensions = Extensions2.getServerExtensions(server_hello, this.client_extensions);
        Console.debug(server_extensions);
        const { client_random, client_extensions, messages } = this;
        this.client.state = new TlsClientHandshakeServerHelloState(this.app, this.client, {
            version,
            cipher,
            client_random,
            client_extensions,
            server_random,
            server_extensions,
            messages
        });
    }
};
var TlsClientHandshakeServerHelloState = class {
    constructor(app, client2, params) {
        this.app = app;
        this.client = client2;
        this.params = params;
        this.version = params.version;
        this.cipher = params.cipher;
        this.client_random = params.client_random;
        this.client_extensions = params.client_extensions;
        this.server_random = params.server_random;
        this.server_extensions = params.server_extensions;
        this.messages = params.messages;
        this.ccadb = app.get("ccadb");
    }
    type = "handshake";
    step = "server_hello";
    client_encrypted = false;
    server_encrypted = false;
    version;
    cipher;
    client_random;
    client_extensions;
    server_random;
    server_extensions;
    messages;
    ccadb;
    certificate_request;
    server_certificates;
    server_dh_params;
    server_ecdh_params;
    async onOutputStart() {
        throw new InvalidTlsStateError();
    }
    async onOutputWrite(_chunk) {
        throw new InvalidTlsStateError();
    }
    async onRecord(record) {
        await this.onPlaintextRecord(record);
    }
    async onPlaintextRecord(record) {
        if (record.type === Alert.record_type)
            return await onAlert(this, record);
        if (record.type === Record.types.handshake)
            return await this.onHandshake(record);
        throw new InvalidTlsStateError();
    }
    async onHandshake(record) {
        const handshake = record.fragment.readIntoOrThrow(Handshake);
        if (handshake.type !== Handshake.types.hello_request)
            this.messages.push(Bytes.from(record.fragment.bytes));
        if (handshake.type === Certificate2.handshake_type)
            return await this.onCertificate(handshake);
        if (handshake.type === Handshake.types.server_key_exchange)
            return this.onServerKeyExchange(handshake);
        if (handshake.type === CertificateRequest2.type)
            return this.onCertificateRequest(handshake);
        if (handshake.type === ServerHelloDone2.type)
            return this.onServerHelloDone(handshake);
        console.warn(handshake);
    }
    #verifyHostNameOrThrow(certificate) {
        const { host_name } = this.client.params;
        if (host_name == null)
            return true;
        if (certificate.tbsCertificate.extensions == null)
            throw new Error("Could not verify domain name");
        for (const extension of certificate.tbsCertificate.extensions.extensions) {
            if (extension.extnID.value === "2.5.29.17") {
                const subjectAltName = extension.extnValue;
                for (const name of subjectAltName.inner.names) {
                    if (name instanceof OtherName)
                        continue;
                    if (name instanceof IA5String) {
                        if (name.value === host_name)
                            return true;
                        const self = host_name.split(".");
                        const other = name.value.split(".");
                        if (self.length !== other.length)
                            continue;
                        const unstarred = other.map((x, i) => {
                            if (x === "*")
                                return self[i];
                            return x;
                        }).join(".");
                        if (unstarred === host_name)
                            return true;
                        continue;
                    }
                }
            }
        }
        throw new Error("Could not verify domain name");
    }
    async onCertificate(handshake) {
        const certificate = handshake.fragment.readIntoOrThrow(Certificate2);
        Console.debug(certificate);
        const server_certificates = certificate.certificate_list.value.array.map((it) => mods_exports.readAndResolveFromBytesOrThrow(mods_exports.Certificate, it.value.bytes));
        const now = /* @__PURE__ */ new Date();
        if (server_certificates.length === 0)
            throw new Error(`Empty certificates`);
        if (this.#verifyHostNameOrThrow(server_certificates[0]) !== true)
            throw new Error("Could not verify domain name");
        let authorized = this.client.params.authorized;
        for (let i = 0; authorized !== true && i < server_certificates.length; i++) {
            const current = server_certificates[i];
            if (now > current.tbsCertificate.validity.notAfter.value)
                throw new Error(`Certificate is expired`);
            if (now < current.tbsCertificate.validity.notBefore.value)
                throw new Error(`Certificate is not yet valid`);
            const issuer = current.tbsCertificate.issuer.toX501OrThrow();
            let next = server_certificates.at(i + 1);
            if (next == null) {
                const trusteds2 = await this.ccadb.get();
                const trusted2 = trusteds2[issuer];
                if (trusted2 == null)
                    continue;
                const raw = Bytes.fromHexAllowMissing0(trusted2.certBase16);
                const x509 = mods_exports.readAndResolveFromBytesOrThrow(mods_exports.Certificate, raw);
                next = x509;
            }
            const subject = next.tbsCertificate.subject.toX501OrThrow();
            if (issuer !== subject)
                throw new Error(`Invalid certificate chain`);
            const identitySpki = next.tbsCertificate.subjectPublicKeyInfo;
            const identityBytes = Writable.writeToBytesOrThrow(identitySpki.toDER());
            const identityHash = Bytes.from(await crypto.subtle.digest("SHA-256", identityBytes));
            let verified = false;
            if (current.algorithmIdentifier.algorithm.value === "1.2.840.113549.1.1.11") {
                const identityAlgorithm = {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: { name: "SHA-256" }
                };
                const identityKey = await crypto.subtle.importKey("spki", identityBytes, identityAlgorithm, false, ["verify"]);
                const dataBytes = Writable.writeToBytesOrThrow(current.tbsCertificate.toDER());
                const signatureAlgorithm = "RSASSA-PKCS1-v1_5";
                const signatureBytes = current.signatureValue.bytes;
                verified = await crypto.subtle.verify(signatureAlgorithm, identityKey, signatureBytes, dataBytes);
            }
            else if (current.algorithmIdentifier.algorithm.value === "1.2.840.10045.4.3.2") {
                if (identitySpki.algorithm.algorithm.value !== "1.2.840.10045.2.1")
                    throw new Error(`Invalid public key algorithm ${identitySpki.algorithm.algorithm.value}`);
                if (!(identitySpki.algorithm.parameters instanceof ObjectIdentifier))
                    throw new Error(`Invalid public key parameters ${identitySpki.algorithm.parameters}`);
                if (identitySpki.algorithm.parameters.value === "1.2.840.10045.3.1.7") {
                    const identityAlgorithm = { name: "ECDSA", namedCurve: "P-256" };
                    const identityKey = await crypto.subtle.importKey("spki", identityBytes, identityAlgorithm, false, ["verify"]);
                    const dataBytes = Writable.writeToBytesOrThrow(current.tbsCertificate.toDER());
                    const signatureAlgorithm = {
                        name: "ECDSA",
                        hash: { name: "SHA-256" }
                    };
                    const signatureBytes = current.signatureValue.bytes;
                    const signatureAsn1 = Readable.readFromBytesOrThrow(Sequence.DER, signatureBytes);
                    const rAsn1 = signatureAsn1.triplets[0].readIntoOrThrow(Integer.DER);
                    const sAsn1 = signatureAsn1.triplets[1].readIntoOrThrow(Integer.DER);
                    const rAndS = new Cursor(Bytes.alloc(32 * 2));
                    rAndS.writeOrThrow(BigintBytes.toBytes(rAsn1.value));
                    rAndS.writeOrThrow(BigintBytes.toBytes(sAsn1.value));
                    verified = await crypto.subtle.verify(signatureAlgorithm, identityKey, rAndS.bytes, dataBytes);
                }
            }
            else if (current.algorithmIdentifier.algorithm.value === "1.2.840.10045.4.3.3") {
                if (identitySpki.algorithm.algorithm.value !== "1.2.840.10045.2.1")
                    throw new Error(`Invalid public key algorithm ${identitySpki.algorithm.algorithm.value}`);
                if (!(identitySpki.algorithm.parameters instanceof ObjectIdentifier))
                    throw new Error(`Invalid public key parameters ${identitySpki.algorithm.parameters}`);
                if (identitySpki.algorithm.parameters.value === "1.3.132.0.34") {
                    const identityAlgorithm = { name: "ECDSA", namedCurve: "P-384" };
                    const identityKey = await crypto.subtle.importKey("spki", identityBytes, identityAlgorithm, false, ["verify"]);
                    const dataBytes = Writable.writeToBytesOrThrow(current.tbsCertificate.toDER());
                    const signatureAlgorithm = {
                        name: "ECDSA",
                        hash: { name: "SHA-384" }
                    };
                    const signatureBytes = current.signatureValue.bytes;
                    const signatureAsn1 = Readable.readFromBytesOrThrow(Sequence.DER, signatureBytes);
                    const rAsn1 = signatureAsn1.triplets[0].readIntoOrThrow(Integer.DER);
                    const sAsn1 = signatureAsn1.triplets[1].readIntoOrThrow(Integer.DER);
                    const rAndS = new Cursor(Bytes.alloc(48 * 2));
                    rAndS.writeOrThrow(BigintBytes.toBytes(rAsn1.value));
                    rAndS.writeOrThrow(BigintBytes.toBytes(sAsn1.value));
                    verified = await crypto.subtle.verify(signatureAlgorithm, identityKey, rAndS.bytes, dataBytes);
                }
            }
            if (!verified)
                throw new Error(`Invalid signature`);
            const trusteds = await this.ccadb.get();
            const trusted = trusteds[issuer];
            if (trusted == null)
                continue;
            const { notAfter } = trusted;
            if (notAfter && now > new Date(notAfter))
                continue;
            const trustedIdentityHash = Bytes.fromHexAllowMissing0(trusted.hashBase16);
            if (!Bytes.equals(identityHash, trustedIdentityHash))
                continue;
            authorized = true;
            break;
        }
        if (authorized !== true)
            throw new Error(`Could not verify certificate chain`);
        await this.client.params.certificates?.call(this.client, server_certificates);
        this.server_certificates = server_certificates;
    }
    async onServerKeyExchange(handshake) {
        const clazz = ReadableServerKeyExchange2.getOrThrow(this.cipher);
        const server_key_exchange = handshake.fragment.readIntoOrThrow(clazz);
        if (server_key_exchange instanceof ServerKeyExchange2DHSigned) {
            Console.debug(server_key_exchange);
            const { params } = server_key_exchange;
            console.warn("Could not verify key exchange");
            this.server_dh_params = params;
            return;
        }
        if (server_key_exchange instanceof ServerKeyExchange2ECDHSigned) {
            Console.debug(server_key_exchange);
            if (this.server_certificates == null)
                throw new InvalidTlsStateError();
            const { params, signed_params } = server_key_exchange;
            if (signed_params.algorithm.signature.type === SignatureAlgorithm.types.rsa) {
                if (signed_params.algorithm.hash.type !== HashAlgorithm.types.sha256)
                    throw new Error(`Unsupported hash algorithm ${signed_params.algorithm.hash.type}`);
                const identitySpki = mods_exports.writeToBytesOrThrow(this.server_certificates[0].tbsCertificate.subjectPublicKeyInfo);
                const identityAlgorithm = {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: { name: "SHA-256" }
                };
                const identityKey = await crypto.subtle.importKey("spki", identitySpki, identityAlgorithm, false, ["verify"]);
                const dataStruct = new ServerKeyExchange2ECDHPreSigned(this.client_random, this.server_random, params);
                const dataBytes = Writable.writeToBytesOrThrow(dataStruct);
                const signatureAlgorithm = "RSASSA-PKCS1-v1_5";
                const signatureBytes = signed_params.signature.value.bytes;
                const verified = await crypto.subtle.verify(signatureAlgorithm, identityKey, signatureBytes, dataBytes);
                if (verified !== true)
                    throw new Error(`Invalid signature`);
                this.server_ecdh_params = params;
                return;
            }
            if (signed_params.algorithm.signature.type === SignatureAlgorithm.types.ecdsa) {
                if (signed_params.algorithm.hash.type !== HashAlgorithm.types.sha256)
                    throw new Error(`Unsupported hash algorithm ${signed_params.algorithm.hash.type}`);
                const identitySpki = mods_exports.writeToBytesOrThrow(this.server_certificates[0].tbsCertificate.subjectPublicKeyInfo);
                const identityAlgorithm = { name: "ECDSA", namedCurve: "P-256" };
                const identityKey = await crypto.subtle.importKey("spki", identitySpki, identityAlgorithm, false, ["verify"]);
                const dataStruct = new ServerKeyExchange2ECDHPreSigned(this.client_random, this.server_random, params);
                const dataBytes = Writable.writeToBytesOrThrow(dataStruct);
                const signatureAlgorithm = { name: "ECDSA", hash: { name: "SHA-256" } };
                const signatureBytes = signed_params.signature.value.bytes;
                const signatureAsn1 = Readable.readFromBytesOrThrow(Sequence.DER, signatureBytes);
                const rAsn1 = signatureAsn1.triplets[0].readIntoOrThrow(Integer.DER);
                const sAsn1 = signatureAsn1.triplets[1].readIntoOrThrow(Integer.DER);
                const rAndS = new Cursor(Bytes.alloc(32 * 2));
                rAndS.writeOrThrow(BigintBytes.toBytes(rAsn1.value));
                rAndS.writeOrThrow(BigintBytes.toBytes(sAsn1.value));
                const verified = await crypto.subtle.verify(signatureAlgorithm, identityKey, rAndS.bytes, dataBytes);
                if (verified !== true)
                    throw new Error(`Invalid signature`);
                this.server_ecdh_params = params;
                return;
            }
            throw new Error(`Unsupported signature algorithm ${signed_params.algorithm.signature.type}`);
        }
        console.warn(server_key_exchange);
    }
    async onCertificateRequest(handshake) {
        const certificate_request = handshake.fragment.readIntoOrThrow(CertificateRequest2);
        Console.debug(certificate_request);
        this.certificate_request = certificate_request;
    }
    #computeDhOrThrow(params) {
        const { dh_g, dh_p, dh_Ys } = params;
        const g = BigintBytes.fromBytes(dh_g.value.bytes);
        const p = BigintBytes.fromBytes(dh_p.value.bytes);
        const Ys = BigintBytes.fromBytes(dh_Ys.value.bytes);
        const dh_yc = crypto.getRandomValues(Bytes.alloc(dh_p.value.bytes.length));
        const yc = BigintBytes.fromBytes(dh_yc);
        const Yc = bigModularExponent(g, yc, p);
        const Z = bigModularExponent(Ys, yc, p);
        const dh_Yc = BigintBytes.toBytes(Yc);
        const dh_Z = BigintBytes.toBytes(Z);
        return { dh_Yc, dh_Z };
    }
    async #computeEcDhOrThrow(params) {
        if (params.curve_params.named_curve.value === NamedCurve.types.secp256r1)
            return new Secp256r1().computeOrThrow(params);
        throw new InvalidTlsStateError();
    }
    async #computeSecretsOrThrow(premaster_secret) {
        const { cipher, client_random, server_random } = this;
        const { prf_md } = cipher.hash;
        const master_secret_seed = Bytes.concat(client_random, server_random);
        const master_secret = await prfOrThrow(prf_md, premaster_secret, "master secret", master_secret_seed, 48);
        const key_block_length = 0 + 2 * cipher.hash.mac_key_length + 2 * cipher.encryption.enc_key_length + 2 * cipher.encryption.fixed_iv_length;
        const key_block_seed = Bytes.concat(server_random, client_random);
        const key_block = await prfOrThrow(prf_md, master_secret, "key expansion", key_block_seed, key_block_length);
        const key_block_cursor = new Cursor(key_block);
        const mac_key_length = cipher.encryption.cipher_type === "block" ? cipher.hash.mac.mac_key_length : 0;
        const client_write_MAC_key = key_block_cursor.readAndCopyOrThrow(mac_key_length);
        const server_write_MAC_key = key_block_cursor.readAndCopyOrThrow(mac_key_length);
        const client_write_key = key_block_cursor.readAndCopyOrThrow(cipher.encryption.enc_key_length);
        const server_write_key = key_block_cursor.readAndCopyOrThrow(cipher.encryption.enc_key_length);
        const client_write_IV = key_block_cursor.readAndCopyOrThrow(cipher.encryption.fixed_iv_length);
        const server_write_IV = key_block_cursor.readAndCopyOrThrow(cipher.encryption.fixed_iv_length);
        return {
            master_secret,
            client_write_MAC_key,
            server_write_MAC_key,
            client_write_key,
            server_write_key,
            client_write_IV,
            server_write_IV
        };
    }
    async onServerHelloDone(handshake) {
        const server_hello_done = handshake.fragment.readIntoOrThrow(ServerHelloDone2);
        Console.debug(server_hello_done);
        if (this.certificate_request != null) {
            const certificate_list = Vector(Number24).from(List.from([]));
            const certificate = new Certificate2(certificate_list);
            const handshake_certificate = Handshake.from(certificate);
            const record_certificate = PlaintextRecord.from(handshake_certificate, this.version);
            this.messages.push(Writable.writeToBytesOrThrow(handshake_certificate));
            this.client.output.enqueue(record_certificate);
        }
        let secrets;
        if (this.server_dh_params != null) {
            const { dh_Yc, dh_Z } = this.#computeDhOrThrow(this.server_dh_params);
            const handshake_client_key_exchange = Handshake.from(ClientKeyExchange2DH.from(dh_Yc));
            const record_client_key_exchange = PlaintextRecord.from(handshake_client_key_exchange, this.version);
            this.messages.push(Writable.writeToBytesOrThrow(handshake_client_key_exchange));
            this.client.output.enqueue(record_client_key_exchange);
            secrets = await this.#computeSecretsOrThrow(dh_Z);
        }
        else if (this.server_ecdh_params != null) {
            const { ecdh_Yc, ecdh_Z } = await this.#computeEcDhOrThrow(this.server_ecdh_params);
            const handshake_client_key_exchange = Handshake.from(ClientKeyExchange2ECDH.from(ecdh_Yc));
            const record_client_key_exchange = PlaintextRecord.from(handshake_client_key_exchange, this.version);
            this.messages.push(Writable.writeToBytesOrThrow(handshake_client_key_exchange));
            this.client.output.enqueue(record_client_key_exchange);
            secrets = await this.#computeSecretsOrThrow(ecdh_Z);
        }
        else
            throw new InvalidTlsStateError();
        let client_sequence = 0n;
        const server_sequence = 0n;
        const encrypter = await this.cipher.initOrThrow(secrets);
        const change_cipher_spec = new ChangeCipherSpec();
        const record_change_cipher_spec = PlaintextRecord.from(change_cipher_spec, this.version);
        this.client.output.enqueue(record_change_cipher_spec);
        const { handshake_md, prf_md } = this.cipher.hash;
        const handshake_messages = Bytes.concat(...this.messages);
        const handshake_messages_hash = Bytes.from(await crypto.subtle.digest(handshake_md, handshake_messages));
        const verify_data = await prfOrThrow(prf_md, secrets.master_secret, "client finished", handshake_messages_hash, 12);
        const finished = PlaintextRecord.from(Handshake.from(new Finished2(verify_data)), this.version);
        const cfinished = await finished.encryptOrThrow(encrypter, client_sequence++);
        this.client.output.enqueue(cfinished);
        const { version, cipher, client_random, client_extensions, server_random, server_extensions, messages } = this;
        this.client.state = new TlsClientHandshakeClientFinishedState(this.client, {
            version,
            cipher,
            client_random,
            client_extensions,
            server_random,
            server_extensions,
            client_sequence,
            server_sequence,
            encrypter,
            messages
        });
    }
};
var TlsClientHandshakeClientFinishedState = class {
    constructor(client2, params) {
        this.client = client2;
        this.params = params;
        this.version = params.version;
        this.cipher = params.cipher;
        this.client_random = params.client_random;
        this.client_extensions = params.client_extensions;
        this.server_random = params.server_random;
        this.server_extensions = params.server_extensions;
        this.client_sequence = params.client_sequence;
        this.server_sequence = params.server_sequence;
        this.encrypter = params.encrypter;
        this.messages = params.messages;
    }
    type = "handshake";
    step = "client_finished";
    client_encrypted = true;
    server_encrypted = false;
    version;
    cipher;
    client_random;
    client_extensions;
    server_random;
    server_extensions;
    client_sequence;
    server_sequence;
    encrypter;
    messages;
    async onOutputStart() {
        throw new InvalidTlsStateError();
    }
    async onOutputWrite(_chunk) {
        throw new InvalidTlsStateError();
    }
    async onRecord(record) {
        await this.onPlaintextRecord(record);
    }
    async onPlaintextRecord(record) {
        if (record.type === Alert.record_type)
            return await onAlert(this, record);
        if (record.type === ChangeCipherSpec.record_type)
            return await this.onChangeCipherSpec(record);
        throw new InvalidTlsStateError();
    }
    async onChangeCipherSpec(record) {
        const change_cipher_spec = record.fragment.readIntoOrThrow(ChangeCipherSpec);
        Console.debug(change_cipher_spec);
        const { version, cipher, client_random, client_extensions, server_random, server_extensions, client_sequence, server_sequence, encrypter, messages } = this;
        this.client.state = new TlsClientHandshakeServerCipheredState(this.client, {
            version,
            cipher,
            client_random,
            client_extensions,
            server_random,
            server_extensions,
            client_sequence,
            server_sequence,
            encrypter,
            messages
        });
    }
};
async function onCiphertextRecord(state, record) {
    if (state.encrypter.cipher_type === "block") {
        const cipher = BlockCiphertextRecord.fromOrThrow(record);
        const plain = await cipher.decryptOrThrow(state.encrypter, state.server_sequence++);
        await state.onPlaintextRecord(plain);
        return;
    }
    if (state.encrypter.cipher_type === "aead") {
        const cipher = AEADCiphertextRecord.fromOrThrow(record);
        const plain = await cipher.decryptOrThrow(state.encrypter, state.server_sequence++);
        await state.onPlaintextRecord(plain);
        return;
    }
    throw new InvalidTlsStateError();
}
var TlsClientHandshakeServerCipheredState = class {
    constructor(client2, params) {
        this.client = client2;
        this.params = params;
        this.version = params.version;
        this.cipher = params.cipher;
        this.client_random = params.client_random;
        this.client_extensions = params.client_extensions;
        this.server_random = params.server_random;
        this.server_extensions = params.server_extensions;
        this.client_sequence = params.client_sequence;
        this.server_sequence = params.server_sequence;
        this.encrypter = params.encrypter;
        this.messages = params.messages;
    }
    type = "handshake";
    step = "server_ciphered";
    client_encrypted = true;
    server_encrypted = true;
    version;
    cipher;
    client_random;
    client_extensions;
    server_random;
    server_extensions;
    encrypter;
    client_sequence;
    server_sequence;
    messages;
    async onOutputStart() {
        throw new InvalidTlsStateError();
    }
    async onOutputWrite(_chunk) {
        throw new InvalidTlsStateError();
    }
    async onRecord(record) {
        await onCiphertextRecord(this, record);
    }
    async onPlaintextRecord(record) {
        if (record.type === Alert.record_type)
            return await onAlert(this, record);
        if (record.type === Record.types.handshake)
            return await this.onHandshake(record);
        throw new InvalidTlsStateError();
    }
    async onHandshake(record) {
        const handshake = record.fragment.readIntoOrThrow(Handshake);
        if (handshake.type !== Handshake.types.hello_request)
            this.messages.push(Bytes.from(record.fragment.bytes));
        if (handshake.type === Finished2.handshake_type)
            return this.onFinished(handshake);
        console.warn(handshake);
    }
    async onFinished(handshake) {
        const finished = handshake.fragment.readIntoOrThrow(Finished2);
        Console.debug(finished);
        const { version, cipher, client_random, client_extensions, server_random, server_extensions, encrypter, client_sequence, server_sequence } = this;
        this.client.state = new TlsClientHandshakedState(this.client, {
            version,
            cipher,
            client_random,
            client_extensions,
            server_random,
            server_extensions,
            encrypter,
            client_sequence,
            server_sequence
        });
        this.client.resolveOnHandshake.resolve();
        await this.client.params.handshake?.call(this.client);
    }
};
var TlsClientHandshakedState = class {
    constructor(client2, params) {
        this.client = client2;
        this.params = params;
        this.version = params.version;
        this.cipher = params.cipher;
        this.client_random = params.client_random;
        this.client_extensions = params.client_extensions;
        this.server_random = params.server_random;
        this.server_extensions = params.server_extensions;
        this.client_sequence = params.client_sequence;
        this.server_sequence = params.server_sequence;
        this.encrypter = params.encrypter;
    }
    type = "handshaked";
    client_encrypted = true;
    server_encrypted = true;
    version;
    cipher;
    client_random;
    client_extensions;
    server_random;
    server_extensions;
    client_sequence;
    server_sequence;
    encrypter;
    async onOutputStart() {
        throw new InvalidTlsStateError();
    }
    async onOutputWrite(chunk) {
        const { version, encrypter } = this;
        const type = Record.types.application_data;
        const plaintext = new PlaintextRecord(type, version, chunk);
        const ciphertext = await plaintext.encryptOrThrow(encrypter, this.client_sequence++);
        this.client.output.enqueue(ciphertext);
    }
    async onRecord(record) {
        await onCiphertextRecord(this, record);
    }
    async onPlaintextRecord(record) {
        if (record.type === Alert.record_type)
            return await onAlert(this, record);
        if (record.type === Record.types.application_data)
            return await this.onApplicationData(record);
        throw new InvalidTlsStateError();
    }
    async onApplicationData(record) {
        this.client.input.enqueue(record.fragment);
    }
};
// src/hazae41/cascade/mods/cascade/streams/readable/index.ts
var SuperReadableStream = class {
    /**
     * Like a ReadableStream but with a getter to its controller
     * @param subsource
     * @param strategy
     */
    constructor(subsource, strategy) {
        this.subsource = subsource;
        this.strategy = strategy;
        this.source = new SuperUnderlyingDefaultSource(subsource);
        this.substream = new ReadableStream(this.source, strategy);
    }
    source;
    substream;
    [Symbol.dispose]() {
        this.close();
    }
    get controller() {
        return this.source.controller;
    }
    enqueue(chunk) {
        this.controller.enqueue(chunk);
    }
    error(reason) {
        this.controller.error(reason);
    }
    close() {
        this.controller.close();
    }
};
var SuperUnderlyingDefaultSource = class {
    constructor(inner) {
        this.inner = inner;
    }
    #controller;
    get controller() {
        return this.#controller;
    }
    start(controller) {
        this.#controller = controller;
        return this.inner.start?.(controller);
    }
    pull(controller) {
        return this.inner.pull?.(controller);
    }
    cancel(reason) {
        return this.inner.cancel?.(reason);
    }
};
// src/hazae41/cascade/mods/cascade/streams/writable/index.ts
var SuperWritableStream = class {
    /**
     * Like a WritableStream but with a getter to its controller
     * @param subsink
     * @param strategy
     */
    constructor(subsink, strategy) {
        this.subsink = subsink;
        this.strategy = strategy;
        this.sink = new SuperUnderlyingSink(subsink);
        this.substream = new WritableStream(this.sink, strategy);
    }
    sink;
    substream;
    [Symbol.dispose]() {
        this.error();
    }
    get controller() {
        return this.sink.controller;
    }
    get signal() {
        return this.controller.signal;
    }
    error(reason) {
        this.controller.error(reason);
    }
};
var SuperUnderlyingSink = class {
    constructor(inner) {
        this.inner = inner;
    }
    #controller;
    get controller() {
        return this.#controller;
    }
    start(controller) {
        this.#controller = controller;
        return this.inner.start?.(controller);
    }
    write(chunk, controller) {
        return this.inner.write?.(chunk, controller);
    }
    abort(reason) {
        return this.inner.abort?.(reason);
    }
    close() {
        return this.inner.close?.();
    }
};
// src/hazae41/cascade/mods/cascade/plexes/simplex/index.ts
var Simplex = class {
    constructor(params = {}) {
        this.params = params;
        this.#writer = new SuperWritableStream({
            start: () => this.#onStart(),
            write: (c) => this.#onWrite(c),
            close: () => this.#onClose(),
            abort: (e) => this.#onError(e)
        });
        this.#reader = new SuperReadableStream({
            cancel: (e) => this.#onError(e)
        });
    }
    #reader;
    #writer;
    #starting = false;
    #started = false;
    #closing;
    #closed;
    #erroring;
    #errored;
    [Symbol.dispose]() {
        this.close();
    }
    get readable() {
        return this.#reader.substream;
    }
    get writable() {
        return this.#writer.substream;
    }
    get starting() {
        return this.#starting;
    }
    get started() {
        return this.#started;
    }
    get closing() {
        return this.#closing;
    }
    get closed() {
        return this.#closed;
    }
    get erroring() {
        return this.#erroring;
    }
    get errored() {
        return this.#errored;
    }
    get stopped() {
        return this.#errored || this.#closed;
    }
    async #onStart() {
        if (this.#starting)
            return;
        this.#starting = true;
        try {
            await this.params.start?.call(this);
        }
        catch (e) {
            this.error(e);
            throw e;
        }
        this.#started = true;
    }
    async #onClose() {
        if (this.#closing)
            return;
        this.#closing = {};
        try {
            await this.params.close?.call(this);
        }
        catch (e) {
            this.error(e);
            throw e;
        }
        try {
            this.#reader.close();
        }
        catch {
        }
        try {
            this.#writer.error();
        }
        catch {
        }
        this.#closed = {};
    }
    async #onError(reason) {
        if (this.#erroring)
            return;
        this.#erroring = { reason };
        try {
            await this.params.error?.call(this, reason);
        }
        finally {
            try {
                this.#writer.error(reason);
            }
            catch {
            }
            try {
                this.#reader.error(reason);
            }
            catch {
            }
            this.#errored = { reason };
        }
    }
    async #onWrite(data) {
        try {
            await this.params.write?.call(this, data);
        }
        catch (e) {
            this.error(e);
            throw e;
        }
    }
    enqueue(chunk) {
        try {
            this.#reader.enqueue(chunk);
        }
        catch {
        }
    }
    error(reason) {
        this.#onError(reason).catch(console.error);
    }
    close() {
        this.#onClose().catch(console.error);
    }
};
// src/hazae41/cascade/mods/cascade/plexes/duplex/index.ts
var FullDuplex = class {
    constructor(params = {}) {
        this.params = params;
        this.input = new Simplex({
            ...params.input,
            close: () => this.#onInputClose(),
            error: (e) => this.#onInputError(e)
        });
        this.output = new Simplex({
            ...params.output,
            close: () => this.#onOutputClose(),
            error: (e) => this.#onOutputError(e)
        });
        this.inner = {
            readable: this.output.readable,
            writable: this.input.writable
        };
        this.outer = {
            readable: this.input.readable,
            writable: this.output.writable
        };
    }
    inner;
    outer;
    input;
    output;
    #closing;
    #closed;
    #erroring;
    #errored;
    [Symbol.dispose]() {
        this.close();
    }
    get closing() {
        return this.#closing;
    }
    get closed() {
        return this.#closed;
    }
    get erroring() {
        return this.#erroring;
    }
    get errored() {
        return this.#errored;
    }
    get stopped() {
        return this.#errored || this.#closed;
    }
    async #onInputClose() {
        if (!this.output.closing) {
            await this.params.input?.close?.call(this.input);
            return;
        }
        this.#closing = {};
        await this.params.input?.close?.call(this.input);
        await this.params.close?.call(this);
        this.#closed = {};
    }
    async #onOutputClose() {
        if (!this.input.closing) {
            await this.params.output?.close?.call(this.output);
            return;
        }
        this.#closing = {};
        await this.params.output?.close?.call(this.output);
        await this.params.close?.call(this);
        this.#closed = {};
    }
    async #onInputError(reason) {
        if (this.#erroring)
            return;
        this.#erroring = { reason };
        try {
            await this.params.input?.error?.call(this.input, reason);
        }
        finally {
            try {
                await this.params.output?.error?.call(this.output, reason);
            }
            finally {
                try {
                    await this.params.error?.call(this, reason);
                }
                finally {
                    this.output.error(reason);
                    this.#errored = { reason };
                }
            }
        }
    }
    async #onOutputError(reason) {
        if (this.#erroring)
            return;
        this.#erroring = { reason };
        try {
            await this.params.output?.error?.call(this.output, reason);
        }
        finally {
            try {
                await this.params.input?.error?.call(this.input, reason);
            }
            finally {
                try {
                    await this.params.error?.call(this, reason);
                }
                finally {
                    this.input.error(reason);
                    this.#errored = { reason };
                }
            }
        }
    }
    error(reason) {
        this.output.error(reason);
    }
    close() {
        this.output.close();
        this.input.close();
    }
};
var HalfDuplex = class {
    constructor(params = {}) {
        this.params = params;
        this.input = new Simplex({
            ...params.input,
            close: () => this.#onInputClose(),
            error: (e) => this.#onInputError(e)
        });
        this.output = new Simplex({
            ...params.output,
            close: () => this.#onOutputClose(),
            error: (e) => this.#onOutputError(e)
        });
        this.inner = {
            readable: this.output.readable,
            writable: this.input.writable
        };
        this.outer = {
            readable: this.input.readable,
            writable: this.output.writable
        };
    }
    inner;
    outer;
    input;
    output;
    #closing;
    #closed;
    #erroring;
    #errored;
    [Symbol.dispose]() {
        this.close();
    }
    get closing() {
        return this.#closing;
    }
    get closed() {
        return this.#closed;
    }
    get erroring() {
        return this.#erroring;
    }
    get errored() {
        return this.#errored;
    }
    get stopped() {
        return this.#errored || this.#closed;
    }
    async #onInputClose() {
        if (this.#closing)
            return;
        this.#closing = {};
        await this.params.input?.close?.call(this.input);
        await this.params.output?.close?.call(this.output);
        await this.params.close?.call(this);
        this.output.close();
        this.#closed = {};
    }
    async #onOutputClose() {
        if (this.#closing)
            return;
        this.#closing = {};
        await this.params.output?.close?.call(this.output);
        await this.params.input?.close?.call(this.input);
        await this.params.close?.call(this);
        this.input.close();
        this.#closed = {};
    }
    async #onInputError(reason) {
        if (this.#erroring)
            return;
        this.#erroring = { reason };
        try {
            await this.params.input?.error?.call(this.input, reason);
        }
        finally {
            try {
                await this.params.output?.error?.call(this.output, reason);
            }
            finally {
                try {
                    await this.params.error?.call(this, reason);
                }
                finally {
                    this.output.error(reason);
                    this.#errored = { reason };
                }
            }
        }
    }
    async #onOutputError(reason) {
        if (this.#erroring)
            return;
        this.#erroring = { reason };
        try {
            await this.params.output?.error?.call(this.output, reason);
        }
        finally {
            try {
                await this.params.input?.error?.call(this.input, reason);
            }
            finally {
                try {
                    await this.params.error?.call(this, reason);
                }
                finally {
                    this.input.error(reason);
                    this.#errored = { reason };
                }
            }
        }
    }
    error(reason) {
        this.output.error(reason);
    }
    close() {
        this.output.close();
    }
};
// src/hazae41/common/Resizer.ts
var Resizer = class {
    constructor(minimum = 2 ** 10, maximum = 2 ** 20) {
        this.minimum = minimum;
        this.maximum = maximum;
        this.inner = new Cursor(Bytes.alloc(this.minimum));
    }
    inner;
    writeOrThrow(chunk) {
        const length = this.inner.offset + chunk.length;
        assert(length <= this.maximum, `Maximum size exceeded`);
        if (length > this.inner.length) {
            const resized = new Cursor(Bytes.alloc(length));
            resized.writeOrThrow(this.inner.before);
            this.inner = resized;
        }
        this.inner.writeOrThrow(chunk);
    }
    writeFromOrThrow(writable) {
        const length = this.inner.offset + writable.sizeOrThrow();
        assert(length <= this.maximum, `Maximum size exceeded`);
        if (length > this.inner.length) {
            const resized = new Cursor(Bytes.alloc(length));
            resized.writeOrThrow(this.inner.before);
            this.inner = resized;
        }
        writable.writeOrThrow(this.inner);
    }
};
// src/hazae41/cadenas/mods/client.ts
var TlsClientDuplex = class {
    constructor(app, params) {
        this.app = app;
        this.params = params;
        this.duplex = new FullDuplex({
            input: {
                write: (m) => this.#onInputWrite(m)
            },
            output: {
                start: () => this.#onOutputStart(),
                write: (m) => this.#onOutputWrite(m)
            },
            close: () => this.#onDuplexClose(),
            error: (e) => this.#onDuplexError(e)
        });
        this.state = new TlsClientNoneState(app, this);
        this.resolveOnStart.resolve();
    }
    duplex;
    #buffer = new Resizer();
    state;
    resolveOnStart = Promise.withResolvers();
    resolveOnClose = Promise.withResolvers();
    resolveOnError = Promise.withResolvers();
    resolveOnHandshake = Promise.withResolvers();
    [Symbol.dispose]() {
        this.close();
    }
    get inner() {
        return this.duplex.inner;
    }
    get outer() {
        return this.duplex.outer;
    }
    get input() {
        return this.duplex.input;
    }
    get output() {
        return this.duplex.output;
    }
    get closing() {
        return this.duplex.closing;
    }
    get closed() {
        return this.duplex.closed;
    }
    error(reason) {
        this.duplex.error(reason);
    }
    close() {
        this.duplex.close();
    }
    async #onDuplexClose() {
        this.resolveOnClose.resolve();
        await this.params.close?.call(this);
    }
    async #onDuplexError(cause) {
        this.resolveOnError.resolve(cause);
        await this.params.error?.call(this);
    }
    async #onOutputStart() {
        await this.resolveOnStart.promise;
        await this.state.onOutputStart();
    }
    async #onInputWrite(chunk) {
        if (this.#buffer.inner.offset)
            await this.#onReadBuffered(chunk.bytes);
        else
            await this.#onReadDirect(chunk.bytes);
    }
    /**
     * Read from buffer
     * @param chunk
     * @returns
     */
    async #onReadBuffered(chunk) {
        this.#buffer.writeOrThrow(chunk);
        const full = Bytes.from(this.#buffer.inner.before);
        this.#buffer.inner.offset = 0;
        await this.#onReadDirect(full);
    }
    /**
     * Zero-copy reading
     * @param chunk
     * @returns
     */
    async #onReadDirect(chunk) {
        const cursor = new Cursor(chunk);
        while (cursor.remaining) {
            let record;
            try {
                record = Readable.readOrRollbackAndThrow(PlaintextRecord, cursor);
            }
            catch {
                this.#buffer.writeOrThrow(cursor.after);
                break;
            }
            await this.#onRecord(record);
        }
    }
    async #onOutputWrite(chunk) {
        await this.state.onOutputWrite(chunk);
    }
    async #onRecord(record) {
        await this.state.onRecord(record);
    }
};
// src/hazae41/fleche/mods/console/index.ts
var Console2;
((Console5) => {
    Console5.debugging = false;
    function debug(...params) {
        if (!Console5.debugging)
            return;
        console.debug(...params);
    }
    Console5.debug = debug;
})(Console2 || (Console2 = {}));
// src/hazae41/signals/mods/signals/index.ts
var signals_exports = {};
__export(signals_exports, {
    AbortError: () => AbortError,
    rejectOnAbort: () => rejectOnAbort,
    resolveOnAbort: () => resolveOnAbort
});
// src/hazae41/box/index.ts
var Pin = class _Pin {
    constructor(value, clean) {
        this.value = value;
        this.clean = clean;
    }
    static with(value, clean) {
        return new _Pin(value, () => clean(value));
    }
    [Symbol.dispose]() {
        this.clean();
    }
    get() {
        return this.value;
    }
};
// src/hazae41/signals/mods/signals/index.ts
var AbortError = class extends Error {
    constructor(signal) {
        super("Aborted", { cause: signal.reason });
        this.signal = signal;
    }
};
function resolveOnAbort(signal) {
    if (signal.aborted)
        return Pin.with(Promise.resolve(signal.reason), () => {
        });
    const resolveOnAbort2 = Promise.withResolvers();
    const onAbort = () => resolveOnAbort2.resolve(signal.reason);
    const onClean = () => signal.removeEventListener("abort", onAbort);
    signal.addEventListener("abort", onAbort, { passive: true });
    resolveOnAbort2.promise.then(onClean);
    return Pin.with(resolveOnAbort2.promise, onClean);
}
function rejectOnAbort(signal) {
    if (signal.aborted)
        return Pin.with(Promise.reject(new AbortError(signal)), () => {
        });
    const rejectOnAbort2 = Promise.withResolvers();
    const onAbort = () => rejectOnAbort2.reject(new AbortError(signal));
    const onClean = () => signal.removeEventListener("abort", onAbort);
    signal.addEventListener("abort", onAbort, { passive: true });
    rejectOnAbort2.promise.catch(onClean);
    return Pin.with(rejectOnAbort2.promise, onClean);
}
// src/hazae41/common/Strings.ts
var Strings;
((Strings2) => {
    function equalsIgnoreCase(a, b) {
        return a?.toLowerCase() === b?.toLowerCase();
    }
    Strings2.equalsIgnoreCase = equalsIgnoreCase;
    function splitOnFirst(text, splitter) {
        const index = text.indexOf(splitter);
        const first = text.slice(0, index);
        const last = text.slice(index + splitter.length);
        return [first, last];
    }
    Strings2.splitOnFirst = splitOnFirst;
})(Strings || (Strings = {}));
// src/hazae41/fleche/mods/http/errors.ts
var InvalidHttpStateError = class _InvalidHttpStateError extends Error {
    #class = _InvalidHttpStateError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid state`);
    }
};
var UnsupportedContentEncoding = class _UnsupportedContentEncoding extends Error {
    constructor(type) {
        super(`Unsupported "Content-Encoding" header value "${type}"`);
        this.type = type;
    }
    #class = _UnsupportedContentEncoding;
    name = this.constructor.name;
};
var UnsupportedTransferEncoding = class _UnsupportedTransferEncoding extends Error {
    constructor(type) {
        super(`Unsupported "Transfer-Encoding" header value "${type}"`);
        this.type = type;
    }
    #class = _UnsupportedTransferEncoding;
    name = this.constructor.name;
};
var ContentLengthOverflowError = class _ContentLengthOverflowError extends Error {
    constructor(offset, length) {
        super(`Received ${offset} bytes but "Content-Length" header said it was ${length} bytes`);
        this.offset = offset;
        this.length = length;
    }
    #class = _ContentLengthOverflowError;
    name = this.constructor.name;
};
// src/hazae41/fleche/mods/http/client.ts
var Lines;
((Lines2) => {
    Lines2.rn = Bytes.encodeUtf8("\r\n");
    Lines2.rnrn = Bytes.encodeUtf8("\r\n\r\n");
})(Lines || (Lines = {}));
var HttpClientDuplex = class _HttpClientDuplex {
    /**
     * Create a new HTTP 1.1 stream
     * @param subduplex
     */
    constructor(params) {
        this.params = params;
        this.duplex = new FullDuplex({
            input: {
                write: (m) => this.#onInputWrite(m),
                close: () => this.#onInputClose()
            },
            output: {
                start: () => this.#onOutputStart(),
                write: (m) => this.#onOutputWrite(m),
                close: () => this.#onOutputClose()
            },
            close: () => this.params.close?.call(this),
            error: (e) => this.params.error?.call(this, e)
        });
        this.#resolveOnStart.resolve();
    }
    #class = _HttpClientDuplex;
    duplex;
    #resolveOnStart = Promise.withResolvers();
    #state = { type: "none" };
    [Symbol.dispose]() {
        this.close();
    }
    get inner() {
        return this.duplex.inner;
    }
    get outer() {
        return this.duplex.outer;
    }
    get input() {
        return this.duplex.input;
    }
    get output() {
        return this.duplex.output;
    }
    get closing() {
        return this.duplex.closing;
    }
    get closed() {
        return this.duplex.closed;
    }
    error(reason) {
        this.duplex.error(reason);
    }
    close() {
        this.duplex.close();
    }
    async #onInputWrite(chunk) {
        Console2.debug(this.constructor.name, "<-", chunk.bytes.length, Bytes.decodeUtf8(chunk.bytes));
        let bytes = chunk.bytes;
        if (this.#state.type === "heading" || this.#state.type === "upgrading") {
            const body = await this.#onReadHead(bytes, this.#state);
            if (!body?.length)
                return;
            bytes = body;
        }
        if (this.#state.type === "upgraded") {
            this.duplex.input.enqueue(bytes);
            return;
        }
        if (this.#state.type === "headed") {
            if (this.#state.server_transfer.type === "none")
                return await this.#onReadNoneBody(bytes, this.#state);
            if (this.#state.server_transfer.type === "lengthed")
                return await this.#onReadLenghtedBody(bytes, this.#state);
            if (this.#state.server_transfer.type === "chunked")
                return await this.#onReadChunkedBody(bytes, this.#state);
        }
        throw new InvalidHttpStateError();
    }
    async #onInputClose() {
        if (this.#state.type === "headed") {
            const { server_transfer, server_compression } = this.#state;
            if (server_transfer.type === "none" && server_compression) {
                server_compression.sourcer.close();
                await server_compression.pipeline;
            }
        }
    }
    #getTransferOrThrow(headers) {
        const type = headers.get("Transfer-Encoding");
        if (type === "chunked") {
            const buffer = new Resizer();
            return { type, buffer };
        }
        if (type === null) {
            const length = headers.get("Content-Length");
            if (length) {
                return { type: "lengthed", length: Number(length), offset: 0 };
            }
            else {
                return { type: "none" };
            }
        }
        throw new UnsupportedTransferEncoding(type);
    }
    async #getCompressionStreamOrNull(type) {
        if (type === "gzip")
            return new CompressionStream("gzip");
        if (type === "deflate")
            return new CompressionStream("deflate");
        return null;
    }
    async #getCompressionOrNullOrThrow(headers) {
        const type = headers.get("Content-Encoding");
        if (type === null)
            return void 0;
        const encoder = await this.#getCompressionStreamOrNull(type);
        if (encoder == null)
            throw new UnsupportedContentEncoding(type);
        const sourcer = new SuperReadableStream({});
        const sinker = new SuperWritableStream({
            write: (c) => this.duplex.output.enqueue(new Unknown(c)),
            abort: (e) => this.duplex.output.error(e),
            close: () => this.duplex.output.close()
        });
        const pipeline = sourcer.substream.pipeThrough(encoder).pipeTo(sinker.substream).catch(() => {
        });
        return { sourcer, pipeline };
    }
    async #getDecompressionStreamOrNull(type) {
        if (type === "gzip")
            return new DecompressionStream("gzip");
        if (type === "deflate")
            return new DecompressionStream("deflate");
        return null;
    }
    async #getDecompressionOrNullOrThrow(headers) {
        const type = headers.get("Content-Encoding");
        if (type === null)
            return void 0;
        const decoder = await this.#getDecompressionStreamOrNull(type);
        if (decoder == null)
            throw new UnsupportedContentEncoding(type);
        const sourcer = new SuperReadableStream({});
        const sinker = new SuperWritableStream({
            write: (c) => this.duplex.input.enqueue(c),
            abort: (e) => this.duplex.input.error(e),
            close: () => this.duplex.input.close()
        });
        const pipeline = sourcer.substream.pipeThrough(decoder).pipeTo(sinker.substream).catch(() => {
        });
        return { sourcer, pipeline };
    }
    async #onReadHead(chunk, state) {
        const { buffer } = state;
        buffer.writeOrThrow(chunk);
        const split = Bytes.indexOf(buffer.inner.before, Lines.rnrn);
        if (split === -1)
            return void 0;
        const rawHead = buffer.inner.before.subarray(0, split);
        const rawBody = buffer.inner.before.subarray(split + Lines.rnrn.length);
        const [rawStatus, ...rawHeaders] = Bytes.decodeUtf8(rawHead).split("\r\n");
        const [_version, statusString, statusText] = rawStatus.split(" ");
        const status = Number(statusString);
        const headers = new Headers(rawHeaders.map((it) => Strings.splitOnFirst(it, ": ")));
        if (state.type === "upgrading") {
            this.#state = { ...state, type: "upgraded" };
        }
        else {
            const server_transfer = this.#getTransferOrThrow(headers);
            const server_compression = await this.#getDecompressionOrNullOrThrow(headers);
            this.#state = {
                ...state,
                type: "headed",
                server_transfer,
                server_compression
            };
        }
        await this.params.head?.call(this, { headers, status, statusText });
        return Bytes.from(rawBody);
    }
    async #onReadNoneBody(chunk, state) {
        if (state.server_transfer.type !== "none")
            throw new InvalidHttpStateError();
        const { server_compression } = state;
        if (server_compression == null) {
            this.duplex.input.enqueue(chunk);
        }
        else {
            server_compression.sourcer.enqueue(chunk);
        }
    }
    async #onReadLenghtedBody(chunk, state) {
        if (state.server_transfer.type !== "lengthed")
            throw new InvalidHttpStateError();
        const { server_transfer, server_compression } = state;
        server_transfer.offset += chunk.length;
        if (server_transfer.offset > server_transfer.length)
            throw new ContentLengthOverflowError(server_transfer.offset, server_transfer.length);
        if (server_compression == null) {
            this.duplex.input.enqueue(chunk);
        }
        else {
            server_compression.sourcer.enqueue(chunk);
        }
        if (server_transfer.offset === server_transfer.length) {
            if (server_compression == null) {
                this.duplex.input.close();
            }
            else {
                server_compression.sourcer.close();
            }
        }
    }
    async #onReadChunkedBody(chunk, state) {
        if (state.server_transfer.type !== "chunked")
            throw new InvalidHttpStateError();
        const { server_transfer, server_compression } = state;
        const { buffer } = server_transfer;
        buffer.writeOrThrow(chunk);
        let slice = buffer.inner.before;
        while (slice.length) {
            const index = Bytes.indexOf(slice, Lines.rn);
            if (index === -1)
                return;
            const lengthBytes = slice.subarray(0, index);
            const lengthUtf8 = Bytes.decodeUtf8(lengthBytes);
            const length = parseInt(lengthUtf8, 16);
            let rest = slice.subarray(index + 2);
            if (length === 0) {
                if (server_compression == null) {
                    this.duplex.input.close();
                }
                else {
                    server_compression.sourcer.close();
                }
                return;
            }
            if (rest.length < length + Lines.rn.length)
                return;
            const body = rest.slice(0, length);
            rest = rest.subarray(length + Lines.rn.length);
            if (server_compression == null) {
                this.duplex.input.enqueue(body);
            }
            else {
                server_compression.sourcer.enqueue(body);
            }
            buffer.inner.offset = 0;
            buffer.writeOrThrow(rest);
            slice = buffer.inner.before;
        }
    }
    async #onOutputStart() {
        await this.#resolveOnStart.promise;
        const { method, target, headers } = this.params;
        let head = `${method} ${target} HTTP/1.1\r
`;
        headers.forEach((v, k) => head += `${k}: ${v}\r
`);
        head += `\r
`;
        Console2.debug(this.constructor.name, "->", head.length, head);
        this.duplex.output.enqueue(new Unknown(Bytes.encodeUtf8(head)));
        const buffer = new Resizer();
        if (Strings.equalsIgnoreCase(headers.get("Connection"), "Upgrade")) {
            this.#state = { type: "upgrading", buffer };
        }
        else {
            const client_transfer = this.#getTransferOrThrow(headers);
            const client_compression = await this.#getCompressionOrNullOrThrow(headers);
            this.#state = {
                type: "heading",
                buffer,
                client_transfer,
                client_compression
            };
        }
    }
    async #onOutputWrite(chunk) {
        Console2.debug(this.constructor.name, "->", Bytes.decodeUtf8(chunk));
        if (this.#state.type === "upgrading" || this.#state.type === "upgraded") {
            this.duplex.output.enqueue(new Unknown(chunk));
            return;
        }
        if (this.#state.type === "heading" || this.#state.type === "headed") {
            if (this.#state.client_transfer.type === "none")
                return await this.#onWriteNone(chunk, this.#state);
            if (this.#state.client_transfer.type === "lengthed")
                return await this.#onWriteLengthed(chunk, this.#state);
            if (this.#state.client_transfer.type === "chunked")
                return await this.#onWriteChunked(chunk, this.#state);
        }
        throw new InvalidHttpStateError();
    }
    async #onWriteNone(chunk, state) {
        const { client_compression } = state;
        if (client_compression == null) {
            this.duplex.output.enqueue(new Unknown(chunk));
        }
        else {
            client_compression.sourcer.enqueue(chunk);
        }
    }
    async #onWriteLengthed(chunk, state) {
        if (state.client_transfer.type !== "lengthed")
            throw new InvalidHttpStateError();
        const { client_transfer, client_compression } = state;
        client_transfer.offset += chunk.length;
        if (client_transfer.offset > client_transfer.length)
            throw new ContentLengthOverflowError(client_transfer.offset, client_transfer.length);
        if (client_compression == null) {
            this.duplex.output.enqueue(new Unknown(chunk));
        }
        else {
            client_compression.sourcer.enqueue(chunk);
        }
    }
    async #onWriteChunked(chunk, state) {
        const text = new TextDecoder().decode(chunk);
        const length = text.length.toString(16);
        const line = `${length}\r
${text}\r
`;
        const { client_compression } = state;
        if (client_compression == null) {
            this.duplex.output.enqueue(new Unknown(Bytes.encodeUtf8(line)));
        }
        else {
            client_compression.sourcer.enqueue(Bytes.encodeUtf8(line));
        }
    }
    async #onOutputClose() {
        if (this.#state.type === "heading") {
            if (this.#state.client_transfer.type === "none") {
                this.duplex.output.enqueue(new Unknown(Bytes.encodeUtf8(`\r
`)));
                return;
            }
            if (this.#state.client_transfer.type === "chunked") {
                this.duplex.output.enqueue(new Unknown(Bytes.encodeUtf8(`0\r
\r
`)));
                return;
            }
        }
    }
};
// src/hazae41/fleche/mods/fetch/fetch.ts
var Requests;
((Requests2) => {
    async function getBody(request, init) {
        if (request.body == null && init.body != null) {
            if (init.body instanceof ReadableStream) {
                return init.body;
            }
            else {
                const blob = await request.blob();
                return blob.stream();
            }
        }
        return request.body;
    }
    Requests2.getBody = getBody;
})(Requests || (Requests = {}));
var Pipe;
((Pipe2) => {
    function rejectOnError2(http, body) {
        const rejectOnError3 = Promise.withResolvers();
        const controller = new AbortController();
        const { signal } = controller;
        if (body != null)
            body.pipeTo(http.outer.writable, { signal }).catch((cause) => rejectOnError3.reject(new Error("Errored", { cause })));
        else
            http.outer.writable.close().catch((cause) => rejectOnError3.reject(new Error("Errored", { cause })));
        return {
            promise: rejectOnError3.promise,
            [Symbol.dispose]() {
                controller.abort();
            }
        };
    }
    Pipe2.rejectOnError = rejectOnError2;
})(Pipe || (Pipe = {}));
async function fetch2(input, init) {
    var _stack = [];
    try {
        const { stream, preventAbort, preventCancel, preventClose, ...others } = init;
        const request = new Request(input, others);
        const body = await Requests.getBody(request, others);
        const { url, method, signal } = request;
        const { host, pathname, search } = new URL(url);
        const target = pathname + search;
        const headers = new Headers(init.headers);
        if (!headers.has("Host"))
            headers.set("Host", host);
        if (!headers.has("Connection"))
            headers.set("Connection", "keep-alive");
        if (!headers.has("Transfer-Encoding") && !headers.has("Content-Length"))
            headers.set("Transfer-Encoding", "chunked");
        if (!headers.has("Accept-Encoding"))
            headers.set("Accept-Encoding", "gzip, deflate");
        const resolveOnHead = Promise.withResolvers();
        const rejectOnClose2 = Promise.withResolvers();
        const rejectOnError2 = Promise.withResolvers();
        const http = new HttpClientDuplex({
            method,
            target,
            headers,
            async head(init2) {
                const isNullBodyStatus = init2.status === 101 || init2.status === 204 || init2.status === 205 || init2.status === 304;
                if (isNullBodyStatus) {
                    resolveOnHead.resolve(new Response(null, init2));
                }
                else {
                    resolveOnHead.resolve(new Response(this.outer.readable, init2));
                }
            },
            error(cause) {
                rejectOnError2.reject(new Error("Errored", { cause }));
            },
            close() {
                rejectOnClose2.reject(new Error("Closed"));
            }
        });
        stream.readable.pipeTo(http.inner.writable, { signal, preventCancel }).catch(() => {
        });
        http.inner.readable.pipeTo(stream.writable, { signal, preventClose, preventAbort }).catch(() => {
        });
        const rejectPin = __using(_stack, rejectOnAbort(signal));
        const rejectOnPipe = __using(_stack, Pipe.rejectOnError(http, body));
        return await Promise.race([
            resolveOnHead.promise,
            rejectOnClose2.promise,
            rejectOnError2.promise,
            rejectPin.get(),
            rejectOnPipe.promise
        ]);
    }
    catch (_) {
        var _error = _, _hasError = true;
    }
    finally {
        __callDispose(_stack, _error, _hasError);
    }
}
// src/hazae41/common/Iterators.ts
var Iterators;
((Iterators2) => {
    function* peek(iterator) {
        let next = iterator.next();
        while (!next.done) {
            const current = next.value;
            next = iterator.next();
            yield { current, next };
        }
        return next.value;
    }
    Iterators2.peek = peek;
})(Iterators || (Iterators = {}));
// src/hazae41/fleche/mods/websocket/client.ts
Bytes.encodeUtf8("258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
// src/utils/getErrorDetails.ts
function getErrorDetails(error) {
    if (!(error instanceof Error)) {
        let className = "";
        try {
            className = error.constructor.name;
        }
        catch {
        }
        const prefix = className ? `${className} ` : "";
        return `${prefix}${JSON.stringify(error)}`;
    }
    let msg;
    if (error.stack) {
        const includesName = error.stack.includes(error.name);
        const includesMsg = error.stack.includes(error.message);
        if (includesName && includesMsg) {
            msg = error.stack;
        }
        else if (includesMsg) {
            msg = `${error.name}: ${error.stack}`;
        }
        else {
            msg = `${error.name}: ${error.message}
Stack: ${error.stack}`;
        }
    }
    else {
        msg = `${error.name}: ${error.message}`;
    }
    if (error.cause) {
        msg += `
Cause: ${getErrorDetails(error.cause)}`;
    }
    return msg;
}
// src/TorClient/experimentalWarning.ts
var logged = false;
function experimentalWarning() {
    if (logged) {
        return;
    }
    console.warn("NOTICE: tor-js is experimental software: https://github.com/voltrevo/tor-js/issues/4");
    logged = true;
}
// src/TorClient/TorClientBase.ts
var TorClientBase = class {
    log;
    app;
    // Circuit management
    circuitManager;
    constructor(options) {
        experimentalWarning();
        this.app = options.app;
        this.log = this.app.get("Log").child("TorClient");
        this.circuitManager = this.app.get("CircuitManager");
    }
    /**
     * Makes a fetch request through Tor using this client's persistent circuit.
     * The circuit is reused across multiple requests until it reaches the end of its
     * lifetime, at which point it is disposed and a new circuit is created on the
     * next request.
     *
     * Use this method when you have multiple requests or want to maintain
     * a long-lived Tor connection with automatic circuit lifecycle management.
     *
     * @param url The URL to fetch
     * @param options Optional fetch options
     * @returns Promise resolving to the fetch Response
     */
    async fetch(url, options) {
        this.log.info(`Starting fetch request to ${url}`);
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : parsedUrl.protocol === "https:" ? 443 : 80;
        const isHttps = parsedUrl.protocol === "https:";
        this.log.info(`Target: ${hostname}:${port} (HTTPS: ${isHttps})`);
        try {
            return await this.circuitManager.useCircuit(hostname, async (circuit) => {
                this.log.info(`Opening connection to ${hostname}:${port}`);
                const ttcp = await circuit.openOrThrow(hostname, port);
                if (isHttps) {
                    this.log.info("Setting up TLS connection");
                    const ciphers = [
                        ciphers_exports.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
                        ciphers_exports.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
                    ];
                    const ttls = new TlsClientDuplex(this.app, {
                        host_name: hostname,
                        ciphers
                    });
                    ttcp.outer.readable.pipeTo(ttls.inner.writable).catch((error) => {
                        this.log.error(`TLS stream connection failed: ${getErrorDetails(error)}`);
                    });
                    ttls.inner.readable.pipeTo(ttcp.outer.writable).catch((error) => {
                        this.log.error(`TLS stream connection failed: ${getErrorDetails(error)}`);
                    });
                    this.log.info("Making HTTPS request through Tor");
                    const response = await fetch2(url, {
                        ...options,
                        stream: ttls.outer
                    });
                    this.log.info("Request completed successfully");
                    return response;
                }
                else {
                    this.log.info("Making HTTP request through Tor");
                    const response = await fetch2(url, {
                        ...options,
                        stream: ttcp.outer
                    });
                    this.log.info("Request completed successfully");
                    return response;
                }
            });
        }
        catch (error) {
            this.log.error(`Request failed: ${getErrorDetails(error)}`);
            this.circuitManager.clearCircuit(hostname);
            throw error;
        }
    }
    /**
     * Waits for a circuit to be ready if one would be needed for requests.
     * This checks if the CircuitManager has at least one circuit available or being created.
     *
     * @throws Error if circuitBuffer is disabled (circuitBuffer=0) and no circuits are being created
     */
    async waitForCircuit() {
        await this.circuitManager.waitForCircuitReady();
    }
    /**
     * Gets the current circuit state information.
     * @returns Object containing circuit state, update status, and timing information
     */
    getCircuitState() {
        return this.circuitManager.getCircuitState();
    }
    /**
     * Gets a human-readable status string for the current circuit state.
     */
    getCircuitStateString() {
        return this.circuitManager.getCircuitStateString();
    }
    /**
     * Closes the TorClient, cleaning up resources.
     */
    close() {
        const components = {
            Clock: true,
            Log: true,
            ConsensusManager: true,
            MicrodescManager: true,
            CertificateManager: true,
            CircuitBuilder: true,
            CircuitManager: true,
            Storage: true,
            ccadb: true,
            fetchCerts: true
        };
        for (const name of Object.keys(components)) {
            const component = this.app.tryGet(name);
            if (component && "close" in component) {
                component.close();
            }
        }
    }
    /**
     * Symbol.dispose implementation for automatic resource cleanup.
     * Calls close() to clean up all resources.
     */
    [Symbol.dispose]() {
        this.close();
    }
};
// src/hazae41/echalote/mods/index.ts
var mods_exports8 = {};
__export(mods_exports8, {
    Address4: () => Address4,
    Address6: () => Address6,
    AuthChallengeCell: () => AuthChallengeCell,
    Cell: () => Cell,
    Certs: () => Certs,
    CertsCell: () => CertsCell,
    Circuit: () => Circuit,
    Consensus: () => Consensus,
    Console: () => Console3,
    Create2Cell: () => Create2Cell,
    CreateFastCell: () => CreateFastCell,
    CreatedFastCell: () => CreatedFastCell,
    CrossCert: () => CrossCert,
    DestroyCell: () => DestroyCell,
    DestroyedError: () => DestroyedError,
    DuplicatedCertError: () => DuplicatedCertError,
    Ed25519Cert: () => Ed25519Cert,
    ExpectedCertError: () => ExpectedCertError,
    ExpectedCircuitError: () => ExpectedCircuitError,
    ExpectedStreamError: () => ExpectedStreamError,
    ExpiredCertError: () => ExpiredCertError,
    ExtendError: () => ExtendError,
    FragmentOverflowError: () => FragmentOverflowError,
    HASH_LEN: () => HASH_LEN,
    IPv6: () => IPv6,
    InvalidCellError: () => InvalidCellError,
    InvalidCertError: () => InvalidCertError,
    InvalidCommandError: () => InvalidCommandError,
    InvalidKdfKeyHashError: () => InvalidKdfKeyHashError,
    InvalidRelayCellDigestError: () => InvalidRelayCellDigestError,
    InvalidRelayCommandError: () => InvalidRelayCommandError,
    InvalidRelaySendmeCellDigestError: () => InvalidRelaySendmeCellDigestError,
    InvalidSignatureError: () => InvalidSignatureError,
    InvalidTorStateError: () => InvalidTorStateError,
    InvalidTorVersionError: () => InvalidTorVersionError,
    KDFTorResult: () => KDFTorResult,
    KEY_LEN: () => KEY_LEN,
    NetinfoCell: () => NetinfoCell,
    Ntor: () => ntor_exports,
    OpenError: () => OpenError,
    PaddingCell: () => PaddingCell,
    PaddingNegociateCell: () => PaddingNegociateCell,
    PrematureCertError: () => PrematureCertError,
    RelayBeginCell: () => RelayBeginCell,
    RelayBeginDirCell: () => RelayBeginDirCell,
    RelayCell: () => RelayCell,
    RelayConnectedCell: () => RelayConnectedCell,
    RelayDataCell: () => RelayDataCell,
    RelayDropCell: () => RelayDropCell,
    RelayEarlyCell: () => RelayEarlyCell,
    RelayEndCell: () => RelayEndCell,
    RelayEndReasonExitPolicy: () => RelayEndReasonExitPolicy,
    RelayEndReasonOther: () => RelayEndReasonOther,
    RelayEndedError: () => RelayEndedError,
    RelayExtend2Cell: () => RelayExtend2Cell,
    RelayExtend2Link: () => RelayExtend2Link,
    RelayExtend2LinkIPv4: () => RelayExtend2LinkIPv4,
    RelayExtend2LinkIPv6: () => RelayExtend2LinkIPv6,
    RelayExtend2LinkLegacyID: () => RelayExtend2LinkLegacyID,
    RelayExtend2LinkModernID: () => RelayExtend2LinkModernID,
    RelayExtended2Cell: () => RelayExtended2Cell,
    RelaySendmeCircuitCell: () => RelaySendmeCircuitCell,
    RelaySendmeDigest: () => RelaySendmeDigest,
    RelaySendmeStreamCell: () => RelaySendmeStreamCell,
    RelayTruncateCell: () => RelayTruncateCell,
    RelayTruncatedCell: () => RelayTruncatedCell,
    RsaCert: () => RsaCert,
    SecretCircuit: () => SecretCircuit,
    SecretTorClientDuplex: () => SecretTorClientDuplex,
    SecretTorStreamDuplex: () => SecretTorStreamDuplex,
    SecretTurboDuplex: () => SecretTurboDuplex,
    Target: () => Target,
    TorClientDuplex: () => TorClientDuplex,
    TorStreamDuplex: () => TorStreamDuplex,
    TruncateError: () => TruncateError,
    TurboDuplex: () => TurboDuplex,
    TurboFrame: () => TurboFrame,
    TypedAddress: () => TypedAddress,
    UnexpectedCircuitError: () => UnexpectedCircuitError,
    UnexpectedContinuationError: () => UnexpectedContinuationError,
    UnexpectedStreamError: () => UnexpectedStreamError,
    Unimplemented: () => Unimplemented3,
    UnknownAddressType: () => UnknownAddressType,
    UnknownCertError: () => UnknownCertError,
    UnknownCertExtensionError: () => UnknownCertExtensionError,
    UnknownCircuitError: () => UnknownCircuitError,
    UnknownProtocolError: () => UnknownProtocolError,
    UnknownStreamError: () => UnknownStreamError,
    UnrecognisedRelayCellError: () => UnrecognisedRelayCellError,
    VariablePaddingCell: () => VariablePaddingCell,
    VersionsCell: () => VersionsCell,
    createSnowflakeStream: () => createSnowflakeStream
});
// src/hazae41/echalote/mods/console/index.ts
var Console3;
((Console5) => {
    Console5.debugging = false;
    function log(...params) {
        if (!Console5.debugging)
            return;
        console.log(...params);
    }
    Console5.log = log;
    function debug(...params) {
        if (!Console5.debugging)
            return;
        console.debug(...params);
    }
    Console5.debug = debug;
    function error(...params) {
        if (!Console5.debugging)
            return;
        console.error(...params);
    }
    Console5.error = error;
    function warn(...params) {
        if (!Console5.debugging)
            return;
        console.warn(...params);
    }
    Console5.warn = warn;
})(Console3 || (Console3 = {}));
// src/hazae41/bitset/index.ts
var Bitset = class _Bitset {
    constructor(value, length) {
        this.value = value;
        this.length = length;
    }
    /**
     * Get the value as a left-padded binary string
     *
     * @returns string
     */
    toString() {
        return this.value.toString(2).padStart(this.length, "0");
    }
    /**
     * Transform the value to an unsigned 32-bits number
     *
     * @returns the same Bitset
     */
    unsign() {
        this.value >>>= 0;
        return this;
    }
    /**
     * Bitwise NOT
     *
     * @returns the same Bitset
     */
    not() {
        for (let i = 0; i < this.length; i++)
            this.value ^= 1 << i;
        return this;
    }
    /**
     * Get the bit at big-endian index
     *
     * @param index
     * @returns boolean
     */
    getBE(index) {
        return Boolean(this.value & 1 << this.length - index - 1);
    }
    /**
     * Get the bit at little-endian index
     *
     * @param index
     * @returns boolean
     */
    getLE(index) {
        return Boolean(this.value & 1 << index);
    }
    /**
     * Toggle the bit at big-endian index
     *
     * @param index
     * @returns the same Bitset
     */
    toggleBE(index) {
        this.value ^= 1 << this.length - index - 1;
        return this;
    }
    /**
     * Toggle the bit at little-endian index
     *
     * @param index
     * @returns the same Bitset
     */
    toggleLE(index) {
        this.value ^= 1 << index;
        return this;
    }
    /**
     * Enable the bit at big-endian index
     *
     * @param index
     * @returns the same Bitset
     */
    enableBE(index) {
        this.value |= 1 << this.length - index - 1;
        return this;
    }
    /**
     * Enable the bit at little-endian index
     *
     * @param index
     * @returns the same Bitset
     */
    enableLE(index) {
        this.value |= 1 << index;
        return this;
    }
    /**
     * Disable the bit at big-endian index
     *
     * @param index
     * @returns the same Bitset
     */
    disableBE(index) {
        this.value &= ~(1 << this.length - index - 1);
        return this;
    }
    /**
     * Disable the bit at little-endian index
     *
     * @param index
     * @returns the same Bitset
     */
    disableLE(index) {
        this.value &= ~(1 << index);
        return this;
    }
    /**
     * Set the bit at big-endian index
     *
     * @param index
     * @param value
     * @returns the same Bitset
     */
    setBE(index, value) {
        if (value)
            return this.enableBE(index);
        else
            return this.disableBE(index);
    }
    /**
     * Set the bit at little-endian index
     *
     * @param index
     * @param value
     * @returns the same Bitset
     */
    setLE(index, value) {
        if (value)
            return this.enableLE(index);
        else
            return this.disableLE(index);
    }
    /**
     * Get first count bits
     *
     * @param count number of bits to get
     * @returns a new Bitset
     */
    first(count) {
        const value = this.value >> this.length - count;
        return new _Bitset(value, count);
    }
    /**
     * Get last count bits
     *
     * @param count number of bits to get
     * @returns a new Bitset
     */
    last(count) {
        const value = this.value & (1 << count) - 1;
        return new _Bitset(value, count);
    }
};
// src/hazae41/echalote/mods/snowflake/turbo/frame.ts
var FragmentOverflowError = class _FragmentOverflowError extends Error {
    #class = _FragmentOverflowError;
    name = this.constructor.name;
    constructor() {
        super(`Fragment size is greater than or equals to 2**20`);
    }
};
var UnexpectedContinuationError = class _UnexpectedContinuationError extends Error {
    #class = _UnexpectedContinuationError;
    name = this.constructor.name;
    constructor() {
        super(`Unexpected continuation bit on third byte`);
    }
};
var TurboFrame = class _TurboFrame {
    constructor(padding, fragment, fragmentSize) {
        this.padding = padding;
        this.fragment = fragment;
        this.fragmentSize = fragmentSize;
    }
    static createOrThrow(params) {
        const { padding, fragment } = params;
        const fragmentSize = fragment.sizeOrThrow();
        if (fragmentSize >= 2 ** 20)
            throw new FragmentOverflowError();
        return new _TurboFrame(padding, fragment, fragmentSize);
    }
    sizeOrThrow() {
        if (this.fragmentSize < 2 ** 6)
            return 1 + this.fragmentSize;
        if (this.fragmentSize < 2 ** 13)
            return 2 + this.fragmentSize;
        if (this.fragmentSize < 2 ** 20)
            return 3 + this.fragmentSize;
        throw new FragmentOverflowError();
    }
    writeOrThrow(cursor) {
        if (this.fragmentSize < 2 ** 6)
            return this.writeOrThrow6(cursor, this.fragmentSize);
        if (this.fragmentSize < 2 ** 13)
            return this.writeOrThrow13(cursor, this.fragmentSize);
        if (this.fragmentSize < 2 ** 20)
            return this.writeOrThrow20(cursor, this.fragmentSize);
        throw new FragmentOverflowError();
    }
    writeOrThrow6(cursor, size) {
        const first = new Bitset(size, 8);
        first.setBE(0, !this.padding);
        first.setBE(1, false);
        first.unsign();
        cursor.writeUint8OrThrow(first.value);
        this.fragment.writeOrThrow(cursor);
    }
    writeOrThrow13(cursor, size) {
        let bits = "";
        bits += this.padding ? "0" : "1";
        bits += "1";
        const length = size.toString(2).padStart(13, "0");
        bits += length.slice(0, 6);
        bits += "0";
        bits += length.slice(6, 13);
        cursor.writeUint16OrThrow(parseInt(bits, 2));
        this.fragment.writeOrThrow(cursor);
    }
    writeOrThrow20(cursor, size) {
        let bits = "";
        bits += this.padding ? "0" : "1";
        bits += "1";
        const length = size.toString(2).padStart(20, "0");
        bits += length.slice(0, 6);
        bits += "1";
        bits += length.slice(6, 13);
        bits += "0";
        bits += length.slice(13, 20);
        cursor.writeUint24OrThrow(parseInt(bits, 2));
        this.fragment.writeOrThrow(cursor);
    }
    /**
     * Read from bytes
     * @param binary bytes
     */
    static readOrThrow(cursor) {
        let lengthBits = "";
        const first = cursor.readUint8OrThrow();
        const bits = new Bitset(first, 8);
        const padding = !bits.getBE(0);
        const continuation = bits.getBE(1);
        lengthBits += bits.last(6).toString();
        if (continuation) {
            const second = cursor.readUint8OrThrow();
            const bits2 = new Bitset(second, 8);
            const continuation2 = bits2.getBE(0);
            lengthBits += bits2.last(7).toString();
            if (continuation2) {
                const third = cursor.readUint8OrThrow();
                const bits3 = new Bitset(third, 8);
                const continuation3 = bits3.getBE(0);
                lengthBits += bits3.last(7).toString();
                if (continuation3)
                    throw new UnexpectedContinuationError();
            }
        }
        const length = parseInt(lengthBits, 2);
        const bytes = cursor.readAndCopyOrThrow(length);
        const fragment = new Unknown(bytes);
        return _TurboFrame.createOrThrow({ padding, fragment });
    }
};
// src/hazae41/echalote/mods/snowflake/turbo/reader.ts
var SecretTurboReader = class {
    constructor(parent) {
        this.parent = parent;
    }
    async onWrite(chunk) {
        const frame = chunk.readIntoOrThrow(TurboFrame);
        if (frame.padding)
            return;
        this.parent.input.enqueue(frame.fragment);
    }
};
// src/hazae41/echalote/mods/snowflake/turbo/writer.ts
var SecretTurboWriter = class {
    constructor(parent) {
        this.parent = parent;
    }
    async onStart() {
        await this.parent.resolveOnStart.promise;
        const token = this.parent.class.token;
        this.parent.output.enqueue(new Unknown(token));
        const client2 = this.parent.client;
        this.parent.output.enqueue(new Unknown(client2));
    }
    async onWrite(fragment) {
        const frame = TurboFrame.createOrThrow({ padding: false, fragment });
        this.parent.output.enqueue(frame);
    }
};
// src/hazae41/echalote/mods/snowflake/turbo/stream.ts
var TurboDuplex = class {
    constructor(params = {}) {
        this.params = params;
        this.#secret = new SecretTurboDuplex(params);
    }
    #secret;
    [Symbol.dispose]() {
        this.close();
    }
    get client() {
        return this.#secret.client;
    }
    get inner() {
        return this.#secret.inner;
    }
    get outer() {
        return this.#secret.outer;
    }
    get closing() {
        return this.#secret.closing;
    }
    get closed() {
        return this.#secret.closed;
    }
    error(reason) {
        this.#secret.error(reason);
    }
    close() {
        this.#secret.close();
    }
};
var SecretTurboDuplex = class _SecretTurboDuplex {
    constructor(params = {}) {
        this.params = params;
        const { client: client2 = Bytes.random(8) } = params;
        this.client = client2;
        this.reader = new SecretTurboReader(this);
        this.writer = new SecretTurboWriter(this);
        this.duplex = new FullDuplex({
            input: {
                write: (c) => this.reader.onWrite(c)
            },
            output: {
                start: () => this.writer.onStart(),
                write: (c) => this.writer.onWrite(c)
            },
            error: (e) => this.params.error?.call(void 0, e),
            close: () => this.params.close?.call(void 0)
        });
        this.resolveOnStart.resolve();
    }
    #class = _SecretTurboDuplex;
    static token = Bytes.from([
        18,
        147,
        96,
        93,
        39,
        129,
        117,
        245
    ]);
    duplex;
    reader;
    writer;
    client;
    resolveOnStart = Promise.withResolvers();
    get class() {
        return this.#class;
    }
    [Symbol.dispose]() {
        this.close();
    }
    get inner() {
        return this.duplex.inner;
    }
    get outer() {
        return this.duplex.outer;
    }
    get input() {
        return this.duplex.input;
    }
    get output() {
        return this.duplex.output;
    }
    get closing() {
        return this.duplex.closing;
    }
    get closed() {
        return this.duplex.closed;
    }
    error(reason) {
        this.duplex.error(reason);
    }
    close() {
        this.duplex.close();
    }
};
// src/hazae41/kcp/mods/console/index.ts
var Console4;
((Console5) => {
    Console5.debugging = false;
    function debug(...params) {
        if (!Console5.debugging)
            return;
        console.debug(...params);
    }
    Console5.debug = debug;
})(Console4 || (Console4 = {}));
// src/hazae41/kcp/mods/kcp/segment/index.ts
var KcpSegment = class _KcpSegment {
    constructor(conversation, command, count = 0, window = 65535, timestamp = Math.ceil(Date.now() / 1e3), serial, unackSerial, fragment, fragmentSize) {
        this.conversation = conversation;
        this.command = command;
        this.count = count;
        this.window = window;
        this.timestamp = timestamp;
        this.serial = serial;
        this.unackSerial = unackSerial;
        this.fragment = fragment;
        this.fragmentSize = fragmentSize;
    }
    static commands = {
        push: 81,
        ack: 82,
        wask: 83,
        wins: 84
    };
    static empty(params) {
        const { conversation, command, count, window, timestamp, serial, unackSerial, fragment } = params;
        return new _KcpSegment(conversation, command, count, window, timestamp, serial, unackSerial, fragment, 0);
    }
    static newOrThrow(params) {
        const { conversation, command, count, window, timestamp, serial, unackSerial, fragment } = params;
        return new _KcpSegment(conversation, command, count, window, timestamp, serial, unackSerial, fragment, fragment.sizeOrThrow());
    }
    sizeOrThrow() {
        return 0 + 4 + 1 + 1 + 2 + 4 + 4 + 4 + 4 + this.fragmentSize;
    }
    writeOrThrow(cursor) {
        cursor.writeUint32OrThrow(this.conversation, true);
        cursor.writeUint8OrThrow(this.command);
        cursor.writeUint8OrThrow(this.count);
        cursor.writeUint16OrThrow(this.window, true);
        cursor.writeUint32OrThrow(this.timestamp, true);
        cursor.writeUint32OrThrow(this.serial, true);
        cursor.writeUint32OrThrow(this.unackSerial, true);
        cursor.writeUint32OrThrow(this.fragmentSize, true);
        this.fragment.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const conversation = cursor.readUint32OrThrow(true);
        const command = cursor.readUint8OrThrow();
        const count = cursor.readUint8OrThrow();
        const window = cursor.readUint16OrThrow(true);
        const timestamp = cursor.readUint32OrThrow(true);
        const serial = cursor.readUint32OrThrow(true);
        const unackSerial = cursor.readUint32OrThrow(true);
        const length = cursor.readUint32OrThrow(true);
        const bytes = Bytes.from(cursor.readOrThrow(length));
        const fragment = new Unknown(bytes);
        return _KcpSegment.newOrThrow({
            conversation,
            command,
            count,
            window,
            timestamp,
            serial,
            unackSerial,
            fragment
        });
    }
};
// src/hazae41/kcp/mods/kcp/reader/index.ts
var UnknownKcpCommandError = class _UnknownKcpCommandError extends Error {
    #class = _UnknownKcpCommandError;
    name = this.#class.name;
    constructor() {
        super(`Unknown KCP command`);
    }
};
var SecretKcpReader = class {
    constructor(parent) {
        this.parent = parent;
    }
    #buffer = /* @__PURE__ */ new Map();
    // fixme
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async onWrite(chunk) {
        const cursor = new Cursor(chunk.bytes);
        while (cursor.remaining)
            await this.#onSegment(Readable.readOrRollbackAndThrow(KcpSegment, cursor));
        return;
    }
    async #onSegment(segment) {
        if (segment.conversation !== this.parent.conversation)
            return;
        if (segment.command === KcpSegment.commands.push)
            return await this.#onPushSegment(segment);
        if (segment.command === KcpSegment.commands.ack)
            return await this.#onAckSegment(segment);
        if (segment.command === KcpSegment.commands.wask)
            return await this.#onWaskSegment(segment);
        throw new UnknownKcpCommandError();
    }
    async #onPushSegment(segment) {
        const conversation = this.parent.conversation;
        const command = KcpSegment.commands.ack;
        const timestamp = segment.timestamp;
        const serial = segment.serial;
        const unackSerial = this.parent.recvCounter;
        const fragment = new Empty();
        const ack = KcpSegment.empty({
            conversation,
            command,
            timestamp,
            serial,
            unackSerial,
            fragment
        });
        this.parent.output.enqueue(ack);
        if (segment.serial < this.parent.recvCounter) {
            Console4.debug(`Received previous KCP segment`);
            return;
        }
        if (segment.serial > this.parent.recvCounter) {
            Console4.debug(`Received next KCP segment`);
            this.#buffer.set(segment.serial, segment);
            return;
        }
        this.parent.input.enqueue(segment.fragment);
        this.parent.recvCounter++;
        let next;
        while (next = this.#buffer.get(this.parent.recvCounter)) {
            Console4.debug(`Unblocked next KCP segment`);
            this.parent.input.enqueue(next.fragment);
            this.#buffer.delete(this.parent.recvCounter);
            this.parent.recvCounter++;
        }
    }
    async #onAckSegment(segment) {
        const future = this.parent.resolveOnAckBySerial.get(segment.serial);
        if (future == null)
            return;
        this.parent.resolveOnAckBySerial.delete(segment.serial);
        future.resolve();
    }
    async #onWaskSegment(_segment) {
        const conversation = this.parent.conversation;
        const command = KcpSegment.commands.wins;
        const serial = 0;
        const unackSerial = this.parent.recvCounter;
        const fragment = new Empty();
        const wins = KcpSegment.empty({
            conversation,
            command,
            serial,
            unackSerial,
            fragment
        });
        this.parent.output.enqueue(wins);
    }
};
// src/hazae41/kcp/mods/kcp/writer/index.ts
var SecretKcpWriter = class {
    constructor(parent) {
        this.parent = parent;
    }
    async onWrite(fragment) {
        const { lowDelay = 300, highDelay = 3e3 } = this.parent.params;
        const conversation = this.parent.conversation;
        const command = KcpSegment.commands.push;
        const serial = this.parent.sendCounter++;
        const unackSerial = this.parent.recvCounter;
        const segment = KcpSegment.newOrThrow({
            conversation,
            command,
            serial,
            unackSerial,
            fragment
        });
        this.parent.output.enqueue(segment);
        const start = Date.now();
        const retry = setInterval(() => {
            if (this.parent.closed) {
                clearInterval(retry);
                return;
            }
            const delay = Date.now() - start;
            if (delay > highDelay) {
                clearInterval(retry);
                return;
            }
            this.parent.output.enqueue(segment);
        }, lowDelay);
        const { resolveOnClose, resolveOnError } = this.parent;
        const resolveOnAck = Promise.withResolvers();
        Promise.race([
            resolveOnAck.promise,
            resolveOnClose.promise,
            resolveOnError.promise
        ]).finally(() => clearInterval(retry));
        this.parent.resolveOnAckBySerial.set(serial, resolveOnAck);
    }
};
// src/hazae41/kcp/mods/kcp/stream/index.ts
var KcpDuplex = class {
    constructor(params = {}) {
        this.params = params;
        this.#secret = new SecretKcpDuplex(params);
    }
    #secret;
    [Symbol.dispose]() {
        this.close();
    }
    get conversation() {
        return this.#secret.conversation;
    }
    get inner() {
        return this.#secret.inner;
    }
    get outer() {
        return this.#secret.outer;
    }
    get closing() {
        return this.#secret.closing;
    }
    get closed() {
        return this.#secret.closed;
    }
    error(reason) {
        this.#secret.error(reason);
    }
    close() {
        this.#secret.close();
    }
};
var SecretKcpDuplex = class {
    constructor(params = {}) {
        this.params = params;
        const { conversation = new Cursor(crypto.getRandomValues(Bytes.alloc(4))).readUint32OrThrow(true) } = this.params;
        this.conversation = conversation;
        this.reader = new SecretKcpReader(this);
        this.writer = new SecretKcpWriter(this);
        this.duplex = new FullDuplex({
            input: {
                write: (m) => this.reader.onWrite(m)
            },
            output: {
                write: (m) => this.writer.onWrite(m)
            },
            close: () => this.#onDuplexClose(),
            error: (e) => this.#onDuplexError(e)
        });
    }
    // fixme
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    duplex;
    reader;
    writer;
    conversation;
    resolveOnClose = Promise.withResolvers();
    resolveOnError = Promise.withResolvers();
    resolveOnAckBySerial = /* @__PURE__ */ new Map();
    sendCounter = 0;
    recvCounter = 0;
    [Symbol.dispose]() {
        this.close();
    }
    get inner() {
        return this.duplex.inner;
    }
    get outer() {
        return this.duplex.outer;
    }
    get input() {
        return this.duplex.input;
    }
    get output() {
        return this.duplex.output;
    }
    get closing() {
        return this.duplex.closing;
    }
    get closed() {
        return this.duplex.closed;
    }
    async #onDuplexClose() {
        this.resolveOnClose.resolve();
        await this.params.close?.call(void 0);
    }
    async #onDuplexError(cause) {
        this.resolveOnError.resolve(cause);
        await this.params.error?.call(void 0, cause);
    }
    error(reason) {
        this.duplex.error(reason);
    }
    close() {
        this.duplex.close();
    }
};
// src/hazae41/smux/mods/smux/segment/index.ts
var SmuxUpdate = class _SmuxUpdate {
    constructor(consumed, window) {
        this.consumed = consumed;
        this.window = window;
    }
    sizeOrThrow() {
        return 4 + 4;
    }
    writeOrThrow(cursor) {
        cursor.writeUint32OrThrow(this.consumed, true);
        cursor.writeUint32OrThrow(this.window, true);
    }
    static readOrThrow(cursor) {
        const consumed = cursor.readUint32OrThrow(true);
        const window = cursor.readUint32OrThrow(true);
        return new _SmuxUpdate(consumed, window);
    }
};
var SmuxSegment = class _SmuxSegment {
    constructor(version, command, stream, fragment, fragmentSize) {
        this.version = version;
        this.command = command;
        this.stream = stream;
        this.fragment = fragment;
        this.fragmentSize = fragmentSize;
    }
    static versions = {
        one: 1,
        two: 2
    };
    static commands = {
        syn: 0,
        fin: 1,
        psh: 2,
        nop: 3,
        upd: 4
    };
    static empty(params) {
        const { version, command, stream, fragment } = params;
        return new _SmuxSegment(version, command, stream, fragment, 0);
    }
    static newOrThrow(params) {
        const { version, command, stream, fragment } = params;
        return new _SmuxSegment(version, command, stream, fragment, fragment.sizeOrThrow());
    }
    sizeOrThrow() {
        return 0 + 1 + 1 + 2 + 4 + this.fragmentSize;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.version);
        cursor.writeUint8OrThrow(this.command);
        cursor.writeUint16OrThrow(this.fragmentSize, true);
        cursor.writeUint32OrThrow(this.stream, true);
        this.fragment.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const version = cursor.readUint8OrThrow();
        const command = cursor.readUint8OrThrow();
        const length = cursor.readUint16OrThrow(true);
        const stream = cursor.readUint32OrThrow(true);
        const bytes = Bytes.from(cursor.readOrThrow(length));
        const fragment = new Unknown(bytes);
        return _SmuxSegment.newOrThrow({ version, command, stream, fragment });
    }
};
// src/hazae41/smux/mods/smux/reader/index.ts
var UnknownSmuxCommandError = class _UnknownSmuxCommandError extends Error {
    #class = _UnknownSmuxCommandError;
    name = this.#class.name;
    constructor() {
        super(`Unknown SMUX command`);
    }
};
var InvalidSmuxVersionError = class _InvalidSmuxVersionError extends Error {
    constructor(version) {
        super(`Invalid SMUX version ${version}`);
        this.version = version;
    }
    #class = _InvalidSmuxVersionError;
    name = this.#class.name;
};
var InvalidSmuxStreamError = class _InvalidSmuxStreamError extends Error {
    constructor(stream) {
        super(`Invalid SMUX stream ${stream}`);
        this.stream = stream;
    }
    #class = _InvalidSmuxStreamError;
    name = this.#class.name;
};
var SecretSmuxReader = class {
    constructor(parent) {
        this.parent = parent;
    }
    // fixme
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async onWrite(chunk) {
        if (this.parent.buffer.offset)
            return await this.#onReadBuffered(chunk.bytes);
        else
            return await this.#onReadDirect(chunk.bytes);
    }
    async #onReadBuffered(chunk) {
        this.parent.buffer.writeOrThrow(chunk);
        const full = Bytes.from(this.parent.buffer.before);
        this.parent.buffer.offset = 0;
        return await this.#onReadDirect(full);
    }
    async #onReadDirect(chunk) {
        const cursor = new Cursor(chunk);
        while (cursor.remaining) {
            let segment;
            try {
                segment = Readable.readOrRollbackAndThrow(SmuxSegment, cursor);
            }
            catch {
                this.parent.buffer.writeOrThrow(cursor.after);
                break;
            }
            await this.#onSegment(segment);
        }
    }
    async #onSegment(segment) {
        if (segment.version !== 2)
            throw new InvalidSmuxVersionError(segment.version);
        if (segment.command === SmuxSegment.commands.psh)
            return await this.#onPshSegment(segment);
        if (segment.command === SmuxSegment.commands.nop)
            return await this.#onNopSegment(segment);
        if (segment.command === SmuxSegment.commands.upd)
            return await this.#onUpdSegment(segment);
        if (segment.command === SmuxSegment.commands.fin)
            return await this.#onFinSegment(segment);
        throw new UnknownSmuxCommandError();
    }
    // fixme
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async #onPshSegment(segment) {
        if (segment.stream !== this.parent.stream)
            throw new InvalidSmuxStreamError(segment.stream);
        this.parent.selfRead += segment.fragment.bytes.length;
        this.parent.selfIncrement += segment.fragment.bytes.length;
        this.parent.input.enqueue(segment.fragment);
        if (this.parent.selfIncrement >= this.parent.selfWindow / 2) {
            const version = 2;
            const command = SmuxSegment.commands.upd;
            const stream = this.parent.stream;
            const fragment = new SmuxUpdate(this.parent.selfRead, this.parent.selfWindow);
            const segment2 = SmuxSegment.newOrThrow({
                version,
                command,
                stream,
                fragment
            });
            this.parent.output.enqueue(segment2);
            this.parent.selfIncrement = 0;
        }
    }
    async #onNopSegment(ping) {
        const version = 2;
        const command = SmuxSegment.commands.nop;
        const stream = ping.stream;
        const fragment = new Empty();
        const pong = SmuxSegment.empty({ version, command, stream, fragment });
        this.parent.output.enqueue(pong);
    }
    // fixme
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async #onUpdSegment(segment) {
        if (segment.stream !== this.parent.stream)
            throw new InvalidSmuxStreamError(segment.stream);
        const update = segment.fragment.readIntoOrThrow(SmuxUpdate);
        this.parent.peerConsumed = update.consumed;
        this.parent.peerWindow = update.window;
    }
    async #onFinSegment(segment) {
        if (segment.stream !== this.parent.stream)
            throw new InvalidSmuxStreamError(segment.stream);
        this.parent.output.close();
    }
};
// src/hazae41/smux/mods/smux/writer/index.ts
var PeerWindowOverflow = class _PeerWindowOverflow extends Error {
    #class = _PeerWindowOverflow;
    name = this.#class.name;
    constructor() {
        super(`Peer window reached`);
    }
};
var SecretSmuxWriter = class {
    constructor(parent) {
        this.parent = parent;
    }
    async onStart() {
        await this.parent.resolveOnStart.promise;
        await this.#sendSynOrThrow();
        await this.#sendUpdOrThrow();
    }
    async #sendSynOrThrow() {
        const version = 2;
        const command = SmuxSegment.commands.syn;
        const stream = this.parent.stream;
        const fragment = new Empty();
        const segment = SmuxSegment.empty({ version, command, stream, fragment });
        this.parent.output.enqueue(segment);
    }
    async #sendUpdOrThrow() {
        const version = 2;
        const command = SmuxSegment.commands.upd;
        const stream = this.parent.stream;
        const fragment = new SmuxUpdate(0, this.parent.selfWindow);
        const segment = SmuxSegment.newOrThrow({
            version,
            command,
            stream,
            fragment
        });
        this.parent.output.enqueue(segment);
    }
    async onWrite(fragment) {
        const inflight = this.parent.selfWrite - this.parent.peerConsumed;
        if (inflight >= this.parent.peerWindow)
            throw new PeerWindowOverflow();
        const version = 2;
        const command = SmuxSegment.commands.psh;
        const stream = this.parent.stream;
        const segment = SmuxSegment.newOrThrow({
            version,
            command,
            stream,
            fragment
        });
        this.parent.output.enqueue(segment);
        this.parent.selfWrite += segment.fragmentSize;
    }
};
// src/hazae41/smux/mods/smux/stream/index.ts
var SmuxDuplex = class {
    constructor(params = {}) {
        this.params = params;
        this.#secret = new SecretSmuxDuplex(params);
    }
    #secret;
    [Symbol.dispose]() {
        this.close();
    }
    get stream() {
        return this.#secret.stream;
    }
    get inner() {
        return this.#secret.inner;
    }
    get outer() {
        return this.#secret.outer;
    }
    get closing() {
        return this.#secret.closing;
    }
    get closed() {
        return this.#secret.closed;
    }
    error(reason) {
        this.#secret.error(reason);
    }
    close() {
        this.#secret.close();
    }
};
var SecretSmuxDuplex = class {
    constructor(params = {}) {
        this.params = params;
        const { stream = 3 } = params;
        this.stream = stream;
        this.reader = new SecretSmuxReader(this);
        this.writer = new SecretSmuxWriter(this);
        this.duplex = new FullDuplex({
            input: {
                write: (m) => this.reader.onWrite(m)
            },
            output: {
                start: () => this.writer.onStart(),
                write: (m) => this.writer.onWrite(m)
            },
            close: () => this.#onDuplexClose(),
            error: (e) => this.#onDuplexError(e)
        });
        this.resolveOnStart.resolve();
    }
    // fixme
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    duplex;
    reader;
    writer;
    buffer = new Cursor(Bytes.alloc(65535));
    stream;
    selfRead = 0;
    selfWrite = 0;
    selfIncrement = 0;
    peerConsumed = 0;
    peerWindow = 65535;
    resolveOnStart = Promise.withResolvers();
    [Symbol.dispose]() {
        this.close();
    }
    get selfWindow() {
        return this.buffer.bytes.length;
    }
    get inner() {
        return this.duplex.inner;
    }
    get outer() {
        return this.duplex.outer;
    }
    get input() {
        return this.duplex.input;
    }
    get output() {
        return this.duplex.output;
    }
    get closing() {
        return this.duplex.closing;
    }
    get closed() {
        return this.duplex.closed;
    }
    async #onDuplexClose() {
        await this.params.close?.call(void 0);
    }
    async #onDuplexError(reason) {
        await this.params.error?.call(void 0, reason);
    }
    error(reason) {
        this.duplex.error(reason);
    }
    close() {
        this.duplex.close();
    }
};
// src/hazae41/echalote/mods/snowflake/snowflake.ts
function createSnowflakeStream(raw) {
    const turbo = new TurboDuplex();
    const kcp = new KcpDuplex({ lowDelay: 100, highDelay: 1e3 });
    const smux = new SmuxDuplex();
    raw.outer.readable.pipeTo(turbo.inner.writable).catch(() => {
    });
    turbo.inner.readable.pipeTo(raw.outer.writable).catch(() => {
    });
    turbo.outer.readable.pipeTo(kcp.inner.writable).catch(() => {
    });
    kcp.inner.readable.pipeTo(turbo.outer.writable).catch(() => {
    });
    kcp.outer.readable.pipeTo(smux.inner.writable).catch(() => {
    });
    smux.inner.readable.pipeTo(kcp.outer.writable).catch(() => {
    });
    return smux;
}
// src/hazae41/echalote/mods/tor/constants.ts
var HASH_LEN = 20;
var KEY_LEN = 16;
// src/hazae41/echalote/mods/tor/algorithms/kdftor.ts
var InvalidKdfKeyHashError = class _InvalidKdfKeyHashError extends Error {
    #class = _InvalidKdfKeyHashError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid KDF key hash`);
    }
};
var KDFTorResult;
((KDFTorResult2) => {
    async function computeOrThrow(k0) {
        const ki = new Cursor(Bytes.alloc(k0.length + 1));
        ki.writeOrThrow(k0);
        const k = new Cursor(Bytes.alloc(HASH_LEN * 5));
        for (let i = 0; k.remaining > 0; i++) {
            ki.setUint8OrThrow(i);
            const h = Bytes.from(await crypto.subtle.digest("SHA-1", ki.bytes));
            k.writeOrThrow(h);
        }
        k.offset = 0;
        const keyHash = k.readAndCopyOrThrow(HASH_LEN);
        const forwardDigest = k.readAndCopyOrThrow(HASH_LEN);
        const backwardDigest = k.readAndCopyOrThrow(HASH_LEN);
        const forwardKey = k.readAndCopyOrThrow(KEY_LEN);
        const backwardKey = k.readAndCopyOrThrow(KEY_LEN);
        return { keyHash, forwardDigest, backwardDigest, forwardKey, backwardKey };
    }
    KDFTorResult2.computeOrThrow = computeOrThrow;
})(KDFTorResult || (KDFTorResult = {}));
// src/hazae41/echalote/mods/tor/algorithms/ntor/ntor.ts
var ntor_exports = {};
__export(ntor_exports, {
    InvalidNtorAuthError: () => InvalidNtorAuthError,
    NtorRequest: () => NtorRequest,
    NtorResponse: () => NtorResponse,
    NtorResult: () => NtorResult
});
var InvalidNtorAuthError = class _InvalidNtorAuthError extends Error {
    #class = _InvalidNtorAuthError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid Ntor auth`);
    }
};
var NtorResponse = class _NtorResponse {
    constructor(public_y, auth) {
        this.public_y = public_y;
        this.auth = auth;
    }
    static readOrThrow(cursor) {
        const publicY = cursor.readAndCopyOrThrow(32);
        const auth = cursor.readAndCopyOrThrow(32);
        return new _NtorResponse(publicY, auth);
    }
};
var NtorRequest = class {
    constructor(public_x, relayid_rsa, ntor_onion_key) {
        this.public_x = public_x;
        this.relayid_rsa = relayid_rsa;
        this.ntor_onion_key = ntor_onion_key;
    }
    sizeOrThrow() {
        return 0 + this.relayid_rsa.length + this.ntor_onion_key.length + this.public_x.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.relayid_rsa);
        cursor.writeOrThrow(this.ntor_onion_key);
        cursor.writeOrThrow(this.public_x);
    }
};
var NtorResult;
((NtorResult2) => {
    async function finalizeOrThrow(shared_xy, shared_xb, relayid_rsa, public_b, public_x, public_y) {
        const protoid = "ntor-curve25519-sha256-1";
        const secret_input = new Cursor(Bytes.alloc(32 + 32 + 20 + 32 + 32 + 32 + protoid.length));
        secret_input.writeOrThrow(shared_xy);
        secret_input.writeOrThrow(shared_xb);
        secret_input.writeOrThrow(relayid_rsa);
        secret_input.writeOrThrow(public_b);
        secret_input.writeOrThrow(public_x);
        secret_input.writeOrThrow(public_y);
        secret_input.writeOrThrow(Bytes.encodeUtf8(protoid));
        const t_mac = Bytes.encodeUtf8(`${protoid}:mac`);
        const t_key = Bytes.encodeUtf8(`${protoid}:key_extract`);
        const t_verify = Bytes.encodeUtf8(`${protoid}:verify`);
        const kt_verify = await crypto.subtle.importKey("raw", t_verify, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const verify = Bytes.from(await crypto.subtle.sign("HMAC", kt_verify, secret_input.bytes));
        const server = "Server";
        const auth_input = new Cursor(Bytes.alloc(32 + 20 + 32 + 32 + 32 + protoid.length + server.length));
        auth_input.writeOrThrow(verify);
        auth_input.writeOrThrow(relayid_rsa);
        auth_input.writeOrThrow(public_b);
        auth_input.writeOrThrow(public_y);
        auth_input.writeOrThrow(public_x);
        auth_input.writeOrThrow(Bytes.encodeUtf8(protoid));
        auth_input.writeOrThrow(Bytes.encodeUtf8(server));
        const t_mac_key = await crypto.subtle.importKey("raw", t_mac, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const auth = Bytes.from(await crypto.subtle.sign("HMAC", t_mac_key, auth_input.bytes));
        const m_expand = Bytes.encodeUtf8(`${protoid}:key_expand`);
        const secret_input_key = await crypto.subtle.importKey("raw", secret_input.bytes, "HKDF", false, ["deriveBits"]);
        const key_params = {
            name: "HKDF",
            hash: "SHA-256",
            info: m_expand,
            salt: t_key
        };
        const key_bytes = Bytes.from(await crypto.subtle.deriveBits(key_params, secret_input_key, 8 * (HASH_LEN * 3 + KEY_LEN * 2)));
        const key = new Cursor(key_bytes);
        const forwardDigest = key.readAndCopyOrThrow(HASH_LEN);
        const backwardDigest = key.readAndCopyOrThrow(HASH_LEN);
        const forwardKey = key.readAndCopyOrThrow(KEY_LEN);
        const backwardKey = key.readAndCopyOrThrow(KEY_LEN);
        const nonce = key.readAndCopyOrThrow(HASH_LEN);
        return {
            forwardDigest,
            backwardDigest,
            forwardKey,
            backwardKey,
            auth,
            nonce
        };
    }
    NtorResult2.finalizeOrThrow = finalizeOrThrow;
})(NtorResult || (NtorResult = {}));
// src/hazae41/echalote/mods/tor/binary/address.ts
var TypedAddress = class _TypedAddress {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static types = {
        IPv4: 4,
        IPv6: 6
    };
    sizeOrThrow() {
        return 1 + 1 + this.value.length;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
        cursor.writeUint8OrThrow(this.value.length);
        cursor.writeOrThrow(this.value);
    }
    static readOrThrow(cursor) {
        const type = cursor.readUint8OrThrow();
        const length = cursor.readUint8OrThrow();
        const value = cursor.readAndCopyOrThrow(length);
        return new _TypedAddress(type, value);
    }
};
var Address4 = class _Address4 {
    /**
     * IPv4 address
     * @param address xxx.xxx.xxx.xxx
     */
    constructor(address) {
        this.address = address;
    }
    sizeOrThrow() {
        return 4;
    }
    writeOrThrow(cursor) {
        const parts = this.address.split(".");
        for (let i = 0; i < 4; i++)
            cursor.writeUint8OrThrow(Number(parts[i]));
        return;
    }
    static readOrThrow(cursor) {
        const parts = new Array(4);
        for (let i = 0; i < 4; i++)
            parts[i] = String(cursor.readUint8OrThrow());
        return new _Address4(parts.join("."));
    }
};
var Address6 = class _Address6 {
    /**
     * IPv6 address
     * @param address [xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx]
     */
    constructor(address) {
        this.address = address;
    }
    sizeOrThrow() {
        return 16;
    }
    writeOrThrow(cursor) {
        const parts = this.address.slice(1, -1).split(":");
        for (let i = 0; i < 8; i++)
            cursor.writeUint16OrThrow(Number(parts[i]));
        return;
    }
    static readOrThrow(cursor) {
        const parts = new Array(8);
        for (let i = 0; i < 8; i++)
            parts[i] = String(cursor.readUint16OrThrow());
        return new _Address6(`[${parts.join(":")}]`);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/errors.ts
var InvalidCellError = class _InvalidCellError extends Error {
    #class = _InvalidCellError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid cell`);
    }
};
var InvalidCommandError = class _InvalidCommandError extends Error {
    #class = _InvalidCommandError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid command`);
    }
};
var UnknownCircuitError = class _UnknownCircuitError extends Error {
    #class = _UnknownCircuitError;
    name = this.constructor.name;
    constructor() {
        super(`Unknown circuit`);
    }
};
var ExpectedCircuitError = class _ExpectedCircuitError extends Error {
    #class = _ExpectedCircuitError;
    name = this.constructor.name;
    constructor() {
        super(`Expected a circuit`);
    }
};
var UnexpectedCircuitError = class _UnexpectedCircuitError extends Error {
    #class = _UnexpectedCircuitError;
    name = this.constructor.name;
    constructor() {
        super(`Unexpected a circuit`);
    }
};
var InvalidRelayCommandError = class _InvalidRelayCommandError extends Error {
    #class = _InvalidRelayCommandError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid relay command`);
    }
};
var UnknownStreamError = class _UnknownStreamError extends Error {
    #class = _UnknownStreamError;
    name = this.constructor.name;
    constructor() {
        super(`Unknown stream`);
    }
};
var ExpectedStreamError = class _ExpectedStreamError extends Error {
    #class = _ExpectedStreamError;
    name = this.constructor.name;
    constructor() {
        super(`Expected a stream`);
    }
};
var UnexpectedStreamError = class _UnexpectedStreamError extends Error {
    #class = _UnexpectedStreamError;
    name = this.constructor.name;
    constructor() {
        super(`Unexpected a stream`);
    }
};
var InvalidRelayCellDigestError = class _InvalidRelayCellDigestError extends Error {
    #class = _InvalidRelayCellDigestError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid RELAY cell digest`);
    }
};
var InvalidRelaySendmeCellDigestError = class _InvalidRelaySendmeCellDigestError extends Error {
    #class = _InvalidRelaySendmeCellDigestError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid RELAY_SENDME cell digest`);
    }
};
var UnrecognisedRelayCellError = class _UnrecognisedRelayCellError extends Error {
    #class = _UnrecognisedRelayCellError;
    name = this.constructor.name;
    constructor() {
        super(`Unrecognised relay cell`);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/cell.ts
var Cell;
((Cell2) => {
    Cell2.PAYLOAD_LEN = 509;
    class Raw {
        constructor(circuit, command, fragment) {
            this.circuit = circuit;
            this.command = command;
            this.fragment = fragment;
        }
        unpackOrNull(tor2) {
            if (this.circuit === 0)
                return new Circuitless(void 0, this.command, this.fragment);
            const circuit = tor2.circuits.value.get(this.circuit);
            if (circuit == null)
                return void 0;
            return new Circuitful(circuit, this.command, this.fragment);
        }
        sizeOrThrow() {
            return this.command >= 128 ? 4 + 1 + 2 + this.fragment.sizeOrThrow() : 4 + 1 + Cell2.PAYLOAD_LEN;
        }
        writeOrThrow(cursor) {
            if (this.command >= 128) {
                cursor.writeUint32OrThrow(this.circuit);
                cursor.writeUint8OrThrow(this.command);
                const size = this.fragment.sizeOrThrow();
                cursor.writeUint16OrThrow(size);
                this.fragment.writeOrThrow(cursor);
                return;
            }
            cursor.writeUint32OrThrow(this.circuit);
            cursor.writeUint8OrThrow(this.command);
            const payload = cursor.readOrThrow(Cell2.PAYLOAD_LEN);
            const subcursor = new Cursor(payload);
            this.fragment.writeOrThrow(subcursor);
            subcursor.fillOrThrow(0, subcursor.remaining);
        }
        static readOrThrow(cursor) {
            const circuit = cursor.readUint32OrThrow();
            const command = cursor.readUint8OrThrow();
            if (command >= 128) {
                const length = cursor.readUint16OrThrow();
                const bytes2 = cursor.readAndCopyOrThrow(length);
                const payload2 = new Unknown(bytes2);
                return new Raw(circuit, command, payload2);
            }
            const bytes = cursor.readAndCopyOrThrow(Cell2.PAYLOAD_LEN);
            const payload = new Unknown(bytes);
            return new Raw(circuit, command, payload);
        }
    }
    Cell2.Raw = Raw;
    class Circuitful {
        constructor(circuit, command, fragment) {
            this.circuit = circuit;
            this.command = command;
            this.fragment = fragment;
            this.#raw = new Raw(circuit.id, command, fragment);
        }
        #raw;
        static from(circuit, cellable) {
            return new Circuitful(circuit, cellable.command, cellable);
        }
        sizeOrThrow() {
            return this.#raw.sizeOrThrow();
        }
        writeOrThrow(cursor) {
            this.#raw.writeOrThrow(cursor);
        }
        static intoOrThrow(cell, readable) {
            if (cell.command !== readable.command)
                throw new InvalidCommandError();
            if (cell.circuit == null)
                throw new ExpectedCircuitError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Circuitful(cell.circuit, readable.command, fragment);
        }
    }
    Cell2.Circuitful = Circuitful;
    class Circuitless {
        constructor(circuit, command, fragment) {
            this.circuit = circuit;
            this.command = command;
            this.fragment = fragment;
            this.#raw = new Raw(0, command, fragment);
        }
        #raw;
        static from(circuit, cellable) {
            return new Circuitless(circuit, cellable.command, cellable);
        }
        sizeOrThrow() {
            return this.#raw.sizeOrThrow();
        }
        writeOrThrow(cursor) {
            this.#raw.writeOrThrow(cursor);
        }
        static intoOrThrow(cell, readable) {
            if (cell.command !== readable.command)
                throw new InvalidCommandError();
            if (cell.circuit != null)
                throw new UnexpectedCircuitError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Circuitless(cell.circuit, readable.command, fragment);
        }
    }
    Cell2.Circuitless = Circuitless;
})(Cell || (Cell = {}));
// src/hazae41/echalote/mods/tor/errors.ts
var Unimplemented3 = class _Unimplemented extends Error {
    #class = _Unimplemented;
    name = this.constructor.name;
    constructor() {
        super(`Unimplemented`);
    }
};
var InvalidTorStateError = class _InvalidTorStateError extends Error {
    #class = _InvalidTorStateError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid Tor state`);
    }
};
var InvalidTorVersionError = class _InvalidTorVersionError extends Error {
    #class = _InvalidTorVersionError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid Tor version`);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/auth_challenge/cell.ts
var AuthChallengeCell = class _AuthChallengeCell {
    constructor(challenge, methods) {
        this.challenge = challenge;
        this.methods = methods;
    }
    #class = _AuthChallengeCell;
    static old = false;
    static circuit = false;
    static command = 130;
    get circuit() {
        return this.#class.circuit;
    }
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        throw new Unimplemented3();
    }
    writeOrThrow(_cursor) {
        throw new Unimplemented3();
    }
    static readOrThrow(cursor) {
        const challenge = cursor.readAndCopyOrThrow(32);
        const nmethods = cursor.readUint16OrThrow();
        const methods = new Array(nmethods);
        for (let i = 0; i < nmethods; i++)
            methods[i] = cursor.readUint16OrThrow();
        return new _AuthChallengeCell(challenge, methods);
    }
};
// src/TorClient/WebCryptoEd25519.ts
var Ed25519;
((Ed255192) => {
    class Signature {
        constructor(data) {
            this.data = data;
        }
        export() {
            return {
                bytes: Bytes.from(this.data)
            };
        }
        static import(bytes) {
            const signatureBytes = bytes instanceof Uint8Array ? bytes : bytes.bytes;
            if (signatureBytes.length !== 64) {
                throw new Error(`Invalid Ed25519 signature length: expected 64, got ${signatureBytes.length}`);
            }
            return new Signature(Bytes.from(signatureBytes));
        }
    }
    Ed255192.Signature = Signature;
    class VerifyingKey {
        constructor(publicKeyBytes, publicKey) {
            this.publicKeyBytes = publicKeyBytes;
            this.publicKey = publicKey;
        }
        async verify(payload, signature) {
            const payloadBytes = payload instanceof Uint8Array ? payload : payload.bytes;
            const signatureBytes = signature.export().bytes;
            try {
                const verified = await crypto.subtle.verify("Ed25519", this.publicKey, signatureBytes, payloadBytes);
                return verified;
            }
            catch (error) {
                throw new Error(`Ed25519 verification failed: ${error}`);
            }
        }
        async export() {
            return {
                bytes: Bytes.from(this.publicKeyBytes)
            };
        }
        static async import(bytes, _extractable) {
            const keyBytes = bytes instanceof Uint8Array ? bytes : bytes.bytes;
            if (keyBytes.length !== 32) {
                throw new Error(`Invalid Ed25519 public key length: expected 32, got ${keyBytes.length}`);
            }
            try {
                const publicKey = await crypto.subtle.importKey("raw", keyBytes, "Ed25519", true, ["verify"]);
                return new VerifyingKey(Bytes.from(keyBytes), publicKey);
            }
            catch (error) {
                throw new Error(`Failed to import Ed25519 public key: ${error}`);
            }
        }
    }
    Ed255192.VerifyingKey = VerifyingKey;
})(Ed25519 || (Ed25519 = {}));
// src/hazae41/echalote/mods/tor/RsaBigInt.ts
var lastVerificationDetails;
function bytesToBigInt(bytes) {
    let result = 0n;
    for (const byte of bytes) {
        result = result << 8n | BigInt(byte);
    }
    return result;
}
function bigIntToBytes(value, length) {
    const bytes = Bytes.alloc(length);
    for (let i = length - 1; i >= 0; i--) {
        bytes[i] = Number(value & 0xffn);
        value >>= 8n;
    }
    return bytes;
}
function modPow(base, exp, modulus) {
    if (modulus === 1n)
        return 0n;
    let result = 1n;
    base = base % modulus;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = result * base % modulus;
        }
        exp = exp >> 1n;
        base = base * base % modulus;
    }
    return result;
}
function parseRSAPublicKeyDER(spkiDer) {
    let i = 0;
    if (spkiDer[i] !== 48)
        return null;
    i++;
    let length = spkiDer[i];
    if (length & 128) {
        const lengthBytes = length & 127;
        length = 0;
        for (let j = 0; j < lengthBytes; j++) {
            length = length << 8 | spkiDer[i + 1 + j];
        }
        i += lengthBytes;
    }
    i++;
    if (spkiDer[i] !== 48)
        return null;
    i++;
    length = spkiDer[i];
    if (length & 128) {
        const lengthBytes = length & 127;
        length = 0;
        for (let j = 0; j < lengthBytes; j++) {
            length = length << 8 | spkiDer[i + 1 + j];
        }
        i += lengthBytes;
    }
    i++;
    i += length;
    if (spkiDer[i] !== 3)
        return null;
    i++;
    let bitStringLength = spkiDer[i];
    if (bitStringLength & 128) {
        const lengthBytes = bitStringLength & 127;
        bitStringLength = 0;
        for (let j = 0; j < lengthBytes; j++) {
            bitStringLength = bitStringLength << 8 | spkiDer[i + 1 + j];
        }
        i += lengthBytes;
    }
    i++;
    i++;
    if (spkiDer[i] !== 48)
        return null;
    i++;
    length = spkiDer[i];
    if (length & 128) {
        const lengthBytes = length & 127;
        length = 0;
        for (let j = 0; j < lengthBytes; j++) {
            length = length << 8 | spkiDer[i + 1 + j];
        }
        i += lengthBytes;
    }
    i++;
    if (spkiDer[i] !== 2)
        return null;
    i++;
    let modulusLength = spkiDer[i];
    if (modulusLength & 128) {
        const lengthBytes = modulusLength & 127;
        modulusLength = 0;
        for (let j = 0; j < lengthBytes; j++) {
            modulusLength = modulusLength << 8 | spkiDer[i + 1 + j];
        }
        i += lengthBytes;
    }
    i++;
    let modulusStart = i;
    if (spkiDer[i] === 0) {
        modulusStart = i + 1;
        modulusLength--;
    }
    const modulusBytes = spkiDer.slice(modulusStart, modulusStart + modulusLength);
    const modulus = bytesToBigInt(modulusBytes);
    const keySize = modulusLength;
    i = modulusStart + modulusLength;
    if (spkiDer[i] !== 2)
        return null;
    i++;
    let exponentLength = spkiDer[i];
    if (exponentLength & 128) {
        const lengthBytes = exponentLength & 127;
        exponentLength = 0;
        for (let j = 0; j < lengthBytes; j++) {
            exponentLength = exponentLength << 8 | spkiDer[i + 1 + j];
        }
        i += lengthBytes;
    }
    i++;
    let exponentStart = i;
    if (spkiDer[i] === 0) {
        exponentStart = i + 1;
        exponentLength--;
    }
    const exponentBytes = spkiDer.slice(exponentStart, exponentStart + exponentLength);
    const exponent = bytesToBigInt(exponentBytes);
    return { modulus, exponent, keySize };
}
var RsaBigInt;
((RsaBigInt2) => {
    class Memory {
        bytes;
        constructor(bytes) {
            if (bytes instanceof ArrayBuffer) {
                this.bytes = Bytes.from(bytes);
            }
            else {
                this.bytes = Bytes.from(bytes);
            }
        }
        ptr() {
            return 0;
        }
        len() {
            return this.bytes.length;
        }
    }
    RsaBigInt2.Memory = Memory;
    class RsaPublicKey2 {
        modulus;
        exponent;
        keySize;
        constructor(modulus, exponent, keySize) {
            this.modulus = modulus;
            this.exponent = exponent;
            this.keySize = keySize;
        }
        static from_public_key_der(memory) {
            const parsed = parseRSAPublicKeyDER(memory.bytes);
            if (!parsed) {
                throw new Error("Failed to parse RSA public key from DER");
            }
            return new RsaPublicKey2(parsed.modulus, parsed.exponent, parsed.keySize);
        }
        static from_pkcs1_der(memory) {
            return RsaPublicKey2.from_public_key_der(memory);
        }
        verify_pkcs1v15_unprefixed(hashMemory, signatureMemory, enableDetailedValidation = false) {
            try {
                const hashBytes = hashMemory.bytes;
                const signatureBytes = signatureMemory.bytes;
                if (enableDetailedValidation) {
                    lastVerificationDetails = {
                        rsaDecryptionMatches: false,
                        decryptedBytesMatches: false,
                        paddingValidationMatches: false
                    };
                }
                const signature = bytesToBigInt(signatureBytes);
                const decrypted = modPow(signature, this.exponent, this.modulus);
                const decryptedBytes = bigIntToBytes(decrypted, this.keySize);
                if (enableDetailedValidation && lastVerificationDetails) {
                    lastVerificationDetails.rsaDecryptionMatches = true;
                    lastVerificationDetails.decryptedBytesMatches = true;
                }
                const expectedHashStart = this.keySize - hashBytes.length;
                if (expectedHashStart < 3) {
                    return false;
                }
                if (decryptedBytes[0] !== 0 || decryptedBytes[1] !== 1) {
                    return false;
                }
                if (decryptedBytes[expectedHashStart - 1] !== 0) {
                    return false;
                }
                for (let i = 2; i < expectedHashStart - 1; i++) {
                    if (decryptedBytes[i] !== 255) {
                        return false;
                    }
                }
                for (let i = 0; i < hashBytes.length; i++) {
                    if (decryptedBytes[expectedHashStart + i] !== hashBytes[i]) {
                        return false;
                    }
                }
                if (enableDetailedValidation && lastVerificationDetails) {
                    lastVerificationDetails.paddingValidationMatches = true;
                }
                return true;
            }
            catch {
                return false;
            }
        }
    }
    RsaBigInt2.RsaPublicKey = RsaPublicKey2;
})(RsaBigInt || (RsaBigInt = {}));
// src/hazae41/echalote/mods/tor/certs/certs.ts
var DuplicatedCertError = class _DuplicatedCertError extends Error {
    #class = _DuplicatedCertError;
    name = this.constructor.name;
    constructor() {
        super(`Duplicated certificate`);
    }
};
var UnknownCertError = class _UnknownCertError extends Error {
    #class = _UnknownCertError;
    name = this.constructor.name;
    constructor() {
        super(`Unknown certificate`);
    }
};
var ExpectedCertError = class _ExpectedCertError extends Error {
    #class = _ExpectedCertError;
    name = this.constructor.name;
    constructor() {
        super(`Expected a certificate`);
    }
};
var ExpiredCertError = class _ExpiredCertError extends Error {
    #class = _ExpiredCertError;
    name = this.constructor.name;
    constructor() {
        super(`Expired certificate`);
    }
};
var PrematureCertError = class _PrematureCertError extends Error {
    #class = _PrematureCertError;
    name = this.constructor.name;
    constructor() {
        super(`Premature certificate`);
    }
};
var InvalidSignatureError = class _InvalidSignatureError extends Error {
    #class = _InvalidSignatureError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid certificate signature`);
    }
};
var InvalidCertError = class _InvalidCertError extends Error {
    #class = _InvalidCertError;
    name = this.constructor.name;
    constructor() {
        super(`Invalid certificate`);
    }
};
var Certs;
((Certs3) => {
    async function verifyOrThrow(pcerts, tlsCerts) {
        const { rsa_self, rsa_to_ed, ed_to_sign, sign_to_tls } = pcerts;
        if (tlsCerts == null)
            throw new ExpectedCertError();
        if (rsa_self == null)
            throw new ExpectedCertError();
        if (rsa_to_ed == null)
            throw new ExpectedCertError();
        if (ed_to_sign == null)
            throw new ExpectedCertError();
        if (sign_to_tls == null)
            throw new ExpectedCertError();
        const certs = { rsa_self, rsa_to_ed, ed_to_sign, sign_to_tls };
        const result = await Promise.all([
            verifyRsaSelfOrThrow(certs),
            verifyRsaToEdOrThrow(certs),
            verifyEdToSigningOrThrow(certs),
            verifySigningToTlsOrThrow(certs, tlsCerts)
        ]).then((all) => all.every((x) => x === true));
        assert(result === true, `Could not verify certs`);
        return certs;
    }
    Certs3.verifyOrThrow = verifyOrThrow;
    async function verifyRsaSelfOrThrow(certs) {
        assert(certs.rsa_self.verifyOrThrow() === true, `Could not verify ID_SELF cert`);
        const length = certs.rsa_self.x509.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey.bytes.length;
        if (length !== 12 + 128)
            throw new InvalidCertError();
        const signed = mods_exports.writeToBytesOrThrow(certs.rsa_self.x509.tbsCertificate);
        const publicKey = mods_exports.writeToBytesOrThrow(certs.rsa_self.x509.tbsCertificate.subjectPublicKeyInfo);
        const signatureAlgorithm = {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" }
        };
        const signature = certs.rsa_self.x509.signatureValue.bytes;
        const key = await crypto.subtle.importKey("spki", publicKey, signatureAlgorithm, true, ["verify"]);
        const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signed);
        if (verified !== true)
            throw new InvalidSignatureError();
        return true;
    }
    async function verifyRsaToEdOrThrow(certs) {
        assert(certs.rsa_to_ed.verifyOrThrow() === true, `Could not verify ID_TO_ED cert`);
        const publicKeyBytes = mods_exports.writeToBytesOrThrow(certs.rsa_self.x509.tbsCertificate.subjectPublicKeyInfo);
        const publicKeyMemory = new RsaBigInt.Memory(publicKeyBytes);
        const publicKeyPointer = RsaBigInt.RsaPublicKey.from_public_key_der(publicKeyMemory);
        const prefix = Bytes.encodeUtf8("Tor TLS RSA/Ed25519 cross-certificate");
        const prefixed = Bytes.concat(prefix, certs.rsa_to_ed.payload);
        const hashed = Bytes.from(await crypto.subtle.digest("SHA-256", prefixed));
        const hashedMemory = new RsaBigInt.Memory(hashed);
        const signatureMemory = new RsaBigInt.Memory(certs.rsa_to_ed.signature);
        const verified = publicKeyPointer.verify_pkcs1v15_unprefixed(hashedMemory, signatureMemory);
        if (verified !== true)
            throw new InvalidSignatureError();
        return true;
    }
    async function verifyEdToSigningOrThrow(certs) {
        assert(await certs.ed_to_sign.verifyOrThrow() === true, `Could not verify ED_TO_SIGN cert`);
        const identity = await Ed25519.VerifyingKey.import(certs.rsa_to_ed.key);
        const signature = Ed25519.Signature.import(certs.ed_to_sign.signature);
        const verified = await identity.verify(certs.ed_to_sign.payload, signature);
        if (verified !== true)
            throw new InvalidSignatureError();
        return true;
    }
    async function verifySigningToTlsOrThrow(certs, tlsCerts) {
        assert(await certs.sign_to_tls.verifyOrThrow() === true, `Could not verify SIGNING_TO_TLS cert`);
        const identity = await Ed25519.VerifyingKey.import(certs.ed_to_sign.certKey);
        const signature = Ed25519.Signature.import(certs.sign_to_tls.signature);
        const verified = await identity.verify(certs.sign_to_tls.payload, signature);
        if (verified !== true)
            throw new InvalidSignatureError();
        const tls = Writable.writeToBytesOrThrow(tlsCerts[0].toDER());
        const hash = Bytes.from(await crypto.subtle.digest("SHA-256", tls));
        if (Bytes.equals(hash, certs.sign_to_tls.certKey) !== true)
            throw new InvalidCertError();
        return true;
    }
})(Certs || (Certs = {}));
// src/hazae41/echalote/mods/tor/binary/certs/cross/cert.ts
var CrossCert = class _CrossCert {
    constructor(type, key, expiration, payload, signature) {
        this.type = type;
        this.key = key;
        this.expiration = expiration;
        this.payload = payload;
        this.signature = signature;
    }
    #class = _CrossCert;
    static types = {
        RSA_TO_ED: 7
    };
    verifyOrThrow() {
        const now = /* @__PURE__ */ new Date();
        if (now > this.expiration)
            throw new ExpiredCertError();
        return true;
    }
    sizeOrThrow() {
        throw new Unimplemented3();
    }
    writeOrThrow(_cursor) {
        throw new Unimplemented3();
    }
    static readOrThrow(cursor) {
        const type = cursor.readUint8OrThrow();
        const length = cursor.readUint16OrThrow();
        const start = cursor.offset;
        const key = cursor.readAndCopyOrThrow(32);
        const expDateHours = cursor.readUint32OrThrow();
        const expiration = new Date(expDateHours * 60 * 60 * 1e3);
        const content = cursor.offset - start;
        cursor.offset = start;
        const payload = cursor.readAndCopyOrThrow(content);
        const sigLength = cursor.readUint8OrThrow();
        const signature = cursor.readAndCopyOrThrow(sigLength);
        const end = cursor.offset;
        const actualLength = end - start;
        if (actualLength !== length) {
            throw new Error(`CrossCert length mismatch: expected ${length}, got ${actualLength}`);
        }
        return new _CrossCert(type, key, expiration, payload, signature);
    }
};
// src/hazae41/echalote/mods/tor/binary/certs/ed25519/extensions/signer.ts
var SignedWithEd25519Key = class _SignedWithEd25519Key {
    constructor(key) {
        this.key = key;
    }
    #class = _SignedWithEd25519Key;
    static type = 4;
    get type() {
        return this.#class.type;
    }
    static readOrThrow(cursor) {
        return new _SignedWithEd25519Key(cursor.readAndCopyOrThrow(32));
    }
};
// src/hazae41/echalote/mods/tor/binary/certs/ed25519/cert.ts
var UnknownCertExtensionError = class _UnknownCertExtensionError extends Error {
    constructor(type) {
        super(`Unknown certificate extension ${type}`);
        this.type = type;
    }
    #class = _UnknownCertExtensionError;
    name = this.constructor.name;
};
var Ed25519Cert = class _Ed25519Cert {
    constructor(type, version, certType, expiration, certKeyType, certKey, extensions, payload, signature) {
        this.type = type;
        this.version = version;
        this.certType = certType;
        this.expiration = expiration;
        this.certKeyType = certKeyType;
        this.certKey = certKey;
        this.extensions = extensions;
        this.payload = payload;
        this.signature = signature;
    }
    static types = {
        ED_TO_SIGN: 4,
        SIGN_TO_TLS: 5,
        SIGN_TO_AUTH: 6
    };
    static flags = {
        AFFECTS_VALIDATION: 1
    };
    async verifyOrThrow() {
        const now = /* @__PURE__ */ new Date();
        if (now > this.expiration)
            throw new ExpiredCertError();
        if (!this.extensions.signer)
            return true;
        const signer = await Ed25519.VerifyingKey.import(this.extensions.signer.key);
        const signature = Ed25519.Signature.import(this.signature);
        const verified = await signer.verify(this.payload, signature);
        if (verified !== true)
            throw new InvalidSignatureError();
        return true;
    }
    static readOrThrow(cursor) {
        const type = cursor.readUint8OrThrow();
        cursor.readUint16OrThrow();
        const start = cursor.offset;
        const version = cursor.readUint8OrThrow();
        const certType = cursor.readUint8OrThrow();
        const expDateHours = cursor.readUint32OrThrow();
        const expiration = new Date(expDateHours * 60 * 60 * 1e3);
        const certKeyType = cursor.readUint8OrThrow();
        const certKey = cursor.readAndCopyOrThrow(32);
        const nextensions = cursor.readUint8OrThrow();
        const extensions = {};
        for (let i = 0; i < nextensions; i++) {
            const length = cursor.readUint16OrThrow();
            const type2 = cursor.readUint8OrThrow();
            const flags = cursor.readUint8OrThrow();
            if (type2 === SignedWithEd25519Key.type) {
                extensions.signer = SignedWithEd25519Key.readOrThrow(cursor);
                continue;
            }
            if (flags === this.flags.AFFECTS_VALIDATION)
                throw new UnknownCertExtensionError(type2);
            cursor.readOrThrow(length);
        }
        const content = cursor.offset - start;
        cursor.offset = start;
        const payload = cursor.readAndCopyOrThrow(content);
        const signature = cursor.readAndCopyOrThrow(64);
        return new _Ed25519Cert(type, version, certType, expiration, certKeyType, certKey, extensions, payload, signature);
    }
};
// src/hazae41/echalote/mods/tor/binary/certs/rsa/cert.ts
var RsaCert = class _RsaCert {
    constructor(type, data, x509) {
        this.type = type;
        this.data = data;
        this.x509 = x509;
    }
    static types = {
        RSA_SELF: 2,
        RSA_TO_TLS: 1,
        RSA_TO_AUTH: 3
    };
    async sha1OrThrow() {
        const publicKey = mods_exports.writeToBytesOrThrow(this.x509.tbsCertificate.subjectPublicKeyInfo);
        return Bytes.from(await crypto.subtle.digest("SHA-1", publicKey));
    }
    verifyOrThrow() {
        const now = /* @__PURE__ */ new Date();
        if (now > this.x509.tbsCertificate.validity.notAfter.value)
            throw new ExpiredCertError();
        if (now < this.x509.tbsCertificate.validity.notBefore.value)
            throw new PrematureCertError();
        return true;
    }
    sizeOrThrow() {
        return 1 + 2 + this.data.length;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.type);
        cursor.writeUint16OrThrow(this.data.length);
        cursor.writeOrThrow(this.data);
    }
    static readOrThrow(cursor) {
        const type = cursor.readUint8OrThrow();
        const length = cursor.readUint16OrThrow();
        const data = cursor.readAndCopyOrThrow(length);
        const x509 = mods_exports.readAndResolveFromBytesOrThrow(mods_exports.Certificate, data);
        return new _RsaCert(type, data, x509);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/certs/cell.ts
var CertsCell = class _CertsCell {
    constructor(certs) {
        this.certs = certs;
    }
    #class = _CertsCell;
    static old = false;
    static circuit = false;
    static command = 129;
    get circuit() {
        return this.#class.circuit;
    }
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        throw new Unimplemented3();
    }
    writeOrThrow(_cursor) {
        throw new Unimplemented3();
    }
    static readOrThrow(cursor) {
        const certs = {};
        const count = cursor.readUint8OrThrow();
        for (let i = 0; i < count; i++) {
            const offset = cursor.offset;
            const type = cursor.readUint8OrThrow();
            const length = cursor.readUint16OrThrow();
            cursor.offset = offset;
            const bytes = cursor.readOrThrow(1 + 2 + length);
            if (type === RsaCert.types.RSA_SELF) {
                if (certs.rsa_self != null)
                    throw new DuplicatedCertError();
                certs.rsa_self = Readable.readFromBytesOrThrow(RsaCert, bytes);
                continue;
            }
            if (type === RsaCert.types.RSA_TO_AUTH) {
                if (certs.rsa_to_auth != null)
                    throw new DuplicatedCertError();
                certs.rsa_to_auth = Readable.readFromBytesOrThrow(RsaCert, bytes);
                continue;
            }
            if (type === RsaCert.types.RSA_TO_TLS) {
                if (certs.rsa_to_tls != null)
                    throw new DuplicatedCertError();
                certs.rsa_to_tls = Readable.readFromBytesOrThrow(RsaCert, bytes);
                continue;
            }
            if (type === CrossCert.types.RSA_TO_ED) {
                if (certs.rsa_to_ed != null)
                    throw new DuplicatedCertError();
                certs.rsa_to_ed = Readable.readFromBytesOrThrow(CrossCert, bytes);
                continue;
            }
            if (type === Ed25519Cert.types.ED_TO_SIGN) {
                if (certs.ed_to_sign != null)
                    throw new DuplicatedCertError();
                certs.ed_to_sign = Readable.readFromBytesOrThrow(Ed25519Cert, bytes);
                continue;
            }
            if (type === Ed25519Cert.types.SIGN_TO_TLS) {
                if (certs.sign_to_tls != null)
                    throw new DuplicatedCertError();
                certs.sign_to_tls = Readable.readFromBytesOrThrow(Ed25519Cert, bytes);
                continue;
            }
            if (type === Ed25519Cert.types.SIGN_TO_AUTH) {
                if (certs.sign_to_auth != null)
                    throw new DuplicatedCertError();
                certs.sign_to_auth = Readable.readFromBytesOrThrow(Ed25519Cert, bytes);
                continue;
            }
            throw new UnknownCertError();
        }
        return new _CertsCell(certs);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/create2/cell.ts
var Create2Cell = class _Create2Cell {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
    #class = _Create2Cell;
    static circuit = true;
    static command = 10;
    static types = {
        /**
         * The old, slow, and insecure handshake
         * @deprecated
         */
        TAP: 0,
        /**
         * The new, quick, and secure handshake
         */
        NTOR: 2
    };
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return 2 + 2 + this.data.length;
    }
    writeOrThrow(cursor) {
        cursor.writeUint16OrThrow(this.type);
        cursor.writeUint16OrThrow(this.data.length);
        cursor.writeOrThrow(this.data);
    }
    static readOrThrow(cursor) {
        const type = cursor.readUint16OrThrow();
        const length = cursor.readUint16OrThrow();
        const data = cursor.readAndCopyOrThrow(length);
        cursor.offset += cursor.remaining;
        return new _Create2Cell(type, data);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/created_fast/cell.ts
var CreatedFastCell = class _CreatedFastCell {
    constructor(material, derivative) {
        this.material = material;
        this.derivative = derivative;
    }
    #class = _CreatedFastCell;
    static old = false;
    static circuit = true;
    static command = 6;
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return this.material.length + this.derivative.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.material);
        cursor.writeOrThrow(this.derivative);
    }
    static readOrThrow(cursor) {
        const material = cursor.readAndCopyOrThrow(20);
        const derivative = cursor.readAndCopyOrThrow(20);
        cursor.offset += cursor.remaining;
        return new _CreatedFastCell(material, derivative);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/create_fast/cell.ts
var CreateFastCell = class _CreateFastCell {
    /**
     * The CREATE_FAST cell
     * @param material Key material (X) [20]
     */
    constructor(material) {
        this.material = material;
    }
    #class = _CreateFastCell;
    static old = false;
    static circuit = true;
    static command = 5;
    get old() {
        return this.#class.old;
    }
    get circuit() {
        return this.#class.circuit;
    }
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return this.material.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.material);
    }
    static readOrThrow(cursor) {
        const material = cursor.readAndCopyOrThrow(20);
        cursor.offset += cursor.remaining;
        return new _CreateFastCell(material);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/destroy/cell.ts
var DestroyCell = class _DestroyCell {
    constructor(reason) {
        this.reason = reason;
    }
    #class = _DestroyCell;
    static old = false;
    static circuit = true;
    static command = 4;
    static reasons = {
        NONE: 0,
        PROTOCOL: 1,
        INTERNAL: 2,
        REQUESTED: 3,
        HIBERNATING: 4,
        RESOURCELIMIT: 5,
        CONNECTFAILED: 6,
        OR_IDENTITY: 7,
        CHANNEL_CLOSED: 8,
        FINISHED: 9,
        TIMEOUT: 10,
        DESTROYED: 11,
        NOSUCHSERVICE: 12
    };
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.reason);
    }
    static readOrThrow(cursor) {
        const code = cursor.readUint8OrThrow();
        cursor.offset += cursor.remaining;
        return new _DestroyCell(code);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/netinfo/cell.ts
var NetinfoCell = class _NetinfoCell {
    constructor(time, other, owneds) {
        this.time = time;
        this.other = other;
        this.owneds = owneds;
    }
    #class = _NetinfoCell;
    static old = false;
    static circuit = false;
    static command = 8;
    get old() {
        return this.#class.old;
    }
    get circuit() {
        return this.#class.circuit;
    }
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return 0 + 4 + this.other.sizeOrThrow() + 1 + this.owneds.reduce((p, c) => p + c.sizeOrThrow(), 0);
    }
    writeOrThrow(cursor) {
        cursor.writeUint32OrThrow(this.time);
        this.other.writeOrThrow(cursor);
        cursor.writeUint8OrThrow(this.owneds.length);
        for (const owned of this.owneds)
            owned.writeOrThrow(cursor);
        return;
    }
    static readOrThrow(cursor) {
        const time = cursor.readUint32OrThrow();
        const other = TypedAddress.readOrThrow(cursor);
        const owneds = new Array(cursor.readUint8OrThrow());
        for (let i = 0; i < owneds.length; i++)
            owneds[i] = TypedAddress.readOrThrow(cursor);
        cursor.offset += cursor.remaining;
        return new _NetinfoCell(time, other, owneds);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/padding/cell.ts
var PaddingCell = class _PaddingCell {
    constructor(data) {
        this.data = data;
    }
    #class = _PaddingCell;
    static circuit = false;
    static command = 0;
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        throw new Unimplemented3();
    }
    writeOrThrow(_cursor) {
        throw new Unimplemented3();
    }
    static readOrThrow(cursor) {
        return new _PaddingCell(cursor.readAndCopyOrThrow(cursor.remaining));
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/padding_negociate/cell.ts
var PaddingNegociateCell = class _PaddingNegociateCell {
    constructor(version, pcommand, ito_low_ms, ito_high_ms) {
        this.version = version;
        this.pcommand = pcommand;
        this.ito_low_ms = ito_low_ms;
        this.ito_high_ms = ito_high_ms;
    }
    #class = _PaddingNegociateCell;
    static old = false;
    static circuit = false;
    static command = 12;
    static versions = {
        ZERO: 0
    };
    static commands = {
        STOP: 1,
        START: 2
    };
    get old() {
        return this.#class.old;
    }
    get circuit() {
        return this.#class.circuit;
    }
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return 1 + 1 + 2 + 2;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.version);
        cursor.writeUint8OrThrow(this.pcommand);
        cursor.writeUint16OrThrow(this.ito_low_ms);
        cursor.writeUint16OrThrow(this.ito_high_ms);
    }
    static readOrThrow(cursor) {
        const version = cursor.readUint8OrThrow();
        const pcommand = cursor.readUint8OrThrow();
        const ito_low_ms = cursor.readUint16OrThrow();
        const ito_high_ms = cursor.readUint16OrThrow();
        cursor.offset += cursor.remaining;
        return new _PaddingNegociateCell(version, pcommand, ito_low_ms, ito_high_ms);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_data/cell.ts
var RelayDataCell = class _RelayDataCell {
    constructor(fragment) {
        this.fragment = fragment;
    }
    #class = _RelayDataCell;
    static early = false;
    static stream = true;
    static rcommand = 2;
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return this.fragment.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.fragment.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _RelayDataCell(new Unknown(cursor.readAndCopyOrThrow(cursor.remaining)));
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/relay/cell.ts
var RelayCell;
((RelayCell2) => {
    RelayCell2.HEAD_LEN = 1 + 2 + 2 + 4 + 2;
    RelayCell2.DATA_LEN = Cell.PAYLOAD_LEN - RelayCell2.HEAD_LEN;
    RelayCell2.command = 3;
    class Raw {
        constructor(circuit, stream, rcommand, fragment, digest) {
            this.circuit = circuit;
            this.stream = stream;
            this.rcommand = rcommand;
            this.fragment = fragment;
            this.digest = digest;
        }
        unpackOrNull() {
            if (this.stream === 0)
                return new Streamless(this.circuit, void 0, this.rcommand, this.fragment, this.digest);
            const stream = this.circuit.streams.get(this.stream);
            if (stream == null)
                return;
            return new Streamful(this.circuit, stream, this.rcommand, this.fragment, this.digest);
        }
        async cellOrThrow() {
            const cursor = new Cursor(Bytes.alloc(Cell.PAYLOAD_LEN));
            cursor.writeUint8OrThrow(this.rcommand);
            cursor.writeUint16OrThrow(0);
            cursor.writeUint16OrThrow(this.stream);
            const digestOffset = cursor.offset;
            cursor.writeUint32OrThrow(0);
            const size = this.fragment.sizeOrThrow();
            cursor.writeUint16OrThrow(size);
            this.fragment.writeOrThrow(cursor);
            cursor.fillOrThrow(0, Math.min(cursor.remaining, 4));
            cursor.writeOrThrow(Bytes.random(cursor.remaining));
            const exit = this.circuit.targets[this.circuit.targets.length - 1];
            exit.forward_digest.updateOrThrow(cursor.bytes);
            const digest20 = exit.forward_digest.finalizeOrThrow();
            if (this.rcommand === RelayDataCell.rcommand) {
                if (exit.package % 100 === 1)
                    exit.digests.push(digest20);
                exit.package--;
            }
            cursor.offset = digestOffset;
            cursor.writeOrThrow(digest20.subarray(0, 4));
            const bytes = Bytes.from(cursor.bytes);
            for (let i = this.circuit.targets.length - 1; i >= 0; i--)
                await this.circuit.targets[i].forward_key.apply_keystream(bytes);
            const fragment = new Unknown(bytes);
            return new Cell.Circuitful(this.circuit, RelayCell2.command, fragment);
        }
        static async uncellOrThrow(cell) {
            if (cell instanceof Cell.Circuitless)
                throw new ExpectedCircuitError();
            const bytes = Bytes.from(cell.fragment.bytes);
            for (const target of cell.circuit.targets) {
                await target.backward_key.apply_keystream(bytes);
                const cursor = new Cursor(bytes);
                const rcommand = cursor.readUint8OrThrow();
                const recognised = cursor.readUint16OrThrow();
                if (recognised !== 0)
                    continue;
                const stream = cursor.readUint16OrThrow();
                const offset = cursor.offset;
                const digest4 = cursor.getAndCopyOrThrow(4);
                cursor.writeUint32OrThrow(0);
                const hasher = await target.backward_digest.cloneOrThrow();
                hasher.updateOrThrow(cursor.bytes);
                const digest20 = hasher.finalizeOrThrow();
                if (!Bytes.equals2(digest4, digest20.subarray(0, 4))) {
                    cursor.offset = offset;
                    cursor.writeOrThrow(digest4);
                    continue;
                }
                target.backward_digest.updateOrThrow(cursor.bytes);
                const length = cursor.readUint16OrThrow();
                const bytes_data = cursor.readAndCopyOrThrow(length);
                const data = new Unknown(bytes_data);
                return new Raw(cell.circuit, stream, rcommand, data, digest20);
            }
            throw new UnrecognisedRelayCellError();
        }
    }
    RelayCell2.Raw = Raw;
    class Streamful {
        constructor(circuit, stream, rcommand, fragment, digest) {
            this.circuit = circuit;
            this.stream = stream;
            this.rcommand = rcommand;
            this.fragment = fragment;
            this.digest = digest;
            this.#raw = new Raw(circuit, stream.id, rcommand, fragment);
        }
        #raw;
        static from(circuit, stream, fragment) {
            return new Streamful(circuit, stream, fragment.rcommand, fragment);
        }
        async cellOrThrow() {
            return await this.#raw.cellOrThrow();
        }
        static intoOrThrow(cell, readable) {
            if (cell.rcommand !== readable.rcommand)
                throw new InvalidRelayCommandError();
            if (cell.stream == null)
                throw new ExpectedStreamError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Streamful(cell.circuit, cell.stream, readable.rcommand, fragment, cell.digest);
        }
    }
    RelayCell2.Streamful = Streamful;
    class Streamless {
        constructor(circuit, stream, rcommand, fragment, digest) {
            this.circuit = circuit;
            this.stream = stream;
            this.rcommand = rcommand;
            this.fragment = fragment;
            this.digest = digest;
            this.#raw = new Raw(circuit, 0, rcommand, fragment);
        }
        #raw;
        static from(circuit, stream, fragment) {
            return new Streamless(circuit, stream, fragment.rcommand, fragment);
        }
        async cellOrThrow() {
            return await this.#raw.cellOrThrow();
        }
        static intoOrThrow(cell, readable) {
            if (cell.rcommand !== readable.rcommand)
                throw new InvalidRelayCommandError();
            if (cell.stream != null)
                throw new UnexpectedStreamError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Streamless(cell.circuit, cell.stream, readable.rcommand, fragment, cell.digest);
        }
    }
    RelayCell2.Streamless = Streamless;
})(RelayCell || (RelayCell = {}));
// src/hazae41/echalote/mods/tor/binary/cells/direct/relay_early/cell.ts
var RelayEarlyCell;
((RelayEarlyCell2) => {
    RelayEarlyCell2.HEAD_LEN = 1 + 2 + 2 + 4 + 2;
    RelayEarlyCell2.DATA_LEN = Cell.PAYLOAD_LEN - RelayEarlyCell2.HEAD_LEN;
    RelayEarlyCell2.command = 9;
    class Raw {
        constructor(circuit, stream, rcommand, fragment) {
            this.circuit = circuit;
            this.stream = stream;
            this.rcommand = rcommand;
            this.fragment = fragment;
        }
        unpackOrThrow() {
            if (this.stream === 0)
                return new Streamless(this.circuit, void 0, this.rcommand, this.fragment);
            const stream = this.circuit.streams.get(this.stream);
            if (stream == null)
                throw new UnknownStreamError();
            return new Streamful(this.circuit, stream, this.rcommand, this.fragment);
        }
        async cellOrThrow() {
            const cursor = new Cursor(Bytes.alloc(Cell.PAYLOAD_LEN));
            cursor.writeUint8OrThrow(this.rcommand);
            cursor.writeUint16OrThrow(0);
            cursor.writeUint16OrThrow(this.stream);
            const digestOffset = cursor.offset;
            cursor.writeUint32OrThrow(0);
            const size = this.fragment.sizeOrThrow();
            cursor.writeUint16OrThrow(size);
            this.fragment.writeOrThrow(cursor);
            cursor.fillOrThrow(0, Math.min(cursor.remaining, 4));
            cursor.writeOrThrow(Bytes.random(cursor.remaining));
            const exit = this.circuit.targets[this.circuit.targets.length - 1];
            exit.forward_digest.updateOrThrow(cursor.bytes);
            const digestSlice = exit.forward_digest.finalizeOrThrow();
            cursor.offset = digestOffset;
            cursor.writeOrThrow(digestSlice.subarray(0, 4));
            const bytes = Bytes.from(cursor.bytes);
            for (let i = this.circuit.targets.length - 1; i >= 0; i--)
                await this.circuit.targets[i].forward_key.apply_keystream(bytes);
            const fragment = new Unknown(bytes);
            return new Cell.Circuitful(this.circuit, RelayEarlyCell2.command, fragment);
        }
        static async uncellOrThrow(cell) {
            if (cell instanceof Cell.Circuitless)
                throw new ExpectedCircuitError();
            const bytes = Bytes.from(cell.fragment.bytes);
            for (const target of cell.circuit.targets) {
                await target.backward_key.apply_keystream(bytes);
                const cursor = new Cursor(bytes);
                const rcommand = cursor.readUint8OrThrow();
                const recognised = cursor.readUint16OrThrow();
                if (recognised !== 0)
                    continue;
                const stream = cursor.readUint16OrThrow();
                const offset = cursor.offset;
                const digest4 = cursor.getAndCopyOrThrow(4);
                cursor.writeUint32OrThrow(0);
                const hasher = await target.backward_digest.cloneOrThrow();
                hasher.updateOrThrow(cursor.bytes);
                const digest = hasher.finalizeOrThrow();
                if (!Bytes.equals2(digest4, digest.subarray(0, 4))) {
                    cursor.offset = offset;
                    cursor.writeOrThrow(digest4);
                    continue;
                }
                target.backward_digest.updateOrThrow(cursor.bytes);
                const length = cursor.readUint16OrThrow();
                const bytes_data = cursor.readAndCopyOrThrow(length);
                const data = new Unknown(bytes_data);
                return new Raw(cell.circuit, stream, rcommand, data);
            }
            throw new UnrecognisedRelayCellError();
        }
    }
    RelayEarlyCell2.Raw = Raw;
    class Streamful {
        constructor(circuit, stream, rcommand, fragment) {
            this.circuit = circuit;
            this.stream = stream;
            this.rcommand = rcommand;
            this.fragment = fragment;
            this.#raw = new Raw(circuit, stream.id, rcommand, fragment);
        }
        #raw;
        static from(circuit, stream, fragment) {
            return new Streamful(circuit, stream, fragment.rcommand, fragment);
        }
        async cellOrThrow() {
            return await this.#raw.cellOrThrow();
        }
        static intoOrThrow(cell, readable) {
            if (cell.rcommand !== readable.rcommand)
                throw new InvalidRelayCommandError();
            if (cell.stream == null)
                throw new ExpectedStreamError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Streamful(cell.circuit, cell.stream, readable.rcommand, fragment);
        }
    }
    RelayEarlyCell2.Streamful = Streamful;
    class Streamless {
        constructor(circuit, stream, rcommand, fragment) {
            this.circuit = circuit;
            this.stream = stream;
            this.rcommand = rcommand;
            this.fragment = fragment;
            this.#raw = new Raw(circuit, 0, rcommand, fragment);
        }
        #raw;
        static from(circuit, stream, fragment) {
            return new Streamless(circuit, stream, fragment.rcommand, fragment);
        }
        async cellOrThrow() {
            return await this.#raw.cellOrThrow();
        }
        static intoOrThrow(cell, readable) {
            if (cell.rcommand !== readable.rcommand)
                throw new InvalidRelayCommandError();
            if (cell.stream != null)
                throw new UnexpectedStreamError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Streamless(cell.circuit, cell.stream, readable.rcommand, fragment);
        }
    }
    RelayEarlyCell2.Streamless = Streamless;
})(RelayEarlyCell || (RelayEarlyCell = {}));
// src/hazae41/echalote/mods/tor/binary/cells/direct/versions/cell.ts
var VersionsCell = class _VersionsCell {
    constructor(versions) {
        this.versions = versions;
    }
    #class = _VersionsCell;
    static old = true;
    static circuit = false;
    static command = 7;
    get old() {
        return this.#class.old;
    }
    get circuit() {
        return this.#class.circuit;
    }
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return 2 * this.versions.length;
    }
    writeOrThrow(cursor) {
        for (const version of this.versions)
            cursor.writeUint16OrThrow(version);
        return;
    }
    static readOrThrow(cursor) {
        const versions = new Array(cursor.remaining / 2);
        for (let i = 0; i < versions.length; i++)
            versions[i] = cursor.readUint16OrThrow();
        return new _VersionsCell(versions);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/direct/vpadding/cell.ts
var VariablePaddingCell = class _VariablePaddingCell {
    constructor(data) {
        this.data = data;
    }
    #class = _VariablePaddingCell;
    static circuit = false;
    static command = 128;
    get command() {
        return this.#class.command;
    }
    sizeOrThrow() {
        return this.data.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.data);
    }
    static readOrThrow(cursor) {
        return new _VariablePaddingCell(cursor.readAndCopyOrThrow(cursor.remaining));
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_begin/cell.ts
var RelayBeginCell = class _RelayBeginCell {
    constructor(address, bytes, flags) {
        this.address = address;
        this.bytes = bytes;
        this.flags = flags;
    }
    #class = _RelayBeginCell;
    static early = false;
    static stream = true;
    static rcommand = 1;
    static flags = {
        IPV6_OK: 0,
        IPV4_NOT_OK: 1,
        IPV6_PREFER: 2
    };
    static create(address, flags) {
        return new _RelayBeginCell(address, Bytes.encodeUtf8(address), flags);
    }
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return this.bytes.length + 1 + 4;
    }
    writeOrThrow(cursor) {
        cursor.writeNulledOrThrow(this.bytes);
        cursor.writeUint32OrThrow(this.flags);
    }
    static readOrThrow(cursor) {
        const bytes = Bytes.from(cursor.readNulledOrThrow());
        const address = Bytes.decodeUtf8(bytes);
        const flags = cursor.readUint32OrThrow();
        return new _RelayBeginCell(address, bytes, flags);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_begin_dir/cell.ts
var RelayBeginDirCell = class _RelayBeginDirCell {
    #class = _RelayBeginDirCell;
    static early = false;
    static stream = true;
    static rcommand = 13;
    constructor() {
    }
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return 0;
    }
    writeOrThrow(cursor) {
        cursor.fillOrThrow(0, cursor.remaining);
    }
};
// src/hazae41/common/Dates.ts
var Dates;
((Dates2) => {
    function fromMillis(millis) {
        return new Date(millis);
    }
    Dates2.fromMillis = fromMillis;
    function toMillis(date) {
        return date.getTime();
    }
    Dates2.toMillis = toMillis;
    function fromSeconds(seconds) {
        return fromMillis(seconds * 1e3);
    }
    Dates2.fromSeconds = fromSeconds;
    function toSeconds(date) {
        return Math.floor(toMillis(date) / 1e3);
    }
    Dates2.toSeconds = toSeconds;
    function fromMillisDelay(millis) {
        return fromMillis(Date.now() + millis);
    }
    Dates2.fromMillisDelay = fromMillisDelay;
    function toMillisDelay(date) {
        return toMillis(date) - Date.now();
    }
    Dates2.toMillisDelay = toMillisDelay;
    function fromSecondsDelay(seconds) {
        return fromMillisDelay(seconds * 1e3);
    }
    Dates2.fromSecondsDelay = fromSecondsDelay;
    function toSecondsDelay(date) {
        return Math.floor(toMillisDelay(date) / 1e3);
    }
    Dates2.toSecondsDelay = toSecondsDelay;
})(Dates || (Dates = {}));
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_connected/cell.ts
var UnknownAddressType = class _UnknownAddressType extends Error {
    constructor(type) {
        super(`Unknown address type ${type}`);
        this.type = type;
    }
    #class = _UnknownAddressType;
    name = this.constructor.name;
};
var RelayConnectedCell = class _RelayConnectedCell {
    constructor(address, ttl) {
        this.address = address;
        this.ttl = ttl;
    }
    #class = _RelayConnectedCell;
    static early = false;
    static stream = true;
    static rcommand = 4;
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        throw new Unimplemented3();
    }
    writeOrThrow(_cursor) {
        throw new Unimplemented3();
    }
    static readOrThrow(cursor) {
        const ipv4 = Address4.readOrThrow(cursor);
        if (ipv4.address !== "0.0.0.0") {
            const ttlv2 = cursor.readUint32OrThrow();
            const ttl2 = Dates.fromSecondsDelay(ttlv2);
            return new _RelayConnectedCell(ipv4, ttl2);
        }
        const type = cursor.readUint8OrThrow();
        if (type !== 6)
            throw new UnknownAddressType(type);
        const ipv6 = Address6.readOrThrow(cursor);
        const ttlv = cursor.readUint32OrThrow();
        const ttl = Dates.fromSecondsDelay(ttlv);
        return new _RelayConnectedCell(ipv6, ttl);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_drop/cell.ts
var RelayDropCell = class _RelayDropCell {
    constructor(fragment) {
        this.fragment = fragment;
    }
    #class = _RelayDropCell;
    static early = false;
    static stream = true;
    static rcommand = 10;
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return this.fragment.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        this.fragment.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        return new _RelayDropCell(new Unknown(cursor.readAndCopyOrThrow(cursor.remaining)));
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_end/reason.ts
var RelayEndReasonOther = class {
    constructor(id) {
        this.id = id;
    }
    sizeOrThrow() {
        return 0;
    }
    writeOrThrow(_cursor) {
        return;
    }
};
var RelayEndReasonExitPolicy = class _RelayEndReasonExitPolicy {
    constructor(address, ttl) {
        this.address = address;
        this.ttl = ttl;
    }
    #class = _RelayEndReasonExitPolicy;
    static id = 4;
    get id() {
        return this.#class.id;
    }
    sizeOrThrow() {
        return this.address.sizeOrThrow() + 4;
    }
    writeOrThrow(cursor) {
        this.address.writeOrThrow(cursor);
        const ttlv = Dates.toSecondsDelay(this.ttl);
        cursor.writeUint32OrThrow(ttlv);
    }
    static readOrThrow(cursor) {
        const address = cursor.remaining === 8 ? Address4.readOrThrow(cursor) : Address6.readOrThrow(cursor);
        const ttlv = cursor.readUint32OrThrow();
        const ttl = Dates.fromSecondsDelay(ttlv);
        return new _RelayEndReasonExitPolicy(address, ttl);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_end/cell.ts
var RelayEndCell = class _RelayEndCell {
    constructor(reason) {
        this.reason = reason;
    }
    #class = _RelayEndCell;
    static early = false;
    static stream = true;
    static rcommand = 3;
    static reasons = {
        REASON_UNKNOWN: 0,
        REASON_MISC: 1,
        REASON_RESOLVEFAILED: 2,
        REASON_CONNECTREFUSED: 3,
        REASON_EXITPOLICY: 4,
        REASON_DESTROY: 5,
        REASON_DONE: 6,
        REASON_TIMEOUT: 7,
        REASON_NOROUTE: 8,
        REASON_HIBERNATING: 9,
        REASON_INTERNAL: 10,
        REASON_RESOURCELIMIT: 11,
        REASON_CONNRESET: 12,
        REASON_TORPROTOCOL: 13,
        REASON_NOTDIRECTORY: 14
    };
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return 1 + this.reason.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.reason.id);
        this.reason.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const reasonId = cursor.readUint8OrThrow();
        const reason = reasonId === this.reasons.REASON_EXITPOLICY ? RelayEndReasonExitPolicy.readOrThrow(cursor) : new RelayEndReasonOther(reasonId);
        return new _RelayEndCell(reason);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_extend2/cell.ts
var RelayExtend2Cell = class _RelayExtend2Cell {
    constructor(type, links, data) {
        this.type = type;
        this.links = links;
        this.data = data;
    }
    #class = _RelayExtend2Cell;
    static early = true;
    static stream = false;
    static rcommand = 14;
    static types = {
        /**
         * The old, slow, and insecure handshake
         * @deprecated
         */
        TAP: 0,
        /**
         * The new, quick, and secure handshake
         */
        NTOR: 2
    };
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return 0 + 1 + this.links.reduce((p, c) => p + c.sizeOrThrow(), 0) + 2 + 2 + this.data.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.links.length);
        for (const link of this.links)
            link.writeOrThrow(cursor);
        cursor.writeUint16OrThrow(this.type);
        const size = this.data.sizeOrThrow();
        cursor.writeUint16OrThrow(size);
        this.data.writeOrThrow(cursor);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_extend2/link.ts
var RelayExtend2Link;
((RelayExtend2Link3) => {
    function fromAddressString(address) {
        return address.startsWith("[") ? RelayExtend2LinkIPv6.from(address) : RelayExtend2LinkIPv4.from(address);
    }
    RelayExtend2Link3.fromAddressString = fromAddressString;
})(RelayExtend2Link || (RelayExtend2Link = {}));
var RelayExtend2LinkIPv4 = class _RelayExtend2LinkIPv4 {
    constructor(hostname, port) {
        this.hostname = hostname;
        this.port = port;
    }
    #class = _RelayExtend2LinkIPv4;
    static type = 0;
    static from(host) {
        const { hostname, port } = new URL(`http://${host}`);
        return new _RelayExtend2LinkIPv4(hostname, Number(port));
    }
    sizeOrThrow() {
        return 1 + 1 + 4 * 1 + 2;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.#class.type);
        cursor.writeUint8OrThrow(4 + 2);
        const [a, b, c, d] = this.hostname.split(".");
        cursor.writeUint8OrThrow(Number(a));
        cursor.writeUint8OrThrow(Number(b));
        cursor.writeUint8OrThrow(Number(c));
        cursor.writeUint8OrThrow(Number(d));
        cursor.writeUint16OrThrow(this.port);
    }
};
var RelayExtend2LinkIPv6 = class _RelayExtend2LinkIPv6 {
    constructor(hostname, port) {
        this.hostname = hostname;
        this.port = port;
    }
    #class = _RelayExtend2LinkIPv6;
    static type = 1;
    static from(addrress) {
        const { hostname, port } = new URL(`http://${addrress}`);
        const ip = hostname.slice(1, -1);
        return new _RelayExtend2LinkIPv6(ip, Number(port));
    }
    sizeOrThrow() {
        return 1 + 1 + 8 * 2 + 2;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.#class.type);
        cursor.writeUint8OrThrow(16 + 2);
        const [a, b, c, d, e, f, g, h] = this.hostname.split(":");
        cursor.writeUint16OrThrow(Number(`0x${a}`) || 0);
        cursor.writeUint16OrThrow(Number(`0x${b}`) || 0);
        cursor.writeUint16OrThrow(Number(`0x${c}`) || 0);
        cursor.writeUint16OrThrow(Number(`0x${d}`) || 0);
        cursor.writeUint16OrThrow(Number(`0x${e}`) || 0);
        cursor.writeUint16OrThrow(Number(`0x${f}`) || 0);
        cursor.writeUint16OrThrow(Number(`0x${g}`) || 0);
        cursor.writeUint16OrThrow(Number(`0x${h}`) || 0);
        cursor.writeUint16OrThrow(this.port);
    }
};
var RelayExtend2LinkLegacyID = class _RelayExtend2LinkLegacyID {
    constructor(fingerprint) {
        this.fingerprint = fingerprint;
    }
    #class = _RelayExtend2LinkLegacyID;
    static type = 2;
    sizeOrThrow() {
        return 1 + 1 + this.fingerprint.length;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.#class.type);
        cursor.writeUint8OrThrow(20);
        cursor.writeOrThrow(this.fingerprint);
    }
};
var RelayExtend2LinkModernID = class _RelayExtend2LinkModernID {
    constructor(fingerprint) {
        this.fingerprint = fingerprint;
    }
    #class = _RelayExtend2LinkModernID;
    static type = 3;
    sizeOrThrow() {
        return 1 + 1 + this.fingerprint.length;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.#class.type);
        cursor.writeUint8OrThrow(32);
        cursor.writeOrThrow(this.fingerprint);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_extended2/cell.ts
var RelayExtended2Cell = class _RelayExtended2Cell {
    constructor(fragment) {
        this.fragment = fragment;
    }
    #class = _RelayExtended2Cell;
    static early = false;
    static stream = false;
    static rcommand = 15;
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        throw new Unimplemented3();
    }
    writeOrThrow(_cursor) {
        throw new Unimplemented3();
    }
    static readOrThrow(cursor) {
        const length = cursor.readUint16OrThrow();
        const bytes = cursor.readAndCopyOrThrow(length);
        const data = new Unknown(bytes);
        return new _RelayExtended2Cell(data);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_sendme/cell.ts
var RelaySendmeCircuitCell = class _RelaySendmeCircuitCell {
    constructor(version, fragment) {
        this.version = version;
        this.fragment = fragment;
    }
    #class = _RelaySendmeCircuitCell;
    static early = false;
    static stream = false;
    static rcommand = 5;
    static versions = {
        0: 0,
        1: 1
    };
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return 1 + 2 + this.fragment.sizeOrThrow();
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.version);
        const size = this.fragment.sizeOrThrow();
        cursor.writeUint16OrThrow(size);
        this.fragment.writeOrThrow(cursor);
    }
    static readOrThrow(cursor) {
        const version = cursor.readUint8OrThrow();
        const length = cursor.readUint16OrThrow();
        const bytes = cursor.readAndCopyOrThrow(length);
        const data = new Unknown(bytes);
        return new _RelaySendmeCircuitCell(version, data);
    }
};
var RelaySendmeStreamCell = class _RelaySendmeStreamCell {
    #class = _RelaySendmeStreamCell;
    static early = false;
    static stream = true;
    static rcommand = 5;
    static versions = {
        0: 0,
        1: 1
    };
    constructor() {
    }
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return 0;
    }
    writeOrThrow(_cursor) {
        return;
    }
    static readOrThrow(_cursor) {
        return new _RelaySendmeStreamCell();
    }
};
var RelaySendmeDigest = class _RelaySendmeDigest {
    constructor(digest) {
        this.digest = digest;
    }
    sizeOrThrow() {
        return this.digest.length;
    }
    writeOrThrow(cursor) {
        cursor.writeOrThrow(this.digest);
    }
    static readOrThrow(cursor) {
        return new _RelaySendmeDigest(cursor.readAndCopyOrThrow(20));
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_truncate/cell.ts
var RelayTruncateCell = class _RelayTruncateCell {
    constructor(reason) {
        this.reason = reason;
    }
    #class = _RelayTruncateCell;
    static early = false;
    static stream = false;
    static rcommand = 8;
    static reasons = DestroyCell.reasons;
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.reason);
    }
    static readOrThrow(cursor) {
        return new _RelayTruncateCell(cursor.readUint8OrThrow());
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/relayed/relay_truncated/cell.ts
var RelayTruncatedCell = class _RelayTruncatedCell {
    constructor(reason) {
        this.reason = reason;
    }
    #class = _RelayTruncatedCell;
    static early = false;
    static stream = false;
    static rcommand = 9;
    static reasons = DestroyCell.reasons;
    get early() {
        return this.#class.early;
    }
    get stream() {
        return this.#class.stream;
    }
    get rcommand() {
        return this.#class.rcommand;
    }
    sizeOrThrow() {
        return 1;
    }
    writeOrThrow(cursor) {
        cursor.writeUint8OrThrow(this.reason);
    }
    static readOrThrow(cursor) {
        return new _RelayTruncatedCell(cursor.readUint8OrThrow());
    }
};
// src/TorClient/WebCryptoAes128Ctr.ts
var WebCryptoAes128Ctr = class {
    keyPromise;
    initialCounter;
    bytePosition = 0n;
    /**
     * Create a new AES-128-CTR key
     * @param keyBytes 16-byte AES key
     * @param counterBytes 16-byte initial counter value (typically zeros)
     */
    constructor(keyBytes, counterBytes) {
        if (keyBytes.length !== 16) {
            throw new Error("Key must be 16 bytes for AES-128");
        }
        if (counterBytes.length !== 16) {
            throw new Error("Counter must be 16 bytes");
        }
        this.initialCounter = Bytes.from(counterBytes);
        this.keyPromise = crypto.subtle.importKey("raw", keyBytes, { name: "AES-CTR" }, false, ["encrypt"]);
    }
    /**
     * Generate keystream bytes in the specified byte range
     * @param start Starting byte position
     * @param end Ending byte position (exclusive)
     * @returns Keystream bytes for the range
     */
    async getKeystream(start, end) {
        const cryptoKey = await this.keyPromise;
        const length = Number(end - start);
        const startBlock = start / 16n;
        const startOffset = Number(start % 16n);
        const endBlock = (end + 15n) / 16n;
        const blocksNeeded = Number(endBlock - startBlock);
        const counter = this.deriveCounter(startBlock);
        const keystream = Bytes.from(await crypto.subtle.encrypt({ name: "AES-CTR", counter, length: 128 }, cryptoKey, Bytes.alloc(blocksNeeded * 16)));
        return keystream.slice(startOffset, startOffset + length);
    }
    /**
     * Derive counter value for a given block number
     */
    deriveCounter(blockNumber) {
        const counter = Bytes.from(this.initialCounter);
        let carry = Number(blockNumber & 0xffffffffn);
        for (let i = 15; i >= 0 && carry > 0; i--) {
            const sum = counter[i] + carry;
            counter[i] = sum & 255;
            carry = sum >>> 8;
        }
        return counter;
    }
    /**
     * Apply AES-CTR keystream to data in-place (XOR operation)
     * @param data Data to XOR with keystream
     */
    async apply_keystream(data) {
        const start = this.bytePosition;
        const end = start + BigInt(data.length);
        this.bytePosition = end;
        const keystream = await this.getKeystream(start, end);
        for (let i = 0; i < data.length; i++) {
            data[i] ^= keystream[i];
        }
    }
    /**
     * Resource cleanup (for 'using' statements)
     */
    [Symbol.dispose]() {
    }
    /**
     * Async resource cleanup (for async context managers)
     */
    async [Symbol.asyncDispose]() {
    }
    /**
     * Reset byte position to zero (for testing only)
     */
    resetPosition() {
        this.bytePosition = 0n;
    }
};
// src/hazae41/plume/mods/index.ts
var mods_exports7 = {};
__export(mods_exports7, {
    SuperEventTarget: () => SuperEventTarget,
    rejectOnClose: () => rejectOnClose,
    rejectOnError: () => rejectOnError,
    waitOrThrow: () => waitOrThrow,
    waitWithCloseAndErrorOrThrow: () => waitWithCloseAndErrorOrThrow
});
// src/hazae41/plume/mods/closed.ts
function rejectOnClose(target) {
    return target.wait("close", (future, ...[cause]) => future.reject(new Error("Closed", { cause })));
}
// src/hazae41/plume/mods/errored.ts
function rejectOnError(target) {
    return target.wait("error", (future, ...[cause]) => future.reject(new Error("Errored", { cause })));
}
// src/hazae41/plume/mods/target.ts
var SuperEventTarget = class {
    #listeners = /* @__PURE__ */ new Map();
    get listeners() {
        return this.#listeners;
    }
    /**
     * Add a listener to an event
     * @param type Event type //  "abort", "error", "message", "close"
     * @param listener Event listener // (e) => new Some(123)
     * @param options Options // { passive: true }
     * @returns
     */
    on(type, listener, options = {}) {
        let listeners = this.#listeners.get(type);
        if (listeners === void 0) {
            listeners = /* @__PURE__ */ new Map();
            this.#listeners.set(type, listeners);
        }
        const off = () => this.off(type, listener);
        options.signal?.addEventListener("abort", off, { passive: true });
        const dispose = () => options.signal?.removeEventListener("abort", off);
        listeners.set(listener, { ...options, [Symbol.dispose]: () => dispose() });
        return off;
    }
    /**
     * Remove a listener from an event
     * @param type Event type //  "abort", "error", "message", "close"
     * @param listener Event listener // (e) => console.log("hello")
     * @param options Just to look like DOM's EventTarget
     * @returns
     */
    off(type, listener) {
        var _stack = [];
        try {
            const listeners = this.#listeners.get(type);
            if (!listeners)
                return;
            const options = __using(_stack, listeners.get(listener));
            if (!options)
                return;
            listeners.delete(listener);
            if (listeners.size > 0)
                return;
            this.#listeners.delete(type);
        }
        catch (_) {
            var _error = _, _hasError = true;
        }
        finally {
            __callDispose(_stack, _error, _hasError);
        }
    }
    /**
     * Dispatch an event to its listeners
     *
     * - Dispatch to active listeners sequencially
     * - Return if one of the listeners returned something
     * - Dispatch to passive listeners concurrently
     * - Return if one of the listeners returned something
     * - Return nothing
     * @param params The object to emit
     * @returns `Some` if the event
     */
    async emit(type, ...params) {
        const listeners = this.#listeners.get(type);
        if (!listeners)
            return new None();
        const promises = new Array();
        for (const [listener, options] of listeners) {
            if (options.passive)
                continue;
            if (options.once)
                this.off(type, listener);
            const returned = await listener(...params);
            if (returned == null)
                continue;
            if (returned.isNone())
                continue;
            return new Some(returned.get());
        }
        for (const [listener, options] of listeners) {
            if (!options.passive)
                continue;
            if (options.once)
                this.off(type, listener);
            const promise = Promise.resolve().then(() => listener(...params));
            promises.push(promise);
            continue;
        }
        const returneds = await Promise.all(promises);
        for (const returned of returneds) {
            if (returned == null)
                continue;
            if (returned.isNone())
                continue;
            return new Some(returned.get());
        }
        return new None();
    }
    /**
     * Like `.on`, but instead of returning to the target, capture the returned value in a future, and return nothing to the target
     * @param type
     * @param callback
     * @returns
     */
    wait(type, callback) {
        const future = Promise.withResolvers();
        const dispose = this.on(type, async (...params) => {
            return await callback(future, ...params);
        }, { passive: true });
        return Pin.with(future.promise, dispose);
    }
};
// src/hazae41/plume/mods/waiters.ts
async function waitOrThrow(target, type, callback, signal = new AbortController().signal) {
    var _stack = [];
    try {
        const abort = __using(_stack, signals_exports.rejectOnAbort(signal));
        const event = __using(_stack, target.wait(type, callback));
        return await Promise.race([abort.get(), event.get()]);
    }
    catch (_) {
        var _error = _, _hasError = true;
    }
    finally {
        __callDispose(_stack, _error, _hasError);
    }
}
async function waitWithCloseAndErrorOrThrow(target, type, callback, signal = new AbortController().signal) {
    var _stack = [];
    try {
        const abort = __using(_stack, signals_exports.rejectOnAbort(signal));
        const error = __using(_stack, rejectOnError(target));
        const close = __using(_stack, rejectOnClose(target));
        const event = __using(_stack, target.wait(type, callback));
        return await Promise.race([
            abort.get(),
            error.get(),
            close.get(),
            event.get()
        ]);
    }
    catch (_) {
        var _error = _, _hasError = true;
    }
    finally {
        __callDispose(_stack, _error, _hasError);
    }
}
var Sha1Hasher = class _Sha1Hasher {
    constructor(hasher) {
        this.hasher = hasher;
    }
    static async createOrThrow() {
        const hasher = await createSHA1();
        hasher.init();
        return new _Sha1Hasher(hasher);
    }
    updateOrThrow(data) {
        this.hasher.update(data);
    }
    finalizeOrThrow() {
        const state = this.hasher.save();
        const result = this.hasher.digest("binary");
        this.hasher.load(state);
        return result;
    }
    async cloneOrThrow() {
        const clonedHasher = await createSHA1();
        clonedHasher.load(this.hasher.save());
        return new _Sha1Hasher(clonedHasher);
    }
};
var PrivateKey = class {
    constructor(keyBytes) {
        this.keyBytes = keyBytes;
    }
    getPublicKeyOrThrow() {
        const publicKeyBytes = x25519.getPublicKey(this.keyBytes);
        return new PublicKey(Bytes.from(publicKeyBytes));
    }
    async computeOrThrow(publicKey) {
        const exported = await publicKey.exportOrThrow();
        const publicKeyBytes = exported.bytes;
        const sharedSecret = x25519.getSharedSecret(this.keyBytes, publicKeyBytes);
        return new SharedSecret(Bytes.from(sharedSecret));
    }
};
var PublicKey = class {
    constructor(keyBytes) {
        this.keyBytes = keyBytes;
    }
    exportOrThrow() {
        return {
            bytes: Bytes.from(this.keyBytes)
        };
    }
};
var SharedSecret = class {
    constructor(keyBytes) {
        this.keyBytes = keyBytes;
    }
    exportOrThrow() {
        return {
            bytes: Bytes.from(this.keyBytes)
        };
    }
};
var X25519 = {
    PrivateKey: {
        randomOrThrow: async () => {
            const privateKeyBytes = Bytes.random(32);
            return new PrivateKey(Bytes.from(privateKeyBytes));
        },
        importOrThrow: async (bytes) => {
            if (bytes.length !== 32) {
                throw new Error("Invalid private key length");
            }
            return new PrivateKey(Bytes.from(bytes));
        }
    },
    PublicKey: {
        importOrThrow: async (bytes) => {
            if (bytes.length !== 32) {
                throw new Error("Invalid public key length");
            }
            return new PublicKey(Bytes.from(bytes));
        }
    }
};
// src/hazae41/echalote/mods/tor/stream.ts
var TorStreamDuplex = class {
    #secret;
    constructor(secret) {
        this.#secret = secret;
    }
    [Symbol.dispose]() {
        this.close();
    }
    get id() {
        return this.#secret.id;
    }
    get type() {
        return this.#secret.type;
    }
    get inner() {
        return this.#secret.inner;
    }
    get outer() {
        return this.#secret.outer;
    }
    error(reason) {
        this.#secret.error(reason);
    }
    close() {
        this.#secret.close();
    }
};
var RelayEndedError = class _RelayEndedError extends Error {
    constructor(reason) {
        super(`Relay ended`, { cause: reason });
        this.reason = reason;
    }
    #class = _RelayEndedError;
    name = this.constructor.name;
};
var SecretTorStreamDuplex = class _SecretTorStreamDuplex {
    constructor(type, id, circuit) {
        this.type = type;
        this.id = id;
        this.circuit = circuit;
        this.duplex = new FullDuplex({
            output: {
                write: (c) => this.#onOutputWrite(c)
            },
            error: (e) => this.#onDuplexError(e),
            close: () => this.#onDuplexClose()
        });
        const onCircuitClose = this.#onCircuitClose.bind(this);
        const onCircuitError = this.#onCircuitError.bind(this);
        const onRelayConnectedCell = this.#onRelayConnectedCell.bind(this);
        const onRelayDataCell = this.#onRelayDataCell.bind(this);
        const onRelayEndCell = this.#onRelayEndCell.bind(this);
        this.circuit.events.on("close", onCircuitClose, { passive: true });
        this.circuit.events.on("error", onCircuitError, { passive: true });
        this.circuit.events.on("RELAY_CONNECTED", onRelayConnectedCell, {
            passive: true
        });
        this.circuit.events.on("RELAY_DATA", onRelayDataCell, { passive: true });
        this.circuit.events.on("RELAY_END", onRelayEndCell, { passive: true });
        this.#onClean = () => {
            this.circuit.events.off("close", onCircuitClose);
            this.circuit.events.off("error", onCircuitError);
            this.circuit.events.off("RELAY_CONNECTED", onRelayConnectedCell);
            this.circuit.events.off("RELAY_DATA", onRelayDataCell);
            this.circuit.events.off("RELAY_END", onRelayEndCell);
            this.circuit.streams.delete(this.id);
            this.#onClean = () => {
            };
        };
    }
    #class = _SecretTorStreamDuplex;
    duplex;
    events = new SuperEventTarget();
    delivery = 500;
    package = 500;
    #onClean;
    [Symbol.dispose]() {
        this.close();
    }
    get inner() {
        return this.duplex.inner;
    }
    get outer() {
        return this.duplex.outer;
    }
    get input() {
        return this.duplex.input;
    }
    get output() {
        return this.duplex.output;
    }
    get closed() {
        return this.duplex.closed;
    }
    close() {
        this.duplex.close();
    }
    error(reason) {
        this.duplex.error(reason);
    }
    async #onDuplexClose() {
        if (!this.circuit.closed) {
            const relay_end_cell = new RelayEndCell(new RelayEndReasonOther(RelayEndCell.reasons.REASON_DONE));
            const relay_cell = RelayCell.Streamful.from(this.circuit, this, relay_end_cell);
            this.circuit.tor.output.enqueue(await relay_cell.cellOrThrow());
            this.package--;
        }
        await this.events.emit("close");
        this.#onClean();
    }
    async #onDuplexError(reason) {
        if (!this.circuit.closed) {
            const relay_end_cell = new RelayEndCell(new RelayEndReasonOther(RelayEndCell.reasons.REASON_DONE));
            const relay_cell = RelayCell.Streamful.from(this.circuit, this, relay_end_cell);
            const cell = await relay_cell.cellOrThrow();
            this.circuit.tor.output.enqueue(cell);
            this.package--;
        }
        await this.events.emit("error", reason);
        this.#onClean();
    }
    async #onCircuitClose() {
        Console3.debug(`${this.constructor.name}.onCircuitClose`);
        if (this.duplex.closing)
            return;
        this.duplex.close();
    }
    async #onCircuitError(reason) {
        Console3.debug(`${this.constructor.name}.onCircuitError`, { reason });
        if (this.duplex.closing)
            return;
        this.duplex.error(reason);
    }
    async #onRelayConnectedCell(cell) {
        if (cell.stream !== this)
            return;
        if (this.type === "directory") {
            await this.events.emit("connected");
            return;
        }
        if (this.type === "external") {
            const cell2 = RelayCell.Streamful.intoOrThrow(cell, RelayConnectedCell);
            Console3.debug(`${this.constructor.name}.onRelayConnectedCell`, cell2);
            await this.events.emit("connected");
            return;
        }
    }
    async #onRelayDataCell(cell) {
        if (cell.stream !== this)
            return;
        Console3.debug(`${this.constructor.name}.onRelayDataCell`, cell);
        this.delivery--;
        if (this.delivery === 450) {
            this.delivery = 500;
            const sendme = new RelaySendmeStreamCell();
            const sendme_cell = RelayCell.Streamful.from(this.circuit, this, sendme);
            const cell2 = await sendme_cell.cellOrThrow();
            this.circuit.tor.output.enqueue(cell2);
        }
        this.input.enqueue(cell.fragment.fragment);
    }
    async #onRelayEndCell(cell) {
        if (cell.stream !== this)
            return;
        Console3.debug(`${this.constructor.name}.onRelayEndCell`, cell);
        if (this.duplex.closing)
            return;
        if (cell.fragment.reason.id === RelayEndCell.reasons.REASON_DONE)
            this.duplex.close();
        else
            this.duplex.error(new RelayEndedError(cell.fragment.reason));
    }
    async #onOutputWrite(writable) {
        if (writable.sizeOrThrow() > RelayCell.DATA_LEN)
            return await this.#onWriteChunked(writable);
        return await this.#onWriteDirect(writable);
    }
    async #onWriteDirect(writable) {
        const relay_data_cell = new RelayDataCell(writable);
        const relay_cell = RelayCell.Streamful.from(this.circuit, this, relay_data_cell);
        const cell = await relay_cell.cellOrThrow();
        this.circuit.tor.output.enqueue(cell);
        this.package--;
    }
    async #onWriteChunked(writable) {
        const bytes = Writable.writeToBytesOrThrow(writable);
        const cursor = new Cursor(bytes);
        for (const chunk of cursor.splitOrThrow(RelayCell.DATA_LEN))
            await this.#onWriteDirect(new Unknown(chunk));
        return;
    }
};
// src/hazae41/echalote/mods/tor/target.ts
var Target = class _Target {
    constructor(relayid_rsa, circuit, forward_digest, backward_digest, forward_key, backward_key) {
        this.relayid_rsa = relayid_rsa;
        this.circuit = circuit;
        this.forward_digest = forward_digest;
        this.backward_digest = backward_digest;
        this.forward_key = forward_key;
        this.backward_key = backward_key;
    }
    #class = _Target;
    delivery = 1e3;
    package = 1e3;
    digests = new Array();
};
// src/utils/debug.ts
function invariant(cond, message) {
    if (!cond) {
        throw new Error(message || "Invariant violation");
    }
}
// src/hazae41/echalote/mods/tor/circuit.ts
var IPv6 = {
    always: 3,
    preferred: 2,
    avoided: 1,
    never: 0
};
var UnknownProtocolError = class _UnknownProtocolError extends Error {
    constructor(protocol) {
        super(`Unknown protocol "${protocol}"`);
        this.protocol = protocol;
    }
    #class = _UnknownProtocolError;
    name = this.constructor.name;
};
var DestroyedError = class _DestroyedError extends Error {
    constructor(reason) {
        super(`Circuit destroyed`, { cause: reason });
        this.reason = reason;
    }
    #class = _DestroyedError;
    name = this.constructor.name;
};
var ExtendError = class _ExtendError extends Error {
    #class = _ExtendError;
    name = this.constructor.name;
    constructor(options) {
        super(`Could not extend`, options);
    }
    static from(cause) {
        return new _ExtendError({ cause });
    }
};
var OpenError = class _OpenError extends Error {
    #class = _OpenError;
    name = this.constructor.name;
    constructor(options) {
        super(`Could not open`, options);
    }
    static from(cause) {
        return new _OpenError({ cause });
    }
};
var TruncateError = class _TruncateError extends Error {
    #class = _TruncateError;
    name = this.constructor.name;
    constructor(options) {
        super(`Could not truncate`, options);
    }
    static from(cause) {
        return new _TruncateError({ cause });
    }
};
var Circuit = class {
    events = new SuperEventTarget();
    #secret;
    constructor(secret) {
        this.#secret = secret;
        const onClose = this.#onClose.bind(this);
        this.#secret.events.on("close", onClose);
        const onError = this.#onError.bind(this);
        this.#secret.events.on("error", onError);
    }
    [Symbol.dispose]() {
        this.#secret[Symbol.dispose]();
    }
    async [Symbol.asyncDispose]() {
        this.#secret[Symbol.asyncDispose]();
    }
    get id() {
        return this.#secret.id;
    }
    get closed() {
        return Boolean(this.#secret.closed);
    }
    async #onClose() {
        return await this.events.emit("close", [void 0]);
    }
    async #onError(reason) {
        return await this.events.emit("error", [reason]);
    }
    async extendOrThrow(microdesc, signal = new AbortController().signal) {
        return await this.#secret.extendOrThrow(microdesc, signal);
    }
    async openOrThrow(hostname, port, params, signal = new AbortController().signal) {
        return await this.#secret.openOrThrow(hostname, port, params, signal);
    }
    async openDirOrThrow(params, signal = new AbortController().signal) {
        return await this.#secret.openDirOrThrow(params, signal);
    }
    async close() {
        return await this.#secret.close();
    }
};
var SecretCircuit = class _SecretCircuit {
    constructor(id, tor2) {
        this.id = id;
        this.tor = tor2;
        const onClose = this.#onTorClose.bind(this);
        const onError = this.#onTorError.bind(this);
        const onDestroyCell = this.#onDestroyCell.bind(this);
        const onRelayExtended2Cell = this.#onRelayExtended2Cell.bind(this);
        const onRelayTruncatedCell = this.#onRelayTruncatedCell.bind(this);
        const onRelayConnectedCell = this.#onRelayConnectedCell.bind(this);
        const onRelayDataCell = this.#onRelayDataCell.bind(this);
        const onRelayEndCell = this.#onRelayEndCell.bind(this);
        this.tor.events.on("close", onClose, { passive: true });
        this.tor.events.on("error", onError, { passive: true });
        this.tor.events.on("DESTROY", onDestroyCell, { passive: true });
        this.tor.events.on("RELAY_EXTENDED2", onRelayExtended2Cell, {
            passive: true
        });
        this.tor.events.on("RELAY_TRUNCATED", onRelayTruncatedCell, {
            passive: true
        });
        this.tor.events.on("RELAY_CONNECTED", onRelayConnectedCell, {
            passive: true
        });
        this.tor.events.on("RELAY_DATA", onRelayDataCell, { passive: true });
        this.tor.events.on("RELAY_END", onRelayEndCell, { passive: true });
        this.#onClean = () => {
            for (const stream of this.streams.values())
                stream[Symbol.dispose]();
            this.tor.events.off("close", onClose);
            this.tor.events.off("error", onError);
            this.tor.events.off("DESTROY", onDestroyCell);
            this.tor.events.off("RELAY_EXTENDED2", onRelayExtended2Cell);
            this.tor.events.off("RELAY_TRUNCATED", onRelayTruncatedCell);
            this.tor.events.off("RELAY_CONNECTED", onRelayConnectedCell);
            this.tor.events.off("RELAY_DATA", onRelayDataCell);
            this.tor.events.off("RELAY_END", onRelayEndCell);
            this.tor.circuits.value.delete(this.id);
            this.#onClean = () => {
            };
        };
    }
    #class = _SecretCircuit;
    events = new SuperEventTarget();
    targets = new Array();
    streams = /* @__PURE__ */ new Map();
    #streamId = 1;
    #closed;
    #onClean;
    [Symbol.dispose]() {
        this.close().catch((e) => {
            console.error(getErrorDetails(e));
        });
    }
    async [Symbol.asyncDispose]() {
        await this.close();
    }
    get closed() {
        return this.#closed;
    }
    #onCloseOrError(reason) {
        if (this.#closed)
            return;
        this.#closed = { reason };
        this.#onClean();
    }
    async close(reason = DestroyCell.reasons.NONE) {
        const error = new DestroyedError(reason);
        this.#onCloseOrError(error);
        if (reason === DestroyCell.reasons.NONE)
            await this.events.emit("close", [error]);
        else
            await this.events.emit("error", [error]);
    }
    async #onTorClose() {
        Console3.debug(`${this.constructor.name}.onTorClose`);
        this.#onCloseOrError();
        await this.events.emit("close", [void 0]);
    }
    async #onTorError(reason) {
        Console3.debug(`${this.constructor.name}.onReadError`, { reason });
        await this.events.emit("error", [reason]);
        this.#onCloseOrError(reason);
    }
    async #onDestroyCell(cell) {
        if (cell.circuit !== this)
            return;
        Console3.debug(`${this.constructor.name}.onDestroyCell`, cell);
        const error = new DestroyedError(cell.fragment.reason);
        this.#onCloseOrError(error);
        if (cell.fragment.reason === DestroyCell.reasons.NONE)
            await this.events.emit("close", [error]);
        else
            await this.events.emit("error", [error]);
    }
    async #onRelayExtended2Cell(cell) {
        if (cell.circuit !== this)
            return;
        Console3.debug(`${this.constructor.name}.onRelayExtended2Cell`, cell);
        await this.events.emit("RELAY_EXTENDED2", cell);
    }
    async #onRelayTruncatedCell(cell) {
        if (cell.circuit !== this)
            return;
        Console3.debug(`${this.constructor.name}.onRelayTruncatedCell`, cell);
        const error = new DestroyedError(cell.fragment.reason);
        this.#onCloseOrError(error);
        if (cell.fragment.reason === RelayTruncateCell.reasons.NONE)
            await this.events.emit("close", [error]);
        else
            await this.events.emit("error", [error]);
        await this.events.emit("RELAY_TRUNCATED", cell);
    }
    async #onRelayConnectedCell(cell) {
        if (cell.circuit !== this)
            return;
        Console3.debug(`${this.constructor.name}.onRelayConnectedCell`, cell);
        await this.events.emit("RELAY_CONNECTED", cell);
    }
    async #onRelayDataCell(cell) {
        if (cell.circuit !== this)
            return;
        Console3.debug(`${this.constructor.name}.onRelayDataCell`, cell);
        await this.events.emit("RELAY_DATA", cell);
    }
    async #onRelayEndCell(cell) {
        if (cell.circuit !== this)
            return;
        Console3.debug(`${this.constructor.name}.onRelayEndCell`, cell);
        this.streams.delete(cell.stream.id);
        await this.events.emit("RELAY_END", cell);
    }
    async extendOrThrow(microdesc, signal = new AbortController().signal) {
        if (this.closed != null)
            throw this.closed.reason;
        const relayid_rsa = Bytes.fromBase64(microdesc.identity);
        Bytes.assertLen(relayid_rsa, HASH_LEN);
        const ntor_key = Bytes.fromBase64(microdesc.ntorOnionKey);
        Bytes.assertLen(ntor_key, 32);
        const relayid_ed = Option.wrap(microdesc.idEd25519).mapSync((x) => {
            return Bytes.fromBase64(x);
        }).getOrNull();
        const links = new Array();
        links.push(new RelayExtend2LinkIPv4(microdesc.hostname, Number(microdesc.orport)));
        if (microdesc.ipv6 != null)
            links.push(RelayExtend2LinkIPv6.from(microdesc.ipv6));
        links.push(new RelayExtend2LinkLegacyID(relayid_rsa));
        if (relayid_ed != null)
            links.push(new RelayExtend2LinkModernID(relayid_ed));
        const wasm_secret_x = await X25519.PrivateKey.randomOrThrow();
        const wasm_public_x = wasm_secret_x.getPublicKeyOrThrow();
        const public_x_memory = wasm_public_x.exportOrThrow();
        const public_x = public_x_memory.bytes.slice();
        Bytes.assertLen(public_x, 32);
        const public_b = ntor_key;
        const ntor_request = new ntor_exports.NtorRequest(public_x, relayid_rsa, public_b);
        const relay_extend2 = new RelayExtend2Cell(RelayExtend2Cell.types.NTOR, links, ntor_request);
        const relay_early_cell = RelayEarlyCell.Streamless.from(this, void 0, relay_extend2);
        this.tor.output.enqueue(await relay_early_cell.cellOrThrow());
        const msg_extended2 = await mods_exports7.waitWithCloseAndErrorOrThrow(this.events, "RELAY_EXTENDED2", (future, e) => {
            future.resolve(e);
        }, signal);
        const response = msg_extended2.fragment.fragment.readIntoOrThrow(ntor_exports.NtorResponse);
        const { public_y } = response;
        const wasm_public_y = await X25519.PublicKey.importOrThrow(public_y);
        const wasm_public_b = await X25519.PublicKey.importOrThrow(public_b);
        const wasm_shared_xy = await wasm_secret_x.computeOrThrow(wasm_public_y);
        const wasm_shared_xb = await wasm_secret_x.computeOrThrow(wasm_public_b);
        const shared_xy_memory = wasm_shared_xy.exportOrThrow();
        const shared_xb_memory = wasm_shared_xb.exportOrThrow();
        const shared_xy = shared_xy_memory.bytes.slice();
        Bytes.assertLen(shared_xy, 32);
        const shared_xb = shared_xb_memory.bytes.slice();
        Bytes.assertLen(shared_xb, 32);
        const result = await NtorResult.finalizeOrThrow(shared_xy, shared_xb, relayid_rsa, public_b, public_x, public_y);
        if (!Bytes.equals(response.auth, result.auth))
            throw new InvalidNtorAuthError();
        const forward_digest = await Sha1Hasher.createOrThrow();
        const backward_digest = await Sha1Hasher.createOrThrow();
        await forward_digest.updateOrThrow(result.forwardDigest);
        await backward_digest.updateOrThrow(result.backwardDigest);
        const forwardKey = new WebCryptoAes128Ctr(result.forwardKey, Bytes.alloc(16));
        const backwardKey = new WebCryptoAes128Ctr(result.backwardKey, Bytes.alloc(16));
        const target = new Target(relayid_rsa, this, forward_digest, backward_digest, forwardKey, backwardKey);
        this.targets.push(target);
    }
    async truncateOrThrow(reason = RelayTruncateCell.reasons.NONE, signal = new AbortController().signal) {
        if (this.closed != null)
            throw this.closed.reason;
        const relay_truncate = new RelayTruncateCell(reason);
        const relay_truncate_cell = RelayCell.Streamless.from(this, void 0, relay_truncate);
        const cell = await relay_truncate_cell.cellOrThrow();
        this.tor.output.enqueue(cell);
        await mods_exports7.waitWithCloseAndErrorOrThrow(this.events, "RELAY_TRUNCATED", (future, e) => {
            future.resolve(e);
        }, signal);
    }
    async openDirOrThrow(params = {}, signal = new AbortController().signal) {
        if (this.closed != null)
            throw this.closed.reason;
        const stream = new SecretTorStreamDuplex("directory", this.#streamId++, this);
        invariant(stream.id > 0 && stream.id < 65536, `Stream ID must be in valid range (1-65535), got ${stream.id}`);
        invariant(!this.streams.has(stream.id), `Stream ID must be unique, but ${stream.id} already exists in circuit`);
        this.streams.set(stream.id, stream);
        const begin = new RelayBeginDirCell();
        const begin_cell = RelayCell.Streamful.from(this, stream, begin);
        const cell = await begin_cell.cellOrThrow();
        this.tor.output.enqueue(cell);
        if (!params.wait)
            return new TorStreamDuplex(stream);
        await mods_exports7.waitWithCloseAndErrorOrThrow(stream.events, "connected", (future) => {
            future.resolve();
        }, signal);
        return new TorStreamDuplex(stream);
    }
    async openOrThrow(hostname, port, params = {}, signal = new AbortController().signal) {
        if (this.closed != null)
            throw this.closed.reason;
        const { ipv6 = "preferred" } = params;
        const stream = new SecretTorStreamDuplex("external", this.#streamId++, this);
        invariant(stream.id > 0 && stream.id < 65536, `Stream ID must be in valid range (1-65535), got ${stream.id}`);
        invariant(!this.streams.has(stream.id), `Stream ID must be unique, but ${stream.id} already exists in circuit`);
        this.streams.set(stream.id, stream);
        const flags = new Bitset(0, 32).setLE(RelayBeginCell.flags.IPV6_OK, IPv6[ipv6] !== IPv6.never).setLE(RelayBeginCell.flags.IPV4_NOT_OK, IPv6[ipv6] === IPv6.always).setLE(RelayBeginCell.flags.IPV6_PREFER, IPv6[ipv6] > IPv6.avoided).unsign().value;
        const begin = RelayBeginCell.create(`${hostname}:${port}`, flags);
        const begin_cell = RelayCell.Streamful.from(this, stream, begin);
        const cell = await begin_cell.cellOrThrow();
        this.tor.output.enqueue(cell);
        if (!params.wait)
            return new TorStreamDuplex(stream);
        await mods_exports7.waitWithCloseAndErrorOrThrow(stream.events, "connected", (future) => {
            future.resolve();
        }, signal);
        return new TorStreamDuplex(stream);
    }
};
// src/hazae41/echalote/mods/tor/binary/cells/old.ts
var OldCell;
((OldCell2) => {
    OldCell2.PAYLOAD_LEN = 509;
    class Raw {
        constructor(circuit, command, fragment) {
            this.circuit = circuit;
            this.command = command;
            this.fragment = fragment;
        }
        unpackOrNull(tor2) {
            if (this.circuit === 0)
                return new Circuitless(void 0, this.command, this.fragment);
            const circuit = tor2.circuits.value.get(this.circuit);
            if (circuit == null)
                return void 0;
            return new Circuitful(circuit, this.command, this.fragment);
        }
        sizeOrThrow() {
            return this.command === 7 ? 2 + 1 + 2 + this.fragment.sizeOrThrow() : 2 + 1 + OldCell2.PAYLOAD_LEN;
        }
        writeOrThrow(cursor) {
            if (this.command === 7) {
                cursor.writeUint16OrThrow(this.circuit);
                cursor.writeUint8OrThrow(this.command);
                const size = this.fragment.sizeOrThrow();
                cursor.writeUint16OrThrow(size);
                this.fragment.writeOrThrow(cursor);
                return;
            }
            cursor.writeUint16OrThrow(this.circuit);
            cursor.writeUint8OrThrow(this.command);
            const payload = cursor.readOrThrow(OldCell2.PAYLOAD_LEN);
            const subcursor = new Cursor(payload);
            this.fragment.writeOrThrow(subcursor);
            subcursor.fillOrThrow(0, subcursor.remaining);
        }
        static readOrThrow(cursor) {
            const circuit = cursor.readUint16OrThrow();
            const command = cursor.readUint8OrThrow();
            if (command === 7) {
                const length = cursor.readUint16OrThrow();
                const bytes2 = cursor.readAndCopyOrThrow(length);
                const payload2 = new Unknown(bytes2);
                return new Raw(circuit, command, payload2);
            }
            const bytes = cursor.readAndCopyOrThrow(OldCell2.PAYLOAD_LEN);
            const payload = new Unknown(bytes);
            return new Raw(circuit, command, payload);
        }
    }
    OldCell2.Raw = Raw;
    class Circuitful {
        constructor(circuit, command, fragment) {
            this.circuit = circuit;
            this.command = command;
            this.fragment = fragment;
            this.#raw = new Raw(circuit.id, command, fragment);
        }
        #raw;
        static from(circuit, cellable) {
            return new Circuitful(circuit, cellable.command, cellable);
        }
        sizeOrThrow() {
            return this.#raw.sizeOrThrow();
        }
        writeOrThrow(cursor) {
            this.#raw.writeOrThrow(cursor);
        }
        static intoOrThrow(cell, readable) {
            if (cell.command !== readable.command)
                throw new InvalidCommandError();
            if (cell.circuit == null)
                throw new ExpectedCircuitError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Circuitful(cell.circuit, readable.command, fragment);
        }
    }
    OldCell2.Circuitful = Circuitful;
    class Circuitless {
        constructor(circuit, command, fragment) {
            this.circuit = circuit;
            this.command = command;
            this.fragment = fragment;
            this.#raw = new Raw(0, command, fragment);
        }
        #raw;
        static from(circuit, cellable) {
            return new Circuitless(circuit, cellable.command, cellable);
        }
        sizeOrThrow() {
            return this.#raw.sizeOrThrow();
        }
        writeOrThrow(cursor) {
            this.#raw.writeOrThrow(cursor);
        }
        static intoOrThrow(cell, readable) {
            if (cell.command !== readable.command)
                throw new InvalidCommandError();
            if (cell.circuit != null)
                throw new UnexpectedCircuitError();
            const fragment = cell.fragment.readIntoOrThrow(readable);
            return new Circuitless(cell.circuit, readable.command, fragment);
        }
    }
    OldCell2.Circuitless = Circuitless;
})(OldCell || (OldCell = {}));
// src/hazae41/mutex/index.ts
var LockedError = class _LockedError extends Error {
    #class = _LockedError;
    name = this.#class.name;
    constructor() {
        super("Locked");
    }
};
var Lock = class {
    constructor(value, clean) {
        this.value = value;
        this.clean = clean;
    }
    [Symbol.dispose]() {
        this.clean();
    }
    // deno-lint-ignore require-await
    async [Symbol.asyncDispose]() {
        this[Symbol.dispose]();
    }
    get() {
        return this.value;
    }
};
var Mutex = class {
    constructor(value) {
        this.value = value;
    }
    #queue = new Array();
    #count = 0;
    [Symbol.dispose]() {
        this.value[Symbol.dispose]();
    }
    async [Symbol.asyncDispose]() {
        await this.value[Symbol.asyncDispose]();
    }
    get count() {
        return this.#count;
    }
    get locked() {
        return this.#count >= 1;
    }
    #unlock() {
        this.#count--;
        this.#queue.shift()?.resolve();
        return;
    }
    get() {
        return this.value;
    }
    getOrNull() {
        if (this.#count >= 1)
            return;
        return this.value;
    }
    getOrThrow() {
        if (this.#count >= 1)
            throw new LockedError();
        return this.value;
    }
    async wait() {
        this.#count++;
        if (this.#count > 1) {
            const future = Promise.withResolvers();
            this.#queue.push(future);
            await future.promise;
        }
        this.#unlock();
    }
    lockOrNull() {
        if (this.#count >= 1)
            return;
        this.#count++;
        return new Lock(this.value, () => this.#unlock());
    }
    /**
     * Get and lock or throw
     * @returns
     */
    lockOrThrow() {
        if (this.#count >= 1)
            throw new LockedError();
        this.#count++;
        return new Lock(this.value, () => this.#unlock());
    }
    /**
     * Get and lock or wait
     * @returns
     */
    async lockOrWait() {
        this.#count++;
        if (this.#count > 1) {
            const future = Promise.withResolvers();
            this.#queue.push(future);
            await future.promise;
        }
        return new Lock(this.value, () => this.#unlock());
    }
    /**
     * @deprecated
     * @param callback
     * @returns
     */
    async runOrThrow(callback) {
        if (this.#count >= 1)
            throw new LockedError();
        this.#count++;
        try {
            return await callback(this.value);
        }
        finally {
            this.#unlock();
        }
    }
    /**
     * @deprecated
     * @param callback
     * @returns
     */
    async runOrWait(callback) {
        this.#count++;
        if (this.#count > 1) {
            const future = Promise.withResolvers();
            this.#queue.push(future);
            await future.promise;
        }
        try {
            return await callback(this.value);
        }
        finally {
            this.#unlock();
        }
    }
};
// src/hazae41/echalote/mods/tor/client.ts
var TorClientDuplex = class {
    constructor(app) {
        this.app = app;
        this.#secret = new SecretTorClientDuplex(app);
        this.#secret.events.on("close", () => this.events.emit("close"));
        this.#secret.events.on("error", (e) => this.events.emit("error", e));
    }
    #secret;
    events = new SuperEventTarget();
    [Symbol.dispose]() {
        this.close();
    }
    get inner() {
        return this.#secret.inner;
    }
    get outer() {
        return this.#secret.outer;
    }
    get closing() {
        return this.#secret.closing;
    }
    get closed() {
        return this.#secret.closed;
    }
    error(reason) {
        this.#secret.error(reason);
    }
    close() {
        this.#secret.close();
    }
    async waitOrThrow(signal = new AbortController().signal) {
        return await this.#secret.waitOrThrow(signal);
    }
    async createOrThrow(signal = new AbortController().signal) {
        return await this.#secret.createOrThrow(signal);
    }
};
var SecretTorClientDuplex = class {
    constructor(app) {
        this.app = app;
        this.tls = new TlsClientDuplex(this.app, {
            /**
             * Do not validate root certificates
             */
            authorized: true,
            ciphers: [ciphers_exports.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384],
            certificates: (c) => this.#resolveOnTlsCertificates.resolve(c)
        });
        this.duplex = new HalfDuplex({
            output: {
                start: () => this.#onOutputStart()
            },
            input: {
                write: (c) => this.#onInputWrite(c)
            },
            close: async () => void await this.events.emit("close"),
            error: async (e) => void await this.events.emit("error", e)
        });
        this.tls.outer.readable.pipeTo(this.duplex.inner.writable).catch(() => {
        });
        this.duplex.inner.readable.pipeTo(this.tls.outer.writable).catch(() => {
        });
        this.#resolveOnStart.resolve();
    }
    ciphers = [ciphers_exports.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384];
    tls;
    duplex;
    events = new SuperEventTarget();
    circuits = new Mutex(/* @__PURE__ */ new Map());
    #buffer = new Resizer();
    #resolveOnStart = Promise.withResolvers();
    #resolveOnTlsCertificates = Promise.withResolvers();
    #state = { type: "none" };
    [Symbol.dispose]() {
        this.close();
    }
    get state() {
        return this.#state;
    }
    /**
     * TLS inner pair
     */
    get inner() {
        return this.tls.inner;
    }
    get outer() {
        return this.duplex.outer;
    }
    get input() {
        return this.duplex.input;
    }
    get output() {
        return this.duplex.output;
    }
    get closing() {
        return this.duplex.closing;
    }
    get closed() {
        return this.duplex.closed;
    }
    error(reason) {
        this.duplex.error(reason);
    }
    close() {
        this.duplex.close();
    }
    async #onOutputStart() {
        await this.#resolveOnStart.promise;
        this.output.enqueue(OldCell.Circuitless.from(void 0, new VersionsCell([5])));
        await mods_exports7.waitWithCloseAndErrorOrThrow(this.events, "handshaked", (future) => future.resolve());
    }
    async #onInputWrite(chunk) {
        if (this.#buffer.inner.offset)
            await this.#onReadBuffered(chunk.bytes);
        else
            await this.#onReadDirect(chunk.bytes);
    }
    /**
     * Read from buffer
     * @param chunk
     * @returns
     */
    async #onReadBuffered(chunk) {
        this.#buffer.writeOrThrow(chunk);
        const full = Bytes.from(this.#buffer.inner.before);
        this.#buffer.inner.offset = 0;
        await this.#onReadDirect(full);
    }
    /**
     * Zero-copy reading
     * @param chunk
     * @returns
     */
    async #onReadDirect(chunk) {
        const cursor = new Cursor(chunk);
        while (cursor.remaining) {
            let raw;
            try {
                raw = this.#state.type === "none" ? Readable.readOrRollbackAndThrow(OldCell.Raw, cursor) : Readable.readOrRollbackAndThrow(Cell.Raw, cursor);
            }
            catch {
                this.#buffer.writeOrThrow(cursor.after);
                break;
            }
            const cell = raw.unpackOrNull(this);
            if (cell == null)
                continue;
            await this.#onCell(cell, this.#state);
        }
    }
    async #onCell(cell, state) {
        if (cell.command === PaddingCell.command) {
            Console3.debug(cell);
            return;
        }
        if (cell.command === VariablePaddingCell.command) {
            Console3.debug(cell);
            return;
        }
        if (state.type === "none")
            return await this.#onNoneStateCell(cell, state);
        if (cell instanceof OldCell.Circuitful)
            throw new InvalidCellError();
        if (cell instanceof OldCell.Circuitless)
            throw new InvalidCellError();
        if (state.type === "versioned")
            return await this.#onVersionedStateCell(cell, state);
        if (state.type === "handshaking")
            return await this.#onHandshakingStateCell(cell, state);
        if (state.type === "handshaked")
            return await this.#onHandshakedStateCell(cell);
        return state;
    }
    async #onNoneStateCell(cell, state) {
        if (cell instanceof Cell.Circuitful)
            throw new InvalidCellError();
        if (cell instanceof Cell.Circuitless)
            throw new InvalidCellError();
        if (cell.command === VersionsCell.command)
            return await this.#onVersionsCell(cell, state);
        console.warn(`Unknown pre-version cell ${cell.command}`);
    }
    async #onVersionedStateCell(cell, state) {
        if (cell.command === CertsCell.command)
            return await this.#onCertsCell(cell, state);
        console.warn(`Unknown versioned-state cell ${cell.command}`);
    }
    async #onHandshakingStateCell(cell, state) {
        if (cell.command === AuthChallengeCell.command)
            return await this.#onAuthChallengeCell(cell, state);
        if (cell.command === NetinfoCell.command)
            return await this.#onNetinfoCell(cell, state);
        console.warn(`Unknown handshaking-state cell ${cell.command}`);
    }
    async #onHandshakedStateCell(cell) {
        if (cell.command === CreatedFastCell.command)
            return await this.#onCreatedFastCell(cell);
        if (cell.command === DestroyCell.command)
            return await this.#onDestroyCell(cell);
        if (cell.command === RelayCell.command)
            return await this.#onRelayCell(cell);
        console.warn(`Unknown handshaked-state cell ${cell.command}`);
    }
    async #onVersionsCell(cell, state) {
        const cell2 = OldCell.Circuitless.intoOrThrow(cell, VersionsCell);
        Console3.debug(cell2);
        invariant(state.type === "none", `State must be 'none' to receive VERSIONS cell`);
        if (!cell2.fragment.versions.includes(5))
            throw new InvalidTorVersionError();
        this.#state = { ...state, type: "versioned", version: 5 };
    }
    async #onCertsCell(cell, state) {
        const cell2 = Cell.Circuitless.intoOrThrow(cell, CertsCell);
        Console3.debug(cell2);
        invariant(state.type === "versioned", `State must be 'versioned' to receive CERTS cell, current: ${state.type}`);
        const tlsCerts = await this.#resolveOnTlsCertificates.promise;
        const torCerts = await Certs.verifyOrThrow(cell2.fragment.certs, tlsCerts);
        const identity = await torCerts.rsa_self.sha1OrThrow();
        const guard = { certs: torCerts, identity };
        this.#state = { ...state, type: "handshaking", guard };
    }
    async #onAuthChallengeCell(cell, _state) {
        Console3.debug(Cell.Circuitless.intoOrThrow(cell, AuthChallengeCell));
    }
    async #onNetinfoCell(cell, state) {
        const cell2 = Cell.Circuitless.intoOrThrow(cell, NetinfoCell);
        Console3.debug(cell2);
        invariant(state.type === "handshaking", `State must be 'handshaking' to receive NETINFO cell, current: ${state.type}`);
        invariant(state.guard !== void 0, `Handshaking state must have guard information`);
        const address = new TypedAddress(4, Bytes.from([127, 0, 0, 1]));
        const netinfo = new NetinfoCell(0, address, []);
        this.output.enqueue(Cell.Circuitless.from(void 0, netinfo));
        const pversion = PaddingNegociateCell.versions.ZERO;
        const pcommand = PaddingNegociateCell.commands.STOP;
        const padding_negociate = new PaddingNegociateCell(pversion, pcommand, 0, 0);
        this.output.enqueue(Cell.Circuitless.from(void 0, padding_negociate));
        this.#state = { ...state, type: "handshaked" };
        await this.events.emit("handshaked");
    }
    async #onCreatedFastCell(cell) {
        const cell2 = Cell.Circuitful.intoOrThrow(cell, CreatedFastCell);
        Console3.debug(cell2);
        await this.events.emit("CREATED_FAST", cell2);
    }
    async #onDestroyCell(cell) {
        const cell2 = Cell.Circuitful.intoOrThrow(cell, DestroyCell);
        Console3.debug(cell2);
        this.circuits.value.delete(cell2.circuit.id);
        await this.events.emit("DESTROY", cell2);
    }
    async #onRelayCell(parent) {
        const raw = await RelayCell.Raw.uncellOrThrow(parent);
        const cell = raw.unpackOrNull();
        if (cell == null)
            return;
        if (cell.rcommand === RelayExtended2Cell.rcommand)
            return await this.#onRelayExtended2Cell(cell);
        if (cell.rcommand === RelayConnectedCell.rcommand)
            return await this.#onRelayConnectedCell(cell);
        if (cell.rcommand === RelayDataCell.rcommand)
            return await this.#onRelayDataCell(cell);
        if (cell.rcommand === RelayEndCell.rcommand)
            return await this.#onRelayEndCell(cell);
        if (cell.rcommand === RelayDropCell.rcommand)
            return await this.#onRelayDropCell(cell);
        if (cell.rcommand === RelayTruncatedCell.rcommand)
            return await this.#onRelayTruncatedCell(cell);
        if (cell.rcommand === RelaySendmeCircuitCell.rcommand && cell.stream == null)
            return await this.#onRelaySendmeCircuitCell(cell);
        if (cell.rcommand === RelaySendmeStreamCell.rcommand && cell.stream != null)
            return await this.#onRelaySendmeStreamCell(cell);
        console.warn(`Unknown relay cell ${cell.rcommand}`);
    }
    async #onRelayExtended2Cell(cell) {
        const cell2 = RelayCell.Streamless.intoOrThrow(cell, RelayExtended2Cell);
        Console3.debug(cell2);
        await this.events.emit("RELAY_EXTENDED2", cell2);
    }
    async #onRelayConnectedCell(cell) {
        if (cell.stream == null)
            throw new ExpectedStreamError();
        await this.events.emit("RELAY_CONNECTED", cell);
    }
    async #onRelayDataCell(cell) {
        const cell2 = RelayCell.Streamful.intoOrThrow(cell, RelayDataCell);
        Console3.debug(cell2);
        const exit = cell2.circuit.targets[cell2.circuit.targets.length - 1];
        exit.delivery--;
        if (exit.delivery === 900) {
            exit.delivery = 1e3;
            if (cell2.digest == null)
                throw new InvalidRelayCellDigestError();
            const digest = new RelaySendmeDigest(cell2.digest);
            const sendme = new RelaySendmeCircuitCell(1, digest);
            const sendme_cell = RelayCell.Streamless.from(cell2.circuit, void 0, sendme);
            const cell3 = await sendme_cell.cellOrThrow();
            this.output.enqueue(cell3);
        }
        await this.events.emit("RELAY_DATA", cell2);
    }
    async #onRelayEndCell(cell) {
        const cell2 = RelayCell.Streamful.intoOrThrow(cell, RelayEndCell);
        Console3.debug(cell2);
        await this.events.emit("RELAY_END", cell2);
    }
    async #onRelayDropCell(cell) {
        Console3.debug(RelayCell.Streamful.intoOrThrow(cell, RelayDropCell));
    }
    async #onRelayTruncatedCell(cell) {
        const cell2 = RelayCell.Streamless.intoOrThrow(cell, RelayTruncatedCell);
        Console3.debug(cell2);
        cell2.circuit.targets.pop();
        await this.events.emit("RELAY_TRUNCATED", cell2);
    }
    async #onRelaySendmeCircuitCell(cell) {
        const cell2 = RelayCell.Streamless.intoOrThrow(cell, RelaySendmeCircuitCell);
        Console3.debug(cell2);
        if (cell2.fragment.version === 0) {
            const exit = cell2.circuit.targets[cell2.circuit.targets.length - 1];
            exit.package += 100;
            return;
        }
        if (cell2.fragment.version === 1) {
            const digest = cell2.fragment.fragment.readIntoOrThrow(RelaySendmeDigest);
            Console3.debug(digest);
            const exit = cell2.circuit.targets[cell2.circuit.targets.length - 1];
            const digest2 = exit.digests.shift();
            if (digest2 == null)
                throw new InvalidRelaySendmeCellDigestError();
            if (!Bytes.equals(digest.digest, digest2))
                throw new InvalidRelaySendmeCellDigestError();
            exit.package += 100;
            return;
        }
        console.warn(`Unknown RELAY_SENDME circuit cell version ${cell2.fragment.version}`);
    }
    async #onRelaySendmeStreamCell(cell) {
        const cell2 = RelayCell.Streamful.intoOrThrow(cell, RelaySendmeStreamCell);
        Console3.debug(cell2);
        cell2.stream.package += 50;
    }
    async waitOrThrow(signal = new AbortController().signal) {
        if (this.state.type === "handshaked")
            return;
        await mods_exports7.waitWithCloseAndErrorOrThrow(this.events, "handshaked", (future) => future.resolve(), signal);
    }
    async #createCircuitOrThrow(signal = new AbortController().signal) {
        return await this.circuits.runOrWait((circuits) => {
            while (!signal.aborted) {
                const rawCircuitId = new Cursor(Bytes.random(4)).getUint32OrThrow();
                if (rawCircuitId === 0)
                    continue;
                const circuitId = new Bitset(rawCircuitId, 32).enableBE(0).unsign().value;
                if (circuits.has(circuitId))
                    continue;
                const circuit = new SecretCircuit(circuitId, this);
                circuits.set(circuitId, circuit);
                return circuit;
            }
            throw new Error("Aborted", { cause: signal.reason });
        });
    }
    async #waitCreatedFast(circuit, signal = new AbortController().signal) {
        return await mods_exports7.waitWithCloseAndErrorOrThrow(this.events, "CREATED_FAST", async (future, e) => {
            if (e.circuit !== circuit)
                return;
            future.resolve(e);
        }, signal);
    }
    async createOrThrow(signal = new AbortController().signal) {
        if (this.#state.type !== "handshaked")
            throw new InvalidTorStateError();
        const circuit = await this.#createCircuitOrThrow(signal);
        const material = Bytes.random(20);
        const create_fast = new CreateFastCell(material);
        this.output.enqueue(Cell.Circuitful.from(circuit, create_fast));
        const created_fast = await this.#waitCreatedFast(circuit, signal);
        const k0 = Bytes.concat(material, created_fast.fragment.material);
        const result = await KDFTorResult.computeOrThrow(k0);
        if (!Bytes.equals(result.keyHash, created_fast.fragment.derivative))
            throw new InvalidKdfKeyHashError();
        const forwardDigest = await Sha1Hasher.createOrThrow();
        const backwardDigest = await Sha1Hasher.createOrThrow();
        await forwardDigest.updateOrThrow(result.forwardDigest);
        await backwardDigest.updateOrThrow(result.backwardDigest);
        const forwardKey = new WebCryptoAes128Ctr(result.forwardKey, Bytes.alloc(16));
        const backwardKey = new WebCryptoAes128Ctr(result.backwardKey, Bytes.alloc(16));
        const target = new Target(this.#state.guard.identity, circuit, forwardDigest, backwardDigest, forwardKey, backwardKey);
        circuit.targets.push(target);
        return new Circuit(circuit);
    }
};
async function computeSignedPartHash(preimage) {
    const signedPart = Bytes.encodeUtf8(preimage);
    const hash = await sha3(signedPart, 256);
    return hash;
}
async function computeFullConsensusHash(consensusText) {
    const bytes = Bytes.encodeUtf8(consensusText);
    const hash = await sha3(bytes, 256);
    return hash;
}
function parseDiffOrThrow(diffText) {
    const lines = diffText.split("\n");
    let i = 0;
    assert(lines[i] && lines[i].startsWith("network-status-diff-version "), "Invalid diff: missing version line");
    const version = parseInt(lines[i].split(" ")[1], 10);
    i++;
    assert(lines[i] && lines[i].startsWith("hash "), "Invalid diff: missing hash line");
    const [, fromHash, toHash] = lines[i].split(" ");
    i++;
    const commands = [];
    while (i < lines.length && lines[i].trim()) {
        const line = lines[i];
        const deleteMatch = line.match(/^(\d+)(?:,(\d+|\$))?d$/);
        if (deleteMatch) {
            const start = parseInt(deleteMatch[1], 10);
            const end = deleteMatch[2] === "$" ? void 0 : deleteMatch[2] ? parseInt(deleteMatch[2], 10) : void 0;
            commands.push({ type: "delete", start, end });
            i++;
            continue;
        }
        const replaceMatch = line.match(/^(\d+)(?:,(\d+))?c$/);
        if (replaceMatch) {
            const start = parseInt(replaceMatch[1], 10);
            const end = replaceMatch[2] ? parseInt(replaceMatch[2], 10) : void 0;
            i++;
            const blockLines = [];
            while (i < lines.length && lines[i] !== ".") {
                blockLines.push(lines[i]);
                i++;
            }
            i++;
            commands.push({ type: "replace", start, end, lines: blockLines });
            continue;
        }
        const appendMatch = line.match(/^(\d+)a$/);
        if (appendMatch) {
            const lineNum = parseInt(appendMatch[1], 10);
            i++;
            const blockLines = [];
            while (i < lines.length && lines[i] !== ".") {
                blockLines.push(lines[i]);
                i++;
            }
            i++;
            commands.push({ type: "append", line: lineNum, lines: blockLines });
            continue;
        }
        i++;
    }
    return { version, fromHash, toHash, commands };
}
function applyDiffOrThrow(basePreimage, diff) {
    let fileLines = basePreimage.split("\n");
    for (const command of diff.commands) {
        if (command.type === "delete") {
            const start = command.start - 1;
            const end = command.end ? command.end - 1 : start;
            if (end === void 0 || end < 0) {
                fileLines = fileLines.slice(0, start);
            }
            else {
                fileLines.splice(start, end - start + 1);
            }
        }
        else if (command.type === "replace") {
            const start = command.start - 1;
            const end = command.end ? command.end - 1 : start;
            fileLines.splice(start, end - start + 1, ...command.lines);
        }
        else if (command.type === "append") {
            const lineNum = command.line;
            fileLines.splice(lineNum, 0, ...command.lines);
        }
    }
    return fileLines.join("\n") + "\n";
}
// src/hazae41/echalote/mods/tor/consensus/consensus.ts
var Consensus;
((Consensus3) => {
    let Authority;
    ((Authority2) => {
        Authority2.trusteds = /* @__PURE__ */ new Set([
            "0232AF901C31A04EE9848595AF9BB7620D4C5B2E",
            "14C131DFC5C6F93646BE72FA1401C02A8DF2E8B4",
            "23D15D965BC35114467363C165C4F724B64B4F66",
            "27102BC123E7AF1D4741AE047E160C91ADC76B21",
            "49015F787433103580E3B66A1707A00E60F2D15B",
            "E8A9C45EDE6D711294FADF8E7951F4DE6CA56B58",
            "ED03BB616EB2F60BEC80151114BB25CEF515B226",
            "F533C81CEF0BC0267857C99B2F471ADF249FA232"
        ]);
    })(Authority = Consensus3.Authority || (Consensus3.Authority = {}));
    async function fetchOrThrow(log, circuit, known = [], signal = new AbortController().signal, certificateManager) {
        const stream = await circuit.openDirOrThrow({}, signal);
        const knownHashes = await Promise.all(known.map((c) => computeSignedPartHash(c.preimage)));
        const headers = {};
        if (knownHashes.length > 0) {
            headers["X-Or-Diff-From-Consensus"] = knownHashes.join(", ");
            log.info(`[CONSENSUS DIFF] Requesting diff from ${knownHashes.length} known consensus(es): ${knownHashes.join(", ")}`);
        }
        const requestTime = /* @__PURE__ */ new Date();
        const response = await fetch2(`http://localhost/tor/status-vote/current/consensus-microdesc.z`, { stream: stream.outer, signal, headers });
        if (response.status === 304) {
            log.info("Received 304 Not Modified - the known consensus is still current");
            assert(known.length > 0, "Received 304 but no known consensus was provided");
            const mostRecent = known.reduce((latest, current) => current.validAfter > latest.validAfter ? current : latest);
            assert(requestTime <= mostRecent.validUntil, `Most recent known consensus has expired (validUntil: ${mostRecent.validUntil.toISOString()}, requestTime: ${requestTime.toISOString()})`);
            return mostRecent;
        }
        const contentType = response.headers.get("Content-Type") || "";
        const consensusTxt = await response.text();
        let consensus;
        if (contentType.includes("diff") || consensusTxt.startsWith("network-status-diff-version")) {
            const diff = parseDiffOrThrow(consensusTxt);
            log.info(`[CONSENSUS DIFF] Received diff with ${diff.commands.length} commands`);
            let baseConsensus = void 0;
            for (const c of known) {
                if ((await computeSignedPartHash(c.preimage)).toLowerCase() === diff.fromHash.toLowerCase()) {
                    baseConsensus = c;
                    break;
                }
            }
            assert(baseConsensus, `No matching base consensus found for diff (hash: ${diff.fromHash})`);
            log.info(`[CONSENSUS DIFF] Applying diff from ${diff.fromHash.substring(0, 8)}... to ${diff.toHash.substring(0, 8)}...`);
            const fullConsensusTxt = applyDiffOrThrow(baseConsensus.preimage, diff);
            const resultHash = await computeFullConsensusHash(fullConsensusTxt);
            assert(resultHash.toLowerCase() === diff.toHash.toLowerCase(), `Diff result hash mismatch: expected ${diff.toHash}, got ${resultHash}`);
            log.info(`[CONSENSUS DIFF] \u2713 Successfully applied diff (${fullConsensusTxt.length} bytes)`);
            consensus = await Consensus3.parseOrThrow(log, fullConsensusTxt);
        }
        else {
            consensus = await Consensus3.parseOrThrow(log, consensusTxt);
        }
        assert(await Consensus3.verifyOrThrow(log, circuit, consensus, signal, certificateManager) === true, `Could not verify`);
        assert(requestTime <= consensus.validUntil, `Fetched consensus has already expired (validUntil: ${consensus.validUntil.toISOString()}, requestTime: ${requestTime.toISOString()})`);
        return consensus;
    }
    Consensus3.fetchOrThrow = fetchOrThrow;
    async function parseOrThrow(log, text) {
        const lines = text.split("\n");
        const consensus = {};
        const authorities = [];
        const microdescs = [];
        const signatures = [];
        const invalidMicrodescs = [];
        for (const i = { x: 0 }; i.x < lines.length; i.x++) {
            if (lines[i.x].startsWith("network-status-version ")) {
                const [, version, type] = lines[i.x].split(" ");
                consensus.version = Number(version);
                consensus.type = type;
                continue;
            }
            if (lines[i.x].startsWith("vote-status ")) {
                const [, status] = lines[i.x].split(" ");
                consensus.status = status;
                continue;
            }
            if (lines[i.x].startsWith("consensus-method ")) {
                const [, method] = lines[i.x].split(" ");
                consensus.method = Number(method);
                continue;
            }
            if (lines[i.x].startsWith("valid-after ")) {
                const validAfter = lines[i.x].split(" ").slice(1).join(" ");
                consensus.validAfter = /* @__PURE__ */ new Date(validAfter + " UTC");
                continue;
            }
            if (lines[i.x].startsWith("fresh-until ")) {
                const freshUntil = lines[i.x].split(" ").slice(1).join(" ");
                consensus.freshUntil = /* @__PURE__ */ new Date(freshUntil + " UTC");
                continue;
            }
            if (lines[i.x].startsWith("valid-until ")) {
                const validUntil = lines[i.x].split(" ").slice(1).join(" ");
                consensus.validUntil = /* @__PURE__ */ new Date(validUntil + " UTC");
                continue;
            }
            if (lines[i.x].startsWith("voting-delay ")) {
                const [, first, second] = lines[i.x].split(" ");
                consensus.votingDelay = [Number(first), Number(second)];
                continue;
            }
            if (lines[i.x].startsWith("client-versions ")) {
                const [, versions] = lines[i.x].split(" ");
                consensus.clientVersions = versions.split(",");
                continue;
            }
            if (lines[i.x].startsWith("server-versions ")) {
                const [, versions] = lines[i.x].split(" ");
                consensus.serverVersions = versions.split(",");
                continue;
            }
            if (lines[i.x].startsWith("known-flags ")) {
                const [, ...flags] = lines[i.x].split(" ");
                consensus.knownFlags = flags;
                continue;
            }
            if (lines[i.x].startsWith("recommended-client-protocols ")) {
                const [, ...protocols] = lines[i.x].split(" ");
                consensus.recommendedClientProtocols = Object.fromEntries(protocols.map((entry) => entry.split("=")));
                continue;
            }
            if (lines[i.x].startsWith("recommended-relay-protocols ")) {
                const [, ...protocols] = lines[i.x].split(" ");
                consensus.recommendedRelayProtocols = Object.fromEntries(protocols.map((entry) => entry.split("=")));
                continue;
            }
            if (lines[i.x].startsWith("required-client-protocols ")) {
                const [, ...protocols] = lines[i.x].split(" ");
                consensus.requiredClientProtocols = Object.fromEntries(protocols.map((entry) => entry.split("=")));
                continue;
            }
            if (lines[i.x].startsWith("required-relay-protocols ")) {
                const [, ...protocols] = lines[i.x].split(" ");
                consensus.requiredRelayProtocols = Object.fromEntries(protocols.map((entry) => entry.split("=")));
                continue;
            }
            if (lines[i.x].startsWith("params ")) {
                const [, ...params] = lines[i.x].split(" ");
                consensus.params = Object.fromEntries(params.map((entry) => entry.split("=")));
                continue;
            }
            if (lines[i.x].startsWith("shared-rand-previous-value ")) {
                const [, reveals, random] = lines[i.x].split(" ");
                consensus.sharedRandPreviousValue = {
                    reveals: Number(reveals),
                    random
                };
                continue;
            }
            if (lines[i.x].startsWith("shared-rand-current-value ")) {
                const [, reveals, random] = lines[i.x].split(" ");
                consensus.sharedRandCurrentValue = { reveals: Number(reveals), random };
                continue;
            }
            if (lines[i.x] === "directory-footer") {
                for (i.x++; i.x < lines.length; i.x++) {
                    if (lines[i.x].startsWith("bandwidth-weights ")) {
                        const [, ...weights] = lines[i.x].split(" ");
                        consensus.bandwidthWeights = Object.fromEntries(weights.map((entry) => entry.split("=")));
                        continue;
                    }
                    if (lines[i.x].startsWith("directory-signature ")) {
                        consensus.preimage ??= `${lines.slice(0, i.x).join("\n")}
directory-signature `;
                        const item = {};
                        const [, algorithm, identity, signingKeyDigest] = lines[i.x].split(" ");
                        item.algorithm = algorithm;
                        item.identity = identity;
                        item.signingKeyDigest = signingKeyDigest;
                        i.x++;
                        item.signature = readSignatureOrThrow(lines, i);
                        assert(item.algorithm != null, "Missing algorithm");
                        assert(item.identity != null, "Missing identity");
                        assert(item.signingKeyDigest != null, "Missing signingKeyDigest");
                        assert(item.signature != null, "Missing signature");
                        const signature = item;
                        signatures.push(signature);
                        continue;
                    }
                    continue;
                }
                break;
            }
            if (lines[i.x].startsWith("dir-source ")) {
                const item = {};
                const [_, nickname, identity, hostname, ipaddress, dirport, orport] = lines[i.x].split(" ");
                item.nickname = nickname;
                item.identity = identity;
                item.hostname = hostname;
                item.ipaddress = ipaddress;
                item.dirport = Number(dirport);
                item.orport = Number(orport);
                for (i.x++; i.x < lines.length; i.x++) {
                    if (lines[i.x].startsWith("dir-source ")) {
                        i.x--;
                        break;
                    }
                    if (lines[i.x].startsWith("r ")) {
                        i.x--;
                        break;
                    }
                    if (lines[i.x] === "directory-footer") {
                        i.x--;
                        break;
                    }
                    if (lines[i.x].startsWith("contact ")) {
                        const contact = lines[i.x].split(" ").slice(1).join(" ");
                        item.contact = contact;
                        continue;
                    }
                    if (lines[i.x].startsWith("vote-digest ")) {
                        const [_2, digest] = lines[i.x].split(" ");
                        item.digest = digest;
                        continue;
                    }
                    continue;
                }
                assert(item.nickname != null, "Missing nickname");
                assert(item.identity != null, "Missing identity");
                assert(item.hostname != null, "Missing hostname");
                assert(item.ipaddress != null, "Missing ipaddress");
                assert(item.dirport != null, "Missing dirport");
                assert(item.orport != null, "Missing orport");
                assert(item.contact != null, "Missing contact");
                assert(item.digest != null, "Missing digest");
                const authority = item;
                authorities.push(authority);
                continue;
            }
            if (lines[i.x].startsWith("r ")) {
                const item = {};
                const microdescIndex = microdescs.length + invalidMicrodescs.length;
                const rParts = lines[i.x].split(" ");
                if (rParts.length !== 8) {
                    invalidMicrodescs.push({
                        index: microdescIndex,
                        reason: `malformed r line: expected 8 fields, got ${rParts.length}`,
                        data: lines[i.x].length > 100 ? lines[i.x].substring(0, 100) + "..." : lines[i.x]
                    });
                    continue;
                }
                const [_, nickname, identity, date, hour, hostname, orport, dirport] = rParts;
                item.nickname = nickname;
                item.identity = identity;
                item.date = date;
                item.hour = hour;
                item.hostname = hostname;
                item.orport = Number(orport);
                item.dirport = Number(dirport);
                for (i.x++; i.x < lines.length; i.x++) {
                    if (lines[i.x].startsWith("dir-source ")) {
                        i.x--;
                        break;
                    }
                    if (lines[i.x].startsWith("r ")) {
                        i.x--;
                        break;
                    }
                    if (lines[i.x] === "directory-footer") {
                        i.x--;
                        break;
                    }
                    if (lines[i.x].startsWith("a ")) {
                        const [, ipv6] = lines[i.x].split(" ");
                        item.ipv6 = ipv6;
                        continue;
                    }
                    if (lines[i.x].startsWith("m ")) {
                        const [, digest] = lines[i.x].split(" ");
                        item.microdesc = digest;
                        continue;
                    }
                    if (lines[i.x].startsWith("s ")) {
                        const [, ...flags] = lines[i.x].split(" ");
                        item.flags = flags;
                        continue;
                    }
                    if (lines[i.x].startsWith("v ")) {
                        const version = lines[i.x].slice("v ".length);
                        item.version = version;
                        continue;
                    }
                    if (lines[i.x].startsWith("pr ")) {
                        const [, ...entries] = lines[i.x].split(" ");
                        item.entries = Object.fromEntries(entries.map((entry) => entry.split("=")));
                        continue;
                    }
                    if (lines[i.x].startsWith("w ")) {
                        const [, ...entries] = lines[i.x].split(" ");
                        item.bandwidth = Object.fromEntries(entries.map((entry) => entry.split("=")));
                        continue;
                    }
                    continue;
                }
                if (item.nickname == null || item.identity == null || item.date == null || item.hour == null || item.hostname == null || item.orport == null || item.dirport == null || item.microdesc == null || item.flags == null) {
                    const missingFields = [];
                    if (item.nickname == null)
                        missingFields.push("nickname");
                    if (item.identity == null)
                        missingFields.push("identity");
                    if (item.date == null)
                        missingFields.push("date");
                    if (item.hour == null)
                        missingFields.push("hour");
                    if (item.hostname == null)
                        missingFields.push("hostname");
                    if (item.orport == null)
                        missingFields.push("orport");
                    if (item.dirport == null)
                        missingFields.push("dirport");
                    if (item.microdesc == null)
                        missingFields.push("microdesc");
                    if (item.flags == null)
                        missingFields.push("flags");
                    invalidMicrodescs.push({
                        index: microdescIndex,
                        reason: `missing required fields: ${missingFields.join(", ")}`,
                        data: item.nickname ? `nickname: ${item.nickname}` : "no nickname available"
                    });
                    continue;
                }
                item.version ??= "unknown";
                item.entries ??= {};
                item.bandwidth ??= {};
                microdescs.push(item);
                continue;
            }
            continue;
        }
        consensus.authorities = authorities;
        consensus.microdescs = microdescs;
        consensus.signatures = signatures;
        if (invalidMicrodescs.length > 0) {
            log.error(`Consensus parsing completed: ${microdescs.length} valid microdescs, ${invalidMicrodescs.length} invalid entries`);
            const examples = invalidMicrodescs.slice(0, 2);
            examples.forEach((invalid, idx) => {
                log.error(`Example ${idx + 1}: Entry ${invalid.index} - ${invalid.reason}`);
                if (invalid.data) {
                    log.error(`  Data: ${invalid.data}`);
                }
            });
            if (invalidMicrodescs.length > 2) {
                log.error(`  ... and ${invalidMicrodescs.length - 2} more invalid entries`);
            }
        }
        consensus.fullTextHash = await computeFullConsensusHash(text);
        assert(consensus.preimage, "Missing preimage");
        consensus.signatureText = text.slice(consensus.preimage.length);
        return consensus;
    }
    Consensus3.parseOrThrow = parseOrThrow;
    async function verifyOrThrow(log, circuit, consensus, signal = new AbortController().signal, certificateManager) {
        const limit2 = pLimit(10);
        const signaturesNeedingVerification = consensus.signatures.filter((it) => it.algorithm === "sha256" && Authority.trusteds.has(it.identity));
        const startTime = Date.now();
        let certificates;
        if (certificateManager) {
            const fingerprints = signaturesNeedingVerification.map((sig) => sig.identity);
            certificates = await certificateManager.getCertificates(circuit, fingerprints);
            log.info(`Retrieved ${certificates.length} certs (cached/fetched) in ${Date.now() - startTime}ms`);
        }
        else {
            const certificatePromises = signaturesNeedingVerification.map((sig) => limit2(() => Certificate4.fetchOrThrow(circuit, sig.identity, signal)));
            certificates = await Promise.all(certificatePromises);
            log.info(`Fetched ${certificates.length} certs in ${Date.now() - startTime}ms`);
        }
        let count = 0;
        for (let i = 0; i < signaturesNeedingVerification.length; i++) {
            const it = signaturesNeedingVerification[i];
            const certificate = certificates[i];
            assert(certificate != null, `Missing certificate for ${it.identity}`);
            const signed = Bytes.encodeUtf8(consensus.preimage);
            const hashed = Bytes.from(await crypto.subtle.digest("SHA-256", signed));
            const signingKey = Bytes.fromBase64(certificate.signingKey);
            const algorithmAsn1 = ObjectIdentifier.create(void 0, OIDs.keys.rsaEncryption).toDER();
            const algorithmId = new mods_exports.AlgorithmIdentifier(algorithmAsn1, Null.create().toDER());
            const subjectPublicKey = BitString.create(void 0, 0, signingKey).toDER();
            const subjectPublicKeyInfo = new mods_exports.SubjectPublicKeyInfo(algorithmId, subjectPublicKey);
            const publicKey = mods_exports.writeToBytesOrThrow(subjectPublicKeyInfo);
            const signature = Bytes.fromBase64(it.signature);
            const signatureM = new RsaBigInt.Memory(signature);
            const hashedM = new RsaBigInt.Memory(hashed);
            const publicKeyM = new RsaBigInt.Memory(publicKey);
            const publicKeyX = RsaBigInt.RsaPublicKey.from_public_key_der(publicKeyM);
            const verified = publicKeyX.verify_pkcs1v15_unprefixed(hashedM, signatureM);
            assert(verified === true, `Could not verify`);
            count++;
        }
        assert(count >= 3, `Not enough signatures`);
        return true;
    }
    Consensus3.verifyOrThrow = verifyOrThrow;
    let Certificate4;
    ((Certificate5) => {
        async function fetchAllOrThrow(circuit, signal = new AbortController().signal) {
            const stream = await circuit.openDirOrThrow({}, signal);
            const response = await fetch2(`http://localhost/tor/keys/fp/all.z`, {
                stream: stream.outer,
                signal
            });
            assert(response.ok, `Could not fetch`);
            const certificates = parseOrThrow2(await response.text());
            const verifieds = await Promise.all(certificates.map(verifyOrThrow2));
            assert(!verifieds.some((result) => result !== true), `Could not verify`);
            return certificates;
        }
        Certificate5.fetchAllOrThrow = fetchAllOrThrow;
        async function fetchOrThrow2(circuit, fingerprint, signal = new AbortController().signal) {
            const stream = await circuit.openDirOrThrow(void 0, signal);
            const response = await fetch2(`http://localhost/tor/keys/fp/${fingerprint}.z`, { stream: stream.outer, signal });
            const [certificate] = parseOrThrow2(await response.text());
            assert(response.ok, `Could not fetch`);
            assert(certificate != null, `Missing certificate`);
            assert(await verifyOrThrow2(certificate) === true, `Could not verify`);
            return certificate;
        }
        Certificate5.fetchOrThrow = fetchOrThrow2;
        async function verifyOrThrow2(cert) {
            const identityKey = Bytes.fromBase64(cert.identityKey);
            const identity = Bytes.from(await crypto.subtle.digest("SHA-1", identityKey));
            const fingerprint = Bytes.toHex(identity);
            assert(fingerprint.toLowerCase() === cert.fingerprint.toLowerCase(), `Fingerprint mismatch`);
            const signed = Bytes.encodeUtf8(cert.preimage);
            const hashed = Bytes.from(await crypto.subtle.digest("SHA-1", signed));
            const algorithmAsn1 = ObjectIdentifier.create(void 0, OIDs.keys.rsaEncryption).toDER();
            const algorithmId = new mods_exports.AlgorithmIdentifier(algorithmAsn1, Null.create().toDER());
            const subjectPublicKey = BitString.create(void 0, 0, identityKey).toDER();
            const subjectPublicKeyInfo = new mods_exports.SubjectPublicKeyInfo(algorithmId, subjectPublicKey);
            const publicKey = mods_exports.writeToBytesOrThrow(subjectPublicKeyInfo);
            const signature = Bytes.fromBase64(cert.signature);
            const hashedM = new RsaBigInt.Memory(hashed);
            const publicKeyM = new RsaBigInt.Memory(publicKey);
            const signatureM = new RsaBigInt.Memory(signature);
            const publicKeyX = RsaBigInt.RsaPublicKey.from_public_key_der(publicKeyM);
            const verified = publicKeyX.verify_pkcs1v15_unprefixed(hashedM, signatureM);
            assert(verified === true, `Could not verify`);
            return true;
        }
        Certificate5.verifyOrThrow = verifyOrThrow2;
        function parseOrThrow2(text) {
            const lines = text.split("\n");
            const items = [];
            for (const i = { x: 0 }; i.x < lines.length; i.x++) {
                if (lines[i.x].startsWith("dir-key-certificate-version ")) {
                    const start = i.x;
                    const cert = {};
                    const [, version] = lines[i.x].split(" ");
                    cert.version = Number(version);
                    for (i.x++; i.x < lines.length; i.x++) {
                        if (lines[i.x].startsWith("dir-key-certificate-version ")) {
                            i.x--;
                            break;
                        }
                        if (lines[i.x].startsWith("fingerprint ")) {
                            const [, fingerprint] = lines[i.x].split(" ");
                            cert.fingerprint = fingerprint;
                            continue;
                        }
                        if (lines[i.x].startsWith("dir-key-published ")) {
                            const published = lines[i.x].split(" ").slice(1).join(" ");
                            cert.published = /* @__PURE__ */ new Date(published + " UTC");
                            continue;
                        }
                        if (lines[i.x].startsWith("dir-key-expires ")) {
                            const expires = lines[i.x].split(" ").slice(1).join(" ");
                            cert.expires = /* @__PURE__ */ new Date(expires + " UTC");
                            continue;
                        }
                        if (lines[i.x] === "dir-identity-key") {
                            i.x++;
                            cert.identityKey = readRsaPublicKeyOrThrow(lines, i);
                            continue;
                        }
                        if (lines[i.x] === "dir-signing-key") {
                            i.x++;
                            cert.signingKey = readRsaPublicKeyOrThrow(lines, i);
                            continue;
                        }
                        if (lines[i.x] === "dir-key-crosscert") {
                            i.x++;
                            cert.crossCert = readIdSignatureOrThrow(lines, i);
                            continue;
                        }
                        if (lines[i.x] === "dir-key-certification") {
                            i.x++;
                            cert.preimage = lines.slice(start, i.x).join("\n") + "\n";
                            cert.signature = readSignatureOrThrow(lines, i);
                            continue;
                        }
                        continue;
                    }
                    assert(cert.version != null, "Missing version");
                    assert(cert.fingerprint != null, "Missing fingerprint");
                    assert(cert.published != null, "Missing published");
                    assert(cert.expires != null, "Missing expires");
                    assert(cert.identityKey != null, "Missing identityKey");
                    assert(cert.signingKey != null, "Missing signingKey");
                    assert(cert.crossCert != null, "Missing crossCert");
                    assert(cert.signature != null, "Missing certification");
                    items.push(cert);
                    continue;
                }
                continue;
            }
            return items;
        }
        Certificate5.parseOrThrow = parseOrThrow2;
    })(Certificate4 = Consensus3.Certificate || (Consensus3.Certificate = {}));
    ((Microdesc2) => {
        async function fetchBodyOrThrow(circuit, microdescHash, signal = new AbortController().signal) {
            const stream = await circuit.openDirOrThrow({}, signal);
            const response = await fetch2(`http://localhost/tor/micro/d/${microdescHash}.z`, { stream: stream.outer, signal });
            assert(response.ok, `Could not fetch ${response.status} ${response.statusText}`);
            const buffer = await response.arrayBuffer();
            const digest = Bytes.from(await crypto.subtle.digest("SHA-256", buffer));
            const digest64 = Bytes.toBase64(digest, { omitPadding: true });
            assert(digest64 === microdescHash, `Digest mismatch`);
            const text = Bytes.decodeUtf8(Bytes.from(buffer));
            const [data] = parseOrThrow2(text);
            assert(data != null, `Empty microdescriptor`);
            return data;
        }
        Microdesc2.fetchBodyOrThrow = fetchBodyOrThrow;
        async function fetchOrThrow2(circuit, ref, signal = new AbortController().signal) {
            const data = await fetchBodyOrThrow(circuit, ref.microdesc, signal);
            return { ...ref, ...data };
        }
        Microdesc2.fetchOrThrow = fetchOrThrow2;
        async function fetchManyOrThrow(circuit, refs, signal = new AbortController().signal) {
            if (refs.length === 0)
                return [];
            const BATCH_SIZE = 80;
            const batches = [];
            for (let i = 0; i < refs.length; i += BATCH_SIZE) {
                batches.push(refs.slice(i, i + BATCH_SIZE));
            }
            const hashToBodyMap = /* @__PURE__ */ new Map();
            for (const batch of batches) {
                const hashes = batch.map((ref) => ref.microdesc);
                const stream = await circuit.openDirOrThrow({}, signal);
                const hashesPath = hashes.join("-");
                const response = await fetch2(`http://localhost/tor/micro/d/${hashesPath}.z`, { stream: stream.outer, signal });
                if (!response.ok) {
                    throw new Error(`Could not fetch batch ${response.status} ${response.statusText}: ${await response.text()}`);
                }
                const buffer = await response.arrayBuffer();
                const text = Bytes.decodeUtf8(Bytes.from(buffer));
                const bodiesWithText = parseWithRawTextOrThrow(text);
                assert(bodiesWithText.length === batch.length, `Expected ${batch.length} microdescriptors but got ${bodiesWithText.length}`);
                for (let idx = 0; idx < bodiesWithText.length; idx++) {
                    const { body, rawText } = bodiesWithText[idx];
                    const encoder = new TextEncoder();
                    const rawBytes = encoder.encode(rawText);
                    const digest = Bytes.from(await crypto.subtle.digest("SHA-256", rawBytes));
                    const calculatedHash = Bytes.toBase64(digest, { omitPadding: true });
                    hashToBodyMap.set(calculatedHash, { body, rawText });
                }
            }
            const result = [];
            const missingHashes = [];
            for (const ref of refs) {
                const entry = hashToBodyMap.get(ref.microdesc);
                if (!entry) {
                    missingHashes.push(ref.microdesc);
                    continue;
                }
                result.push({ ...ref, ...entry.body });
            }
            assert(missingHashes.length === 0, `${missingHashes.length} requested microdesc(s) not found in response: ${missingHashes.slice(0, 3).join(", ")}${missingHashes.length > 3 ? "..." : ""}`);
            return result;
        }
        Microdesc2.fetchManyOrThrow = fetchManyOrThrow;
        function parseWithRawTextOrThrow(text) {
            const lines = text.split("\n");
            const items = [];
            for (const i = { x: 0 }; i.x < lines.length; i.x++) {
                if (lines[i.x] === "onion-key") {
                    const startLine = i.x;
                    i.x++;
                    const item = {};
                    item.onionKey = readRsaPublicKeyOrThrow(lines, i);
                    for (i.x++; i.x < lines.length; i.x++) {
                        if (lines[i.x] === "onion-key") {
                            i.x--;
                            break;
                        }
                        if (lines[i.x].startsWith("ntor-onion-key ")) {
                            const [, ntorOnionKey] = lines[i.x].split(" ");
                            item.ntorOnionKey = ntorOnionKey;
                            continue;
                        }
                        if (lines[i.x].startsWith("id ed25519 ")) {
                            const [, , idEd25519] = lines[i.x].split(" ");
                            item.idEd25519 = idEd25519;
                            continue;
                        }
                        continue;
                    }
                    assert(item.onionKey != null, "Missing onion-key");
                    assert(item.ntorOnionKey != null, "Missing ntor-onion-key");
                    assert(item.idEd25519 != null, "Missing id ed25519");
                    const endLine = i.x + 1;
                    const itemLines = lines.slice(startLine, endLine);
                    while (itemLines.slice(-1)[0]?.trim() === "") {
                        itemLines.pop();
                    }
                    const rawText = itemLines.join("\n") + "\n";
                    items.push({ body: item, rawText });
                    continue;
                }
                continue;
            }
            return items;
        }
        Microdesc2.parseWithRawTextOrThrow = parseWithRawTextOrThrow;
        function parseOrThrow2(text) {
            return parseWithRawTextOrThrow(text).map((item) => item.body);
        }
        Microdesc2.parseOrThrow = parseOrThrow2;
    })(Consensus3.Microdesc || (Consensus3.Microdesc = {}));
})(Consensus || (Consensus = {}));
function readRsaPublicKeyOrThrow(lines, i) {
    assert(lines[i.x] === "-----BEGIN RSA PUBLIC KEY-----", "Missing BEGIN RSA PUBLIC KEY");
    let text = "";
    for (i.x++; i.x < lines.length; i.x++) {
        if (lines[i.x] === "-----END RSA PUBLIC KEY-----")
            return text;
        text += lines[i.x];
    }
    assert(false, "Missing END RSA PUBLIC KEY");
}
function readSignatureOrThrow(lines, i) {
    assert(lines[i.x] === "-----BEGIN SIGNATURE-----", "Missing BEGIN SIGNATURE");
    let text = "";
    for (i.x++; i.x < lines.length; i.x++) {
        if (lines[i.x] === "-----END SIGNATURE-----")
            return text;
        text += lines[i.x];
    }
    assert(false, "Missing END SIGNATURE");
}
function readIdSignatureOrThrow(lines, i) {
    assert(lines[i.x] === "-----BEGIN ID SIGNATURE-----", "Missing BEGIN ID SIGNATURE");
    let text = "";
    for (i.x++; i.x < lines.length; i.x++) {
        if (lines[i.x] === "-----END ID SIGNATURE-----")
            return text;
        text += lines[i.x];
    }
    assert(false, "Missing END ID SIGNATURE");
}
// src/TorClient/CertificateManager.ts
var CertificateManager = class {
    storage;
    maxCached;
    log;
    certificateCache = /* @__PURE__ */ new Map();
    cacheLoaded = false;
    cacheLoading;
    isClosed = false;
    constructor(options) {
        this.storage = options.app.get("Storage");
        this.maxCached = options.maxCached;
        this.log = options.app.get("Log").child("CertificateManager");
    }
    /**
     * Gets a certificate for the given fingerprint, using cache when available or fetching when needed.
     * @param circuit The circuit to use for fetching if needed
     * @param fingerprint The certificate fingerprint to retrieve
     * @returns A verified certificate
     */
    async getCertificate(circuit, fingerprint) {
        const cached = await this.loadCachedCertificate(fingerprint);
        if (cached && this.isCertificateValid(cached)) {
            this.log.info(`Using cached certificate for ${fingerprint}`);
            return cached;
        }
        this.log.info(`Fetching certificate for ${fingerprint} from network`);
        const certificate = await mods_exports8.Consensus.Certificate.fetchOrThrow(circuit, fingerprint);
        await this.saveToCache(certificate);
        this.log.info(`Cached certificate for ${fingerprint}`);
        return certificate;
    }
    /**
     * Gets multiple certificates in parallel, using cache when available.
     * @param circuit The circuit to use for fetching
     * @param fingerprints Array of certificate fingerprints to retrieve
     * @returns Array of verified certificates
     */
    async getCertificates(circuit, fingerprints) {
        const certificates = [];
        const cachedResults = await Promise.all(fingerprints.map(async (fingerprint) => {
            const cached = await this.loadCachedCertificate(fingerprint);
            return { fingerprint, certificate: cached };
        }));
        const cachedCertificates = [];
        const uncachedFingerprints = [];
        for (const { fingerprint, certificate } of cachedResults) {
            if (certificate && this.isCertificateValid(certificate)) {
                cachedCertificates.push(certificate);
                this.log.info(`Using cached certificate for ${fingerprint}`);
            }
            else {
                uncachedFingerprints.push(fingerprint);
            }
        }
        if (uncachedFingerprints.length > 0) {
            this.log.info(`Fetching ${uncachedFingerprints.length} certificates from network`);
            const fetchedCertificates = await Promise.all(uncachedFingerprints.map((fingerprint) => mods_exports8.Consensus.Certificate.fetchOrThrow(circuit, fingerprint)));
            await Promise.all(fetchedCertificates.map((cert) => this.saveToCache(cert)));
            certificates.push(...fetchedCertificates);
            this.log.info(`Cached ${fetchedCertificates.length} new certificates`);
        }
        certificates.push(...cachedCertificates);
        const fingerprintToCert = new Map(certificates.map((cert) => [cert.fingerprint, cert]));
        return fingerprints.map((fp) => fingerprintToCert.get(fp)).filter((cert) => cert !== void 0);
    }
    /**
     * Checks if a certificate is still valid (not expired).
     * @param certificate The certificate to check
     * @returns True if the certificate is still valid
     */
    isCertificateValid(certificate) {
        const now = /* @__PURE__ */ new Date();
        return now < certificate.expires;
    }
    /**
     * Loads cached certificates from storage.
     */
    async loadCache() {
        if (this.cacheLoaded) {
            return;
        }
        if (this.cacheLoading) {
            await this.cacheLoading;
            return;
        }
        this.cacheLoading = this.loadCacheInternal();
        await this.cacheLoading;
    }
    async loadCacheInternal() {
        try {
            this.log.info("Loading cached certificates from storage");
            const keys = await this.storage.list("cert:");
            if (keys.length === 0) {
                this.log.info("No cached certificates found");
                this.cacheLoaded = true;
                return;
            }
            let loadedCount = 0;
            let expiredCount = 0;
            for (const key of keys.slice(0, this.maxCached)) {
                try {
                    const data = await this.storage.read(key);
                    const text = new TextDecoder().decode(data);
                    const certificate = await this.parseCertificate(text);
                    if (this.isCertificateValid(certificate)) {
                        this.certificateCache.set(certificate.fingerprint, certificate);
                        loadedCount++;
                        this.log.info(`Loaded cached certificate for ${certificate.fingerprint} (expires: ${certificate.expires.toISOString()})`);
                    }
                    else {
                        expiredCount++;
                        this.log.info(`Skipping expired certificate for ${certificate.fingerprint} (expired: ${certificate.expires.toISOString()})`);
                        await this.storage.remove(key);
                    }
                }
                catch (error) {
                    this.log.error(`Failed to load certificate ${key}: ${error.message}`);
                }
            }
            this.log.info(`Loaded ${loadedCount} cached certificates, removed ${expiredCount} expired ones`);
            if (keys.length > this.maxCached) {
                const keysToRemove = keys.slice(this.maxCached);
                this.log.info(`Removing ${keysToRemove.length} old cached certificates`);
                for (const key of keysToRemove) {
                    try {
                        await this.storage.remove(key);
                    }
                    catch (error) {
                        this.log.error(`Failed to remove old certificate ${key}: ${error.message}`);
                    }
                }
            }
        }
        catch (error) {
            this.log.error(`Failed to load certificate cache: ${error.message}`);
        }
        finally {
            this.cacheLoaded = true;
        }
    }
    /**
     * Loads a specific certificate from cache by fingerprint.
     * @param fingerprint The certificate fingerprint to load
     * @returns The cached certificate or undefined if not found
     */
    async loadCachedCertificate(fingerprint) {
        await this.loadCache();
        return this.certificateCache.get(fingerprint);
    }
    /**
     * Saves a certificate to the cache and storage.
     * @param certificate The certificate to save
     */
    async saveToCache(certificate) {
        try {
            const key = `cert:${certificate.fingerprint}`;
            const textToSave = await this.serializeCertificate(certificate);
            const data = Bytes.encodeUtf8(textToSave);
            await this.storage.write(key, data);
            this.certificateCache.set(certificate.fingerprint, certificate);
            if (this.certificateCache.size > this.maxCached) {
                const entries = Array.from(this.certificateCache.entries());
                const toRemove = entries.slice(0, entries.length - this.maxCached);
                for (const [fingerprint] of toRemove) {
                    this.certificateCache.delete(fingerprint);
                    await this.storage.remove(`cert:${fingerprint}`);
                }
            }
            this.log.info(`Saved certificate to cache: ${key}`);
        }
        catch (error) {
            this.log.error(`Failed to save certificate to cache: ${error.message}`);
        }
    }
    /**
     * Serializes a certificate back to its text format.
     * @param certificate The certificate to serialize
     * @returns The certificate text
     */
    async serializeCertificate(certificate) {
        return JSON.stringify({
            version: certificate.version,
            fingerprint: certificate.fingerprint,
            published: certificate.published.toISOString(),
            expires: certificate.expires.toISOString(),
            identityKey: certificate.identityKey,
            signingKey: certificate.signingKey,
            crossCert: certificate.crossCert,
            preimage: certificate.preimage,
            signature: certificate.signature
        });
    }
    /**
     * Parses a certificate from text format.
     * @param text The certificate text to parse
     * @returns The parsed certificate
     */
    async parseCertificate(text) {
        try {
            const data = JSON.parse(text);
            return {
                ...data,
                published: new Date(data.published),
                expires: new Date(data.expires)
            };
        }
        catch {
            const certificates = mods_exports8.Consensus.Certificate.parseOrThrow(text);
            if (certificates.length === 0) {
                throw new Error("No certificate found in text");
            }
            return certificates[0];
        }
    }
    close() {
        this.isClosed = true;
        this.certificateCache.clear();
    }
};
// src/TorClient/MicrodescManager.ts
var MicrodescManager = class {
    storage;
    maxCached;
    log;
    microdescCache = /* @__PURE__ */ new Map();
    cacheLoaded = false;
    cacheLoading;
    isClosed = false;
    constructor(options) {
        this.storage = options.app.get("Storage");
        this.maxCached = options.maxCached;
        this.log = options.app.get("Log").child("MicrodescManager");
    }
    /**
     * Gets a microdescriptor for the given hash, using cache when available or fetching when needed.
     * @param circuit The circuit to use for fetching if needed
     * @param ref The relay head information containing the microdesc hash
     * @returns A verified microdescriptor
     */
    async getMicrodesc(circuit, ref) {
        const cached = await this.loadCachedMicrodesc(ref.microdesc);
        if (cached) {
            invariant(cached.microdesc === ref.microdesc, `Cached microdesc hash must match requested hash`);
            this.log.info(`Using cached microdesc for ${ref.identity.slice(0, 8)}`);
            return cached;
        }
        this.log.info(`Fetching microdesc for ${ref.identity.slice(0, 8)} from network`);
        const microdesc = await mods_exports8.Consensus.Microdesc.fetchOrThrow(circuit, ref);
        invariant(microdesc.microdesc === ref.microdesc, `Fetched microdesc hash must match requested hash`);
        await this.saveToCache(microdesc);
        this.log.info(`Cached microdesc for ${ref.identity.slice(0, 8)}`);
        return microdesc;
    }
    /**
     * Gets multiple microdescriptors in parallel, using cache when available.
     * @param circuit The circuit to use for fetching
     * @param refs Array of relay head information to retrieve
     * @returns Array of verified microdescriptors
     */
    async getMicrodescs(circuit, refs) {
        if (refs.length === 0)
            return [];
        const microdescs = [];
        const cachedResults = await Promise.all(refs.map(async (ref) => {
            const cached = await this.loadCachedMicrodesc(ref.microdesc);
            return { ref, microdesc: cached };
        }));
        const cachedMicrodescs = [];
        const uncachedRefs = [];
        for (const { ref, microdesc } of cachedResults) {
            if (microdesc) {
                invariant(microdesc.microdesc === ref.microdesc, `Cached microdesc hash must match requested hash`);
                cachedMicrodescs.push(microdesc);
            }
            else {
                uncachedRefs.push(ref);
            }
        }
        if (cachedMicrodescs.length > 0) {
            this.log.info(`Using ${cachedMicrodescs.length} cached microdescs`);
        }
        if (uncachedRefs.length > 0) {
            this.log.info(`Fetching ${uncachedRefs.length} microdescs from network`);
            const fetchedMicrodescs = await mods_exports8.Consensus.Microdesc.fetchManyOrThrow(circuit, uncachedRefs);
            invariant(fetchedMicrodescs.length === uncachedRefs.length, `Fetched microdesc count must match requested count`);
            await Promise.all(fetchedMicrodescs.map((md) => this.saveToCache(md)));
            microdescs.push(...fetchedMicrodescs);
            this.log.info(`Cached ${fetchedMicrodescs.length} new microdescs`);
        }
        microdescs.push(...cachedMicrodescs);
        const hashToMicrodesc = new Map(microdescs.map((md) => [md.microdesc, md]));
        const result = refs.map((ref) => hashToMicrodesc.get(ref.microdesc)).filter((md) => md !== void 0);
        invariant(result.length === refs.length, `All requested microdescs must be returned, got ${result.length}/${refs.length}`);
        return result;
    }
    /**
     * Loads cached microdescs from storage.
     */
    async loadCache() {
        if (this.cacheLoaded) {
            return;
        }
        if (this.cacheLoading) {
            await this.cacheLoading;
            return;
        }
        this.cacheLoading = this.loadCacheInternal();
        await this.cacheLoading;
    }
    async loadCacheInternal() {
        try {
            this.log.info("Loading cached microdescs from storage");
            const keys = await this.storage.list("microdesc:");
            if (keys.length === 0) {
                this.log.info("No cached microdescs found");
                this.cacheLoaded = true;
                return;
            }
            let loadedCount = 0;
            let errorCount = 0;
            for (const key of keys.slice(0, this.maxCached)) {
                try {
                    const data = await this.storage.read(key);
                    const text = new TextDecoder().decode(data);
                    const microdesc = await this.parseMicrodesc(text);
                    this.microdescCache.set(microdesc.microdesc, microdesc);
                    loadedCount++;
                }
                catch (error) {
                    errorCount++;
                    this.log.error(`Failed to load microdesc ${key}: ${error.message}`);
                }
            }
            this.log.info(`Loaded ${loadedCount} cached microdescs${errorCount > 0 ? `, ${errorCount} errors` : ""}`);
            if (keys.length > this.maxCached) {
                const keysToRemove = keys.slice(this.maxCached);
                this.log.info(`Removing ${keysToRemove.length} old cached microdescs`);
                for (const key of keysToRemove) {
                    try {
                        await this.storage.remove(key);
                    }
                    catch (error) {
                        this.log.error(`Failed to remove old microdesc ${key}: ${error.message}`);
                    }
                }
            }
        }
        catch (error) {
            this.log.error(`Failed to load microdesc cache: ${error.message}`);
        }
        finally {
            this.cacheLoaded = true;
        }
    }
    /**
     * Loads a specific microdesc from cache by hash.
     * @param hash The microdesc hash to load
     * @returns The cached microdesc or undefined if not found
     */
    async loadCachedMicrodesc(hash) {
        await this.loadCache();
        return this.microdescCache.get(hash);
    }
    /**
     * Saves a microdesc to the cache and storage.
     * @param microdesc The microdesc to save
     */
    async saveToCache(microdesc) {
        try {
            const key = `microdesc:${microdesc.microdesc}`;
            const textToSave = await this.serializeMicrodesc(microdesc);
            const data = Bytes.encodeUtf8(textToSave);
            await this.storage.write(key, data);
            this.microdescCache.set(microdesc.microdesc, microdesc);
            if (this.microdescCache.size > this.maxCached) {
                const entries = Array.from(this.microdescCache.entries());
                const toRemove = entries.slice(0, entries.length - this.maxCached);
                for (const [hash] of toRemove) {
                    this.microdescCache.delete(hash);
                    await this.storage.remove(`microdesc:${hash}`);
                }
            }
            this.log.info(`Saved microdesc to cache: ${key}`);
        }
        catch (error) {
            this.log.error(`Failed to save microdesc to cache: ${error.message}`);
        }
    }
    /**
     * Serializes a microdesc to JSON format for storage.
     * @param microdesc The microdesc to serialize
     * @returns The microdesc JSON
     */
    async serializeMicrodesc(microdesc) {
        return JSON.stringify({
            nickname: microdesc.nickname,
            identity: microdesc.identity,
            date: microdesc.date,
            hour: microdesc.hour,
            hostname: microdesc.hostname,
            orport: microdesc.orport,
            dirport: microdesc.dirport,
            ipv6: microdesc.ipv6,
            microdesc: microdesc.microdesc,
            flags: microdesc.flags,
            version: microdesc.version,
            entries: microdesc.entries,
            bandwidth: microdesc.bandwidth,
            onionKey: microdesc.onionKey,
            ntorOnionKey: microdesc.ntorOnionKey,
            idEd25519: microdesc.idEd25519
        });
    }
    /**
     * Parses a microdesc from JSON format.
     * @param text The microdesc JSON to parse
     * @returns The parsed microdesc
     */
    async parseMicrodesc(text) {
        const data = JSON.parse(text);
        return data;
    }
    close() {
        this.isClosed = true;
        this.microdescCache.clear();
    }
};
// src/TorClient/ConsensusManager.ts
var ConsensusManager = class {
    clock;
    storage;
    maxCached;
    log;
    circuitManager;
    // Cache maintains chronological order (oldest first, newest last)
    // This order is required for Tor nodes to properly return 304 responses
    consensusCache = [];
    cacheLoaded = false;
    cacheLoading;
    backgroundUpdating = false;
    inFlightFetch;
    certificateManager;
    isClosed = false;
    constructor(options) {
        const app = options.app;
        this.clock = app.get("Clock");
        this.storage = app.get("Storage");
        this.maxCached = options.maxCached;
        this.log = app.get("Log").child("ConsensusManager");
        this.circuitManager = app.get("CircuitManager");
        this.certificateManager = app.get("CertificateManager");
    }
    /**
     * Gets a consensus for the given circuit, using cache when fresh or fetching when needed.
     * @param circuit The circuit to use for fetching if needed
     * @returns A fresh consensus document
     */
    async getConsensus() {
        this.backgroundUpdate();
        const { consensus, status } = await this.loadCachedConsensus();
        if (status === "fresh") {
            this.log.info("Providing fresh cached consensus");
        }
        else if (status === "stale") {
            this.log.info("Providing stale cached consensus, a fresh one will be sought separately");
        }
        else if (status === "invalid") {
            this.log.info("Cached consensus is no longer valid, fetching a new one");
        }
        else if (status === "none") {
            this.log.info("No cached consensus, fetching a new one");
        }
        if (consensus) {
            return consensus;
        }
        return await this.fetchConsensus();
    }
    async fetchConsensus() {
        if (this.inFlightFetch) {
            return await this.inFlightFetch;
        }
        this.inFlightFetch = this.rawFetchConsensus();
        this.inFlightFetch.finally(() => {
            this.inFlightFetch = void 0;
        });
        return await this.inFlightFetch;
    }
    async rawFetchConsensus() {
        const cache = await this.loadCache();
        this.log.info("Fetching consensus from network");
        const circuit = await this.circuitManager.getBaseCircuit();
        const consensus = await mods_exports8.Consensus.fetchOrThrow(this.log.child("Consensus"), circuit, cache, void 0, this.certificateManager);
        this.log.info(`Consensus fetched with ${consensus.microdescs.length} microdescs`);
        await this.saveToCache(consensus);
        return consensus;
    }
    /**
     * Loads cached consensuses from storage.
     */
    async loadCache() {
        if (this.cacheLoaded) {
            return this.consensusCache;
        }
        if (this.cacheLoading) {
            await this.cacheLoading;
            return this.consensusCache;
        }
        const cacheLoadingFuture = Promise.withResolvers();
        this.cacheLoading = cacheLoadingFuture.promise;
        try {
            this.log.info("Loading cached consensuses from storage");
            const keys = await this.storage.list("consensus:");
            if (keys.length === 0) {
                this.log.info("No cached consensuses found");
                this.cacheLoaded = true;
                return this.consensusCache;
            }
            const sortedKeys = keys.sort();
            const consensuses = [];
            for (const key of sortedKeys.slice(0, this.maxCached)) {
                try {
                    const data = await this.storage.read(key);
                    const text = new TextDecoder().decode(data);
                    const consensus = await mods_exports8.Consensus.parseOrThrow(this.log.child("Consensus"), text);
                    consensuses.push(consensus);
                    this.log.info(`Loaded cached consensus from ${consensus.validAfter.toISOString()}`);
                }
                catch (error) {
                    this.log.error(`Failed to load consensus ${key}: ${error.message}`);
                }
            }
            this.consensusCache = consensuses;
            this.log.info(`Loaded ${consensuses.length} cached consensus(es)`);
            if (sortedKeys.length > this.maxCached) {
                const keysToRemove = sortedKeys.slice(this.maxCached);
                this.log.info(`Removing ${keysToRemove.length} old cached consensus(es)`);
                for (const key of keysToRemove) {
                    try {
                        await this.storage.remove(key);
                    }
                    catch (error) {
                        this.log.error(`Failed to remove old consensus ${key}: ${error.message}`);
                    }
                }
            }
        }
        catch (error) {
            this.log.error(`Failed to load consensus cache: ${error.message}`);
        }
        finally {
            this.cacheLoaded = true;
            cacheLoadingFuture.resolve();
        }
        return this.consensusCache;
    }
    async loadCachedConsensus() {
        const cache = await this.loadCache();
        const consensus = cache.slice(-1)[0];
        if (!consensus) {
            return { status: "none", consensus: void 0 };
        }
        const now = /* @__PURE__ */ new Date();
        if (now < consensus.freshUntil) {
            return { status: "fresh", consensus };
        }
        if (now < consensus.validUntil) {
            return { status: "stale", consensus };
        }
        return { status: "invalid", consensus: void 0 };
    }
    /**
     * Saves a consensus to the cache and storage.
     * @param consensus The consensus to save
     */
    async saveToCache(consensus) {
        try {
            const timestamp = consensus.validAfter.toISOString().replace(/[:.]/g, "_");
            const key = `consensus:${timestamp}`;
            const textToSave = await this.serializeConsensus(consensus);
            const data = Bytes.encodeUtf8(textToSave);
            await this.storage.write(key, data);
            this.log.info(`Saved consensus to cache: ${key}`);
            this.consensusCache.push(consensus);
            if (this.consensusCache.length > this.maxCached) {
                this.consensusCache = this.consensusCache.slice(-this.maxCached);
            }
            const keys = await this.storage.list("consensus:");
            if (keys.length > this.maxCached) {
                const sortedKeys = keys.sort();
                const keysToRemove = sortedKeys.slice(0, keys.length - this.maxCached);
                for (const oldKey of keysToRemove) {
                    try {
                        await this.storage.remove(oldKey);
                        this.log.info(`Removed old cached consensus: ${oldKey}`);
                    }
                    catch (error) {
                        this.log.error(`Failed to remove old consensus ${oldKey}: ${error.message}`);
                    }
                }
            }
        }
        catch (error) {
            this.log.error(`Failed to save consensus to cache: ${error.message}`);
        }
    }
    async backgroundUpdate() {
        if (this.backgroundUpdating) {
            return;
        }
        this.backgroundUpdating = true;
        try {
            await this.rawBackgroundUpdate();
        }
        catch (e) {
            this.log.error(`backgroundUpdate failed: ${getErrorDetails(e)}`);
        }
        finally {
            this.backgroundUpdating = false;
        }
    }
    async rawBackgroundUpdate() {
        const info = await this.loadCachedConsensus();
        if (info.status === "fresh") {
            const timeTilStale = info.consensus.freshUntil.getTime() - Date.now();
            await this.clock.delay(timeTilStale + 6e4);
        }
        const endTime = Date.now() + 36e5;
        while (Date.now() < endTime && !this.isClosed) {
            const consensus = await this.fetchConsensus();
            const isFresh = /* @__PURE__ */ new Date() < consensus.freshUntil;
            if (isFresh) {
                break;
            }
            await this.clock.delay(3 * 6e4);
        }
    }
    /**
     * Serializes a consensus back to its full text format.
     * Reconstructs the original consensus document from preimage and signatureText.
     * Verifies the reconstruction matches the original by checking the hash.
     */
    async serializeConsensus(consensus) {
        const text = consensus.preimage + consensus.signatureText;
        if (consensus.fullTextHash) {
            const reconstructedHash = await computeFullConsensusHash(text);
            if (reconstructedHash !== consensus.fullTextHash) {
                throw new Error(`Consensus reconstruction failed: hash mismatch. Expected ${consensus.fullTextHash}, got ${reconstructedHash}`);
            }
        }
        return text;
    }
    close() {
        this.isClosed = true;
        this.certificateManager.close();
    }
};
// src/utils/random.ts
function selectRandomElement(array) {
    assert(array.length !== 0, "Cannot select from empty array");
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}
// src/utils/relayFilters.ts
function isMiddleRelay(relay) {
    return relay.flags.includes("Fast") && relay.flags.includes("Stable") && relay.flags.includes("V2Dir");
}
function isExitRelay(relay) {
    return relay.flags.includes("Fast") && relay.flags.includes("Stable") && relay.flags.includes("Exit") && !relay.flags.includes("BadExit");
}
var EventEmitter = eventsExports.EventEmitter;
// src/hiddenServices/Base32.ts
var Base32 = class {
    static ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";
    static fromString(str) {
        const input = str.toLowerCase().replace(/=+$/, "");
        const bits = input.length * 5;
        const bytes = Math.floor(bits / 8);
        const data = Bytes.alloc(bytes);
        let bitString = "";
        for (const char of input) {
            const index = this.ALPHABET.indexOf(char);
            if (index === -1) {
                throw new Error(`Invalid Base32 character: ${char}`);
            }
            bitString += index.toString(2).padStart(5, "0");
        }
        for (let i = 0; i < bytes; i++) {
            const byte = bitString.substring(i * 8, (i + 1) * 8);
            data[i] = parseInt(byte, 2);
        }
        return data;
    }
    static toString(data) {
        let bitString = "";
        for (const byte of data) {
            bitString += byte.toString(2).padStart(8, "0");
        }
        let result = "";
        for (let i = 0; i < bitString.length; i += 5) {
            const chunk = bitString.substring(i, i + 5).padEnd(5, "0");
            const index = parseInt(chunk, 2);
            result += this.ALPHABET[index];
        }
        return result;
    }
};
// src/hiddenServices/decodeOnionStylePubkey.ts
async function decodeOnionStylePubKey(encodedKey) {
    if (!/^[a-z2-7]{56}$/.test(encodedKey)) {
        throw new Error("Invalid v3 tor pubkey onion-style format (expect 56 base32 chars).");
    }
    const decoded = Base32.fromString(encodedKey);
    if (decoded.length !== 35)
        throw new Error("Decoded length must be 35 bytes.");
    const pubkey = decoded.subarray(0, 32);
    const checksum = decoded.subarray(32, 34);
    const version = decoded[34];
    if (version !== 3)
        throw new Error("Unsupported tor pubkey onion-style version (expected 0x03).");
    const prefix = Bytes.encodeUtf8(".onion checksum");
    const toHash = Bytes.alloc(prefix.length + 32 + 1);
    toHash.set(prefix, 0);
    toHash.set(pubkey, prefix.length);
    toHash[prefix.length + 32] = version;
    const digestHex = await sha3(toHash, 256);
    const digest0 = parseInt(digestHex.substring(0, 2), 16);
    const digest1 = parseInt(digestHex.substring(2, 4), 16);
    if (digest0 !== checksum[0] || digest1 !== checksum[1]) {
        throw new Error("Checksum mismatch.");
    }
    return pubkey;
}
// src/keynet/decodeKeynetPubkey.ts
async function decodeKeynetPubKey(host) {
    assert(host.toLowerCase().endsWith(".keynet"), "not a .keynet address");
    const encodedKey = host.slice(0, -".keynet".length);
    return await decodeOnionStylePubKey(encodedKey);
}
// src/TorClient/CircuitBuilder.ts
var CircuitBuilder = class extends EventEmitter {
    torConnection;
    log;
    microdescManager;
    consensusManager;
    maxAttempts;
    extendTimeout;
    /**
     * Creates a new circuit builder instance.
     *
     * @param options Circuit builder configuration options
     */
    constructor(options) {
        super();
        this.torConnection = options.torConnection;
        this.log = options.log;
        this.microdescManager = options.app.get("MicrodescManager");
        this.consensusManager = options.app.get("ConsensusManager");
        this.maxAttempts = options.maxAttempts ?? 10;
        this.extendTimeout = options.extendTimeout ?? 1e4;
    }
    /**
     * Builds a new circuit through the Tor network.
     * Selects random middle and exit relays, extends circuit through them.
     *
     * @throws Error if circuit building fails after all retry attempts
     */
    async buildCircuit() {
        this.log.info("[CircuitBuilder] Creating circuit");
        const consensus = await this.consensusManager.getConsensus();
        const middles = consensus.microdescs.filter(isMiddleRelay);
        const exits = consensus.microdescs.filter(isExitRelay);
        this.log.info(`[CircuitBuilder] Found ${middles.length} middle and ${exits.length} exit relays`);
        if (middles.length === 0 || exits.length === 0) {
            throw new Error(`Insufficient relays: ${middles.length} middles, ${exits.length} exits`);
        }
        let lastError;
        for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
            try {
                this.log.info(`[CircuitBuilder] Building circuit (attempt ${attempt}/${this.maxAttempts})`);
                const circuit = await this.torConnection.createOrThrow();
                try {
                    await this.extendCircuit(circuit, middles, "middle");
                    await this.extendCircuit(circuit, exits, "exit");
                    this.log.info("[CircuitBuilder] Circuit built successfully");
                    this.emit("circuit-created", circuit);
                    return circuit;
                }
                catch (e) {
                    try {
                        circuit[Symbol.dispose]();
                    }
                    catch {
                    }
                    throw e;
                }
            }
            catch (e) {
                lastError = e;
                const error = e instanceof Error ? e : new Error(String(e));
                this.emit("circuit-failed", error, attempt, this.maxAttempts);
                if (attempt === this.maxAttempts) {
                    this.log.error(`[CircuitBuilder] Failed after ${this.maxAttempts} attempts: ${getErrorDetails(e)}`);
                }
            }
        }
        throw new Error(`Circuit build failed after ${this.maxAttempts} attempts: ${getErrorDetails(lastError)}`);
    }
    async extendCircuitToKeynet(consensus, circuit, hostname) {
        const pubkey = await decodeKeynetPubKey(hostname);
        const candidates = consensus.microdescs.filter(
        // keynet servers choose an rsa key such that the first byte of their rsa
        // fingerprint (m.identity) matches the first byte of their ed25519 key
        // (pubkey).
        (m) => Bytes.fromBase64(m.identity)[0] === pubkey[0]);
        const fullCandidates = await this.microdescManager.getMicrodescs(circuit, candidates);
        let keynetNode;
        for (const candidate of fullCandidates) {
            if (Bytes.equals(Bytes.fromBase64(candidate.idEd25519), pubkey)) {
                keynetNode = candidate;
                break;
            }
        }
        assert(keynetNode !== void 0, `Must find keynet exit node matching hostname ${hostname}`);
        await circuit.extendOrThrow(keynetNode, AbortSignal.timeout(this.extendTimeout));
    }
    /**
     * Extends a circuit through a randomly selected relay.
     *
     * @throws Error if extension fails
     */
    async extendCircuit(circuit, candidates, relayType) {
        assert(candidates.length > 0, `Cannot extend circuit through ${relayType}: no candidates available`);
        const candidate = selectRandomElement(candidates);
        this.emit("relay-selected", relayType);
        this.log.info(`[CircuitBuilder] Extending through ${relayType} relay`);
        try {
            const microdesc = await this.microdescManager.getMicrodesc(circuit, candidate);
            await circuit.extendOrThrow(microdesc, AbortSignal.timeout(this.extendTimeout));
            this.log.info(`[CircuitBuilder] Extended through ${relayType}`);
            this.emit("relay-extended", relayType);
        }
        catch (e) {
            this.log.error(`[CircuitBuilder] Extension through ${relayType} failed: ${getErrorDetails(e)}`);
            throw e;
        }
    }
};
var ResourcePool = class extends EventEmitter {
    pool = [];
    inFlight = [];
    disposed = false;
    maintenanceAbortController = null;
    targetSizeReachedEmitted = false;
    // Backoff state
    failCount = 0;
    lastFailTime = 0;
    // Options
    factory;
    clock;
    log;
    targetSize;
    minInFlightCount;
    concurrencyLimit;
    backoffMinMs;
    backoffMaxMs;
    backoffMultiplier;
    constructor(options) {
        super();
        this.factory = options.factory;
        this.clock = options.clock;
        this.log = options.log;
        this.targetSize = options.targetSize ?? 0;
        this.minInFlightCount = options.minInFlightCount ?? 1;
        this.concurrencyLimit = options.concurrencyLimit ? pLimit(options.concurrencyLimit) : null;
        this.backoffMinMs = options.backoffMinMs ?? 5e3;
        this.backoffMaxMs = options.backoffMaxMs ?? 6e4;
        this.backoffMultiplier = options.backoffMultiplier ?? 1.1;
        this.lastFailTime = this.clock.now();
        if (this.minInFlightCount <= 0) {
            throw new Error(`ResourcePool: minInFlightCount must be > 0, got ${this.minInFlightCount}`);
        }
        if (this.targetSize === 0 && this.minInFlightCount === 0) {
            throw new Error("ResourcePool: Both targetSize and minInFlightCount cannot be 0 (no resources would ever be created)");
        }
        this.maintenanceAbortController = new AbortController();
        this.maintenanceLoop();
    }
    /**
     * Acquires a resource from the pool. If buffer is empty, waits for one to be created.
     * Returns immediately if a buffered resource is available.
     *
     * When buffer is empty, races minInFlightCount creations in parallel:
     * - Returns whoever finishes first (fastest acquisition)
     * - Other successful creations fill the buffer for future acquires
     * - Errors are silently dropped
     * - Pool can overfill, especially when targetSize=0
     */
    async pop() {
        if (this.disposed) {
            throw new Error("ResourcePool is disposed");
        }
        await this.clock.delay(0);
        while (this.pool.length === 0) {
            this.ensureInFlight();
            await this.nextUpdate();
            await this.clock.delay(0);
        }
        const r = this.pool.shift();
        invariant(r !== void 0, "Pool must have at least one resource after waiting");
        this.emit("resource-acquired", r);
        this.emitUpdate();
        return r;
    }
    /**
     * Alias for pop() to maintain backward compatibility with original API
     */
    async acquire() {
        return this.pop();
    }
    /**
     * Waits for the pool to reach target size.
     * Resolves immediately if already at target size.
     */
    async waitForFull() {
        if (this.disposed) {
            throw new Error("ResourcePool is disposed");
        }
        if (this.pool.length >= this.targetSize) {
            this.log?.info?.(`\u23ED\uFE0F  waitForFull: Already at target size (pool=${this.pool.length}, target=${this.targetSize})`);
            this.emit("target-size-reached");
            return;
        }
        this.log?.info?.(`\u23F3 waitForFull: Starting wait for target size (pool=${this.pool.length}, target=${this.targetSize})`);
        return new Promise((resolve, reject) => {
            const checkFull = () => {
                this.log?.info?.(`\u{1F50D} waitForFull: checkFull called (pool=${this.pool.length}, target=${this.targetSize})`);
                if (this.disposed) {
                    this.log?.error?.("\u274C waitForFull: Pool disposed while waiting");
                    reject(new Error("ResourcePool disposed while waiting for full"));
                    this.off("resource-created", checkFull);
                    return;
                }
                if (this.pool.length >= this.targetSize) {
                    this.log?.info?.(`\u2705 waitForFull: Target size reached (pool=${this.pool.length})`);
                    resolve();
                    this.off("resource-created", checkFull);
                }
            };
            this.on("resource-created", checkFull);
            checkFull();
        });
    }
    /**
     * Disposes the pool and all buffered resources.
     */
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        if (this.maintenanceAbortController) {
            this.maintenanceAbortController.abort();
        }
        for (const resource of this.pool) {
            this.disposeResource(resource);
        }
        this.pool = [];
    }
    /**
     * Returns the number of buffered resources.
     */
    size() {
        return this.pool.length;
    }
    /**
     * Returns true if the pool has reached target size.
     */
    atTargetSize() {
        return this.pool.length >= this.targetSize;
    }
    /**
     * Returns the number of in-flight creation attempts.
     */
    inFlightCount() {
        return this.inFlight.length;
    }
    async nextUpdate() {
        return new Promise((resolve) => {
            this.once("update", resolve);
        });
    }
    // ==================== Private Implementation ====================
    ensureInFlight() {
        if (this.pool.length > 0) {
            return;
        }
        while (this.inFlight.length < this.minInFlightCount) {
            this.pushInFlight();
        }
    }
    pushInFlight() {
        const createFn = async () => {
            if (this.failCount > 0) {
                const timeElapsed = this.clock.now() - this.lastFailTime;
                let totalDelay = this.backoffMinMs * this.backoffMultiplier ** this.failCount;
                if (totalDelay > this.backoffMaxMs) {
                    totalDelay = this.backoffMaxMs;
                }
                const netDelay = totalDelay - timeElapsed;
                if (netDelay > 0) {
                    await this.clock.delay(netDelay);
                }
            }
            return this.factory();
        };
        const p = this.concurrencyLimit ? this.concurrencyLimit(createFn) : createFn();
        this.inFlight.push(p);
        p.then((r) => {
            this.inFlight = this.inFlight.filter((inFlightP) => inFlightP !== p);
            this.pool.push(r);
            this.failCount = 0;
            this.emit("resource-created", r);
            this.checkTargetSizeReached();
            this.emitUpdate();
        }, (e) => {
            this.failCount++;
            this.lastFailTime = this.clock.now();
            this.inFlight = this.inFlight.filter((inFlightP) => inFlightP !== p);
            const err = e instanceof Error ? e : new Error(String(e));
            this.emit("creation-failed", err, this.inFlight.length);
            this.log?.error?.(`Creation failed: ${err.message}`);
            this.emitUpdate();
        });
    }
    checkTargetSizeReached() {
        if (this.targetSize > 0 && this.pool.length >= this.targetSize && !this.targetSizeReachedEmitted) {
            this.targetSizeReachedEmitted = true;
            this.emit("target-size-reached");
        }
    }
    emitUpdate() {
        this.emit("update");
    }
    maintenanceLoop() {
        const signal = this.maintenanceAbortController.signal;
        (async () => {
            while (!this.disposed && !signal.aborted) {
                try {
                    if (this.targetSize > 0 && this.pool.length + this.inFlight.length < this.targetSize && this.targetSizeReachedEmitted) {
                        this.targetSizeReachedEmitted = false;
                    }
                    while (!this.disposed && !signal.aborted && this.pool.length + this.inFlight.length < this.targetSize) {
                        this.pushInFlight();
                    }
                    try {
                        await this.nextUpdate();
                    }
                    catch {
                        return;
                    }
                }
                catch (error) {
                    this.log?.error?.(`\u274C maintenanceLoop: Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
                    if (!this.disposed && !signal.aborted) {
                        try {
                            await this.clock.delay(1e3);
                        }
                        catch {
                            return;
                        }
                    }
                }
            }
        })();
    }
    /**
     * Disposes a single resource by calling Symbol.dispose if available.
     */
    disposeResource(resource) {
        const disposable = resource;
        if (disposable && typeof disposable[Symbol.dispose] === "function") {
            try {
                disposable[Symbol.dispose]();
                this.emit("resource-disposed", resource);
            }
            catch {
            }
        }
    }
};
// src/TorClient/WebSocketDuplex.ts
var WebSocketDuplex = class _WebSocketDuplex {
    constructor(socket, params = {}) {
        this.socket = socket;
        this.params = params;
        const { shouldCloseOnError, shouldCloseOnClose } = params;
        this.duplex = new HalfDuplex({
            output: {
                write(message) {
                    socket.send(Writable.writeToBytesOrThrow(message));
                }
            },
            close() {
                if (!shouldCloseOnClose)
                    return;
                try {
                    socket.close();
                }
                catch {
                }
            },
            error() {
                if (!shouldCloseOnError)
                    return;
                try {
                    socket.close();
                }
                catch {
                }
            }
        });
        socket.addEventListener("close", () => this.duplex.close());
        socket.addEventListener("error", (e) => this.duplex.error(e));
        socket.addEventListener("message", async (e) => {
            if (typeof e.data === "string")
                return;
            const bytes = Bytes.from(e.data);
            const unknown = new Unknown(bytes);
            this.duplex.input.enqueue(unknown);
        });
    }
    duplex;
    static async connect(url, signal = new AbortController().signal) {
        const socket = new WebSocket(url);
        socket.binaryType = "arraybuffer";
        await waitForWebSocket(socket, signal);
        return new _WebSocketDuplex(socket);
    }
    [Symbol.dispose]() {
        this.close();
    }
    get outer() {
        return this.duplex.outer;
    }
    get closing() {
        return this.duplex.closing;
    }
    get closed() {
        return this.duplex.closed;
    }
    error(reason) {
        this.duplex.error(reason);
    }
    close() {
        this.duplex.close();
    }
};
async function waitForWebSocket(socket, signal = new AbortController().signal) {
    return new Promise((resolve, reject) => {
        const onOpen = () => {
            cleanup();
            resolve();
        };
        const onError = (e) => {
            cleanup();
            reject(e);
        };
        const onClose = (e) => {
            cleanup();
            reject(e);
        };
        const onAbort = () => {
            cleanup();
            reject(new Error("Aborted"));
        };
        const cleanup = () => {
            socket.removeEventListener("open", onOpen);
            socket.removeEventListener("close", onClose);
            socket.removeEventListener("error", onError);
            signal.removeEventListener("abort", onAbort);
        };
        socket.addEventListener("open", onOpen, { passive: true });
        socket.addEventListener("close", onClose, { passive: true });
        socket.addEventListener("error", onError, { passive: true });
        signal.addEventListener("abort", onAbort, { passive: true });
    });
}
// src/TorClient/CircuitManager.ts
var CircuitManager = class {
    snowflakeUrl;
    connectionTimeout;
    circuitTimeout;
    clock;
    maxCircuitLifetime;
    circuitBufferSize;
    log;
    app;
    circuitPool;
    // Shared Tor connection
    torConnection;
    torConnectionPromise;
    // Host ownership tracking
    circuitOwnershipMap = /* @__PURE__ */ new Map();
    hostCircuitMap = /* @__PURE__ */ new Map();
    circuitAllocationTasks = /* @__PURE__ */ new Map();
    // Per-circuit state
    circuitStates = /* @__PURE__ */ new Map();
    baseCircuitPromise;
    constructor(options) {
        this.snowflakeUrl = options.snowflakeUrl;
        this.connectionTimeout = options.connectionTimeout;
        this.circuitTimeout = options.circuitTimeout;
        this.clock = options.app.get("Clock");
        this.maxCircuitLifetime = options.maxCircuitLifetime ?? 10 * 6e4;
        this.circuitBufferSize = options.circuitBuffer ?? 0;
        this.log = options.app.get("Log").child("CircuitManager");
        this.app = options.app;
        this.circuitPool = new ResourcePool({
            factory: async () => await this.buildCircuit(),
            clock: this.clock,
            targetSize: this.circuitBufferSize,
            minInFlightCount: 2,
            log: this.log.child("pool")
            // FIXME: noisy maintenance logs
        });
    }
    /**
     * Increments the reference count for a circuit.
     * Called when CircuitManager acquires the circuit or when a request starts using it.
     */
    incrementRefCount(circuit) {
        const state = this.circuitStates.get(circuit);
        invariant(state, `Circuit ${circuit.id} must have state when incrementing refCount`);
        state.refCount++;
        invariant(state.refCount > 0, `refCount must be positive after increment, got ${state.refCount}`);
    }
    /**
     * Decrements the reference count for a circuit.
     * When refCount reaches 0, the circuit is disposed.
     * Called when CircuitManager clears the circuit or when a request completes.
     */
    decrementRefCount(circuit) {
        const state = this.circuitStates.get(circuit);
        invariant(state, `Circuit ${circuit.id} must have state when decrementing refCount`);
        invariant(state.refCount > 0, `Cannot decrement refCount below 0 for circuit ${circuit.id}, current: ${state.refCount}`);
        state.refCount--;
        if (state.refCount === 0) {
            const hostname = this.circuitOwnershipMap.get(circuit) || "unknown";
            this.log.info(`[${hostname}] Circuit refCount reached 0, disposing circuit ${circuit.id}`);
            if (state.lifetimeTimer) {
                this.clock.clearTimeout(state.lifetimeTimer);
            }
            if (state.safetyCheckTimer) {
                this.clock.clearTimeout(state.safetyCheckTimer);
            }
            circuit[Symbol.dispose]();
            this.circuitStates.delete(circuit);
            this.circuitOwnershipMap.delete(circuit);
        }
    }
    /**
     * Gets or creates a circuit for the specified hostname.
     */
    async getOrCreateCircuit(hostname) {
        const existingCircuit = this.hostCircuitMap.get(hostname);
        if (existingCircuit) {
            const state = this.circuitStates.get(existingCircuit);
            invariant(state, `Circuit ${existingCircuit.id} in hostCircuitMap must have state`);
            invariant(this.circuitOwnershipMap.get(existingCircuit) === hostname, `Bidirectional mapping broken: hostCircuitMap[${hostname}] exists but circuitOwnershipMap mismatch`);
            state.lastUsed = Date.now();
            return existingCircuit;
        }
        if (this.circuitAllocationTasks.has(hostname)) {
            return await this.circuitAllocationTasks.get(hostname);
        }
        const allocationPromise = this.allocateCircuitToHost(hostname);
        this.circuitAllocationTasks.set(hostname, allocationPromise);
        try {
            return await allocationPromise;
        }
        finally {
            this.circuitAllocationTasks.delete(hostname);
        }
    }
    /**
     * Gets or creates a circuit and safely manages its reference count during async operation.
     * The circuit is automatically incremented before calling the callback and decremented after,
     * ensuring safe usage even if the callback throws an error.
     *
     * @param hostname The hostname to allocate a circuit for
     * @param callback Async function that uses the circuit
     * @returns Promise resolving to the callback's return value
     */
    async useCircuit(hostname, callback) {
        const circuit = await this.getOrCreateCircuit(hostname);
        this.incrementRefCount(circuit);
        try {
            return await callback(circuit);
        }
        finally {
            this.decrementRefCount(circuit);
        }
    }
    async getBaseCircuit() {
        if (!this.baseCircuitPromise) {
            this.baseCircuitPromise = (async () => {
                const torConnection = await this.getTorConnection();
                return await torConnection.createOrThrow();
            })();
        }
        return await this.baseCircuitPromise;
    }
    /**
     * Waits for at least one circuit to be ready (buffered or in-flight creation).
     * Useful for determining when CircuitManager is initialized and ready for use.
     *
     * @throws Error if circuitBuffer is disabled and no circuits are being created
     * @returns Promise that resolves when a circuit is ready
     */
    async waitForCircuitReady() {
        if (this.circuitBufferSize <= 0) {
            this.log.error(`\u274C waitForCircuitReady: CircuitBuffer is disabled (circuitBuffer=${this.circuitBufferSize})`);
            throw new Error("CircuitManager not configured to create circuits (circuitBuffer=0)");
        }
        this.log.info(`\u23F3 waitForCircuitReady: Waiting for circuits (target=${this.circuitBufferSize})`);
        while (this.circuitPool.size() === 0) {
            await this.circuitPool.nextUpdate();
        }
        this.log.info(`\u2705 waitForCircuitReady: Circuit ready!`);
    }
    /**
     * Allocates a buffered circuit to a host, or creates one if buffer is empty.
     */
    async allocateCircuitToHost(hostname) {
        let circuit;
        if (!hostname.toLowerCase().endsWith(".keynet")) {
            this.log.info(`[${hostname}] Allocating circuit from pool`);
            circuit = await this.circuitPool.acquire();
            this.log.info(`[${hostname}] Allocated circuit from pool`);
        }
        else {
            circuit = await this.acquireKeynetCircuit(hostname);
        }
        const now = Date.now();
        this.circuitStates.set(circuit, {
            allocatedAt: now,
            host: hostname,
            lastUsed: now,
            hasCircuit: true,
            isCreating: false,
            expiry: now + this.maxCircuitLifetime,
            refCount: 1,
            // CircuitManager owns the initial reference
            createdAt: now
        });
        this.circuitOwnershipMap.set(circuit, hostname);
        this.hostCircuitMap.set(hostname, circuit);
        this.scheduleCircuitDisposal(circuit, hostname);
        return circuit;
    }
    async acquireKeynetCircuit(hostname) {
        const builder = new CircuitBuilder({
            torConnection: await this.getTorConnection(),
            log: this.log.child("CircuitBuilder"),
            app: this.app
        });
        const consensus = await this.app.get("ConsensusManager").getConsensus();
        let lastError;
        for (let i = 1; i <= 3; i++) {
            try {
                this.log.info(`[${hostname}] Allocating circuit from pool`);
                const circuit = await this.circuitPool.acquire();
                this.log.info(`[${hostname}] Allocated circuit from pool, extending to keynet host`);
                await builder.extendCircuitToKeynet(consensus, circuit, hostname);
                this.log.info(`[${hostname}] Extended to keynet host`);
                return circuit;
            }
            catch (e) {
                lastError = e;
            }
        }
        throw lastError;
    }
    /**
     * Clears the circuit for a specific host (or all if hostname is undefined).
     * This removes CircuitManager's reference to the circuit. If no active requests
     * are using it, the circuit will be disposed immediately. Otherwise, it will be
     * disposed when the last active request completes.
     */
    clearCircuit(hostname) {
        if (hostname === void 0) {
            const hosts = Array.from(this.hostCircuitMap.keys());
            hosts.forEach((h) => this.clearCircuit(h));
            return;
        }
        const circuit = this.hostCircuitMap.get(hostname);
        if (circuit) {
            invariant(this.circuitOwnershipMap.get(circuit) === hostname, `Bidirectional mapping must be consistent when clearing, hostname: ${hostname}, circuit: ${circuit.id}`);
            this.hostCircuitMap.delete(hostname);
            const state = this.circuitStates.get(circuit);
            if (state?.lifetimeTimer) {
                this.clock.clearTimeout(state.lifetimeTimer);
                state.lifetimeTimer = void 0;
            }
            this.decrementRefCount(circuit);
            this.log.info(`[${hostname}] Circuit cleared`);
        }
    }
    /**
     * Gets the current circuit state for a specific host or all hosts.
     */
    getCircuitState(hostname) {
        if (hostname === void 0) {
            const result = {};
            for (const host of this.hostCircuitMap.keys()) {
                result[host] = this.getCircuitStateForHost(host);
            }
            result["[pool]"] = {
                allocatedAt: 0,
                host: "[pool]",
                lastUsed: 0,
                hasCircuit: this.circuitPool.size() > 0,
                isCreating: this.circuitPool.inFlightCount() > 0,
                expiry: 0,
                refCount: 0,
                createdAt: 0
            };
            return result;
        }
        return this.getCircuitStateForHost(hostname);
    }
    /**
     * Gets state for a specific host's circuit.
     */
    getCircuitStateForHost(hostname) {
        const circuit = this.hostCircuitMap.get(hostname);
        const state = circuit ? this.circuitStates.get(circuit) : void 0;
        if (circuit) {
            invariant(this.circuitOwnershipMap.get(circuit) === hostname, `Bidirectional mapping broken when getting state for ${hostname}`);
        }
        if (!state) {
            return {
                allocatedAt: 0,
                host: hostname,
                lastUsed: 0,
                hasCircuit: false,
                isCreating: this.circuitAllocationTasks.has(hostname),
                expiry: 0,
                refCount: 0,
                createdAt: 0
            };
        }
        return state;
    }
    /**
     * Gets a human-readable status string for a circuit.
     */
    getCircuitStateString(hostname) {
        if (hostname === void 0) {
            const result = {};
            for (const host of this.hostCircuitMap.keys()) {
                result[host] = this.getCircuitStateStringForHost(host);
            }
            result["[pool]"] = `${this.circuitPool.size()}/${this.circuitBufferSize} buffered (${this.circuitPool.inFlightCount()} in-flight)`;
            return result;
        }
        return this.getCircuitStateStringForHost(hostname);
    }
    /**
     * Gets a human-readable status string for a specific host's circuit.
     */
    getCircuitStateStringForHost(hostname) {
        const state = this.getCircuitStateForHost(hostname);
        if (!state.hasCircuit && state.isCreating) {
            return "Creating...";
        }
        if (!state.hasCircuit) {
            return "None";
        }
        const msToExpiry = Math.max(0, state.expiry - Date.now());
        const expirySeconds = Math.ceil(msToExpiry / 1e3);
        return `Ready (${expirySeconds}s to expiry)`;
    }
    /**
     * Closes the circuit manager, cleaning up all resources.
     */
    close() {
        this.circuitPool.dispose();
        for (const [hostname, circuit] of this.hostCircuitMap.entries()) {
            const state = this.circuitStates.get(circuit);
            if (state?.lifetimeTimer) {
                this.clock.clearTimeout(state.lifetimeTimer);
            }
            circuit[Symbol.dispose]();
            this.log.info(`[${hostname}] Circuit disposed`);
        }
        this.hostCircuitMap.clear();
        this.circuitOwnershipMap.clear();
        this.circuitStates.clear();
        this.circuitAllocationTasks.clear();
        if (this.torConnection) {
            this.torConnection.close();
            this.log.info(`[Tor] Connection closed`);
        }
        this.torConnection = void 0;
        this.torConnectionPromise = void 0;
    }
    /**
     * Symbol.dispose implementation for automatic resource cleanup.
     */
    [Symbol.dispose]() {
        this.close();
    }
    /**
     * Creates a new unallocated circuit.
     */
    async buildCircuit() {
        this.log.info(`\u{1F680} Building new circuit`);
        try {
            const torConnection = await this.getTorConnection();
            const circuitBuilder = new CircuitBuilder({
                torConnection,
                log: this.log.child("CircuitBuilder"),
                app: this.app
            });
            const circuit = circuitBuilder.buildCircuit();
            this.log.info(`\u2705 Circuit created successfully`);
            return circuit;
        }
        catch (error) {
            this.log.error(`\u274C Circuit creation failed: ${getErrorDetails(error)}`);
            throw error;
        }
    }
    async getTorConnection() {
        if (this.torConnection) {
            return this.torConnection;
        }
        if (this.torConnectionPromise) {
            return await this.torConnectionPromise;
        }
        this.log.info(`Creating shared Tor connection`);
        try {
            this.torConnectionPromise = this.createTorConnection();
            this.torConnection = await this.torConnectionPromise;
            this.torConnection.events.on("error", () => {
                this.log.info(`[Tor] Connection error detected, will create new connection on next use`);
                this.torConnection = void 0;
                this.torConnectionPromise = void 0;
            });
            this.torConnection.events.on("close", () => {
                this.log.info(`[Tor] Connection closed, will create new connection on next use`);
                this.torConnection = void 0;
                this.torConnectionPromise = void 0;
            });
            return this.torConnection;
        }
        catch (error) {
            this.log.error(`Tor connection creation failed: ${getErrorDetails(error)}`);
            throw error;
        }
    }
    /**
     * Schedules disposal of a circuit at the end of its lifetime.
     * Also sets a 2x lifetime safety check to detect if circuit wasn't disposed.
     */
    scheduleCircuitDisposal(circuit, hostname) {
        const state = this.circuitStates.get(circuit);
        if (!state) {
            return;
        }
        this.log.info(`[${hostname}] Scheduled circuit disposal in ${this.maxCircuitLifetime}ms`);
        state.lifetimeTimer = this.clock.setTimeout(() => {
            this.log.info(`[${hostname}] Circuit reached max lifetime, disposing`);
            this.clearCircuit(hostname);
        }, this.maxCircuitLifetime);
        const safetyCheckDelay = this.maxCircuitLifetime * 2;
        state.safetyCheckTimer = this.clock.setTimeout(() => {
            if (!circuit.closed) {
                this.log.error(`[${hostname}] Circuit ${circuit.id} was not disposed after 2x lifetime (${safetyCheckDelay}ms)`);
            }
        }, safetyCheckDelay);
    }
    async createTorConnection() {
        this.log.info(`Connecting to Snowflake bridge at ${this.snowflakeUrl}`);
        const stream = await WebSocketDuplex.connect(this.snowflakeUrl, AbortSignal.timeout(this.connectionTimeout));
        this.log.info("Creating Snowflake stream");
        const tcp = createSnowflakeStream(stream);
        const tor2 = new TorClientDuplex(this.app);
        this.log.info("Connecting streams");
        tcp.outer.readable.pipeTo(tor2.inner.writable).catch((error) => {
            this.log.error(`TCP -> Tor stream error: ${getErrorDetails(error)}`);
        });
        tor2.inner.readable.pipeTo(tcp.outer.writable).catch((error) => {
            this.log.error(`Tor -> TCP stream error: ${getErrorDetails(error)}`);
        });
        tor2.events.on("error", (error) => {
            this.log.error(`Tor client error: ${getErrorDetails(error)}`);
        });
        tor2.events.on("close", (reason) => {
            const reasonMessage = reason instanceof Error ? reason.message : String(reason || "Connection closed normally");
            const logLevel = reason && reason !== void 0 ? "error" : "info";
            if (logLevel === "error") {
                this.log.error(`Tor client closed: ${reasonMessage}`);
            }
            else {
                this.log.info(`Tor client closed: ${reasonMessage}`);
            }
        });
        this.log.info(`Waiting for Tor to be ready (timeout: ${this.circuitTimeout}ms)`);
        await tor2.waitOrThrow(AbortSignal.timeout(this.circuitTimeout));
        this.log.info("Tor client ready!");
        return tor2;
    }
};
// src/hazae41/cadenas/mods/ccadb/certHashes.ts
var certHashes = [
    // AffirmTrust Premium ECC (issued by AffirmTrust Premium ECC)
    // Expires: 2040-12-31T14:20:24.000Z
    "3219b09114ff495a3eb6eb00c2efeab34002ae5f0a56c7679ea087a3fa037e4f",
    // GlobalSign (issued by GlobalSign)
    // Expires: 2038-01-19T03:14:07.000Z
    "08b3a6335fce5ef48f8f0e543986c07fd18a3b1226129f61864bbd5bdd1f1cc9",
    // Amazon Root CA 4 (issued by Amazon Root CA 4)
    // Expires: 2040-05-26T00:00:00.000Z
    "f7ecded5c66047d28ed6466b543c40e0743abe81d109254dcf845d4c2c7853c5",
    // Certainly Root E1 (issued by Certainly Root E1)
    // Expires: 2046-04-01T00:00:00.000Z
    "1ef64625daa2e5d433d7449ae31a200d1025e0012a8fecfa70932f8b599b75dd",
    // Amazon Root CA 3 (issued by Amazon Root CA 3)
    // Expires: 2040-05-26T00:00:00.000Z
    "36abc32656acfc645c61b71613c4bf21c787f5cabbee48348d58597803d7abc9",
    // Entrust Root Certification Authority - EC1 (issued by Entrust Root Certification Authority - EC1)
    // Expires: 2037-12-18T15:55:36.000Z
    "fea2b7d645fba73d753c1ec9a7870c40e1f7b0c561e927b985bf711866e36f22",
    // D-TRUST EV Root CA 1 2020 (issued by D-TRUST EV Root CA 1 2020)
    // Expires: 2035-02-11T09:59:59.000Z
    "9d37e4a989eab3882d116052fc8b58446702cb593726e4604c3795940c7103e2",
    // D-TRUST BR Root CA 1 2020 (issued by D-TRUST BR Root CA 1 2020)
    // Expires: 2035-02-11T09:44:59.000Z
    "603f76f28c9feba83ec751edb66c8d7523ea40fe49fe74427629f50dabbcf55a",
    // GTS Root R3 (issued by GTS Root R3)
    // Expires: 2036-06-22T00:00:00.000Z
    "4179edd981ef747477b49626408af43daa2ca7ab7f9e082c1060f84096774348",
    // GTS Root R4 (issued by GTS Root R4)
    // Expires: 2036-06-22T00:00:00.000Z
    "9847e5653e5e9e847516e5cb818606aa7544a19be67fd7366d506988e8d84347",
    // GlobalSign Root E46 (issued by GlobalSign Root E46)
    // Expires: 2046-03-20T00:00:00.000Z
    "e04a022ce32f4ccf2c7f6046287b828a32a909f5e751447f83fd2c71f6fd8173",
    // vTrus ECC Root CA (issued by vTrus ECC Root CA)
    // Expires: 2043-07-31T07:26:44.000Z
    "a246b822f96cfecc155156e5476957845492acf32187ec8a2ef12d89618d711d",
    // Atos TrustedRoot Root CA ECC TLS 2021 (issued by Atos TrustedRoot Root CA ECC TLS 2021)
    // Expires: 2041-04-17T09:26:22.000Z
    "608963c78c455e6e34b072468ace0956cff18d34643f9f305b7162fa181979fc",
    // DigiCert TLS ECC P384 Root G5 (issued by DigiCert TLS ECC P384 Root G5)
    // Expires: 2046-01-14T23:59:59.000Z
    "a02fafa192c8cb81cb1341554f9c05b71cca2a890b0d1298d683647c961efbdf",
    // ISRG Root X2 (issued by ISRG Root X2)
    // Expires: 2040-09-17T16:00:00.000Z
    "762195c225586ee6c0237456e2107dc54f1efc21f61a792ebd515913cce68332",
    // GlobalSign (issued by GlobalSign)
    // Expires: 2038-01-19T03:14:07.000Z
    "7e0ead76bb6819dc2f54511a84354f6e8b307b9dd82058ea6c004f01d9dda5df",
    // SecureSign Root CA15 (issued by SecureSign Root CA15)
    // Expires: 2045-04-08T08:32:56.000Z
    "f0011f92fcf9be36c7a5b36e7bc862ab20e94ef36fea8a561db0a8d7750c1f51",
    // BJCA Global Root CA2 (issued by BJCA Global Root CA2)
    // Expires: 2044-12-12T03:18:21.000Z
    "cc94a5a0319ff77a4ccadd821c4c59674e44d52816cbd1dfe2c761370ad4d21c",
    // emSign ECC Root CA - C3 (issued by emSign ECC Root CA - C3)
    // Expires: 2043-02-18T18:30:00.000Z
    "eabc185c4e82d942b1a5978ba3c0181487d6b3b9974e5c49f72f6d0bd9637150",
    // TrustAsia TLS ECC Root CA (issued by TrustAsia TLS ECC Root CA)
    // Expires: 2044-05-15T05:41:55.000Z
    "f4632e58701c0bd7dafc7e3831355ec433fc13777de286683e8ec50964df0452",
    // OISTE Server Root ECC G1 (issued by OISTE Server Root ECC G1)
    // Expires: 2048-05-24T14:42:27.000Z
    "d439dd80f1e3bc5c9e5f13e8bff7a8887df9dc1c3e19d76af70c8f8d985eef22",
    // Security Communication ECC RootCA1 (issued by Security Communication ECC RootCA1)
    // Expires: 2038-01-18T05:15:28.000Z
    "3329bfa13b6007ab5fc3713f0acb289426e2fbc99cc5c110a914b139571600b6",
    // SSL.com TLS ECC Root CA 2022 (issued by SSL.com TLS ECC Root CA 2022)
    // Expires: 2046-08-19T16:33:47.000Z
    "1bf00d5c8f13c094dd17e00504cf0888850f12fd067fa1f92c0fdbf60b86e321",
    // Sectigo Public Server Authentication Root E46 (issued by Sectigo Public Server Authentication Root E46)
    // Expires: 2046-03-21T23:59:59.000Z
    "b0b56335468561f5bb9fa12d801784a633a572705d34f32b643445dfa8b005d1",
    // DigiCert Global Root G3 (issued by DigiCert Global Root G3)
    // Expires: 2038-01-15T12:00:00.000Z
    "b94c198300cec5c057ad0727b70bbe91816992256439a7b32f4598119dda9c97",
    // e-Szigno Root CA 2017 (issued by e-Szigno Root CA 2017)
    // Expires: 2042-08-22T12:07:06.000Z
    "42431627ea76cc78697f915e3455b1b2ec82ff2f6380ee6423ef3c0840b7e631",
    // Telekom Security TLS ECC Root 2020 (issued by Telekom Security TLS ECC Root 2020)
    // Expires: 2045-08-25T23:59:59.000Z
    "eab0de5a46419010b01b2d55553fc111aa82b43d9395edfeaeaa8c76e6ad1995",
    // DigiCert Assured ID Root G3 (issued by DigiCert Assured ID Root G3)
    // Expires: 2038-01-15T12:00:00.000Z
    "15eed339594b304f8cf847b477371d8d6fec61f4db2b01af589e7c53b35cae4c",
    // emSign ECC Root CA - G3 (issued by emSign ECC Root CA - G3)
    // Expires: 2043-02-18T18:30:00.000Z
    "8d417db2dd8bf5e3084d1e3f196d583849d81bdd4c00c70b9d39369e96b8c782",
    // HARICA TLS ECC Root CA 2021 (issued by HARICA TLS ECC Root CA 2021)
    // Expires: 2045-02-13T11:01:09.000Z
    "fc784300ec8df4d3d1bad763835182918d52a9ff0238bdf695a1cd9bdb98321c",
    // TrustAsia Global Root CA G4 (issued by TrustAsia Global Root CA G4)
    // Expires: 2046-05-19T02:10:22.000Z
    "07a2904d4bff9604ea1331ae990e9ffe331232e69ecb8a08cd49d8e34757db41",
    // Microsoft ECC Root Certificate Authority 2017 (issued by Microsoft ECC Root Certificate Authority 2017)
    // Expires: 2042-07-18T23:16:04.000Z
    "35f53ce1264611e03340fe37e1ec7d4cc986c5613dca70fd04aa44545f2daf28",
    // Trustwave Global ECC P256 Certification Authority (issued by Trustwave Global ECC P256 Certification Authority)
    // Expires: 2042-08-23T19:35:10.000Z
    "497128fc90656b87290482b223efb72240fe9c421e79938de5f8110cb0be9056",
    // Certum EC-384 CA (issued by Certum EC-384 CA)
    // Expires: 2043-03-26T07:24:54.000Z
    "de7b6932e9c44582ce0de07abdab7eea90c75d6d2a07331df57bd5cb88553d13",
    // OISTE WISeKey Global Root GC CA (issued by OISTE WISeKey Global Root GC CA)
    // Expires: 2042-05-09T09:58:33.000Z
    "fd371bea9755ff60c8828c849b8e5215de532d61b009855fa0ad630d90eef82e",
    // AC RAIZ FNMT-RCM SERVIDORES SEGUROS (issued by AC RAIZ FNMT-RCM SERVIDORES SEGUROS)
    // Expires: 2043-12-20T09:37:33.000Z
    "453b74809b69019627f2f843001db5950cdd1d45371053e7f3dfdbc3714113c6",
    // FIRMAPROFESIONAL CA ROOT-A WEB (issued by FIRMAPROFESIONAL CA ROOT-A WEB)
    // Expires: 2047-03-31T09:01:36.000Z
    "2db2ae4d0d08a4dc7b7a5c911b36b42e3068d2e58657efa61a2f2f69c553b858",
    // COMODO ECC Certification Authority (issued by COMODO ECC Certification Authority)
    // Expires: 2038-01-18T23:59:59.000Z
    "e7ca91bbfbb18788057b3a8070446ea5291160194102f7dcc3b9848c63cb9cd5",
    // SSL.com Root Certification Authority ECC (issued by SSL.com Root Certification Authority ECC)
    // Expires: 2041-02-12T18:14:03.000Z
    "a320f4d534d7be97c1ae8dd0499735bc895c323add2d388bfccf662c23d7f99a",
    // USERTrust ECC Certification Authority (issued by USERTrust ECC Certification Authority)
    // Expires: 2038-01-18T23:59:59.000Z
    "2021917e98263945c859c43f1d73cb4139053c414fa03ca3bc7ee88614298f3b",
    // SSL.com EV Root Certification Authority ECC (issued by SSL.com EV Root Certification Authority ECC)
    // Expires: 2041-02-12T18:15:23.000Z
    "348767cdad3bdd28b2b8dd5351aec30c68cec5cd69d276df3827dbc4f5806464",
    // Trustwave Global ECC P384 Certification Authority (issued by Trustwave Global ECC P384 Certification Authority)
    // Expires: 2042-08-23T19:36:43.000Z
    "828b0eeff24654e8ff5841a29dd5d4e3ed30952ca43425a79283407208d39d16",
    // Hellenic Academic and Research Institutions ECC RootCA 2015 (issued by Hellenic Academic and Research Institutions ECC RootCA 2015)
    // Expires: 2040-06-30T10:37:12.000Z
    "bb52086d0639e8db332775ac8f4e8435d92ceb00f4e24f28fc0eabe240772e80",
    // Starfield Root Certificate Authority - G2 (issued by Starfield Root Certificate Authority - G2)
    // Expires: 2037-12-31T23:59:59.000Z
    "808d68b3fab4884a5f971ace7d10550d7a95a163774f3ec36afffb213fbe4c74",
    // Starfield Services Root Certificate Authority - G2 (issued by Starfield Services Root Certificate Authority - G2)
    // Expires: 2037-12-31T23:59:59.000Z
    "2b071c59a0a0ae76b0eadb2bad23bad4580b69c3601b630c2eaf0613afa83f92",
    // OU=certSIGN ROOT CA (issued by OU=certSIGN ROOT CA)
    // Expires: 2031-07-04T17:20:04.000Z
    "dbc1e3a15238a0483bcdb8fdec616e03e705a48e2a501157cadf3b9c7311c5e5",
    // Amazon Root CA 1 (issued by Amazon Root CA 1)
    // Expires: 2038-01-17T00:00:00.000Z
    "fbe3018031f9586bcbf41727e417b7d1c45c2f47f93be372a17b96b50757d5a2",
    // AffirmTrust Commercial (issued by AffirmTrust Commercial)
    // Expires: 2030-12-31T14:06:06.000Z
    "6c464b9a5b233a5e874da765c26f045010d2ddcff45794f0b4c7e4aafa501495",
    // AffirmTrust Networking (issued by AffirmTrust Networking)
    // Expires: 2030-12-31T14:08:24.000Z
    "94072ad3f58f70f93098e5a5f6c04c96c710bd849d83184919ae90eb890ae400",
    // GlobalSign (issued by GlobalSign)
    // Expires: 2029-03-18T10:00:00.000Z
    "706bb1017c855c59169bad5c1781cf597f12d2cad2f63d1a4aa37493800ffb80",
    // SZAFIR ROOT CA2 (issued by SZAFIR ROOT CA2)
    // Expires: 2035-10-19T07:43:30.000Z
    "6e364b6133deefdcbb21273c5f445a20afbc05038d5b021c0c2153039016345b",
    // SecureSign Root CA12 (issued by SecureSign Root CA12)
    // Expires: 2040-04-08T05:36:46.000Z
    "e14e51891f3492243eea613bc2c814d47224b224c57d38169e958e30b3dedee4",
    // emSign Root CA - C1 (issued by emSign Root CA - C1)
    // Expires: 2043-02-18T18:30:00.000Z
    "b7408b4d2be0238ba37004dd34e276c6019bd2f24c9db7d4980f5f6c359a4bcc",
    // OU=Security Communication RootCA2 (issued by OU=Security Communication RootCA2)
    // Expires: 2029-05-29T05:00:39.000Z
    "3380709af3b096be3cc2a40548142c0a520028db09e2cb77ae2206616ab6cbb4",
    // Atos TrustedRoot 2011 (issued by Atos TrustedRoot 2011)
    // Expires: 2030-12-31T23:59:59.000Z
    "e5ca37bc7b6c361979bc6b123ca9a1db019046d7ff5f57dfb854b19d10b0682f",
    // TWCA Root Certification Authority (issued by TWCA Root Certification Authority)
    // Expires: 2030-12-31T15:59:59.000Z
    "92c46879626ef2cc1ecea50c72fb5e385844095f21cbf3b283cb82e6b9fc6a58",
    // DigiCert Global Root G2 (issued by DigiCert Global Root G2)
    // Expires: 2038-01-15T12:00:00.000Z
    "8bb593a93be1d0e8a822bb887c547890c3e706aad2dab76254f97fb36b82fc26",
    // emSign Root CA - G1 (issued by emSign Root CA - G1)
    // Expires: 2043-02-18T18:30:00.000Z
    "376a1a7082a593dccc20d561d119e9ab8d30f11cc321d0a37fa41f0df284e01c",
    // DigiCert Assured ID Root G2 (issued by DigiCert Assured ID Root G2)
    // Expires: 2038-01-15T12:00:00.000Z
    "f1c6ba670cfc88e4df52973cae420f0a089dd474144fe5806c420064e1591229",
    // Certigna (issued by Certigna)
    // Expires: 2027-06-29T15:13:05.000Z
    "510d20e5c47f63cf666b20f61af62bc099a42ac824ffa443a2da7c90b1808a91",
    // DigiCert Global Root CA (issued by DigiCert Global Root CA)
    // Expires: 2031-11-10T00:00:00.000Z
    "aff988906dde12955d9bebbf928fdcc31cce328d5b9384f21c8941ca26e20391",
    // OISTE WISeKey Global Root GB CA (issued by OISTE WISeKey Global Root GB CA)
    // Expires: 2039-12-01T15:10:31.000Z
    "149f2ee63b9a5e5803240a770dc991fc2e3445e62831c245a49bc4f1f738ff9c",
    // DigiCert Assured ID Root CA (issued by DigiCert Assured ID Root CA)
    // Expires: 2031-11-10T00:00:00.000Z
    "23f2edff3ede90259a9e30f40af8f912a5e5b3694e6938440341f6060e014ffa",
    // SecureTrust CA (issued by SecureTrust CA)
    // Expires: 2029-12-31T19:40:55.000Z
    "77290717614b25f12964ebdb38b5f83caadc0f6c36b0777f880fc6dee1d339cc",
    // Certum Trusted Network CA (issued by Certum Trusted Network CA)
    // Expires: 2029-12-31T12:07:37.000Z
    "aa2630a7b617b04d0a294bab7a8caaa5016e6dbe604837a83a85719fab667eb5",
    // Secure Global CA (issued by Secure Global CA)
    // Expires: 2029-12-31T19:52:06.000Z
    "2596904dc4d699ae20c2cef4dce47f285937d77464ac370746f52dea76ba0c28",
    // T-TeleSec GlobalRoot Class 2 (issued by T-TeleSec GlobalRoot Class 2)
    // Expires: 2033-10-01T23:59:59.000Z
    "6106c0e3a0a299831875127bd7d3cc1859803d511cac11eb6e0840dd166fc10e",
    // T-TeleSec GlobalRoot Class 3 (issued by T-TeleSec GlobalRoot Class 3)
    // Expires: 2033-10-01T23:59:59.000Z
    "8d767764b3cbda08929d072a22a561f4dcdd1bc57d3cbddc948c47d2b47f9122",
    // Go Daddy Root Certificate Authority - G2 (issued by Go Daddy Root Certificate Authority - G2)
    // Expires: 2037-12-31T23:59:59.000Z
    "2a8f2d8af0eb123898f74c866ac3fa669054e23c17bc7a95bd0234192dc635d0",
    // DigiCert High Assurance EV Root CA (issued by DigiCert High Assurance EV Root CA)
    // Expires: 2031-11-10T00:00:00.000Z
    "5a889647220e54d6bd8a16817224520bb5c78e58984bd570506388b9de0f075f",
    // Microsec e-Szigno Root CA 2009 (issued by Microsec e-Szigno Root CA 2009)
    // Expires: 2029-12-30T11:30:18.000Z
    "616167201433aea6c8e5e3070afcaf6749188f814bd1abb179ae8dad3abf26ec",
    // NetLock Arany (Class Gold) Főtanúsítvány (issued by NetLock Arany (Class Gold) Főtanúsítvány)
    // Expires: 2028-12-06T15:08:21.000Z
    "f48badd7df6a06690d0ae31373b12855f8dedb14517f362a313101cc98cc6b35",
    // COMODO Certification Authority (issued by COMODO Certification Authority)
    // Expires: 2029-12-31T23:59:59.000Z
    "006d7be7555dd82026442c4f1a27a80e89a1989cb87b34448ed2194c18196d5e",
    // D-TRUST Root Class 3 CA 2 2009 (issued by D-TRUST Root Class 3 CA 2 2009)
    // Expires: 2029-11-05T08:35:58.000Z
    "eca0f181402ce7a8652b31b4d036df247e3a30b7f41a50d91ec4f90b006b43a1",
    // Entrust Root Certification Authority - G2 (issued by Entrust Root Certification Authority - G2)
    // Expires: 2030-12-07T17:55:54.000Z
    "76ee8590374c715437bbca6bba6028eadde2dc6dbbb8c3f610e851f11d1ab7f5",
    // D-TRUST Root Class 3 CA 2 EV 2009 (issued by D-TRUST Root Class 3 CA 2 EV 2009)
    // Expires: 2029-11-05T08:50:46.000Z
    "ff342fb6c4c8bd30a4706f73489539f19e6e48cc05f46254654f6610dbc540e9",
    // TUBITAK Kamu SM SSL Kok Sertifikasi - Surum 1 (issued by TUBITAK Kamu SM SSL Kok Sertifikasi - Surum 1)
    // Expires: 2043-10-25T08:25:55.000Z
    "55e00be277ceb0545299f24fd9f877e2acf32852db43ffcd29bca74b39b4c9fa",
    // Entrust Root Certification Authority (issued by Entrust Root Certification Authority)
    // Expires: 2026-11-27T20:53:42.000Z
    "6dbfae00d37b9cd73f8fb47de65917af00e0dddf42dbceac20c17c0275ee2095",
    // Certum Trusted Network CA 2 (issued by Certum Trusted Network CA 2)
    // Expires: 2046-10-06T08:39:56.000Z
    "6b3b57e9ec88d1bb3d01637ff33c7698b3c9758255e9f01ea9178f3e7f3b2b52",
    // COMODO RSA Certification Authority (issued by COMODO RSA Certification Authority)
    // Expires: 2038-01-18T23:59:59.000Z
    "82b5f84daf47a59c7ab521e4982aefa40a53406a3aec26039efa6b2e0e7244c1",
    // Trustwave Global Certification Authority (issued by Trustwave Global Certification Authority)
    // Expires: 2042-08-23T19:34:12.000Z
    "2e06cae1fc20b200e6fb748557a4444bec9317dfff2e4151669e0f7944f0a9e0",
    // SSL.com Root Certification Authority RSA (issued by SSL.com Root Certification Authority RSA)
    // Expires: 2041-02-12T17:39:39.000Z
    "d1c45377ebdcd618cd1651dc2e02c21d751e5aa9fcd1b3431ff6ecf6a31348fa",
    // USERTrust RSA Certification Authority (issued by USERTrust RSA Certification Authority)
    // Expires: 2038-01-18T23:59:59.000Z
    "c784333d20bcd742b9fdc3236f4e509b8937070e73067e254dd3bf9c45bf4dde",
    // SSL.com EV Root Certification Authority RSA R2 (issued by SSL.com EV Root Certification Authority RSA R2)
    // Expires: 2042-05-30T18:14:37.000Z
    "7cd67c248f69d83fc2f9bb01dcb1f7ad67a363d046043796d0984c3a231f6bb0",
    // ANF Secure Server Root CA (issued by ANF Secure Server Root CA)
    // Expires: 2039-08-30T10:00:38.000Z
    "9a52ff6a3cb6e353a08567e0dc9c395b300d60a22292ab8c18c1656b2983ae90",
    // Izenpe.com (issued by Izenpe.com)
    // Expires: 2037-12-13T08:27:25.000Z
    "952c2039c0243eb515dd73d83fc3643184874feb0862a9837731ed9b4742e17a",
    // TeliaSonera Root CA v1 (issued by TeliaSonera Root CA v1)
    // Expires: 2032-10-18T12:00:50.000Z
    "10ba3485ca8bb6880ab9531a4063e4001555561c7f2e055165f49b2d74fc5f6b",
    // TWCA Global Root CA (issued by TWCA Global Root CA)
    // Expires: 2030-12-31T15:59:59.000Z
    "c444b5b66ce5d71e1b5e40f27385c95cbfd24a05b56f70cac0992f0f50c3379c",
    // Amazon Root CA 2 (issued by Amazon Root CA 2)
    // Expires: 2040-05-26T00:00:00.000Z
    "7f4296fc5b6a4e3b35d3c369623e364ab1af381d8fa7121533c9d6c633ea2461",
    // AffirmTrust Premium (issued by AffirmTrust Premium)
    // Expires: 2040-12-31T14:10:36.000Z
    "c7f43b4cf5b71568294f822b53762605f6ddd15cadece739e9e2c3cba61e9d67",
    // UCA Global G2 Root (issued by UCA Global G2 Root)
    // Expires: 2040-12-31T00:00:00.000Z
    "1255cabe8152fa64df942f7a47417e29f96c1ce11bf8c84ecbe2815cc1280810",
    // OU=certSIGN ROOT CA G2 (issued by OU=certSIGN ROOT CA G2)
    // Expires: 2042-02-06T09:27:35.000Z
    "cbad7b1d384849df0946b7ee8e7f5f7ce3aed876fda7bc9d30d8b16f29ff2c53",
    // Certainly Root R1 (issued by Certainly Root R1)
    // Expires: 2046-04-01T00:00:00.000Z
    "3f93f3fcf79d225d213eef6a4a3f5885cf84fe3d7a7a3c11553517688c0e2100",
    // vTrus Root CA (issued by vTrus Root CA)
    // Expires: 2043-07-31T07:24:05.000Z
    "e06647e52610160c3e83c42d22e39aa8750c584d6c24afaed54a61164742000a",
    // GTS Root R1 (issued by GTS Root R1)
    // Expires: 2036-06-22T00:00:00.000Z
    "871a9194f4eed5b312ff40c84c1d524aed2f778bbff25f138cf81f680a7adc67",
    // GTS Root R2 (issued by GTS Root R2)
    // Expires: 2036-06-22T00:00:00.000Z
    "55f77de41c03792428f8d518c55104225be43a5598d926a528ad653e1ccec7bf",
    // Buypass Class 2 Root CA (issued by Buypass Class 2 Root CA)
    // Expires: 2040-10-26T08:38:03.000Z
    "5955ae291574a931342cf7450e16652ede1e0fb3097e1571dfac11c915601564",
    // Buypass Class 3 Root CA (issued by Buypass Class 3 Root CA)
    // Expires: 2040-10-26T08:28:58.000Z
    "b03d87b056d08cc9d4e675ef19ca83ab53532168a8258598be72e6d85c7dd7c1",
    // UCA Extended Validation Root (issued by UCA Extended Validation Root)
    // Expires: 2038-12-31T00:00:00.000Z
    "5c41a73ab2c35dfcd771f6fd6e3e8fac9b469d386cadda56a95b646eb48cca34",
    // GlobalSign Root R46 (issued by GlobalSign Root R46)
    // Expires: 2046-03-20T00:00:00.000Z
    "ae7f962cb9e6a7dbf7b833fb18fa9b71a89175df949c232b6a9ef7cb3df2bbfc",
    // IdenTrust Commercial Root CA 1 (issued by IdenTrust Commercial Root CA 1)
    // Expires: 2034-01-16T18:12:23.000Z
    "07e854f26a7cbd389927aa041bfef1b6cd21dd143818ad947dc655a9e587fe88",
    // QuoVadis Root CA 3 G3 (issued by QuoVadis Root CA 3 G3)
    // Expires: 2042-01-12T20:26:32.000Z
    "f3438e23b3ce532522facf307923f58fd18608e9ba7addc30e952b43c49616c3",
    // QuoVadis Root CA 2 G3 (issued by QuoVadis Root CA 2 G3)
    // Expires: 2042-01-12T18:59:32.000Z
    "4a49edbd2f8f8230bd5592b313573fe1c172a45fa98011cc1eddbb36ade3fce5",
    // QuoVadis Root CA 1 G3 (issued by QuoVadis Root CA 1 G3)
    // Expires: 2042-01-12T17:27:44.000Z
    "86a68f050034126a540d39db2c5f917ef66a94fb9619fa1ecd827cea46ba0cb0",
    // Atos TrustedRoot Root CA RSA TLS 2021 (issued by Atos TrustedRoot Root CA RSA TLS 2021)
    // Expires: 2041-04-17T09:21:09.000Z
    "f7ca77a610e3d42447240692dbd57cfd13cf042acd2062e6a62b87b9ed81c1a7",
    // DigiCert TLS RSA4096 Root G5 (issued by DigiCert TLS RSA4096 Root G5)
    // Expires: 2046-01-14T23:59:59.000Z
    "6a97b51c8219e93e5dec64bad5806cdeb0f8355be47e757010b702456e01aafd",
    // IdenTrust Public Sector Root CA 1 (issued by IdenTrust Public Sector Root CA 1)
    // Expires: 2034-01-16T17:53:32.000Z
    "58dd61feb36ea7d258724371709149cb121337864cacb2d0999ad20739d06477",
    // CA Disig Root R2 (issued by CA Disig Root R2)
    // Expires: 2042-07-19T09:15:30.000Z
    "702116ccd8bf23e16466f0e0dba0ed6a239a9c1cd6a8f5a66b39af3595020385",
    // HiPKI Root CA - G1 (issued by HiPKI Root CA - G1)
    // Expires: 2037-12-31T15:59:59.000Z
    "79caaf5347e6e4a94c8e78a98496fc74020f809ede13f220fab6104c8ded329f",
    // ISRG Root X1 (issued by ISRG Root X1)
    // Expires: 2035-06-04T11:04:38.000Z
    "0b9fa5a59eed715c26c1020c711b4f6ec42d58b0015e14337a39dad301c5afc3",
    // SecureSign Root CA14 (issued by SecureSign Root CA14)
    // Expires: 2045-04-08T07:06:19.000Z
    "581cc15821169694c39c2991b53e93ab945a42b076661774c2ecf38a3323acea",
    // Telia Root CA v2 (issued by Telia Root CA v2)
    // Expires: 2043-11-29T11:55:54.000Z
    "c2b3c31a4a29850aa8f3cf472a1169ff71b416579f6a4482ec7744b83df988ac",
    // BJCA Global Root CA1 (issued by BJCA Global Root CA1)
    // Expires: 2044-12-12T03:16:17.000Z
    "ebc55f21e88d49ede81c0075ab08b3c73b81f0f33e37d7641a1d01b6e602dc9d",
    // TrustAsia TLS RSA Root CA (issued by TrustAsia TLS RSA Root CA)
    // Expires: 2044-05-15T05:41:56.000Z
    "5628872e245fe66148b80badeac9c40f6252e642fa9595aece4b3e8a58b8fd46",
    // GLOBALTRUST 2020 (issued by GLOBALTRUST 2020)
    // Expires: 2040-06-10T00:00:00.000Z
    "fee8af929175687f4638a3fc983db8ecd0e5e2a83e737f3fb77b4c22fcbac0a6",
    // GlobalSign (issued by GlobalSign)
    // Expires: 2034-12-10T00:00:00.000Z
    "682747f8ba621b87cdd3bc295ed5cabce722a1c0c0363d1d68b38928d2787f1e",
    // OU=AC RAIZ FNMT-RCM (issued by OU=AC RAIZ FNMT-RCM)
    // Expires: 2030-01-01T00:00:00.000Z
    "2fc5667a4b9a2678ed6ac6ad25465fcbf6094bfcd9504097c7a8fa47ade5e888",
    // OISTE Server Root RSA G1 (issued by OISTE Server Root RSA G1)
    // Expires: 2048-05-24T14:37:15.000Z
    "b964e141d3a55cae180ea6a1a8d4a297de26f11833c673569d196fb533a98710",
    // GDCA TrustAUTH R5 ROOT (issued by GDCA TrustAUTH R5 ROOT)
    // Expires: 2040-12-31T15:59:59.000Z
    "ceb19411c65052c757f941eb826c96941e4d08d096c7db7e7ea3c4f8c13f1a13",
    // SSL.com TLS RSA Root CA 2022 (issued by SSL.com TLS RSA Root CA 2022)
    // Expires: 2046-08-19T16:34:21.000Z
    "2bcf553a66f570900ddd32ba6dfe1ecc06c9182d662dc1b60e1f7b767c2bdd54",
    // Sectigo Public Server Authentication Root R46 (issued by Sectigo Public Server Authentication Root R46)
    // Expires: 2046-03-21T23:59:59.000Z
    "0e8bb18bbeefb381be21bfc1a206d317298462ad104855f04a0542699708d3d4",
    // CFCA EV ROOT (issued by CFCA EV ROOT)
    // Expires: 2029-12-31T03:07:01.000Z
    "dd5ed1c090f9f448061baa94a6bb11017544e9eefaa20cc714ce6c633f5dc629",
    // TWCA CYBER Root CA (issued by TWCA CYBER Root CA)
    // Expires: 2047-11-22T15:59:59.000Z
    "06600b94c0318bb6967f0c7787cc8a1032a179c4e95e3c5760b32e290f7fec9b",
    // DigiCert Trusted Root G4 (issued by DigiCert Trusted Root G4)
    // Expires: 2038-01-15T12:00:00.000Z
    "59df317bfa9f4f0ab7ca514d7772296aa2c765b87664d08b96e57399e364729c",
    // SwissSign RSA TLS Root CA 2022 - 1 (issued by SwissSign RSA TLS Root CA 2022 - 1)
    // Expires: 2047-06-08T11:08:22.000Z
    "ebc978ae0dd9e5822d6b19652596f620c93d7caefa952191cb050a632ca9005f",
    // NAVER Global Root Certification Authority (issued by NAVER Global Root Certification Authority)
    // Expires: 2037-08-18T23:59:59.000Z
    "786ffa578618c3b9a311175e50816f4dda0605c3869f296ebc5943bf09f4e904",
    // HARICA TLS RSA Root CA 2021 (issued by HARICA TLS RSA Root CA 2021)
    // Expires: 2045-02-13T10:55:37.000Z
    "693c9aa6b245b3b0261637750863eadb6c248a16e52d6f4bc90c86bbf32d7042",
    // TrustAsia Global Root CA G3 (issued by TrustAsia Global Root CA G3)
    // Expires: 2046-05-19T02:10:19.000Z
    "8685ad850f7f56cd16943bcb70b434e7356e1b8bdc613406e2ea8de46092b636",
    // Microsoft RSA Root Certificate Authority 2017 (issued by Microsoft RSA Root Certificate Authority 2017)
    // Expires: 2042-07-18T23:00:23.000Z
    "b2f7298b52bf2c3cac4ddfe72de4d682ac58957595982f2b62301af597c699c5",
    // D-TRUST EV Root CA 2 2023 (issued by D-TRUST EV Root CA 2 2023)
    // Expires: 2038-05-09T09:10:32.000Z
    "e753cdd9f13413c7ca9cda82962f8c0ce5ed13d1657312954af5267eb2cb7c79",
    // D-TRUST BR Root CA 2 2023 (issued by D-TRUST BR Root CA 2 2023)
    // Expires: 2038-05-09T08:56:30.000Z
    "ac76f63a46e761b5acc3259705c920cb7f0563d248d8d180f934af68099a15f9",
    // OU=ePKI Root Certification Authority (issued by OU=ePKI Root Certification Authority)
    // Expires: 2034-12-20T02:31:27.000Z
    "62554c17005543b237215f04268dcd2fd1c470240ad3c8660e25ae2c59630f55",
    // Telekom Security TLS RSA Root 2023 (issued by Telekom Security TLS RSA Root 2023)
    // Expires: 2048-03-27T23:59:59.000Z
    "0e05e9bb23869eb689dc56839dcec475a3ae75fa6b50bc5a4978360cbe673323",
    // TunTrust Root CA (issued by TunTrust Root CA)
    // Expires: 2044-04-26T08:57:56.000Z
    "c942262c0c7c0a95bb152b71c42556ddbe9a04fa8378373550d2b7ce27d952a3",
    // QuoVadis Root CA 2 (issued by QuoVadis Root CA 2)
    // Expires: 2031-11-24T18:23:33.000Z
    "8fd112c3c8370f147d5ccd3a7d865eb8dd540783bac69fc60088e3743ff33378",
    // SwissSign Gold CA - G2 (issued by SwissSign Gold CA - G2)
    // Expires: 2036-10-25T08:30:35.000Z
    "40fcfc28875dccbfebcbdf6cd7433312da63c4efcf3bd7b1b505c22020ae0274",
    // Actalis Authentication Root CA (issued by Actalis Authentication Root CA)
    // Expires: 2030-09-22T11:22:02.000Z
    "25d4913cf587097414d29d26f6c1b1942cd6d64eaf45d0fcf81526adba96d324",
    // Certum Trusted Root CA (issued by Certum Trusted Root CA)
    // Expires: 2043-03-16T12:10:13.000Z
    "681dc482c296c8402c6ebb20e68309a3bc846523ae34b984a84ee697a3312db7",
    // Hongkong Post Root CA 3 (issued by Hongkong Post Root CA 3)
    // Expires: 2042-06-03T02:29:46.000Z
    "2541e53ba5b3b07acbe7097ac4a03e040c11cf7a6d4a67cb213d558b50167a06",
    // Hellenic Academic and Research Institutions RootCA 2015 (issued by Hellenic Academic and Research Institutions RootCA 2015)
    // Expires: 2040-06-30T10:11:21.000Z
    "50cc86ba96db3263c79a43ead07553d9f56659e6907e72d8c026637a1cdc85dc",
    // Autoridad de Certificacion Firmaprofesional CIF A62634068 (issued by Autoridad de Certificacion Firmaprofesional CIF A62634068)
    // Expires: 2036-05-05T15:22:07.000Z
    "3b0d73b4be4a854adc3e51d7ef9fa48aefbb2cdd824d67bdc7d7d09a2abc2d43",
    // Certigna Root CA (issued by Certigna Root CA)
    // Expires: 2033-10-01T08:32:27.000Z
    "8e8046ec4cac015a507ce0d2d0154a4b40e8e42b3165cfa546571435112d17e5",
    // QuoVadis Root CA 3 (issued by QuoVadis Root CA 3)
    // Expires: 2031-11-24T19:06:44.000Z
    "0c7acaa710226720bbc940349ee2e6148652a89dbf406a232c895f6dc78ebb9a",
    // ACCVRAIZ1 (issued by ACCVRAIZ1)
    // Expires: 2030-12-31T09:37:37.000Z
    "05570ae6eb0fceb4210e6db79486b7094caf200401e149b6677441b5f25e449b"
];
// src/hazae41/cadenas/mods/ccadb/CCADB.ts
var CCADB = class _CCADB {
    // 30 days in milliseconds
    constructor(app) {
        this.app = app;
        this.fetchCerts = app.get("fetchCerts");
        this.storage = app.get("Storage");
        this.clock = app.get("Clock");
        this.log = app.get("Log").child("CCADB");
    }
    cached;
    fetchCerts;
    whitelistSet = new Set(certHashes);
    storage;
    clock;
    log;
    static STORAGE_KEY = "ccadb:cached";
    static CACHE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1e3;
    /**
     * Validate and parse certificates without memoization.
     * Returns both the parsed certificates and validation diagnostics.
     *
     * Parses base64-encoded X.509 certificates to extract:
     * - Subject DN (x501)
     * - SPKI hash (hashBase16)
     * - DER bytes (certBase16)
     * - Expiration date (notAfter)
     *
     * Only includes certificates whose SPKI hash matches the whitelist.
     *
     * @param source - Optional specific certificate source to validate. If not provided, uses the default fallback chain.
     */
    async validateAndParseCerts(source) {
        const base64Certs = await this.fetchCerts(this.log.child("fetchCerts"), source);
        return this.validateAndParseBase64Certs(base64Certs);
    }
    /**
     * Validate and parse pre-fetched base64 certificates.
     * Used internally when we have base64 data from storage or other sources.
     */
    async validateAndParseBase64Certs(base64Certs) {
        const result = {};
        let matched = 0;
        let unrecognized = 0;
        for (const base64 of base64Certs) {
            try {
                const derBytes = Bytes.fromBase64(base64);
                const x509 = mods_exports.readAndResolveFromBytesOrThrow(mods_exports.Certificate, derBytes);
                const spki = Writable.writeToBytesOrThrow(x509.tbsCertificate.subjectPublicKeyInfo.toDER());
                const hash = Bytes.from(await crypto.subtle.digest("SHA-256", spki));
                const hashBase16 = Bytes.toHex(hash);
                if (!this.whitelistSet.has(hashBase16)) {
                    unrecognized++;
                    continue;
                }
                matched++;
                const x501 = x509.tbsCertificate.subject.toX501OrThrow();
                const certBase16 = Bytes.toHex(derBytes);
                const validity = x509.tbsCertificate.validity;
                const notAfter = validity.toJSON().notAfter;
                result[x501] = {
                    hashBase16,
                    certBase16,
                    ...notAfter && { notAfter }
                };
            }
            catch (error) {
                this.log.warn("Failed to parse certificate:", error);
            }
        }
        return {
            certificates: result,
            diagnostics: {
                matched,
                unrecognized,
                notFound: this.whitelistSet.size - matched
            }
        };
    }
    /**
     * Load raw base64 certificates from persistent storage if they exist and are fresh.
     * Returns base64 strings for re-validation, or null if cache miss/expired.
     */
    async loadFromStorage() {
        try {
            const data = await this.storage.read(_CCADB.STORAGE_KEY);
            if (!data) {
                this.log.info("Cache miss: no stored certificates found");
                return null;
            }
            const text = new TextDecoder().decode(data);
            const payload = JSON.parse(text);
            const savedAt = new Date(payload.savedAt).getTime();
            const now = this.clock.now();
            const age = now - savedAt;
            if (age > _CCADB.CACHE_EXPIRY_MS) {
                this.log.info(`Cache miss: stored certificates expired (age: ${Math.floor(age / 1e3 / 60 / 60 / 24)} days)`);
                return null;
            }
            const certCount = payload.base64Certs.length;
            this.log.info(`Cache hit: loaded ${certCount} base64 certificates (age: ${Math.floor(age / 1e3 / 60)} minutes)`);
            return payload.base64Certs;
        }
        catch (error) {
            this.log.warn(`Cache miss: failed to load from storage: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    /**
     * Save raw base64 certificates to persistent storage with current timestamp.
     */
    async saveToStorage(base64Certs) {
        try {
            const payload = {
                version: 1,
                savedAt: new Date(this.clock.now()).toISOString(),
                base64Certs
            };
            const text = JSON.stringify(payload);
            const data = Bytes.encodeUtf8(text);
            await this.storage.write(_CCADB.STORAGE_KEY, data);
            this.log.info(`Saved ${base64Certs.length} base64 certificates to storage`);
        }
        catch (error) {
            this.log.error(`Failed to save certificates to storage: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Clear cached certificates from memory and storage.
     * Useful for testing and forcing a fresh fetch.
     */
    async clearCache() {
        try {
            this.cached = void 0;
            await this.storage.remove(_CCADB.STORAGE_KEY);
            this.log.info("Cleared certificate cache");
        }
        catch (error) {
            this.log.warn(`Failed to clear storage cache: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get all trusted root certificates indexed by subject DN.
     *
     * Results are cached in memory and persisted to storage with 30-day expiry.
     * Storage stores raw base64 certificates which are re-validated on load.
     * On subsequent calls, will load from storage if fresh and re-validate,
     * otherwise fetches fresh certificates.
     */
    async get() {
        if (this.cached) {
            this.log.debug("Using in-memory cached certificates");
            return this.cached;
        }
        this.log.info("Checking storage for cached certificates");
        const base64CertsFromStorage = await this.loadFromStorage();
        if (base64CertsFromStorage) {
            this.log.info("Re-validating base64 certificates loaded from storage");
            const { certificates: certificates2 } = await this.validateAndParseBase64Certs(base64CertsFromStorage);
            this.cached = certificates2;
            return this.cached;
        }
        this.log.info("Fetching fresh certificates");
        const base64Certs = await this.fetchCerts(this.log.child("fetchCerts"));
        const { certificates } = await this.validateAndParseBase64Certs(base64Certs);
        this.cached = certificates;
        await this.saveToStorage(base64Certs);
        return this.cached;
    }
};
// src/hazae41/cadenas/mods/ccadb/fetchCerts.ts
var sourceUrls = {
    curl: "https://curl.se/ca/cacert.pem",
    ccadb: "https://ccadb.my.salesforce-sites.com/mozilla/IncludedRootsPEMTxt?TrustBitsInclude=Websites",
    certifi: "https://raw.githubusercontent.com/certifi/python-certifi/master/certifi/cacert.pem"
};
async function getRawCerts(source) {
    const url = sourceUrls[source];
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch certificates: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const certRegex = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;
    const pemMatches = text.match(certRegex);
    if (!pemMatches) {
        throw new Error("No certificates found in response");
    }
    return pemMatches.map(pemToBase64);
}
function pemToBase64(pem) {
    return pem.replace(/-----BEGIN CERTIFICATE-----/, "").replace(/-----END CERTIFICATE-----/, "").replace(/\s/g, "");
}
async function fetchCerts(log, source) {
    const sources = source ? [source] : ["curl", "ccadb", "certifi"];
    for (const source2 of sources) {
        try {
            const certs = await getRawCerts(source2);
            if (certs.length > 0) {
                log.info(`Successfully fetched ${certs.length} certs from ${source2}`);
                return certs;
            }
        }
        catch (error) {
            log.info(`Failed to fetch from ${source2}:`, error);
        }
    }
    throw new Error("All certificate sources failed");
}
// src/storage/getStorageName.ts
var PACKAGE_VERSION = "0.2.3";
function getStorageName() {
    return `tor-js-${PACKAGE_VERSION}-cache`;
}
// src/TorClient/versions/noStaticCerts.ts
var TorClient = class _TorClient extends TorClientBase {
    /**
     * Creates a new TorClient instance with the specified configuration.
     *
     * @example
     * ```typescript
     * const client = new TorClient({
     *   snowflakeUrl: 'wss://snowflake.pse.dev/',
     *   log: new Log()
     * });
     *
     * const response = await client.fetch('https://httpbin.org/ip');
     * const data = await response.json();
     * console.log('My Tor IP:', data.origin);
     *
     * client.dispose(); // Clean up when done
     * ```
     */
    constructor(options) {
        super({ ...options, app: _TorClient.makeApp(options) });
    }
    static makeApp(options) {
        const app = new App();
        const clock = new SystemClock();
        app.set("Clock", clock);
        app.set("Log", options.log ?? new Log({ rawLog: () => {
            } }));
        app.set("Storage", options.storage ?? createAutoStorage(getStorageName()));
        app.set("CertificateManager", new CertificateManager({ app, maxCached: 20 }));
        app.set("MicrodescManager", new MicrodescManager({ app, maxCached: 1e3 }));
        app.register("CircuitBuilder", CircuitBuilder);
        app.set("CircuitManager", new CircuitManager({
            snowflakeUrl: options.snowflakeUrl,
            connectionTimeout: options.connectionTimeout ?? 15e3,
            circuitTimeout: options.circuitTimeout ?? 9e4,
            maxCircuitLifetime: options.maxCircuitLifetime ?? 6e5,
            circuitBuffer: options.circuitBuffer ?? 2,
            app
        }));
        app.set("ConsensusManager", new ConsensusManager({ app, maxCached: 5 }));
        app.set("fetchCerts", fetchCerts);
        app.set("ccadb", new CCADB(app));
        return app;
    }
};
// src/TorClient/versions/singleton.ts
var client;
var config = {
    snowflakeUrl: "wss://snowflake.pse.dev/",
    connectionTimeout: 15e3,
    circuitTimeout: 9e4,
    circuitBuffer: 2,
    // Maintain 2 circuits in buffer
    log: new Log({ rawLog: () => {
        } })
};
var tor = {
    /**
     * Same as standard fetch, but powered by tor.
     * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
     */
    async fetch(url, options) {
        if (!client) {
            this.open();
            assert(client);
        }
        const res = await client.fetch(url, options);
        return res;
    },
    /**
     * Configures the TorClient singleton.
     * Closes and restarts if already started.
     */
    configure(customConfig) {
        config = customConfig;
        if (client) {
            client.close();
            client = void 0;
            this.open();
        }
    },
    /**
     * Actively open the TorClient singleton.
     * This is optional - it's automatic if you just call fetch.
     * This library doesn't do anything until it is used, but it's beneficial to
     * call this early if you know you're going to use it.
     */
    open() {
        if (client) {
            return;
        }
        client = new TorClient(config);
    },
    /**
     * Close the singleton.
     */
    close() {
        if (client) {
            client.close();
            client = void 0;
        }
    }
};
exports.tor = tor;
//# sourceMappingURL=index.mjs.map