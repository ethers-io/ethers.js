import type { FetchRequest, FetchCancelSignal, GetUrlResponse } from "./fetch.js";
/**
 *  @_ignore:
 */
export declare function getUrl(req: FetchRequest, signal?: FetchCancelSignal): Promise<GetUrlResponse>;
