"use strict";

import { ethers } from "ethers";

import { version } from "./_version";

const logger = new ethers.utils.Logger(version);

export class MetamaskProvider extends ethers.providers.Web3Provider {

    _pollingAccount: any;
    _pollAccountFunc: () => void;

    constructor(ethereum?: ethers.providers.ExternalProvider) {
        if (!ethereum) {
            ethereum = (<any>global).ethereum;
            if (!ethereum) {
                logger.throwError("could not auto-detect global.ethereum", ethers.errors.UNSUPPORTED_OPERATION, {
                    operation: "window.ethereum"
                });
            }
        }

        super(ethereum);

        let _account: string = null;
        ethers.utils.defineReadOnly(this, "_pollAccountFunc", () => {
            let account: string = null;
            if (account === _account) { return; }
            console.log("poll");
            this.emit("account", account, _account);
            _account = account;
        });

        super(ethereum);
    }

    getSigner(addressOrIndex?: string | number): ethers.providers.JsonRpcSigner {
        if (!this.enabled) { return null }
        return super.getSigner(addressOrIndex);
    }

    get enabled(): boolean {
        return false;
    }

    _startPollingAccount(): void {
        if (this._pollingAccount) { return; }
        console.log("start polling for account changes including to/from null");
        this._pollingAccount = setInterval(this._pollAccountFunc, 1000);
    }

    _stopPollingAccount(): void {
        if (!this._pollingAccount) { return; }
        console.log("stop polling for account changes including to/from null");
        clearInterval(this._pollingAccount);
        this._pollingAccount = null;
    }

    on(eventName: ethers.providers.EventType, listener: ethers.providers.Listener): this {
        super.on(eventName, listener);
        if (this.listenerCount("account") > 0) {
            this._startPollingAccount();
        }
        return this;
    }

    off(eventName: ethers.providers.EventType, listener?: ethers.providers.Listener): this {
        super.off(eventName, listener);
        if (this.listenerCount("account") === 0) {
            this._stopPollingAccount();
        }
        return this;
    }

}
