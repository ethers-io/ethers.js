import { ethers } from "ethers";
export declare class MetamaskProvider extends ethers.providers.Web3Provider {
    _pollingAccount: any;
    _pollAccountFunc: () => void;
    constructor(ethereum?: ethers.providers.ExternalProvider);
    getSigner(addressOrIndex?: string | number): ethers.providers.JsonRpcSigner;
    get enabled(): boolean;
    _startPollingAccount(): void;
    _stopPollingAccount(): void;
    on(eventName: ethers.providers.EventType, listener: ethers.providers.Listener): this;
    off(eventName: ethers.providers.EventType, listener?: ethers.providers.Listener): this;
}
//# sourceMappingURL=metamask-provider.d.ts.map