import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';
import { Networkish } from '../utils/networks';
export declare class InfuraProvider extends JsonRpcProvider {
    readonly apiAccessToken: string;
    readonly projectId: string;
    constructor(network?: Networkish, projectId?: string);
    protected _startPending(): void;
    getSigner(address?: string): JsonRpcSigner;
    listAccounts(): Promise<Array<string>>;
}
