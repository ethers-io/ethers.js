import u2f from "@ledgerhq/hw-transport-u2f";
export declare type TransportCreator = {
    create: () => Promise<u2f.Transport>;
};
export declare const transports: {
    [name: string]: TransportCreator;
};
//# sourceMappingURL=ledger-transport.d.ts.map