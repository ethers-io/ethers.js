/**
 *  About ENS Resolver
 *
 *  @_section: api/providers/ens-resolver:ENS Resolver  [about-ens-rsolver]
 */

import { getAddress } from "../address/index.js";
import { ZeroAddress, ZeroHash } from "../constants/index.js";
import { dnsEncode, namehash } from "../hash/index.js";
import {
    concat, dataSlice, getBytes, hexlify, zeroPadValue,
    defineProperties, encodeBase58, getBigInt, toArray,
    toNumber, toUtf8Bytes, toUtf8String,
    assert, assertArgument,
    FetchRequest
} from "../utils/index.js";

import type { BigNumberish, BytesLike, EthersError } from "../utils/index.js";

import type { AbstractProvider, AbstractProviderPlugin } from "./abstract-provider.js";
import type { EnsPlugin } from "./plugins-network.js";
import type { TransactionRequest, Provider } from "./provider.js";

const BN_1 = BigInt(1);

const Empty = new Uint8Array([ ]);

function parseBytes(result: string, start: number): null | string {
    if (result === "0x") { return null; }

    const offset = toNumber(dataSlice(result, start, start + 32));
    const length = toNumber(dataSlice(result, offset, offset + 32));

    return dataSlice(result, offset + 32, offset + 32 + length);
}

function parseString(result: string, start: number): null | string {
    try {
        const bytes = parseBytes(result, start);
        if (bytes != null) { return toUtf8String(bytes); }
    } catch(error) { }
    return null;
}

function numPad(value: BigNumberish): Uint8Array {
    const result = toArray(value);
    if (result.length > 32) { throw new Error("internal; should not happen"); }

    const padded = new Uint8Array(32);
    padded.set(result, 32 - result.length);
    return padded;
}

function bytesPad(value: Uint8Array): Uint8Array {
    if ((value.length % 32) === 0) { return value; }

    const result = new Uint8Array(Math.ceil(value.length / 32) * 32);
    result.set(value);
    return result;
}

// ABI Encodes a series of (bytes, bytes, ...)
function encodeBytes(datas: Array<BytesLike>) {
    const result: Array<Uint8Array> = [ ];

    let byteCount = 0;

    // Add place-holders for pointers as we add items
    for (let i = 0; i < datas.length; i++) {
        result.push(Empty);
        byteCount += 32;
    }

    for (let i = 0; i < datas.length; i++) {
        const data = getBytes(datas[i]);

        // Update the bytes offset
        result[i] = numPad(byteCount);

        // The length and padded value of data
        result.push(numPad(data.length));
        result.push(bytesPad(data));
        byteCount += 32 + Math.ceil(data.length / 32) * 32;
    }

    return concat(result);
}

function callAddress(value: string): string {
    assertArgument(value.length === 66 && dataSlice(value, 0, 12) === "0x000000000000000000000000",
        "invalid call address", "value", value);
    return getAddress("0x" + value.substring(26));
}

