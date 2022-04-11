export interface Freezable<T> {
    clone(): T;
    freeze(): Frozen<T>;
    isFrozen(): boolean;
}
export declare type Frozen<T> = Readonly<{
    [P in keyof T]: T[P] extends (...args: Array<any>) => any ? T[P] : T[P] extends Freezable<any> ? Frozen<T[P]> : Readonly<T[P]>;
}>;
//# sourceMappingURL=freezable.d.ts.map