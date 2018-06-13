export declare type Network = {
    name: string;
    chainId: number;
    ensAddress?: string;
};
export declare const networks: {
    "unspecified": {
        "chainId": number;
        "name": string;
    };
    "homestead": {
        "chainId": number;
        "ensAddress": string;
        "name": string;
    };
    "mainnet": {
        "chainId": number;
        "ensAddress": string;
        "name": string;
    };
    "morden": {
        "chainId": number;
        "name": string;
    };
    "ropsten": {
        "chainId": number;
        "ensAddress": string;
        "name": string;
    };
    "testnet": {
        "chainId": number;
        "ensAddress": string;
        "name": string;
    };
    "rinkeby": {
        "chainId": number;
        "name": string;
    };
    "kovan": {
        "chainId": number;
        "name": string;
    };
    "classic": {
        "chainId": number;
        "name": string;
    };
};
/**
 *  getNetwork
 *
 *  If the network is a the name of a common network, return that network.
 *  Otherwise, if it is a network object, verify the chain ID is valid
 *  for that network. Otherwise, return the network.
 *
 */
export declare function getNetwork(network: Network | string | number): Network;
