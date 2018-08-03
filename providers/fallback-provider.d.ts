import { BaseProvider } from './base-provider';
export declare class FallbackProvider extends BaseProvider {
    private _providers;
    constructor(providers: Array<BaseProvider>);
    readonly providers: Array<BaseProvider>;
    perform(method: string, params: any): any;
}
