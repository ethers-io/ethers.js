import { FetchRequest } from "./request.js";
import { FetchResponse } from "./response.js";
import type { Frozen } from "@ethersproject/properties";
export declare type PreflightRequestFunc = (request: Frozen<FetchRequest>) => Promise<FetchRequest>;
export declare type ProcessResponseFunc = (request: Frozen<FetchRequest>, response: FetchResponse) => Promise<FetchResponse>;
export declare type ThrottleRetryFunc = (request: Frozen<FetchRequest>, response: FetchResponse, attempt: number) => Promise<boolean>;
export declare type FrozenFetchRequest = Frozen<FetchRequest>;
export declare type FrozenFetchResponse = Frozen<FetchResponse>;
export declare type ConnectionInfo = {
    request: FetchRequest;
    preflightRequest?: PreflightRequestFunc;
    processResponse?: ProcessResponseFunc;
    throttleLimit?: number;
    throttleSlotInterval?: number;
    throttleRetry?: ThrottleRetryFunc;
};
export declare type GatewayFunc = (url: string) => Promise<FetchRequest | FetchResponse>;
export declare function fetchData(connection: string | FetchRequest | ConnectionInfo): Promise<Frozen<FetchResponse>>;
export declare namespace fetchData {
    var lock: () => void;
    var setGateway: (gateway: GatewayFunc | null) => void;
    var setIpfsGateway: (gateway: string | GatewayFunc | null) => void;
    var setArGateway: (gateway: string | GatewayFunc | null) => void;
}
//# sourceMappingURL=fetch-data.d.ts.map