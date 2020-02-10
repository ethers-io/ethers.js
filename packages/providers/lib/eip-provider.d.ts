import { Networkish } from "@ethersproject/networks";
import { JsonRpcProvider } from "./json-rpc-provider";
export interface Eip1193Provider {
    isMetaMask?: boolean;
    send: (message: string, params?: Array<any>) => Promise<any>;
    on(eventName: string, listener: (...args: Array<any>) => void): this;
}
export declare class EipWrappedProvider extends JsonRpcProvider {
    readonly provider: Eip1193Provider;
    constructor(provider: Eip1193Provider, network?: Networkish);
    send(method: string, params: any): Promise<any>;
}
