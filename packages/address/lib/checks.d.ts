import type { Addressable, NameResolver } from "./types.js";
export declare function isAddressable(value: any): value is Addressable;
export declare function isAddress(value: any): boolean;
export declare function resolveAddress(target: string | Addressable, resolver?: null | NameResolver): Promise<string>;
//# sourceMappingURL=checks.d.ts.map