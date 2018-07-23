import { JsonRpcProvider } from './json-rpc-provider';
import { AsyncProvider, Networkish } from '../utils/types';
export declare class Web3Provider extends JsonRpcProvider {
    readonly _web3Provider: AsyncProvider;
    constructor(web3Provider: AsyncProvider, network?: Networkish);
    send(method: string, params: any): Promise<any>;
}
//# sourceMappingURL=web3-provider.d.ts.map