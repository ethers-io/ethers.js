"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly } from "@ethersproject/properties";
import { ConnectionInfo } from "@ethersproject/web";

import { CommunityResourcable, showThrottleMessage } from "./formatter";
import { WebSocketProvider } from "./websocket-provider";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
import {
    AssetTransfersParams,
    AssetTransfersResponse,
    GetNftMetadataResponse,
    GetNftsResponse,
    Nft,
    TokenBalancesResponse,
    TokenMetadataResponse,
    TransactionReceiptsParams,
    TransactionReceiptsResponse
} from "./alchemy-provider-types";

// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io

const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"
const DEFAULT_CONTRACT_ADDRESSES = "DEFAULT_TOKENS";

export class AlchemyWebSocketProvider extends WebSocketProvider implements CommunityResourcable {
    readonly apiKey: string;

    constructor(network?: Networkish, apiKey?: any) {
        const provider = new AlchemyProvider(network, apiKey);

        const url = provider.connection.url.replace(/^http/i, "ws")
            .replace(".alchemyapi.", ".ws.alchemyapi.");

        super(url, provider.network);
        defineReadOnly(this, "apiKey", provider.apiKey);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }
}

export class AlchemyProvider extends UrlJsonRpcProvider {

    static getWebSocketProvider(network?: Networkish, apiKey?: any): AlchemyWebSocketProvider {
        return new AlchemyWebSocketProvider(network, apiKey);
    }

    static getApiKey(apiKey: any): any {
        if (apiKey == null) { return defaultApiKey; }
        if (apiKey && typeof(apiKey) !== "string") {
            logger.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey;
    }

    static getUrl(network: Network, apiKey: string): ConnectionInfo {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "eth-mainnet.alchemyapi.io/v2/";
                break;
            case "ropsten":
                host = "eth-ropsten.alchemyapi.io/v2/";
                break;
            case "rinkeby":
                host = "eth-rinkeby.alchemyapi.io/v2/";
                break;
            case "goerli":
                host = "eth-goerli.alchemyapi.io/v2/";
                break;
            case "kovan":
                host = "eth-kovan.alchemyapi.io/v2/";
                break;
            case "matic":
                host = "polygon-mainnet.g.alchemy.com/v2/";
                break;
            case "maticmum":
                host = "polygon-mumbai.g.alchemy.com/v2/";
                break;
            case "arbitrum":
                host = "arb-mainnet.g.alchemy.com/v2/";
                break;
            case "arbitrum-rinkeby":
                host = "arb-rinkeby.g.alchemy.com/v2/";
                break;
            case "optimism":
                host = "opt-mainnet.g.alchemy.com/v2/";
                break;
            case "optimism-kovan":
                host = "opt-kovan.g.alchemy.com/v2/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }

        return {
            allowGzip: true,
            url: ("https:/" + "/" + host + apiKey),
            throttleCallback: (attempt: number, url: string) => {
                if (apiKey === defaultApiKey) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }

    getTokenAllowance(contract: string, owner: string, spender: string): Promise<string> {
        return this.send("alchemy_getTokenAllowance", [contract, owner, spender]);
    }

    getTokenBalances(address: string, contractAddresses?: string[]): Promise<TokenBalancesResponse> {
        return this.send("alchemy_getTokenBalances", [address, contractAddresses || DEFAULT_CONTRACT_ADDRESSES]);
    }

    // Token API
    getTokenMetadata(address: string): Promise<TokenMetadataResponse> {
        return this.send("alchemy_getTokenMetadata", [address]);
    }

    getAssetTransfers(params: AssetTransfersParams): Promise<AssetTransfersResponse> {
        return this.send("alchemy_getAssetTransfers",
            [
                {
                    ...params,
                    fromBlock:
                        params.fromBlock != null
                            ? formatBlock(params.fromBlock)
                            : undefined,
                    toBlock:
                        params.toBlock != null ? formatBlock(params.toBlock) : undefined,
                    maxCount:
                        params.maxCount != null ? toHex(params.maxCount) : undefined,
                },
            ]);
    }

    getNftMetadata(contractAddress: string, tokenId: string, tokenType?: "erc721" | "erc1155"):
        Promise<GetNftMetadataResponse> {
        return this.send("alchemy_getNftMetadata", [contractAddress, tokenId, tokenType]);
    }

    getNfts(ownedNfts: Nft[], pageKey?: string, contractAddresses?: string[]):
        Promise<GetNftsResponse> {
        return this.send("alchemy_getNfts", [ownedNfts, pageKey, contractAddresses]);
    }

    getTransactionReceipts(params: TransactionReceiptsParams): Promise<TransactionReceiptsResponse> {
        return this.send("alchemy_getTransactionReceipts", [params]);
    }
}

export function toHex(n: number): string {
    return `0x${n.toString(16)}`;
}

export function fromHex(hexString: string): number {
    return Number.parseInt(hexString, 16);
}

export function formatBlock(block: string | number): string {
    if (typeof block === "string") {
        return block;
    } else if (typeof block === "number" && Number.isInteger(block)) {
        return toHex(block);
    }
    return block.toString();
}
