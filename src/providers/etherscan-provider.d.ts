import { BlockTag, Provider, TransactionResponse } from './provider';
import { Networkish } from './networks';
export declare class EtherscanProvider extends Provider {
    readonly baseUrl: string;
    readonly apiKey: string;
    constructor(network?: Networkish, apiKey?: string);
    perform(method: string, params: any): Promise<any>;
    getHistory(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag): Promise<Array<TransactionResponse>>;
}
