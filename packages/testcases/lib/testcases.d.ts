export interface BigNumber {
    testcase: string;
    value: string | number;
    expectedValue: string;
}
export interface Hash {
    data: string;
    keccak256: string;
    sha256: string;
    sha512: string;
}
export interface HDWalletNode {
    path: string;
    address: string;
    privateKey: string;
}
export interface HDWallet {
    name: string;
    seed: string;
    locale: string;
    password?: string;
    entropy: string;
    mnemonic: string;
    hdnodes: Array<HDWalletNode>;
}
export interface Nameprep {
    comment: string;
    input: Array<number>;
    output: Array<number>;
    rc?: string;
    flags?: string;
}
export interface Wallet {
    name: string;
    type: "crowdsale" | "secret-storage";
    hasAddress: boolean;
    address: string;
    privateKey: string;
    mnemonic?: string;
    password?: string;
    json: string;
}
export interface Wordlist {
    locale: string;
    content: string;
}
export interface Unit {
    name: string;
    ether: string;
    ether_format: string;
    wei: string;
    kwei?: string;
    mwei?: string;
    gwei?: string;
    szabo?: string;
    finney?: string;
    satoshi?: string;
    kwei_format?: string;
    mwei_format?: string;
    gwei_format?: string;
    szabo_format?: string;
    finney_format?: string;
    satoshi_format?: string;
}
export interface SignedTransaction {
    name: string;
    accountAddress: string;
    privateKey: string;
    signedTransaction: string;
    unsignedTransaction: string;
    signedTransactionChainId5: string;
    unsignedTransactionChainId5: string;
    nonce: number;
    gasLimit: string;
    gasPrice: string;
    to: string;
    value: string;
    data: string;
}
export interface TypedTransaction {
    name: string;
    key: string;
    address: string;
    tx: {
        type?: number;
        data?: string;
        gasLimit?: string;
        maxPriorityFeePerGas: string;
        maxFeePerGas: string;
        nonce: number;
        to: string;
        value: string;
        chainId: number;
        accessList: Array<{
            address: string;
            storageKeys: Array<string>;
        }>;
    };
    signed: string;
    unsigned: string;
}
export interface Eip712 {
    name: string;
    domain: {
        name: string;
        version?: string;
        chainId?: number;
        verifyingContract?: string;
        salt?: string;
    };
    primaryType: string;
    types: Record<string, Array<{
        name: string;
        type: string;
    }>>;
    data: Record<string, any>;
    encoded: string;
    digest: string;
    type?: string;
    seed?: string;
    privateKey?: string;
    signature?: string;
}
//# sourceMappingURL=testcases.d.ts.map