// @TODO: This should use the fetch-data:ipfs gateway
// Trim off the ipfs:// prefix and return the default gateway URL
function getIpfsLink(link: string): string {
    if (link.match(/^ipfs:\/\/ipfs\//i)) {
        link = link.substring(12);
    } else if (link.match(/^ipfs:\/\//i)) {
        link = link.substring(7);
    } else {
        assertArgument(false, "unsupported IPFS format", "link", link);
    }

    return `https:/\/gateway.ipfs.io/ipfs/${ link }`;
}

/**
 *  The type of data found during a steip during avatar resolution.
 */
export type AvatarLinkageType = "name" | "avatar" | "!avatar" | "url" | "data" | "ipfs" |
    "erc721" | "erc1155" | "!erc721-caip" | "!erc1155-caip" |
    "!owner" | "owner" | "!balance" | "balance" |
    "metadata-url-base" | "metadata-url-expanded" | "metadata-url" | "!metadata-url" |
    "!metadata" | "metadata" |
    "!imageUrl" | "imageUrl-ipfs" | "imageUrl" | "!imageUrl-ipfs";

/**
 *  An individual record for each step during avatar resolution.
 */
export interface AvatarLinkage {
    type: AvatarLinkageType;
    value: string;
};

/**
 *  When resolving an avatar for an ENS name, there are many
 *  steps involved, fetching metadata, validating results, et cetera.
 *
 *  Some applications may wish to analyse this data, or use this data
 *  to diagnose promblems, so an **AvatarResult** provides details of
 *  each completed step during avatar resolution.
 */
export interface AvatarResult {
    linkage: Array<AvatarLinkage>;
    url: null | string;
};

/**
 *  A provider plugin super-class for processing multicoin address types.
 */
export abstract class MulticoinProviderPlugin implements AbstractProviderPlugin {
    readonly name!: string;

    constructor(name: string) {
        defineProperties<MulticoinProviderPlugin>(this, { name });
    }

    connect(proivder: Provider): MulticoinProviderPlugin {
        return this;
    }

    supportsCoinType(coinType: number): boolean {
        return false;
    }

    async encodeAddress(coinType: number, address: string): Promise<string> {
        throw new Error("unsupported coin");
    }

    async decodeAddress(coinType: number, data: BytesLike): Promise<string> {
        throw new Error("unsupported coin");
    }
}

const BasicMulticoinPluginId = "org.ethers.plugins.BasicMulticoinProviderPlugin";

/**
 *  A basic multicoin provider plugin.
 */
export class BasicMulticoinProviderPlugin extends MulticoinProviderPlugin {
    constructor() {
        super(BasicMulticoinPluginId);
    }
}

const matcherIpfs = new RegExp("^(ipfs):/\/(.*)$", "i");
const matchers = [
    new RegExp("^(https):/\/(.*)$", "i"),
    new RegExp("^(data):(.*)$", "i"),
    matcherIpfs,
    new RegExp("^eip155:[0-9]+/(erc[0-9]+):(.*)$", "i"),
];

/**
 *  A connected object to a resolved ENS name resolver, which can be
 *  used to query additional details.
 */
export class EnsResolver {
    /**
     *  The connected provider.
     */
    provider!: AbstractProvider;

    /**
     *  The address of the resolver.
     */
    address!: string;

    /**
     *  The name this resovler was resolved against.
     */
    name!: string;

    // For EIP-2544 names, the ancestor that provided the resolver
    #supports2544: null | Promise<boolean>;

    constructor(provider: AbstractProvider, address: string, name: string) {
        defineProperties<EnsResolver>(this, { provider, address, name });
        this.#supports2544 = null;
    }

    /**
     *  Resolves to true if the resolver supports wildcard resolution.
     */
    async supportsWildcard(): Promise<boolean> {
        if (!this.#supports2544) {
            // supportsInterface(bytes4 = selector("resolve(bytes,bytes)"))
            this.#supports2544 = this.provider.call({
                to: this.address,
                data: "0x01ffc9a79061b92300000000000000000000000000000000000000000000000000000000"
            }).then((result) => {
                return (getBigInt(result) === BN_1);
            }).catch((error) => {
                if (error.code === "CALL_EXCEPTION") { return false; }
                // Rethrow the error: link is down, etc. Let future attempts retry.
                this.#supports2544 = null;
                throw error;
            });
        }

        return await this.#supports2544;
    }

    /**
     *  Fetch the %%selector%% with %%parameters%% using call, resolving
     *  recursively if the resolver supports it.
     */
    async _fetch(selector: string, parameters?: BytesLike): Promise<null | string> {
        if (parameters == null) { parameters = "0x"; }

        // e.g. keccak256("addr(bytes32,uint256)")
        const addrData = concat([ selector, namehash(this.name), parameters ]);
        const tx: TransactionRequest = {
            to: this.address,
            from: ZeroAddress,
            enableCcipRead: true,
            data: addrData
        };

        // Wildcard support; use EIP-2544 to resolve the request
        let wrapped = false;
        if (await this.supportsWildcard()) {
            wrapped = true;

            // selector("resolve(bytes,bytes)")
            tx.data = concat([ "0x9061b923", encodeBytes([ dnsEncode(this.name), addrData ]) ]);
        }

        try {
            let data = await this.provider.call(tx);
            assert((getBytes(data).length % 32) !== 4, "execution reverted during JSON-RPC call (could not parse reason; invalid data length)", "CALL_EXCEPTION", {
                action: "call", data, reason: null, transaction: <any>tx,
                invocation: null, revert: null
            });

            if (wrapped) { return parseBytes(data, 0); }
            return data;
        } catch (error: any) {
            if ((error as EthersError).code !== "CALL_EXCEPTION") { throw error; }
        }

        return null;
    }

    /**
     *  Resolves to the address for %%coinType%% or null if the
     *  provided %%coinType%% has not been configured.
     */
    async getAddress(coinType?: number): Promise<null | string> {
        if (coinType == null) { coinType = 60; }
        if (coinType === 60) {
            try {
                // keccak256("addr(bytes32)")
                const result = await this._fetch("0x3b3b57de");

                // No address
                if (result == null || result === "0x" || result === ZeroHash) { return null; }

                return callAddress(result);
            } catch (error: any) {
                if ((error as EthersError).code === "CALL_EXCEPTION") { return null; }
                throw error;
            }
        }

        let coinPlugin: null | MulticoinProviderPlugin = null;
        for (const plugin of this.provider.plugins) {
            if (!(plugin instanceof MulticoinProviderPlugin)) { continue; }
            if (plugin.supportsCoinType(coinType)) {
                coinPlugin = plugin;
                break;
            }
        }

        if (coinPlugin == null) { return null; }

        // keccak256("addr(bytes32,uint256")
        const data = parseBytes((await this._fetch("0xf1cb7e06", numPad(coinType))) || "0x", 0);

        // No address
        if (data == null || data === "0x") { return null; }

        // Compute the address
        const address = await coinPlugin.encodeAddress(coinType, data);

        if (address != null) { return address; }

        assert(false, `invalid coin data`, "UNSUPPORTED_OPERATION", {
            operation: `getAddress(${ coinType })`,
            info: { coinType, data }
        });
    }

    /**
     *  Resovles to the EIP-643 text record for %%key%%, or ``null``
     *  if unconfigured.
     */
    async getText(key: string): Promise<null | string> {
        // The key encoded as parameter to fetchBytes
        let keyBytes = toUtf8Bytes(key);

        // The nodehash consumes the first slot, so the string pointer targets
        // offset 64, with the length at offset 64 and data starting at offset 96
        const calldata = getBytes(concat([ numPad(64), numPad(keyBytes.length), keyBytes ]));

        const hexBytes = parseBytes((await this._fetch("0x59d1d43c", bytesPad(calldata))) || "0x", 0);
        if (hexBytes == null || hexBytes === "0x") { return null; }

        return toUtf8String(hexBytes);
    }

    /**
     *  Rsolves to the content-hash or ``null`` if unconfigured.
     */
    async getContentHash(): Promise<null | string> {
        // keccak256("contenthash()")
        const hexBytes = parseBytes((await this._fetch("0xbc1c58d1")) || "0x", 0);

        // No contenthash
        if (hexBytes == null || hexBytes === "0x") { return null; }

        // IPFS (CID: 1, Type: 70=DAG-PB, 72=libp2p-key)
        const ipfs = hexBytes.match(/^0x(e3010170|e5010172)(([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f]*))$/);
        if (ipfs) {
            const scheme = (ipfs[1] === "e3010170") ? "ipfs": "ipns";
            const length = parseInt(ipfs[4], 16);
            if (ipfs[5].length === length * 2) {
                return `${ scheme }:/\/${ encodeBase58("0x" + ipfs[2])}`;
            }
        }

        // Swarm (CID: 1, Type: swarm-manifest; hash/length hard-coded to keccak256/32)
        const swarm = hexBytes.match(/^0xe40101fa011b20([0-9a-f]*)$/)
        if (swarm && swarm[1].length === 64) {
            return `bzz:/\/${ swarm[1] }`;
        }

        assert(false, `invalid or unsupported content hash data`, "UNSUPPORTED_OPERATION", {
            operation: "getContentHash()",
            info: { data: hexBytes }
        });
    }

    /**
     *  Resolves to the avatar url or ``null`` if the avatar is either
     *  unconfigured or incorrectly configured (e.g. references an NFT
     *  not owned by the address).
     *
     *  If diagnosing issues with configurations, the [[_getAvatar]]
     *  method may be useful.
     */
    async getAvatar(): Promise<null | string> {
        return (await this._getAvatar()).url;
    }

    /**
     *  When resolving an avatar, there are many steps involved, such
     *  fetching metadata and possibly validating ownership of an
     *  NFT.
     *
     *  This method can be used to examine each step and the value it
     *  was working from.
     */
    async _getAvatar(): Promise<AvatarResult> {
        const linkage: Array<AvatarLinkage> = [ { type: "name", value: this.name } ];
        try {
            // test data for ricmoo.eth
            //const avatar = "eip155:1/erc721:0x265385c7f4132228A0d54EB1A9e7460b91c0cC68/29233";
            const avatar = await this.getText("avatar");
            if (avatar == null) {
                linkage.push({ type: "!avatar", value: "" });
                throw new Error("!avatar");
            }
            linkage.push({ type: "avatar", value: avatar });

            for (let i = 0; i < matchers.length; i++) {
                const match = avatar.match(matchers[i]);
                if (match == null) { continue; }

                const scheme = match[1].toLowerCase();

                switch (scheme) {
                    case "https":
                    case "data":
                        linkage.push({ type: "url", value: avatar });
                        return { linkage, url: avatar };
                    case "ipfs": {
                        const url = getIpfsLink(avatar);
                        linkage.push({ type: "ipfs", value: avatar });
                        linkage.push({ type: "url", value: url });
                        return { linkage, url };
                    }

                    case "erc721":
                    case "erc1155": {
                       // Depending on the ERC type, use tokenURI(uint256) or url(uint256)
                        const selector = (scheme === "erc721") ? "0xc87b56dd": "0x0e89341c";
                        linkage.push({ type: scheme, value: avatar });

                        // The owner of this name
                        const owner = await this.getAddress();
                        if (owner == null) {
                            linkage.push({ type: "!owner", value: "" });
                            throw new Error("!owner");
                        }

                        const comps = (match[2] || "").split("/");
                        if (comps.length !== 2) {
                            linkage.push({ type: <any>`!${ scheme }caip`, value: (match[2] || "") });
                            throw new Error("!caip");
                        }

                        const addr = getAddress(comps[0]);
                        const tokenId = numPad(comps[1]);

                        // Check that this account owns the token
                        if (scheme === "erc721") {
                            // ownerOf(uint256 tokenId)
                            const tokenOwner = callAddress(await this.provider.call({
                                to: addr, data: concat([ "0x6352211e", tokenId ])
                            }));
                            if (owner !== tokenOwner) {
                                linkage.push({ type: "!owner", value: tokenOwner });
                                throw new Error("!owner");
                            }
                            linkage.push({ type: "owner", value: tokenOwner });

                        } else if (scheme === "erc1155") {
                            // balanceOf(address owner, uint256 tokenId)
                            const balance = getBigInt(await this.provider.call({
                                to: addr, data: concat([ "0x00fdd58e", zeroPadValue(owner, 32), tokenId ])
                            }));
                            if (!balance) {
                                linkage.push({ type: "!balance", value: "0" });
                                throw new Error("!balance");
                            }
                            linkage.push({ type: "balance", value: balance.toString() });
                        }

                        // Call the token contract for the metadata URL
                        const tx = {
                            to: comps[0],
                            data: concat([ selector, tokenId ])
                        };

                        let metadataUrl = parseString(await this.provider.call(tx), 0);
                        if (metadataUrl == null) {
                            linkage.push({ type: "!metadata-url", value: "" });
                            throw new Error("!metadata-url");
                        }

                        linkage.push({ type: "metadata-url-base", value: metadataUrl });

                        // ERC-1155 allows a generic {id} in the URL
                        if (scheme === "erc1155") {
                            metadataUrl = metadataUrl.replace("{id}", hexlify(tokenId).substring(2));
                            linkage.push({ type: "metadata-url-expanded", value: metadataUrl });
                        }

                        // Transform IPFS metadata links
                        if (metadataUrl.match(/^ipfs:/i)) {
                            metadataUrl = getIpfsLink(metadataUrl);
                        }
                        linkage.push({ type: "metadata-url", value: metadataUrl });

                        // Get the token metadata
                        let metadata: any = { };
                        const response = await (new FetchRequest(metadataUrl)).send();
                        response.assertOk();

                        try {
                            metadata = response.bodyJson;
                        } catch (error) {
                            try {
                                linkage.push({ type: "!metadata", value: response.bodyText });
                            } catch (error) {
                                const bytes = response.body;
                                if (bytes) {
                                    linkage.push({ type: "!metadata", value: hexlify(bytes) });
                                }
                                throw error;
                            }
                            throw error;
                        }

                        if (!metadata) {
                            linkage.push({ type: "!metadata", value: "" });
                            throw new Error("!metadata");
                        }

                        linkage.push({ type: "metadata", value: JSON.stringify(metadata) });

                        // Pull the image URL out
                        let imageUrl = metadata.image;
                        if (typeof(imageUrl) !== "string") {
                            linkage.push({ type: "!imageUrl", value: "" });
                            throw new Error("!imageUrl");
                        }

                        if (imageUrl.match(/^(https:\/\/|data:)/i)) {
                            // Allow
                        } else {
                            // Transform IPFS link to gateway
                            const ipfs = imageUrl.match(matcherIpfs);
                            if (ipfs == null) {
                                linkage.push({ type: "!imageUrl-ipfs", value: imageUrl });
                                throw new Error("!imageUrl-ipfs");
                            }

                            linkage.push({ type: "imageUrl-ipfs", value: imageUrl });
                            imageUrl = getIpfsLink(imageUrl);
                        }

                        linkage.push({ type: "url", value: imageUrl });

                        return { linkage, url: imageUrl };
                    }
                }
            }
        } catch (error) { console.log("EE", error); }

        return { linkage, url: null };
    }

    static async #getResolver(provider: Provider, name: string): Promise<null | string> {
        const network = await provider.getNetwork();

        const ensPlugin = network.getPlugin<EnsPlugin>("org.ethers.network-plugins.ens");

        // No ENS...
        assert(ensPlugin, "network does not support ENS", "UNSUPPORTED_OPERATION", {
            operation: "getResolver", info: { network: network.name } });

        try {
            // keccak256("resolver(bytes32)")
            const addrData = await provider.call({
                to: ensPlugin.address,
                data: concat([ "0x0178b8bf", namehash(name) ]),
                enableCcipRead: true
            });

            const addr = callAddress(addrData);
            if (addr === dataSlice(ZeroHash, 0, 20)) { return null; }
            return addr;

        } catch (error) {
            // ENS registry cannot throw errors on resolver(bytes32),
            // so probably a link error
            throw error;
        }

        return null;
    }

    /**
     *  Resolve to the ENS resolver for %%name%% using %%provider%% or
     *  ``null`` if uncinfigured.
     */
    static async fromName(provider: AbstractProvider, name: string): Promise<null | EnsResolver> {

        let currentName = name;
        while (true) {
            if (currentName === "" || currentName === ".") { return null; }

            // Optimization since the eth node cannot change and does
            // not have a wildcar resolver
            if (name !== "eth" && currentName === "eth") { return null; }

            // Check the current node for a resolver
            const addr = await EnsResolver.#getResolver(provider, currentName);

            // Found a resolver!
            if (addr != null) {
                const resolver = new EnsResolver(provider, addr, name);

                // Legacy resolver found, using EIP-2544 so it isn't safe to use
                if (currentName !== name && !(await resolver.supportsWildcard())) { return null; }

                return resolver;
            }

            // Get the parent node
            currentName = currentName.split(".").slice(1).join(".");
        }
    }
}
