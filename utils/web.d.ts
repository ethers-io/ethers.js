export declare type ConnectionInfo = {
    url: string;
    user?: string;
    password?: string;
    allowInsecure?: boolean;
    timeout?: number;
    headers?: {
        [key: string]: string | number;
    };
};
export interface OnceBlockable {
    once(eventName: "block", handler: () => void): void;
}
export declare type PollOptions = {
    timeout?: number;
    floor?: number;
    ceiling?: number;
    interval?: number;
    onceBlock?: OnceBlockable;
    fastRetry?: number;
};
export declare function fetchJson(connection: string | ConnectionInfo, json: string, processFunc: (value: any) => any): Promise<any>;
export declare function poll(func: () => Promise<any>, options?: PollOptions): Promise<any>;
