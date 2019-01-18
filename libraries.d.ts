/// <reference types="node" />
import { pbkdf2 } from 'crypto';
import scrypt from 'scrypt-js';
export declare const setPbkdf2: (pbkdf2Fn: typeof pbkdf2) => void;
export declare const setScrypt: (scryptFn: typeof scrypt) => void;
declare const libraries: {
    readonly pbkdf2: typeof pbkdf2;
    readonly scrypt: typeof scrypt;
};
export default libraries;
