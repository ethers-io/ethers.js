import { Networkish } from '@ethersproject/networks';
import { Web3Provider } from './web3-provider';
interface IFrameProviderOptions {
    timeoutMs?: number;
    targetOrigin?: string;
}
export default class IFrameProvider extends Web3Provider {
    constructor(options?: IFrameProviderOptions, network?: Networkish);
}
export {};
