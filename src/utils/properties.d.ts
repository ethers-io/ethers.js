export declare function defineReadOnly(object: any, name: any, value: any): void;
export declare function defineFrozen(object: any, name: any, value: any): void;
export declare type DeferredSetter = (value: any) => void;
export declare function defineDeferredReadOnly(object: any, name: any, value: any): DeferredSetter;
export declare function resolveProperties(object: any): Promise<any>;
