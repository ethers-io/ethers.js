import { Provider } from './provider';
import { Networkish } from './networks';
export declare class EtherscanProvider extends Provider {
    readonly baseUrl: string;
    readonly apiKey: string;
    constructor(network?: Networkish, apiKey?: string);
    perform(method: string, params: any): Promise<any>;
    getHistory(addressOrName: any, startBlock: any, endBlock: any): Promise<any[]>;
}
