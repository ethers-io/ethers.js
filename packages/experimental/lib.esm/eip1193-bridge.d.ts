/// <reference types="node" />
import EventEmitter from "events";
import { ethers } from "ethers";
export declare class _Eip1193Bridge extends EventEmitter {
    readonly signer: ethers.Signer;
    readonly provider: ethers.providers.Provider;
    constructor(signer: ethers.Signer, provider?: ethers.providers.Provider);
    send(method: string, params?: Array<any>): Promise<any>;
}
//# sourceMappingURL=eip1193-bridge.d.ts.map