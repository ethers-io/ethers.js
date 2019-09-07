import { ethers } from "ethers";
export interface ContractCode {
    interface: ethers.utils.Interface;
    name: string;
    bytecode?: string;
    runtime?: string;
}
export declare type CompilerOptions = {
    filename?: string;
    basedir?: string;
    optimize?: boolean;
    throwWarnings?: boolean;
};
export declare function compile(source: string, options?: CompilerOptions): Array<ContractCode>;
