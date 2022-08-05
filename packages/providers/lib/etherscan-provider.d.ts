import { BlockTag, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import { Network, Networkish } from "@ethersproject/networks";
import { BaseProvider } from "./base-provider";
export declare class EtherscanProvider extends BaseProvider {
    readonly baseUrl: string;
    readonly apiKey: string;
    constructor(network?: Networkish, apiKey?: string);
    getBaseUrl(): string;
    getUrl(module: string, params: Record<string, string>): string;
    getPostUrl(): string;
    getPostData(module: string, params: Record<string, any>): Record<string, any>;
    fetch(module: string, params: Record<string, any>, post?: boolean): Promise<any>;
    detectNetwork(): Promise<Network>;
    perform(method: string, params: any): Promise<any>;
    getHistory(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag): Promise<Array<TransactionResponse>>;
    getContract(address: string, signer?: Signer): Promise<Contract>;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=etherscan-provider.d.ts.map