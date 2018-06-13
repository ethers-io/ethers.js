import { Provider } from './provider';
export declare class FallbackProvider extends Provider {
    private _providers;
    constructor(providers: Array<Provider>);
    readonly providers: Provider[];
    perform(method: string, params: any): any;
}
