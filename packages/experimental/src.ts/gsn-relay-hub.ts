"use strict";

import { ethers } from "ethers";
import { GsnRelayer } from "./gsn-relay-pinger";

import { version } from "./_version";
const logger = new ethers.utils.Logger(version);


// see https://rinkeby.etherscan.io/address/0xD216153c06E857cD7f72665E0aF1d7D82172F494#code
// GSN IRelayRecipient and RelayHub contract definitions
const relayRecipientAbi = [ "function getHubAddr() public view returns (address)" ];
const relayHubAbi = [
    "function relayCall( address from, address to, bytes memory encodedFunction, uint256 transactionFee, uint256 gasPrice, uint256 gasLimit, uint256 nonce, bytes memory signature, bytes memory approvalData) public",
    "function getNonce(address) external view returns (uint256)",
    "event RelayAdded(address indexed relay, address indexed owner, uint256 transactionFee, uint256 stake, uint256 unstakeDelay, string url)",
    "event RelayRemoved(address indexed relay, uint256 unstakeTime)"
];


export class GsnRelayHub {
    readonly provider: ethers.providers.Provider;
    readonly contract: ethers.Contract;
    relayers: Array<GsnRelayer>;
    fromBlock: number;

    constructor(provider: ethers.providers.Provider, hubAddress: string) {
        logger.checkNew(new.target, GsnRelayHub);

        ethers.utils.defineReadOnly(this, "provider", provider);
        ethers.utils.defineReadOnly(this, "contract", new ethers.Contract(hubAddress, relayHubAbi, provider));

        this.relayers = [];
    }

    get address(): string {
        return this.contract.address;
    }

    getRecipientNonce(recipient: string): Promise<ethers.BigNumber> {
       return this.contract.getNonce(recipient)
            .catch((error: Error) => {
                return logger.throwError("Failed to get nonce", ethers.errors.CALL_EXCEPTION, error);
            });
    }

    static createFromRecipient(provider: ethers.providers.Provider, recipient: string): Promise<GsnRelayHub> {
        try {
            const recipientContract = new ethers.Contract(recipient, relayRecipientAbi, provider);
            return recipientContract.getHubAddr()
               .then((addr: string) => new GsnRelayHub(provider, addr))
        } catch (error) {
            return logger.throwError("Failed to create GSN relay hub", ethers.errors.SERVER_ERROR, error);
        }
    }

    static parseTransaction(data: string): ethers.utils.Result {
        const iface = new ethers.utils.Interface(relayHubAbi);
        const parsed = iface.parseTransaction({ data });
        return parsed.args;
    }

    async fetchRelayers(fromBlock: number): Promise<Array<GsnRelayer>>{
        if( this.fromBlock === fromBlock && this.relayers.length > 0 ){
            return this.relayers;
        }

        const relayAdded = await this.contract.queryFilter(this.contract.filters.RelayAdded(), fromBlock);
        const relayRemoved = await this.contract.queryFilter(this.contract.filters.RelayRemoved(), fromBlock);
        const removedSet = new Set(relayRemoved.map(r => r.args.relay));

        const relayers: Record<string, GsnRelayer> = {};
        for(let i=0; i< relayAdded.length; i++)
        {
           const added = relayAdded[i].args;
           if( removedSet.has(added.relay) ) continue;

           const relayer: GsnRelayer = {
               address: added.relay,
               owner: added.owner,
               relayFee: added.transactionFee.toNumber(),
               unstakeDelay: added.unstakeDelay,
               stake: added.stake,
               url: added.url
           }

           relayers[relayer.address] = relayer;
        }

        const result = Object.values(relayers);
        if (result.length === 0) {
            return logger.throwError(`No relayer registered at relay hub ${this.address}`, ethers.errors.SERVER_ERROR);
        }

        this.relayers = result;
        this.fromBlock = fromBlock;
        return this.relayers;
    }
}

