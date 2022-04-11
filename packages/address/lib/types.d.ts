export interface Addressable {
    getAddress(): Promise<string>;
}
export interface NameResolver {
    resolveName(name: string): Promise<null | string>;
}
//# sourceMappingURL=types.d.ts.map