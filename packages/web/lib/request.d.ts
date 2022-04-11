import type { Freezable, Frozen } from "@ethersproject/properties";
export interface FetchRequestWithBody extends FetchRequest {
    body: Uint8Array;
}
export declare class FetchRequest implements Freezable<FetchRequest>, Iterable<[key: string, value: string]> {
    #private;
    get url(): string;
    set url(url: string);
    get body(): null | Uint8Array;
    set body(body: null | string | Readonly<object> | Readonly<Uint8Array>);
    hasBody(): this is FetchRequestWithBody;
    get method(): string;
    set method(method: null | string);
    get headers(): Readonly<Record<string, string>>;
    getHeader(key: string): string;
    setHeader(key: string, value: string | number): void;
    clearHeaders(): void;
    [Symbol.iterator](): Iterator<[key: string, value: string]>;
    get credentials(): null | string;
    setCredentials(username: string, password: string): void;
    get allowGzip(): boolean;
    set allowGzip(value: boolean);
    get allowInsecureAuthentication(): boolean;
    set allowInsecureAuthentication(value: boolean);
    get timeout(): number;
    set timeout(timeout: number);
    constructor(url: string);
    redirect(location: string): FetchRequest;
    clone(): FetchRequest;
    freeze(): Frozen<FetchRequest>;
    isFrozen(): boolean;
}
//# sourceMappingURL=request.d.ts.map