export declare type GetUrlResponse = {
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string>;
    body: null | Uint8Array;
};
export interface FetchRequestWithBody extends FetchRequest {
    body: Uint8Array;
}
/**
 *  Called before any network request, allowing updated headers (e.g. Bearer tokens), etc.
 */
export declare type FetchPreflightFunc = (request: FetchRequest) => Promise<FetchRequest>;
/**
 *  Called on the response, allowing client-based throttling logic or post-processing.
 */
export declare type FetchProcessFunc = (request: FetchRequest, response: FetchResponse) => Promise<FetchResponse>;
/**
 *  Called prior to each retry; return true to retry, false to abort.
 */
export declare type FetchRetryFunc = (request: FetchRequest, response: FetchResponse, attempt: number) => Promise<boolean>;
/**
 *  Called on Gateway URLs.
 */
export declare type FetchGatewayFunc = (url: string, signal?: FetchCancelSignal) => Promise<FetchRequest | FetchResponse>;
/**
 *  Used to perform a fetch; use this to override the underlying network
 *  fetch layer. In NodeJS, the default uses the "http" and "https" libraries
 *  and in the browser ``fetch`` is used. If you wish to use Axios, this is
 *  how you would register it.
 */
export declare type FetchGetUrlFunc = (request: FetchRequest, signal?: FetchCancelSignal) => Promise<GetUrlResponse>;
export declare function getIpfsGatewayFunc(base: string): FetchGatewayFunc;
export declare class FetchCancelSignal {
    #private;
    constructor(request: FetchRequest);
    addListener(listener: () => void): void;
    get cancelled(): boolean;
    checkSignal(): void;
}
export declare class FetchRequest implements Iterable<[key: string, value: string]> {
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
    get preflightFunc(): null | FetchPreflightFunc;
    set preflightFunc(preflight: null | FetchPreflightFunc);
    get processFunc(): null | FetchProcessFunc;
    set processFunc(process: null | FetchProcessFunc);
    get retryFunc(): null | FetchRetryFunc;
    set retryFunc(retry: null | FetchRetryFunc);
    constructor(url: string);
    send(): Promise<FetchResponse>;
    cancel(): void;
    /**
     *  Returns a new [[FetchRequest]] that represents the redirection
     *  to %%location%%.
     */
    redirect(location: string): FetchRequest;
    clone(): FetchRequest;
    static lockConfig(): void;
    static getGateway(scheme: string): null | FetchGatewayFunc;
    static registerGateway(scheme: string, func: FetchGatewayFunc): void;
    static registerGetUrl(getUrl: FetchGetUrlFunc): void;
}
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
//# sourceMappingURL=fetch.d.ts.map