"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAddress } from "@ethersproject/address";
import { hexlify, joinSignature } from "@ethersproject/bytes";
import { Signer } from "@ethersproject/abstract-signer";
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
    constructor(provider, type, path) {
        super();
        if (path == null) {
            path = defaultPath;
        }
        if (type == null) {
            type = "default";
        }
        defineReadOnly(this, "path", path);
        defineReadOnly(this, "type", type);
        defineReadOnly(this, "provider", provider || null);
        const transport = transports[type];
        if (!transport) {
            throw new Error("unknown or unsupport type");
        }
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
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const eth = yield this._eth;
            if (eth == null) {
                throw new Error("failed to connect");
            }
            const o = yield eth.getAddress(this.path);
            return getAddress(o.address);
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof (message) === 'string') {
                message = toUtf8Bytes(message);
            }
            const messageHex = hexlify(message).substring(2);
            const eth = yield this._eth;
            const sig = yield eth.signPersonalMessage(this.path, messageHex);
            sig.r = '0x' + sig.r;
            sig.s = '0x' + sig.s;
            return joinSignature(sig);
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const eth = yield this._eth;
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
        });
    }
    connect(provider) {
        return new LedgerSigner(provider, this.type, this.path);
    }
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const signer = new LedgerSigner();
        console.log(signer);
        try {
            const sig = yield signer.signMessage("Hello World");
            console.log(sig);
        }
        catch (error) {
            console.log("ERR", error);
        }
    });
})();
