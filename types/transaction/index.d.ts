export declare type AccessListSet = {
    address: string;
    storageKeys: Array<string>;
};
export declare type AccessList = Array<AccessListSet>;
export declare type AccessListish = AccessList | Array<[string, Array<string>]> | Record<string, Array<string>>;
export { accessListify } from "./accesslist.js";
export { computeAddress, recoverAddress } from "./address.js";
export { Transaction } from "./transaction.js";
export type { SignedTransaction, TransactionLike } from "./transaction.js";
//# sourceMappingURL=index.d.ts.map