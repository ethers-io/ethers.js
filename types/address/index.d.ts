export interface Addressable {
    getAddress(): Promise<string>;
}
export declare type AddressLike = string | Promise<string> | Addressable;
export interface NameResolver {
    resolveName(name: string): Promise<null | string>;
}
export { getAddress, getIcapAddress } from "./address.js";
export { getCreateAddress, getCreate2Address } from "./contract-address.js";
export { isAddressable, isAddress, resolveAddress } from "./checks.js";
//# sourceMappingURL=index.d.ts.map