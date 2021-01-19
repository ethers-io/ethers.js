import { ethers } from "ethers";
export declare class BrainWallet extends ethers.Wallet {
    static _generate(username: ethers.Bytes | string, password: ethers.Bytes | string, legacy: boolean, progressCallback?: ethers.utils.ProgressCallback): Promise<BrainWallet>;
    static generate(username: ethers.Bytes | string, password: ethers.Bytes | string, progressCallback?: ethers.utils.ProgressCallback): Promise<BrainWallet>;
    static generateLegacy(username: ethers.Bytes | string, password: ethers.Bytes | string, progressCallback?: ethers.utils.ProgressCallback): Promise<BrainWallet>;
}
//# sourceMappingURL=brain-wallet.d.ts.map