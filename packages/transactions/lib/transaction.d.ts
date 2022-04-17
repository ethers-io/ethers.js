import { Signature } from "@ethersproject/signing-key";
import type { BigNumberish, BytesLike } from "@ethersproject/logger";
import type { Freezable, Frozen } from "@ethersproject/properties";
import type { SignatureLike } from "@ethersproject/signing-key";
import type { AccessList, AccessListish } from "./accesslist.js";
export interface TransactionLike<A = string> {
    type?: null | number;
    to?: null | A;
    from?: null | A;
    nonce?: null | number;
    gasLimit?: null | BigNumberish;
    gasPrice?: null | BigNumberish;
    maxPriorityFeePerGas?: null | BigNumberish;
    maxFeePerGas?: null | BigNumberish;
    data?: null | string;
    value?: null | BigNumberish;
    chainId?: null | BigNumberish;
    hash?: null | string;
    signature?: null | SignatureLike;
    accessList?: null | AccessListish;
}
export interface SignedTransaction extends Transaction {
    type: number;
    typeName: string;
    from: string;
    signature: Signature;
}
export interface LegacyTransaction extends Transaction {
    type: 0;
    gasPrice: bigint;
}
export interface BerlinTransaction extends Transaction {
    type: 1;
    gasPrice: bigint;
    accessList: AccessList;
}
export interface LondonTransaction extends Transaction {
    type: 2;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    accessList: AccessList;
}
export declare class Transaction implements Freezable<Transaction>, TransactionLike<string> {
    #private;
    get type(): null | number;
    get typeName(): null | string;
    set type(value: null | number | string);
    get to(): null | string;
    set to(value: null | string);
    get nonce(): number;
    set nonce(value: BigNumberish);
    get gasLimit(): bigint;
    set gasLimit(value: BigNumberish);
    get gasPrice(): null | bigint;
    set gasPrice(value: null | BigNumberish);
    get maxPriorityFeePerGas(): null | bigint;
    set maxPriorityFeePerGas(value: null | BigNumberish);
    get maxFeePerGas(): null | bigint;
    set maxFeePerGas(value: null | BigNumberish);
    get data(): string;
    set data(value: BytesLike);
    get value(): bigint;
    set value(value: BigNumberish);
    get chainId(): bigint;
    set chainId(value: BigNumberish);
    get signature(): null | Signature;
    set signature(value: null | SignatureLike);
    get accessList(): null | AccessList;
    set accessList(value: null | AccessListish);
    constructor();
    get hash(): null | string;
    get unsignedHash(): string;
    get from(): null | string;
    get fromPublicKey(): null | string;
    isSigned(): this is SignedTransaction;
    get serialized(): string;
    get unsignedSerialized(): string;
    inferTypes(): Array<number>;
    isLegacy(): this is LegacyTransaction;
    isBerlin(): this is BerlinTransaction;
    isLondon(): this is LondonTransaction;
    clone(): Transaction;
    freeze(): Frozen<Transaction>;
    isFrozen(): boolean;
    static from(tx: string | TransactionLike<string>): Transaction;
}
//# sourceMappingURL=transaction.d.ts.map