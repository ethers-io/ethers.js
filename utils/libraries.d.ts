import scrypt from 'scrypt-js';
export declare const setScrypt: (scryptFn: typeof scrypt) => void;
declare const libraries: {
    readonly scrypt: typeof scrypt;
};
export default libraries;
