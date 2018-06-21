import { BigNumber, BigNumberish } from './bignumber';
import { Arrayish } from './bytes';
import { Signature } from './secp256k1';
export declare type UnsignedTransaction = {
    to?: string;
    nonce?: number;
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
    data?: Arrayish;
    value?: BigNumberish;
    chainId?: number;
};
export interface Transaction {
    hash?: string;
    to?: string;
    from?: string;
    nonce: number;
    gasLimit: BigNumber;
    gasPrice: BigNumber;
    data: string;
    value: BigNumber;
    chainId: number;
    r?: string;
    s?: string;
    v?: number;
}
export declare type SignDigestFunc = (digest: Arrayish) => Signature;
export declare function sign(transaction: UnsignedTransaction, signDigest?: SignDigestFunc): string;
export declare function parse(rawTransaction: Arrayish): Transaction;
