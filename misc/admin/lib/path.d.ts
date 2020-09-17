export declare const root: string;
export declare const dirs: Readonly<{
    rootPackageJsonPath: string;
    packages: string;
    root: string;
}>;
export declare type Package = {
    dependencies: {
        [name: string]: string;
    };
    devDependencies: {
        [name: string]: string;
    };
    name: string;
    version: string;
};
export declare const dirnames: ReadonlyArray<string>;
export declare const packages: ReadonlyArray<string>;
export declare function atomicWrite(path: string, value: string | Uint8Array): void;
export declare function loadJson(path: string): any;
export declare function getPackagePath(name: string): string;
export declare function getDirname(name: string): string;
export declare function getPackageJsonPath(name: string): string;
export declare function getPackage(name: string): Package;
export declare function getDependencies(name?: string): Record<string, string>;
export declare function isEthers(name: string): boolean;
export declare function updateJson(path: string, replace: Record<string, any>, sort?: boolean): void;
