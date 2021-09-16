"use strict";
import Transport from "@ledgerhq/hw-transport";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

export type TransportCreator = {
    create: () => Promise<Transport>;
};

export const transports: { [ name: string ]: TransportCreator } = {
    "webusb": TransportWebUSB,
    "default": TransportWebUSB
};
