import { BytesLike } from "@ethersproject/bytes";
export declare function getAccountFromTransactionId(transactionId: string): string;
export declare function asAccountString(accountLike: AccountLike): string;
export declare function getChecksumAddress(address: string): string;
export declare function getAddress(address: string): string;
export declare function isAddress(address: string): boolean;
export declare function getIcapAddress(address: string): string;
export declare function getCreate2Address(from: string, salt: BytesLike, initCodeHash: BytesLike): string;
export declare function getAddressFromAccount(accountLike: AccountLike): string;
export declare function getAccountFromAddress(address: string): Account;
export declare function parseAccount(account: string): Account;
export declare type Account = {
    shard: bigint;
    realm: bigint;
    num: bigint;
};
/**
 * Used for evm addresses and hedera accounts (represented in both Account structure and string format)
 * `0x0000000000000000000000000000000000000001`
 * `0.0.1`
 * Account{shard:0, realm:0, num: 1}
 */
export declare type AccountLike = Account | string;
//# sourceMappingURL=index.d.ts.map