
import { BlockTag, TransactionRequest } from "@ethersproject/abstract-provider";
import { deepCopy, Deferrable } from "@ethersproject/properties";

import { Interface } from "@ethersproject/abi";
import { JsonRpcProvider } from "./json-rpc-provider";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

// Experimental

interface CallStruct {
    target: string;
    callData: string;
}

interface ResultStruct {
    success: boolean;
    returnData: string;
}

const multicall = new Interface([
	"function aggregate(tuple(address target, bytes callData)[] calls) public returns (uint256 blockNumber, tuple(bool success, bytes returnData)[] result)"
]);

export class MulticallProvider extends JsonRpcProvider {
    _pendingBatchAggregator: NodeJS.Timer;
    _pendingCalls: Array<{
        call: CallStruct,
        resolve: (result: any) => void,
        reject: (error: Error) => void
    }>;

    call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        const call = {
            target: transaction.to, 
            callData: transaction.data || '0x'
        };

        if (this._pendingCalls == null) {
            this._pendingCalls = [ ];
        }

        const inflightRequest: any = { call, resolve: null, reject: null };

        const promise = new Promise<string>((resolve, reject) => {
            inflightRequest.resolve = resolve;
            inflightRequest.reject = reject;
        });

        this._pendingCalls.push(inflightRequest);

        if (!this._pendingBatchAggregator) {

            // Schedule batch for next event loop + short duration
            this._pendingBatchAggregator = setTimeout(() => {

                // Get teh current batch and clear it, so new requests
                // go into the next batch
                const batch = this._pendingCalls;
                this._pendingCalls = null;
                this._pendingBatchAggregator = null;

                // Get the request as an array of requests
                const calls = batch.map((inflight) => inflight.call);

                this.emit("debug", {
                    action: "request",
                    request: deepCopy(calls),
                    provider: this
                });
                
                if (!this.network.multicallContract) {
                    logger.throwError(
                        "network does not have multicall address",
                        Logger.errors.UNSUPPORTED_OPERATION,
                        { operation: "MULTICALL", network: this.network.name }
                    );
                }

                return super.call({
                    to: this.network.multicallContract,
                    data: multicall.encodeFunctionData('aggregate', [calls])
                }).then((result) => {
                    this.emit("debug", {
                        action: "response",
                        request: calls,
                        response: result,
                        provider: this
                    });
                    
                    const decoded = multicall.decodeFunctionResult('aggregate', result);

                    batch.forEach((inflightRequest, index) => {
                        const payload = decoded.result[index] as ResultStruct;
                        if (payload.success) {
                            inflightRequest.resolve(payload.returnData);
                        } else {
                            const error = new Error('reverted');
                            (<any>error).returnData = payload.returnData;
                            inflightRequest.reject(error);
                        }
                    });
                }, (error) => {
                    this.emit("debug", {
                        action: "response",
                        error: error,
                        request: calls,
                        provider: this
                    });

                    batch.forEach((inflightRequest) => {
                        inflightRequest.reject(error);
                    });
                });
            }, 10);
        }

        return promise;
    }
}
