import type { Addressable } from "@ethersproject/address";
import type { CallRequest, Provider, TransactionRequest, TransactionResponse } from "./provider.js";
export interface ContractRunner {
    provider: null | Provider;
    estimateGas?: (tx: TransactionRequest) => Promise<bigint>;
    call?: (tx: CallRequest) => Promise<string>;
    resolveName?: (name: string | Addressable) => Promise<null | string>;
    sendTransaction?: (tx: TransactionRequest) => Promise<TransactionResponse>;
}
//# sourceMappingURL=contracts.d.ts.map