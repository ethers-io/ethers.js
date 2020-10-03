export declare type GetUrlResponse = {
    statusCode: number;
    statusMessage: string;
    headers: {
        [key: string]: string;
    };
    body: Uint8Array;
};
export declare type Options = {
    method?: string;
    body?: Uint8Array;
    headers?: {
        [key: string]: string;
    };
    user?: string;
    password?: string;
};
export declare function getUrl(href: string, options?: Options): Promise<GetUrlResponse>;
