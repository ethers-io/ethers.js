export declare function resolveProperties<T>(value: {
    [P in keyof T]: T[P] | Promise<T[P]>;
}): Promise<T>;
export declare function defineReadOnly<T, P extends keyof T>(object: T, name: P, value: T[P]): void;
export interface CancellablePromise<T> extends Promise<T> {
    cancel(): Promise<void>;
}
export declare function defineProperties<T>(target: T, values: {
    [K in keyof T]?: undefined | T[K];
}, types?: {
    [K in keyof T]?: string;
}, defaults?: {
    [K in keyof T]?: T[K];
}): void;
//# sourceMappingURL=properties.d.ts.map