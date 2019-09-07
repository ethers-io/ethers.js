import { Bytes } from "@ethersproject/bytes";
export declare function isValidName(name: string): boolean;
export declare function namehash(name: string): string;
export declare function id(text: string): string;
export declare const messagePrefix = "\u0019Ethereum Signed Message:\n";
export declare function hashMessage(message: Bytes | string): string;
