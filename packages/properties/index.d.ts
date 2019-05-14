export declare function defineReadOnly(object: any, name: string, value: any): void;
export declare function isNamedInstance<T>(type: Function | string, value: any): value is T;
export declare function resolveProperties(object: any): Promise<any>;
export declare function checkProperties(object: any, properties: {
    [name: string]: boolean;
}): void;
export declare function shallowCopy(object: any): any;
export declare function deepCopy(object: any, frozen?: boolean): any;
export declare class Description {
    constructor(info: any);
    static isType(value: any): boolean;
}
