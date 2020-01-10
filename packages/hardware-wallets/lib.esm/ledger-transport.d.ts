export declare type TransportCreator = {
    create: () => Promise<Transport>;
};
export declare const transports: {
    [name: string]: TransportCreator;
};
