import { Provider } from '../providers/abstract-provider';
import { Arrayish } from '../utils/bytes';
import { TransactionRequest, TransactionResponse } from '../providers/abstract-provider';
export declare abstract class Signer {
    readonly provider?: Provider;
    abstract getAddress(): Promise<string>;
    abstract signMessage(message: Arrayish | string): Promise<string>;
    abstract sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    constructor();
    static isSigner(value: any): value is Signer;
}
