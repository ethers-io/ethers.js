import { ethers } from "ethers";
export interface Eip1193Provider {
    send: (message: string, params?: Array<any>) => Promise<any>;
    on(eventName: string, listener: (...args: Array<any>) => void): this;
}
export declare class EipWrappedProvider extends ethers.providers.JsonRpcProvider {
    readonly provider: Eip1193Provider;
    constructor(provider: Eip1193Provider, network?: ethers.providers.Networkish);
    send(method: string, params: any): Promise<any>;
}
