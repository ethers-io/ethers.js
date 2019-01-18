// import { pbkdf2 } from 'crypto'
import scrypt from 'scrypt-js';

// let _pbkdf2 = pbkdf2
let _scrypt = scrypt

export const setPbkdf2 = (pbkdf2Fn: any) => {
    // _pbkdf2 = pbkdf2Fn
}

export const setScrypt = (scryptFn: typeof scrypt) => {
    _scrypt = scryptFn
}

const libraries = {
    get pbkdf2() {
        return {} as any
    },

    get scrypt() {
        return _scrypt
    }
}

export default libraries