"use strict";

import u2f from "@ledgerhq/hw-transport-u2f";

export type TransportCreator = {
    create: () => Promise<u2f.Transport>;
};

export const transports: { [ name: string ]: TransportCreator } = {
    "u2f": u2f,
    "default": u2f
};
