import scrypt from 'scrypt-js';
export declare const setPbkdf2: (pbkdf2Fn: any) => void;
export declare const setScrypt: (scryptFn: typeof scrypt) => void;
declare const libraries: {
    readonly pbkdf2: any;
    readonly scrypt: typeof scrypt;
};
export default libraries;
