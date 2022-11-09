import type { BytesLike } from "../utils/index.js";
import type { AbstractProvider, AbstractProviderPlugin } from "./abstract-provider.js";
import type { Provider } from "./provider.js";
export declare type AvatarLinkageType = "name" | "avatar" | "!avatar" | "url" | "data" | "ipfs" | "erc721" | "erc1155" | "!erc721-caip" | "!erc1155-caip" | "!owner" | "owner" | "!balance" | "balance" | "metadata-url-base" | "metadata-url-expanded" | "metadata-url" | "!metadata-url" | "!metadata" | "metadata" | "!imageUrl" | "imageUrl-ipfs" | "imageUrl" | "!imageUrl-ipfs";
export interface AvatarLinkage {
    type: AvatarLinkageType;
    value: string;
}
export interface AvatarResult {
    linkage: Array<AvatarLinkage>;
    url: null | string;
}
export declare abstract class MulticoinProviderPlugin implements AbstractProviderPlugin {
    readonly name: string;
    constructor(name: string);
    connect(proivder: Provider): MulticoinProviderPlugin;
    supportsCoinType(coinType: number): boolean;
    encodeAddress(coinType: number, address: string): Promise<string>;
    decodeAddress(coinType: number, data: BytesLike): Promise<string>;
}
export declare class BasicMulticoinProviderPlugin extends MulticoinProviderPlugin {
    constructor();
}
export declare class EnsResolver {
    #private;
    provider: AbstractProvider;
    address: string;
    name: string;
    constructor(provider: AbstractProvider, address: string, name: string);
    supportsWildcard(): Promise<boolean>;
    _fetch(selector: string, parameters?: BytesLike): Promise<null | string>;
    getAddress(coinType?: number): Promise<null | string>;
    getText(key: string): Promise<null | string>;
    getContentHash(): Promise<null | string>;
    getAvatar(): Promise<null | string>;
    _getAvatar(): Promise<AvatarResult>;
    static fromName(provider: AbstractProvider, name: string): Promise<null | EnsResolver>;
}
//# sourceMappingURL=ens-resolver.d.ts.map