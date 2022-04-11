
export interface TestCaseAccount {
    name: string;
    privateKey: string;
    address: string;
    icap: string;
}

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
}

export interface TestCaseWallet {
    name: string;
    filename: string,
    type: string;
    address: string;
    password: string;
    content: string;
}
