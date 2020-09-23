export declare type Package = {
    dependencies: {
        [name: string]: string;
    };
    devDependencies: {
        [name: string]: string;
    };
    gitHead: string;
    name: string;
    version: string;
    tarballHash: string;
    location: "remote" | "local";
    _ethers_nobuild: boolean;
};
export declare function getPackage(name: string): Package;
export declare function updateJson(path: string, replace: Record<string, any>, sort?: boolean): void;
export declare function getDependencies(name?: string, filter?: (name: string) => boolean): Record<string, string>;
export declare function getPackList(name: string): Array<string>;
export declare function computeTarballHash(name: string): string;
