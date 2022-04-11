import type { FetchRequest } from "./request.js";
export interface FetchResponseWithBody extends FetchResponse {
    body: Readonly<Uint8Array>;
}
export declare class FetchResponse implements Iterable<[key: string, value: string]> {
    #private;
    toString(): string;
    get statusCode(): number;
    get statusMessage(): string;
    get headers(): Readonly<Record<string, string>>;
    get body(): null | Readonly<Uint8Array>;
    get bodyText(): string;
    get bodyJson(): any;
    [Symbol.iterator](): Iterator<[key: string, value: string]>;
    constructor(statusCode: number, statusMessage: string, headers: Readonly<Record<string, string>>, body: null | Uint8Array, request?: FetchRequest);
    makeServerError(message?: string, error?: Error): FetchResponse;
    throwThrottleError(message?: string, stall?: number): never;
    getHeader(key: string): string;
    hasBody(): this is FetchResponseWithBody;
    get request(): null | FetchRequest;
    ok(): boolean;
    assertOk(): void;
}
//# sourceMappingURL=response.d.ts.map