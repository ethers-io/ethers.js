import type { BytesLike } from "@ethersproject/logger";
export declare function looseArrayify(hexString: string): Uint8Array;
export declare function zpad(value: String | number, length: number): String;
export declare function getPassword(password: string | Uint8Array): Uint8Array;
export declare function spelunk<T = string>(object: any, _path: string): T;
export declare function uuidV4(randomBytes: BytesLike): string;
//# sourceMappingURL=utils.d.ts.map