import Transport from "@ledgerhq/hw-transport";
export declare type TransportCreator = {
    create: () => Promise<Transport>;
};
export declare const transports: {
    [name: string]: TransportCreator;
};
//# sourceMappingURL=ledger-transport.d.ts.map