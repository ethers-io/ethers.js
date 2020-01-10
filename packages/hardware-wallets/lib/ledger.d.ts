import { Bytes } from "@ethersproject/bytes";
import { Signer } from "@ethersproject/abstract-signer";
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import Eth from "@ledgerhq/hw-app-eth";
export declare class LedgerSigner extends Signer {
    readonly type: string;
    readonly path: string;
    readonly _eth: Promise<Eth>;
    constructor(provider?: Provider, type?: string, path?: string);
    getAddress(): Promise<string>;
    signMessage(message: Bytes | string): Promise<string>;
    signTransaction(transaction: TransactionRequest): Promise<string>;
    connect(provider: Provider): Signer;
}
