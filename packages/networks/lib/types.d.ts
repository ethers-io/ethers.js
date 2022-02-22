import { AccountLike } from "@hethers/address";
export declare type Network = {
    name: string;
    chainId: number;
    ensAddress?: string;
    _defaultProvider?: (providers: any, options?: any) => any;
};
export declare type HederaOperator = {
    accountId: AccountLike;
    privateKey: string;
    publicKey?: string;
};
export declare type HederaNetworkConfigLike = {
    operator?: HederaOperator;
    network?: NodeUrlEntries;
    mirrorNodeUrl?: string;
};
export declare type NodeUrlEntries = {
    [key: string]: any;
};
export declare type Networkish = Network | string | number;
//# sourceMappingURL=types.d.ts.map