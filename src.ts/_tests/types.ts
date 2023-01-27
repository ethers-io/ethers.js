

export type TestCaseAbiVerbose = {
    type: "address" | "hexstring" | "number" | "string",
    value: string
} | {
    type: "boolean",
    value: boolean
} | {
    type: "array",
    value: Array<TestCaseAbiVerbose>
} | {
    type: "object",
    value: Array<TestCaseAbiVerbose>
}

export interface TestCaseAbi {
    name: string;
    type: string;
    value: any;
    verbose: TestCaseAbiVerbose;
    bytecode: string;
    encoded: string;
}

/////////////////////////////
// address

export interface TestCaseAccount {
    name: string;
    privateKey: string;
    address: string;
    icap: string;
}

export type TestCaseCreate = {
    sender: string;
    creates: Array<{
        name: string,
        nonce: number,
        address: string
    }>;
};

export type TestCaseCreate2 = {
    sender: string;
    creates: Array<{
        name: string,
        salt: string;
        initCode: string
        initCodeHash: string
        address: string;
    }>;
};


/////////////////////////////
// crypto

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

/////////////////////////////
// hash

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
    error?: string;
    namehash?: string;
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

export interface TestCaseSolidityHash {
    name: string;
    types: Array<string>;
    keccak256: string;
    ripemd160: string;
    sha256: string;
    values: Array<any>
}

/////////////////////////////
// rlp

export interface TestCaseUnit {
    name: string;
    wei: string;
    ethers: string;
    ether_format: string;

    kwei?: string;
    mwei?: string;
    gwei?: string;
    szabo?: string;
    finney?: string;
    finney_format?: string;
    szabo_format?: string;
    gwei_format?: string;
    mwei_format?: string;
    kwei_format?: string;
}

export type NestedHexString = string | Array<string | NestedHexString>;

export interface TestCaseRlp {
    name: string;
    encoded: string;
    decoded: NestedHexString;
}


/////////////////////////////
// transaction

export interface TestCaseTransactionTx {
    to?: string;
    nonce?: number;
    gasLimit?: string;

    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;

    data?: string;
    value?: string;

    accessList?: Array<{ address: string, storageKeys: Array<string> }>;

    chainId?: string;
}

export interface TestCaseTransactionSig {
    r: string;
    s: string;
    v: string;
}

export interface TestCaseTransaction {
    name: string;
    transaction: TestCaseTransactionTx;
    privateKey: string;

    unsignedLegacy: string;
    signedLegacy: string;
    unsignedEip155: string;
    signedEip155: string;
    unsignedBerlin: string;
    signedBerlin: string;
    unsignedLondon: string;
    signedLondon: string;

    signatureLegacy: TestCaseTransactionSig;
    signatureEip155: TestCaseTransactionSig;
    signatureBerlin: TestCaseTransactionSig;
    signatureLondon: TestCaseTransactionSig;
}


/////////////////////////////
// wallet

export interface TestCaseMnemonicNode {
    path: string,
    chainCode: string;
    depth: number;
    index: number;
    parentFingerprint: string;
    fingerprint: string;
    publicKey: string;
    privateKey: string;
    xpriv: string;
    xpub: string;
}

export interface TestCaseMnemonic {
    name: string;
    phrase: string;
    phraseHash: string;
    password: string;
    locale: string;
    entropy: string;
    seed: string;
    nodes: Array<TestCaseMnemonicNode>;
};

export interface TestCaseWallet {
    name: string;
    filename: string,
    type: string;
    address: string;
    password: string;
    content: string;
}

/////////////////////////////
// wordlists

export interface TestCaseWordlist {
    name: string;
    filename: string,
    locale: string;
    content: string;
}
