import type {
    Provider, TransactionRequest, TransactionResponse
} from "./provider.js";

// The object that will be used to run Contracts. The Signer and Provider
// both adhere to this, but other types of objects may wish to as well.
export interface ContractRunner {
    provider: null | Provider;

    // Required to estimate gas; usually a Signer or Provider
    estimateGas?: (tx: TransactionRequest) => Promise<bigint>;

    // Required for pure, view or static calls to contracts; usually a Signer or Provider
    call?: (tx: TransactionRequest) => Promise<string>;

    // Required to support ENS names; usually a Signer or Provider
    resolveName?: (name: string) => Promise<null | string>;

    // Required for mutating calls; usually a Signer
    sendTransaction?: (tx: TransactionRequest) => Promise<TransactionResponse>;
}
