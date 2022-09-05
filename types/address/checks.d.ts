import type { Addressable, AddressLike, NameResolver } from "./index.js";
export declare function isAddressable(value: any): value is Addressable;
export declare function isAddress(value: any): boolean;
export declare function resolveAddress(target: AddressLike, resolver?: null | NameResolver): string | Promise<string>;
//# sourceMappingURL=checks.d.ts.map