import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';
import { Networkish } from '../utils/networks';
export declare class NodesmithProvider extends JsonRpcProvider {
    readonly apiKey: string;
    constructor(apiKey: string, network?: Networkish);
    protected _startPending(): void;
    getSigner(address?: string): JsonRpcSigner;
}
