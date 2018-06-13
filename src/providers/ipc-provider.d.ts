import { JsonRpcProvider } from './json-rpc-provider';
import { Network } from './networks';
export declare class IpcProvider extends JsonRpcProvider {
    readonly path: string;
    constructor(path: string, network?: Network | string);
    send(method: any, params: any): Promise<{}>;
}
