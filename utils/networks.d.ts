export declare type Network = {
    name: string;
    chainId: number;
    ensAddress?: string;
    _defaultProvider?: (providers: any) => any;
};
export declare type Networkish = Network | string | number;
/**
 *  getNetwork
 *
 *  Converts a named common networks or chain ID (network ID) to a Network
 *  and verifies a network is a valid Network..
 */
export declare function getNetwork(network: Networkish): Network;
