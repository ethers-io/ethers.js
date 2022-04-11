export interface TestCaseHash {
    name: string;
    data: string;
    sha256: string;
    sha512: string;
    ripemd160: string;
    keccak256: string;
}
export interface TestCasePbkdf {
    name: string;
    password: string;
    salt: string;
    dkLen: number;
    pbkdf2: {
        iterations: number;
        algorithm: "sha256" | "sha512";
        key: string;
    };
    scrypt: {
        N: number;
        r: number;
        p: number;
        key: string;
    };
}
export interface TestCaseHmac {
    name: string;
    data: string;
    key: string;
    algorithm: "sha256" | "sha512";
    hmac: string;
}
//# sourceMappingURL=types.d.ts.map