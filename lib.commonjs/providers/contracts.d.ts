import type { Provider, TransactionRequest, TransactionResponse } from "./provider.js";
export interface ContractRunner {
    provider: null | Provider;
    estimateGas?: (tx: TransactionRequest) => Promise<bigint>;
    call?: (tx: TransactionRequest) => Promise<string>;
    resolveName?: (name: string) => Promise<null | string>;
    sendTransaction?: (tx: TransactionRequest) => Promise<TransactionResponse>;
}
//# sourceMappingURL=contracts.d.ts.map