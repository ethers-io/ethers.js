import {TransactionReceipt} from "@ethersproject/abstract-provider";

export interface TokenAllowanceParams {
    contract: string;
    owner: string;
    spender: string;
}

export type TokenAllowanceResponse = string;

export interface TokenBalancesResponse {
    address: string;
    tokenBalances: TokenBalance[];
}

export type TokenBalance = TokenBalanceSuccess | TokenBalanceFailure;

export interface TokenBalanceSuccess {
    address: string;
    tokenBalance: string;
    error: null;
}

export interface TokenBalanceFailure {
    address: string;
    tokenBalance: null;
    error: string;
}

export interface TokenMetadataResponse {
    decimals: number | null;
    logo: string | null;
    name: string | null;
    symbol: string | null;
}

export interface AssetTransfersParams {
    fromBlock?: string;
    toBlock?: string;
    order?: AssetTransfersOrder;
    fromAddress?: string;
    toAddress?: string;
    contractAddresses?: string[];
    excludeZeroValue?: boolean;
    maxCount?: number;
    category?: AssetTransfersCategory[];
    pageKey?: string;
}

export enum AssetTransfersCategory {
    EXTERNAL = "external",
    INTERNAL = "internal",
    TOKEN = "token",
    ERC20 = "erc20",
    ERC721 = "erc721",
    ERC1155 = "erc1155",
    SPECIALNFT = "specialnft",
}

export enum AssetTransfersOrder {
    ASCENDING = "asc",
    DESCENDING = "desc",
}

export interface AssetTransfersResponse {
    transfers: AssetTransfersResult[];
    pageKey?: string;
}

export interface AssetTransfersResult {
    category: AssetTransfersCategory;
    blockNum: string;
    from: string;
    to: string | null;
    value: number | null;
    erc721TokenId: string | null;
    erc1155Metadata: ERC1155Metadata[] | null;
    tokenId: string | null;
    asset: string | null;
    hash: string;
    rawContract: RawContract;
}

export interface NftMetadata {
    image?: string;
    attributes?: Array<Record<string, any>>;
}

export interface TokenUri {
    raw: string;
    gateway: string;
}

export interface NftMedia {
    uri?: TokenUri;
}

export interface NftContract {
    address: string;
}

export interface NftId {
    tokenId: string;
    tokenMetadata?: NftTokenMetadata;
}

export interface NftTokenMetadata {
    tokenType: "erc721" | "erc1155";
}

export interface GetNftMetadataParams {
    contractAddress: string;
    tokenId: string;
    tokenType?: "erc721" | "erc1155";
}

export interface GetNftMetadataResponse {
    contract: NftContract;
    id: NftId;
    title: string;
    description: string;
    tokenUri?: TokenUri;
    media?: NftMedia[];
    metadata?: NftMetadata;
    timeLastUpdated: string;
}

export interface GetNftsParams {
    owner: string;
    pageKey?: string;
    contractAddresses?: string[];
}

export interface GetNftsResponse {
    ownedNfts: Nft[];
    pageKey?: string;
    totalCount: number;
}

export interface TransactionReceiptsBlockNumber {
    blockNumber: string;
}
export interface TransactionReceiptsBlockHash {
    blockHash: string;
}
export type TransactionReceiptsParams =
    | TransactionReceiptsBlockNumber
    | TransactionReceiptsBlockHash;

export interface TransactionReceiptsResponse {
    receipts: TransactionReceipt[] | null;
}

export interface Nft {
    contract: NftContract;
    id: NftId;
}

export interface ERC1155Metadata {
    tokenId: string;
    value: string;
}

export interface RawContract {
    value: string | null;
    address: string | null;
    decimal: string | null;
}
