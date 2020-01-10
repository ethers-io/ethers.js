"use strict";

import hid from "@ledgerhq/hw-transport-node-hid";

export type TransportCreator = {
    create: () => Promise<Transport>;
};

export const transports: { [ name: string ]: TransportCreator } = {
    "hid": hid,
    "default": hid
};
