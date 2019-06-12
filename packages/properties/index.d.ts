export declare function defineReadOnly(object: any, name: string, value: any): void;
export declare function getStatic<T>(ctor: any, key: string): T;
export declare function resolveProperties(object: any): Promise<any>;
export declare function checkProperties(object: any, properties: {
    [name: string]: boolean;
}): void;
export declare function shallowCopy(object: any): any;
export declare function deepCopy(object: any): any;
export declare class Description {
    constructor(info: any);
}
