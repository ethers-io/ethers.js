import { Provider } from './provider';
import { BlockTag, TransactionResponse } from './abstract-provider';
import { Networkish } from '../utils/networks';
export declare class EtherscanProvider extends Provider {
    readonly baseUrl: string;
    readonly apiKey: string;
    constructor(network?: Networkish, apiKey?: string);
    perform(method: string, params: any): Promise<any>;
    getHistory(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag): Promise<Array<TransactionResponse>>;
}
