export declare type Network = {
    name: string;
    chainId: number;
    ensAddress?: string;
};
export declare type Networkish = Network | string | number;
/**
 *  getNetwork
 *
 *  If the network is a the name of a common network, return that network.
 *  Otherwise, if it is a network object, verify the chain ID is valid
 *  for that network. Otherwise, return the network.
 *
 */
export declare function getNetwork(network: Networkish): Network;
