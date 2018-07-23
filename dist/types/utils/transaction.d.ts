import { Arrayish, Signature, Transaction, UnsignedTransaction } from './types';
export declare function serialize(transaction: UnsignedTransaction, signature?: Arrayish | Signature): string;
export declare function parse(rawTransaction: Arrayish): Transaction;
//# sourceMappingURL=transaction.d.ts.map