export declare function defineReadOnly<T, K extends keyof T>(object: T, name: K, value: T[K]): void;
export declare function getStatic<T>(ctor: any, key: string): T;
export declare type Similar<T> = {
    [P in keyof T]: T[P];
};
export declare type Resolvable<T> = {
    [P in keyof T]: T[P] | Promise<T[P]>;
};
export declare function resolveProperties<T>(object: Readonly<Resolvable<T>>): Promise<Similar<T>>;
export declare function checkProperties(object: any, properties: {
    [name: string]: boolean;
}): void;
export declare function shallowCopy<T>(object: T): Similar<T>;
export declare function deepCopy<T>(object: T): Similar<T>;
export declare class Description<T = any> {
    constructor(info: {
        [K in keyof T]: T[K];
    });
}
