import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';
import { Network } from './networks';
export declare class InfuraProvider extends JsonRpcProvider {
    readonly apiAccessToken: string;
    constructor(network?: Network | string, apiAccessToken?: string);
    _startPending(): void;
    getSigner(address?: string): JsonRpcSigner;
    listAccounts(): Promise<Array<string>>;
}
