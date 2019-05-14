import { BaseProvider } from "./base-provider";
export declare class FallbackProvider extends BaseProvider {
    readonly providers: Array<BaseProvider>;
    readonly weights: Array<number>;
    readonly quorum: number;
    constructor(providers: Array<BaseProvider>, quorum?: number, weights?: Array<number>);
    perform(method: string, params: {
        [name: string]: any;
    }): any;
}
