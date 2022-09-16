export declare type GetUrlResponse = {
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string>;
    body: null | Uint8Array;
};
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
/**
 *  Returns a [[FetchGatewayFunc]] for fetching content from a standard
 *  IPFS gateway hosted at %%baseUrl%%.
 */
export declare function getIpfsGatewayFunc(baseUrl: string): FetchGatewayFunc;
export declare class FetchCancelSignal {
    #private;
    constructor(request: FetchRequest);
    addListener(listener: () => void): void;
    get cancelled(): boolean;
    checkSignal(): void;
}
/**
 *  Represents a request for a resource using a URI.
 *
 *  Requests can occur over http/https, data: URI or any
 *  URI scheme registered via the static [[register]] method.
 */
export declare class FetchRequest implements Iterable<[key: string, value: string]> {
    #private;
    /**
     *  The fetch URI to requrest.
     */
    get url(): string;
    set url(url: string);
    /**
     *  The fetch body, if any, to send as the request body.
     *
     *  When setting a body, the intrinsic ``Content-Type`` is automatically
     *  set and will be used if **not overridden** by setting a custom
     *  header.
     *
     *  If %%body%% is null, the body is cleared (along with the
     *  intrinsic ``Content-Type``) and the .
     *
     *  If %%body%% is a string, the intrincis ``Content-Type`` is set to
     *  ``text/plain``.
     *
     *  If %%body%% is a Uint8Array, the intrincis ``Content-Type`` is set to
     *  ``application/octet-stream``.
     *
     *  If %%body%% is any other object, the intrincis ``Content-Type`` is
     *  set to ``application/json``.
     */
    get body(): null | Uint8Array;
    set body(body: null | string | Readonly<object> | Readonly<Uint8Array>);
    /**
     *  Returns true if the request has a body.
     */
    hasBody(): this is (FetchRequest & {
        body: Uint8Array;
    });
    /**
     *  The HTTP method to use when requesting the URI. If no method
     *  has been explicitly set, then ``GET`` is used if the body is
     *  null and ``POST`` otherwise.
     */
    get method(): string;
    set method(method: null | string);
    /**
     *  The headers that will be used when requesting the URI.
     */
    get headers(): Readonly<Record<string, string>>;
    /**
     *  Get the header for %%key%%.
     */
    getHeader(key: string): string;
    /**
     *  Set the header for %%key%% to %%value%%. All values are coerced
     *  to a string.
     */
    setHeader(key: string, value: string | number): void;
    /**
     *  Clear all headers.
     */
    clearHeaders(): void;
    [Symbol.iterator](): Iterator<[key: string, value: string]>;
    /**
     *  The value that will be sent for the ``Authorization`` header.
     */
    get credentials(): null | string;
    /**
     *  Sets an ``Authorization`` for %%username%% with %%password%%.
     */
    setCredentials(username: string, password: string): void;
    /**
     *  Allow gzip-encoded responses.
     */
    get allowGzip(): boolean;
    set allowGzip(value: boolean);
    /**
     *  Allow ``Authentication`` credentials to be sent over insecure
     *  channels.
     */
    get allowInsecureAuthentication(): boolean;
    set allowInsecureAuthentication(value: boolean);
    /**
     *  The timeout (in milliseconds) to wait for a complere response.
     */
    get timeout(): number;
    set timeout(timeout: number);
    /**
     *  This function is called prior to each request, for example
     *  during a redirection or retry in case of server throttling.
     *
     *  This offers an opportunity to populate headers or update
     *  content before sending a request.
     */
    get preflightFunc(): null | FetchPreflightFunc;
    set preflightFunc(preflight: null | FetchPreflightFunc);
    /**
     *  This function is called after each response, offering an
     *  opportunity to provide client-level throttling or updating
     *  response data.
     *
     *  Any error thrown in this causes the ``send()`` to throw.
     *
     *  To schedule a retry attempt (assuming the maximum retry limit
     *  has not been reached), use [[response.throwThrottleError]].
     */
    get processFunc(): null | FetchProcessFunc;
    set processFunc(process: null | FetchProcessFunc);
    /**
     *  This function is called on each retry attempt.
     */
    get retryFunc(): null | FetchRetryFunc;
    set retryFunc(retry: null | FetchRetryFunc);
    constructor(url: string);
    /**
     *  Resolves to the response by sending the request.
     */
    send(): Promise<FetchResponse>;
    /**
     *  Cancels the inflight response, causing a ``CANCELLED``
     *  error to be rejected from the [[send]].
     */
    cancel(): void;
    /**
     *  Returns a new [[FetchRequest]] that represents the redirection
     *  to %%location%%.
     */
    redirect(location: string): FetchRequest;
    /**
     *  Create a new copy of this request.
     */
    clone(): FetchRequest;
    /**
     *  Locks all static configuration for gateways and FetchGetUrlFunc
     *  registration.
     */
    static lockConfig(): void;
    /**
     *  Get the current Gateway function for %%scheme%%.
     */
    static getGateway(scheme: string): null | FetchGatewayFunc;
    /**
     *  Set the FetchGatewayFunc for %%scheme%% to %%func%%.
     */
    static registerGateway(scheme: string, func: FetchGatewayFunc): void;
    /**
     *  Set a custom function for fetching HTTP and HTTPS requests.
     */
    static registerGetUrl(getUrl: FetchGetUrlFunc): void;
}
/**
 *  The response for a FetchREquest.
 */
export declare class FetchResponse implements Iterable<[key: string, value: string]> {
    #private;
    toString(): string;
    /**
     *  The response status code.
     */
    get statusCode(): number;
    /**
     *  The response status message.
     */
    get statusMessage(): string;
    /**
     *  The response headers.
     */
    get headers(): Record<string, string>;
    /**
     *  The response body.
     */
    get body(): null | Readonly<Uint8Array>;
    /**
     *  The response body as a UTF-8 encoded string.
     *
     * An error is thrown if the body is invalid UTF-8 data.
     */
    get bodyText(): string;
    /**
     *  The response body, decoded as JSON.
     *
     *  An error is thrown if the body is invalid JSON-encoded data.
     */
    get bodyJson(): any;
    [Symbol.iterator](): Iterator<[key: string, value: string]>;
    constructor(statusCode: number, statusMessage: string, headers: Readonly<Record<string, string>>, body: null | Uint8Array, request?: FetchRequest);
    /**
     *  Return a Response with matching headers and body, but with
     *  an error status code (i.e. 599) and %%message%% with an
     *  optional %%error%%.
     */
    makeServerError(message?: string, error?: Error): FetchResponse;
    /**
     *  If called within the [[processFunc]], causes the request to
     *  retry as if throttled for %%stall%% milliseconds.
     */
    throwThrottleError(message?: string, stall?: number): never;
    /**
     *  Get the header value for %%key%%.
     */
    getHeader(key: string): string;
    /**
     *  Returns true of the response has a body.
     */
    hasBody(): this is (FetchResponse & {
        body: Uint8Array;
    });
    /**
     *  The request made for this response.
     */
    get request(): null | FetchRequest;
    /**
     *  Returns true if this response was a success statuscode.
     */
    ok(): boolean;
    /**
     *  Throws a ``SERVER_ERROR`` if this response is not ok.
     */
    assertOk(): void;
}
//# sourceMappingURL=fetch.d.ts.map