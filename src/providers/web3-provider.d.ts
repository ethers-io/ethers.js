import { Network } from './networks';
import { JsonRpcProvider } from './json-rpc-provider';
export declare type Callback = (error: any, response: any) => void;
export declare type AsyncProvider = {
    isMetaMask: boolean;
    host?: string;
    path?: string;
    sendAsync: (request: any, callback: Callback) => void;
};
export declare class Web3Provider extends JsonRpcProvider {
    readonly _web3Provider: AsyncProvider;
    constructor(web3Provider: AsyncProvider, network?: Network | string);
    send(method: any, params: any): Promise<{}>;
}
