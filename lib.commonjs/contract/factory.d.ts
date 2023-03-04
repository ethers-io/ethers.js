import { Interface } from "../abi/index.js";
import { BaseContract } from "./contract.js";
import type { InterfaceAbi } from "../abi/index.js";
import type { ContractRunner } from "../providers/index.js";
import type { BytesLike } from "../utils/index.js";
import type { ContractInterface, ContractMethodArgs, ContractDeployTransaction } from "./types.js";
import type { ContractTransactionResponse } from "./wrappers.js";
export declare class ContractFactory<A extends Array<any> = Array<any>, I = BaseContract> {
    readonly interface: Interface;
    readonly bytecode: string;
    readonly runner: null | ContractRunner;
    constructor(abi: Interface | InterfaceAbi, bytecode: BytesLike | {
        object: string;
    }, runner?: null | ContractRunner);
    getDeployTransaction(...args: ContractMethodArgs<A>): Promise<ContractDeployTransaction>;
    deploy(...args: ContractMethodArgs<A>): Promise<BaseContract & {
        deploymentTransaction(): ContractTransactionResponse;
    } & Omit<I, keyof BaseContract>>;
    connect(runner: null | ContractRunner): ContractFactory<A, I>;
    static fromSolidity<A extends Array<any> = Array<any>, I = ContractInterface>(output: any, runner?: ContractRunner): ContractFactory<A, I>;
}
