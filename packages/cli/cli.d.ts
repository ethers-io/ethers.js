import { ethers } from "ethers";
export declare function dump(header: string, info: any): void;
declare class WrappedSigner extends ethers.Signer {
    readonly addressPromise: Promise<string>;
    readonly provider: ethers.providers.Provider;
    readonly plugin: Plugin;
    constructor(addressPromise: Promise<string>, signerFunc: () => Promise<ethers.Signer>, plugin: Plugin);
    connect(provider?: ethers.providers.Provider): ethers.Signer;
    getAddress(): Promise<string>;
    signMessage(message: string | ethers.utils.Bytes): Promise<string>;
    signTransaction(transactionRequest: ethers.providers.TransactionRequest): Promise<string>;
    sendTransaction(transactionRequest: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
    unlock(): Promise<void>;
}
export declare class ArgParser {
    readonly _args: Array<string>;
    readonly _consumed: Array<boolean>;
    constructor(args: Array<string>);
    _finalizeArgs(): Array<string>;
    _checkCommandIndex(): number;
    consumeFlag(name: string): boolean;
    consumeMultiOptions(names: Array<string>): Array<{
        name: string;
        value: string;
    }>;
    consumeOptions(name: string): Array<string>;
    consumeOption(name: string): string;
}
export interface Help {
    name: string;
    help: string;
}
export interface PluginType {
    new (...args: any[]): Plugin;
    getHelp?: () => Help;
    getOptionHelp?: () => Array<Help>;
}
export declare class Plugin {
    network: ethers.providers.Network;
    provider: ethers.providers.Provider;
    accounts: Array<WrappedSigner>;
    gasLimit: ethers.BigNumber;
    gasPrice: ethers.BigNumber;
    nonce: number;
    data: string;
    value: ethers.BigNumber;
    yes: boolean;
    constructor();
    static getHelp(): Help;
    static getOptionHelp(): Array<Help>;
    prepareOptions(argParser: ArgParser): Promise<void>;
    prepareArgs(args: Array<string>): Promise<void>;
    run(): Promise<void>;
    getAddress(addressOrName: string, message?: string, allowZero?: boolean): Promise<string>;
    throwUsageError(message?: string): never;
    throwError(message: string): never;
}
export declare class CLI {
    readonly defaultCommand: string;
    readonly plugins: {
        [command: string]: PluginType;
    };
    constructor(defaultCommand: string);
    addPlugin(command: string, plugin: PluginType): void;
    showUsage(message?: string, status?: number): never;
    run(args: Array<string>): Promise<void>;
}
export {};
