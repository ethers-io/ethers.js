export declare type AccessListSet = {
    address: string;
    storageKeys: Array<string>;
};
export declare type AccessList = Array<AccessListSet>;
export declare type AccessListish = AccessList | Array<[string, Array<string>]> | Record<string, Array<string>>;
export declare function accessListify(value: AccessListish): AccessList;
//# sourceMappingURL=accesslist.d.ts.map