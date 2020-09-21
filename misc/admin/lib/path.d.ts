export declare const root: string;
export declare function resolve(...args: Array<string>): string;
export declare const dirs: Readonly<{
    rootPackageJsonPath: string;
    packages: string;
    root: string;
}>;
export declare const dirnames: ReadonlyArray<string>;
export declare const packages: ReadonlyArray<string>;
export declare function getPackagePath(name: string): string;
export declare function getDirname(name: string): string;
export declare function getPackageJsonPath(name: string): string;
export declare function isEthers(name: string): boolean;
