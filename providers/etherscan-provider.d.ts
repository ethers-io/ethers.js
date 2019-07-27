import { BaseProvider } from './base-provider';
import { BlockTag, Order, Page, TransactionResponse } from './abstract-provider';
import { Networkish } from '../utils/networks';
export declare class EtherscanProvider extends BaseProvider {
    readonly baseUrl: string;
    readonly apiKey: string;
    constructor(network?: Networkish, apiKey?: string);
    perform(method: string, params: any): Promise<any>;
    getHistory(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag, sort?: Order): Promise<Array<TransactionResponse>>;
    getHistoryPaginated(addressOrName: string | Promise<string>, page?: Page, offset?: Page, sort?: Order): Promise<Array<TransactionResponse>>;
}
