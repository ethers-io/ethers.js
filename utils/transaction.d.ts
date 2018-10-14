import { BigNumber } from './bignumber';
import { Arrayish, Signature } from './bytes';
import { BigNumberish } from './bignumber';
import { Provider } from '../providers/abstract-provider';
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
export declare function serialize(transaction: UnsignedTransaction, signature?: Arrayish | Signature): string;
export declare function parse(rawTransaction: Arrayish): Transaction;
export declare function populateTransaction(transaction: any, provider: Provider, from: string | Promise<string>): Promise<Transaction>;
