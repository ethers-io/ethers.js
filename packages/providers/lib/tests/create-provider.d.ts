import type { AbstractProvider } from "../index.js";
export declare const providerNames: readonly string[];
export declare function getProviderNetworks(provider: string): Array<string>;
export declare function getProvider(provider: string, network: string): null | AbstractProvider;
export declare function connect(network: string): AbstractProvider;
//# sourceMappingURL=create-provider.d.ts.map