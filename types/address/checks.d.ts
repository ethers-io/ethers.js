import type { Addressable, AddressLike, NameResolver } from "./index.js";
/**
 *  Returns true if %%value%% is an object which implements the
 *  [[Addressable]] interface.
 */
export declare function isAddressable(value: any): value is Addressable;
/**
 *  Returns true if %%value%% is a valid address.
 */
export declare function isAddress(value: any): boolean;
/**
 *  Resolves to an address for the %%target%%, which may be any
 *  supported address type, an [[Addressable]] or a Promise which
 *  resolves to an address.
 *
 *  If an ENS name is provided, but that name has not been correctly
 *  configured a [[UnconfiguredNameError]] is thrown.
 */
export declare function resolveAddress(target: AddressLike, resolver?: null | NameResolver): string | Promise<string>;
//# sourceMappingURL=checks.d.ts.map