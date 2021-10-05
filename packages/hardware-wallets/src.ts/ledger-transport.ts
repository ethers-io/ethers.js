"use strict";

import type { Transport } from "@ledgerhq/hw-transport-node-hid";

export type TransportCreator = {
    create: () => Promise<Transport>;
};

let hidCache: Promise<typeof import("@ledgerhq/hw-transport-node-hid")> = null;

const hidWrapper = Object.freeze({
    create: function(): Promise<Transport> {
        // Load the library if not loaded
        if (hidCache == null) {
            hidCache = new Promise((resolve, reject) => {
                try {
                    let hid = require("@ledgerhq/hw-transport-node-hid");
                    if (hid.create == null) { resolve(hid["default"]); }
                    resolve(hid);
                } catch (error) {
                    reject(error);
                }
            });
            /*
            hidCache = import("@ledgerhq/hw-transport-node-hid").then((hid) => {
                if (hid.create == null) { return hid["default"]; }
                return hid;
            });
            */
        }

        return hidCache.then((hid) => {
            return hid.create()
        });
    }
});

export const transports: { [ name: string ]: TransportCreator } = Object.freeze({
    "hid": hidWrapper,
    "default": hidWrapper
});
