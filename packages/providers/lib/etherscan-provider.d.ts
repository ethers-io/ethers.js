import { BlockTag, TransactionResponse } from "@ethersproject/abstract-provider";
import { Networkish } from "@ethersproject/networks";
import { BaseProvider } from "./base-provider";
export declare class EtherscanProvider extends BaseProvider {
    readonly baseUrl: string;
    readonly apiKey: string;
    constructor(network?: Networkish, apiKey?: string);
    perform(method: string, params: any): Promise<any>;
    getHistory(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag): Promise<Array<TransactionResponse>>;
}
