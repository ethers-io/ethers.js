import { Networkish } from "@ethersproject/networks";
import { JsonRpcProvider } from "./json-rpc-provider";
export declare type JsonRpc<TMethod = any, TParams = any> = {
    jsonrpc: '2.0';
    id: number;
    method: TMethod;
    params: TParams;
};
export declare type AsyncSendable = {
    isMetaMask?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (request: JsonRpc, callback: (error: any, response: any) => void) => void;
    send?: (request: JsonRpc, callback: (error: any, response: any) => void) => void;
};
export declare class Web3Provider extends JsonRpcProvider {
    readonly _web3Provider: AsyncSendable;
    private _sendAsync;
    constructor(web3Provider: AsyncSendable, network?: Networkish);
    /**
     * Generate a unique identifier for a JSON RPC.
     */
    private static getUniqueId;
    send(method: string, params: any): Promise<any>;
}
