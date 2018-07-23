import { Arrayish, HDNode as _HDNode, Wordlist } from '../utils/types';
export declare const defaultPath = "m/44'/60'/0'/0/0";
export declare function fromMnemonic(mnemonic: string, wordlist?: Wordlist): _HDNode;
export declare function fromSeed(seed: Arrayish): _HDNode;
export declare function mnemonicToSeed(mnemonic: string, password?: string): string;
export declare function mnemonicToEntropy(mnemonic: string, wordlist?: Wordlist): string;
export declare function entropyToMnemonic(entropy: Arrayish, wordlist?: Wordlist): string;
export declare function isValidMnemonic(mnemonic: string, wordlist?: Wordlist): boolean;
//# sourceMappingURL=hdnode.d.ts.map