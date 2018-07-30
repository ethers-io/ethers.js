import { JsonRpcProvider } from './json-rpc-provider';
import { Networkish } from '../utils/networks';
export declare class IpcProvider extends JsonRpcProvider {
    readonly path: string;
    constructor(path: string, network?: Networkish);
    send(method: string, params: any): Promise<any>;
}
