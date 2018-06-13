export declare type ConnectionInfo = {
    url: string;
    user?: string;
    password?: string;
    allowInsecure?: boolean;
};
export declare type ProcessFunc = (value: any) => any;
export declare function fetchJson(url: string | ConnectionInfo, json: string, processFunc: ProcessFunc): Promise<any>;
