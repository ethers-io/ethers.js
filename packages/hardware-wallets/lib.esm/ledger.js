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
import { ethers } from "ethers";
import { version } from "./_version";
const logger = new ethers.utils.Logger(version);
import Eth from "@ledgerhq/hw-app-eth";
// We store these in a separated import so it is easier to swap them out
// at bundle time; browsers do not get HID, for example. This maps a string
// "type" to a Transport with create.
import { transports } from "./ledger-transport";
const defaultPath = "m/44'/60'/0'/0/0";
function waiter(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}
export class LedgerSigner extends ethers.Signer {
    constructor(provider, type, path) {
        super();
        if (path == null) {
            path = defaultPath;
        }
        if (type == null) {
            type = "default";
        }
        ethers.utils.defineReadOnly(this, "path", path);
        ethers.utils.defineReadOnly(this, "type", type);
        ethers.utils.defineReadOnly(this, "provider", provider || null);
        const transport = transports[type];
        if (!transport) {
            logger.throwArgumentError("unknown or unsupported type", "type", type);
        }
        ethers.utils.defineReadOnly(this, "_eth", transport.create().then((transport) => {
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
    _retry(callback, timeout) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (timeout && timeout > 0) {
                setTimeout(() => { reject(new Error("timeout")); }, timeout);
            }
            const eth = yield this._eth;
            // Wait up to 5 seconds
            for (let i = 0; i < 50; i++) {
                try {
                    const result = yield callback(eth);
                    return resolve(result);
                }
                catch (error) {
                    if (error.id !== "TransportLocked") {
                        return reject(error);
                    }
                }
                yield waiter(100);
            }
            return reject(new Error("timeout"));
        }));
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this._retry((eth) => eth.getAddress(this.path));
            return ethers.utils.getAddress(account.address);
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof (message) === 'string') {
                message = ethers.utils.toUtf8Bytes(message);
            }
            const messageHex = ethers.utils.hexlify(message).substring(2);
            const sig = yield this._retry((eth) => eth.signPersonalMessage(this.path, messageHex));
            sig.r = '0x' + sig.r;
            sig.s = '0x' + sig.s;
            return ethers.utils.joinSignature(sig);
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield ethers.utils.resolveProperties(transaction);
            const baseTx = {
                chainId: (tx.chainId || undefined),
                data: (tx.data || undefined),
                gasLimit: (tx.gasLimit || undefined),
                gasPrice: (tx.gasPrice || undefined),
                nonce: (tx.nonce ? ethers.BigNumber.from(tx.nonce).toNumber() : undefined),
                to: (tx.to || undefined),
                value: (tx.value || undefined),
            };
            const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2);
            const sig = yield this._retry((eth) => eth.signTransaction(this.path, unsignedTx));
            return ethers.utils.serializeTransaction(baseTx, {
                v: ethers.BigNumber.from("0x" + sig.v).toNumber(),
                r: ("0x" + sig.r),
                s: ("0x" + sig.s),
            });
        });
    }
    connect(provider) {
        return new LedgerSigner(provider, this.type, this.path);
    }
}
//# sourceMappingURL=ledger.js.map