import { ethers } from "ethers";
export interface ContractCode {
    interface: ethers.utils.Interface;
    name: string;
    compiler: string;
    bytecode: string;
    runtime: string;
}
export declare type CompilerOptions = {
    filename?: string;
    basedir?: string;
    optimize?: boolean;
    throwWarnings?: boolean;
};
export declare function customRequire(path: string): (name: string) => any;
export declare function wrapSolc(_solc: any): (source: string, options?: CompilerOptions) => Array<ContractCode>;
export declare const compile: (source: string, options?: CompilerOptions) => Array<ContractCode>;
//# sourceMappingURL=solc.d.ts.map