import { ethers } from '../';
export interface Opts {
    args: Array<string>;
    accounts: Array<ethers.types.Signer>;
    options: {
        [key: string]: any;
    };
    network: ethers.types.Network;
    provider: ethers.providers.Provider;
}
export declare type OptionFunc = (value: string, opts: Opts) => any;
export declare type OptionType = OptionFunc | string | number | boolean;
export declare type Options = {
    [key: string]: Array<OptionType> | OptionType;
};
export declare function getopts(options: Options, argv?: Array<string>): Promise<Opts>;
//# sourceMappingURL=cli.d.ts.map