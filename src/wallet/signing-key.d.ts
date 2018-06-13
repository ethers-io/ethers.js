export declare class SigningKey {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly address: string;
    readonly mnemonic: string;
    readonly path: string;
    private readonly keyPair;
    constructor(privateKey: any);
    signDigest(digest: any): {
        recoveryParam: number;
        r: string;
        s: string;
    };
    static recover(digest: any, r: any, s: any, recoveryParam: any): string;
    static getPublicKey(value: any, compressed: any): string;
    static publicKeyToAddress(publicKey: any): string;
}
