declare global {
    class Headers {
        constructor(values: Array<[string, string]>);
        forEach(func: (v: string, k: string) => void): void;
    }
    class Response {
        status: number;
        statusText: string;
        headers: Headers;
        arrayBuffer(): Promise<ArrayBuffer>;
    }
    type FetchInit = {
        method?: string;
        headers?: Headers;
        body?: Uint8Array;
    };
    function fetch(url: string, init: FetchInit): Promise<Response>;
}
import { FetchResponse } from "./response.js";
import type { FetchRequest } from "./request.js";
export declare function getUrl(req: FetchRequest, timeout: number): Promise<FetchResponse>;
//# sourceMappingURL=get-url-browser.d.ts.map