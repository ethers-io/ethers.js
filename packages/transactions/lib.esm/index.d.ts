import { AccountLike } from "@hethers/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike, SignatureLike } from "@ethersproject/bytes";
import { Transaction as HederaTransaction, PublicKey as HederaPubKey } from "@hashgraph/sdk";
export declare type AccessList = Array<{
    address: string;
    storageKeys: Array<string>;
}>;
export declare type AccessListish = AccessList | Array<[string, Array<string>]> | Record<string, Array<string>>;
export declare enum TransactionTypes {
    legacy = 0,
    eip2930 = 1,
    eip1559 = 2
}
export declare type UnsignedTransaction = {
    to?: AccountLike;
    from?: AccountLike;
    gasLimit?: BigNumberish;
    data?: BytesLike;
    value?: BigNumberish;
    chainId?: number;
    type?: number;
    accessList?: AccessListish;
    maxPriorityFeePerGas?: BigNumberish;
    maxFeePerGas?: BigNumberish;
    nodeId?: AccountLike;
    customData?: Record<string, any>;
};
export interface Transaction {
    transactionId: string;
    hash?: string;
    to?: string;
    from?: string;
    gasLimit: BigNumber;
    data: string;
    value: BigNumber;
    chainId: number;
    r?: string;
    s?: string;
    v?: number;
    accessList?: AccessList;
}
export declare function computeAddress(key: BytesLike | string): string;
export declare function computeAlias(key: BytesLike | string): string;
export declare function computeAliasFromPubKey(pubKey: string): string;
export declare function recoverAddress(digest: BytesLike, signature: SignatureLike): string;
export declare function accessListify(value: AccessListish): AccessList;
export declare function serializeHederaTransaction(transaction: UnsignedTransaction, pubKey?: HederaPubKey): HederaTransaction;
export declare function parse(rawTransaction: BytesLike): Promise<Transaction>;
export declare function numberify(num: BigNumberish): number;
//# sourceMappingURL=index.d.ts.map