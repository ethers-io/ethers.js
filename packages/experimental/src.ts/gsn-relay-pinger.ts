"use strict";

import { ethers } from "ethers";
import { fetchJson } from "@ethersproject/web";


import { version } from "./_version";
const logger = new ethers.utils.Logger(version);

const DEFAULT_PING_SIZE = 3;

export type GsnRelayer = {
    address?: string,         // relayer address that signs the transaction
    owner?: string,           // owner will recieve the relay fee
    relayFee?: number,
    unstakeDelay?: ethers.BigNumber,
    stake?: ethers.BigNumber,
    score?: number,
    url?: string
};


type GsnPingerOptions = {
   gasPrice?: ethers.BigNumberish
   pingSize?: number
};

/**
* Resolves once any promise resolves, ignores the rest, ignores rejections
*/
async function anyPromise(promises: Array<Promise<any>>): Promise<any> {
    let firstError: Error;
    let errorCount: number = 0;
    return new Promise((resolve, reject) =>
        promises.forEach(promise =>
            promise.then(res => resolve(res))
            .catch(err => {
                firstError = firstError || err;

                errorCount++;
                if (errorCount === promises.length) {
                    reject(firstError);
                }
            })
        )
    );
}

/**
 * @returns the relayer if the JSON response indicates it's ready and gasPrice requirement is satisfied
 */
 async function ping(relayer: GsnRelayer, gasPrice: ethers.BigNumber): Promise<GsnRelayer> {
   return fetchJson(relayer.url + '/getaddr')
          .then(result => {
              if (!result) {
                   logger.throwError(`Empty response from relayer ${relayer.url}`,
                       ethers.errors.SERVER_ERROR);
              }

              if (!result.Ready) {
                   logger.throwError(`Relayer ${relayer.url} is not ready`,
                       ethers.errors.SERVER_ERROR);
              }

              if (ethers.BigNumber.from(result.MinGasPrice).gt(gasPrice)) {
                   logger.throwError(`The minimum gas price ${result.MinGasPrice} required by the ` +
                                            `relayer ${relayer.url} is more than the transaction ` +
                                            `gas price ${gasPrice}`, ethers.errors.SERVER_ERROR);
              }
              return relayer;

          });
}

export class GsnRelayPinger {
    failedUrls: Array<string>;
    relayers: Array<GsnRelayer>;
    gasPrice: ethers.BigNumber;
    pingSize: number;

    constructor(relayers: Array<GsnRelayer> = [], options: GsnPingerOptions = {}) {
        logger.checkNew(new.target, GsnRelayPinger);

        this.failedUrls = [];
        this.relayers = relayers.slice();

        this.gasPrice = ethers.BigNumber.from(options.gasPrice || 0);
        this.pingSize = options.pingSize || DEFAULT_PING_SIZE;
    }

    async nextRelayer(): Promise<GsnRelayer>
    {
       if (this.relayers.length === 0) {
           return null;
       }

       let relayersToPing;
       let relayer: GsnRelayer;
       while (!relayer && this.relayers.length > 0) {
           const pingSize = Math.min(this.pingSize, this.relayers.length);
           relayersToPing = this.relayers.slice(0, pingSize);
           try {
               relayer = await anyPromise(relayersToPing.map(r => ping(r, this.gasPrice)
                               .catch(err => {
                                    this.failedUrls.push(r.url);
                                    throw err;
                               })));
           } catch (error) {
               this.relayers = this.relayers.slice(pingSize);
               logger.warn(`No relayers match criteria for this batch: ${error}`);
           }
       }

       this.relayers = this.relayers.filter(r => r.url !== relayer.url);
       return relayer;

    }
}

