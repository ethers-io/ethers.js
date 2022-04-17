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
