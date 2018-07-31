import { JsonRpcProvider } from './json-rpc-provider';
import { Networkish } from '../utils/networks';
export declare type AsyncSendable = {
    isMetaMask?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (request: any, callback: (error: any, response: any) => void) => void;
    send?: (request: any, callback: (error: any, response: any) => void) => void;
};
export declare class Web3Provider extends JsonRpcProvider {
    readonly _web3Provider: AsyncSendable;
    private _sendAsync;
    constructor(web3Provider: AsyncSendable, network?: Networkish);
    send(method: string, params: any): Promise<any>;
}
