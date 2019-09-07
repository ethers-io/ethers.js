import { ethers } from "ethers";
export declare type RetryOptions = {
    timeout?: number;
    floor?: number;
    ceiling?: number;
    interval?: number;
    retryLimit?: number;
};
export declare class RetryProvider extends ethers.providers.BaseProvider {
    readonly provider: ethers.providers.BaseProvider;
    readonly options: RetryOptions;
    constructor(provider: ethers.providers.BaseProvider, options?: RetryOptions);
    perform(method: string, params: any): Promise<any>;
}
