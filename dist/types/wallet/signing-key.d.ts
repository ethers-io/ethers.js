import { Arrayish, HDNode, Signature } from '../utils/types';
export declare class SigningKey {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly address: string;
    readonly mnemonic: string;
    readonly path: string;
    private readonly keyPair;
    constructor(privateKey: Arrayish | HDNode);
    signDigest(digest: Arrayish): Signature;
}
//# sourceMappingURL=signing-key.d.ts.map