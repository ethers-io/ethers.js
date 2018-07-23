import { Provider } from './provider';
import { EtherscanProvider } from './etherscan-provider';
import { FallbackProvider } from './fallback-provider';
import { IpcProvider } from './ipc-provider';
import { InfuraProvider } from './infura-provider';
import { JsonRpcProvider, JsonRpcSigner } from './json-rpc-provider';
import { Web3Provider } from './web3-provider';
import { Network } from '../utils/types';
declare function getDefaultProvider(network?: Network | string): Provider;
export { Provider, getDefaultProvider, FallbackProvider, EtherscanProvider, InfuraProvider, JsonRpcProvider, Web3Provider, IpcProvider, JsonRpcSigner };
//# sourceMappingURL=index.d.ts.map