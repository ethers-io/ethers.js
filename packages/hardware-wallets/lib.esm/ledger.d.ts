import { ethers } from "ethers";
import Eth from "@ledgerhq/hw-app-eth";
export declare class LedgerSigner extends ethers.Signer {
    readonly type: string;
    readonly path: string;
    readonly _eth: Promise<Eth>;
    constructor(provider?: ethers.providers.Provider, type?: string, path?: string);
    _retry<T = any>(callback: (eth: Eth) => Promise<T>, timeout?: number): Promise<T>;
    getAddress(): Promise<string>;
    signMessage(message: ethers.utils.Bytes | string): Promise<string>;
    signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string>;
    connect(provider: ethers.providers.Provider): ethers.Signer;
}
//# sourceMappingURL=ledger.d.ts.map