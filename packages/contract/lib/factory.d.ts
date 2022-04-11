import { Interface } from "@ethersproject/abi";
import { BaseContract } from "./contract.js";
import type { InterfaceAbi } from "@ethersproject/abi";
import type { BytesLike } from "@ethersproject/logger";
import type { ContractInterface, ContractMethodArgs, ContractRunner, ContractDeployTransaction } from "./types.js";
import type { ContractTransactionResponse } from "./wrappers.js";
export declare class ContractFactory<A extends Array<any> = Array<any>, I = BaseContract> {
    readonly interface: Interface;
    readonly bytecode: string;
    readonly runner: null | ContractRunner;
    constructor(abi: Interface | InterfaceAbi, bytecode: BytesLike | {
        object: string;
    }, runner?: ContractRunner);
    getDeployTransaction(...args: ContractMethodArgs<A>): Promise<ContractDeployTransaction>;
    deploy(...args: ContractMethodArgs<A>): Promise<BaseContract & {
        deploymentTransaction(): ContractTransactionResponse;
    } & Omit<I, keyof BaseContract>>;
    connect(runner: ContractRunner): ContractFactory<A, I>;
    static fromSolidity<A extends Array<any> = Array<any>, I = ContractInterface>(output: any, runner?: ContractRunner): ContractFactory<A, I>;
}
//# sourceMappingURL=factory.d.ts.map