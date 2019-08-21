import { BaseProvider } from "./base-provider";
export declare class FallbackProvider extends BaseProvider {
    readonly providers: Array<BaseProvider>;
    readonly weights: Array<number>;
    readonly quorum: number;
    constructor(providers: Array<BaseProvider>, quorum?: number, weights?: Array<number>);
    static doPerform(provider: BaseProvider, method: string, params: {
        [name: string]: any;
    }): Promise<any>;
    perform(method: string, params: {
        [name: string]: any;
    }): any;
}
