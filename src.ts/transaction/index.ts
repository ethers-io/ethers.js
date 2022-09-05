
export type AccessListSet = { address: string, storageKeys: Array<string> };
export type AccessList = Array<AccessListSet>;

// Input allows flexibility in describing an access list
export type AccessListish = AccessList |
                            Array<[ string, Array<string> ]> |
                            Record<string, Array<string>>;


export { accessListify } from "./accesslist.js";
export { computeAddress, recoverAddress } from "./address.js";
export { Transaction } from "./transaction.js";

export type { SignedTransaction, TransactionLike } from "./transaction.js";
