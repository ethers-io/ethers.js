"use strict";

import { getAddress } from "@ethersproject/address";
import { Bytes, hexlify, joinSignature } from "@ethersproject/bytes";
import { Signer } from "@ethersproject/abstract-signer";
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { defineReadOnly, resolveProperties } from "@ethersproject/properties";
import { toUtf8Bytes } from "@ethersproject/strings";
import { serialize as serializeTransaction } from "@ethersproject/transactions";

import Eth from "@ledgerhq/hw-app-eth";

// We store these in a separated import so it is easier to swap them out
// at bundle time; browsers do not get HID, for example. This maps a string
// "type" to a Transport with create.
import { transports } from "./ledger-transport";

const defaultPath = "m/44'/60'/0'/0/0";

export class LedgerSigner extends Signer {
    readonly type: string;
    readonly path: string

    readonly _eth: Promise<Eth>;

    constructor(provider?: Provider, type?: string, path?: string) {
        super();
        if (path == null) { path = defaultPath; }
        if (type == null) { type = "default"; }

        defineReadOnly(this, "path", path);
        defineReadOnly(this, "type", type);
        defineReadOnly(this, "provider", provider || null);

        const transport = transports[type];
        if (!transport) { throw new Error("unknown or unsupport type"); }

        defineReadOnly(this, "_eth", transport.create().then((transport) => {
            const eth = new Eth(transport);
            return eth.getAppConfiguration().then((config) => {
                return eth;
            }, (error) => {
                return Promise.reject(error);
            });
        }, (error) => {
            return Promise.reject(error);
        }));
    }

    async getAddress(): Promise<string> {
        const eth = await this._eth;
        if (eth == null) { throw new Error("failed to connect"); }
        const o = await eth.getAddress(this.path);
        return getAddress(o.address);
    }

    async signMessage(message: Bytes | string): Promise<string> {
        if (typeof(message) === 'string') {
            message = toUtf8Bytes(message);
        }

        const messageHex = hexlify(message).substring(2);

        const eth = await this._eth;
        const sig = await eth.signPersonalMessage(this.path, messageHex);
        sig.r = '0x' + sig.r;
        sig.s = '0x' + sig.s;
        return joinSignature(sig);
    }

    async signTransaction(transaction: TransactionRequest): Promise<string> {
        const eth = await this._eth;
        return resolveProperties(transaction).then((tx) => {
            const unsignedTx = serializeTransaction(tx).substring(2);
            return eth.signTransaction(this.path, unsignedTx).then((sig) => {
                return serializeTransaction(tx, {
                    v: sig.v,
                    r: ("0x" + sig.r),
                    s: ("0x" + sig.s),
                });
            });
        });
    }

    connect(provider: Provider): Signer {
        return new LedgerSigner(provider, this.type, this.path);
    }
}

(async function() {
    const signer = new LedgerSigner();
    console.log(signer);
    try {
        const sig = await signer.signMessage("Hello World");
        console.log(sig);
    } catch (error) {
        console.log("ERR", error);
    }
})();
