
export interface TestCaseHash {
    name: string;
    data: string;
    sha256: string;
    sha512: string;
    ripemd160: string;
    keccak256: string;
}

export interface TestCaseNamehash {
    name: string;
    ensName: string;
    namehash: string;
}

export interface TestCasePbkdf {
    name: string;
    password: string;
    salt: string;
    dkLen: number;
    pbkdf2: {
        iterations: number;
        algorithm: string;
        key: string;
    },
    scrypt: {
        N: number;
        r: number;
        p: number;
        key: string;
    }
}

export interface TestCaseHmac {
    name: string;
    data: string;
    key: string;
    algorithm: "sha256" | "sha512";
    hmac: string;
}

export interface TestCaseTypedDataDomain {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
}

export interface TestCaseTypedDataType {
    name: string;
    type: string;
}

export interface TestCaseTypedData {
    name: string;

    domain: TestCaseTypedDataDomain;
    primaryType: string;
    types: Record<string, Array<TestCaseTypedDataType>>
    data: any;

    encoded: string;
    digest: string;

    privateKey?: string;
    signature?: string;
}
